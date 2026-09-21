from flask import Blueprint, request, jsonify, send_from_directory
import os
from services.tts_service import generate_speech, get_available_voices
from utils.rate_limiter import is_rate_limited, get_retry_after

tts_bp = Blueprint("tts", __name__)

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "generated_audio")
MAX_TEXT_LENGTH = 5000
ALLOWED_UPLOAD_EXTENSIONS = {".txt"}
MAX_UPLOAD_BYTES = 1 * 1024 * 1024  # 1 MB
VALID_SPEEDS = {"slow", "normal", "fast"}


@tts_bp.route("/health", methods=["GET"])
def health():
    """Check whether the backend is running."""
    return jsonify({"status": "ok"}), 200


@tts_bp.route("/voices", methods=["GET"])
def voices():
    """Return all available languages and voices."""
    return jsonify(get_available_voices()), 200


@tts_bp.route("/tts", methods=["POST"])
def text_to_speech():
    """Convert text to speech and return the audio URL."""

    # --- Rate limiting (429) ---
    client_ip = request.remote_addr or "unknown"
    if is_rate_limited(client_ip):
        retry_after = get_retry_after(client_ip)
        response = jsonify({
            "success": False,
            "error": f"Too many requests. Please wait {retry_after} seconds before trying again."
        })
        response.headers["Retry-After"] = str(retry_after)
        return response, 429

    # --- Validate Content-Type ---
    if not request.is_json:
        return jsonify({"success": False, "error": "Content-Type must be application/json"}), 400

    data = request.get_json()

    text = data.get("text", "").strip()
    language = data.get("language", "")
    voice = data.get("voice", "")
    speed = data.get("speed", "normal")

    # --- Input validation ---
    if not text:
        return jsonify({"success": False, "error": "Text must not be empty."}), 400

    if len(text) > MAX_TEXT_LENGTH:
        return jsonify({
            "success": False,
            "error": f"Text exceeds the maximum allowed length of {MAX_TEXT_LENGTH} characters."
        }), 400

    if speed not in VALID_SPEEDS:
        return jsonify({"success": False, "error": f"Invalid speed '{speed}'. Choose slow, normal, or fast."}), 400

    available = get_available_voices()
    valid_languages = [lang["code"] for lang in available]

    if language not in valid_languages:
        return jsonify({"success": False, "error": f"Unsupported language: {language}"}), 400

    # Check voice belongs to the selected language
    lang_data = next((l for l in available if l["code"] == language), None)
    valid_voices = [v["value"] for v in lang_data["voices"]]

    if voice not in valid_voices:
        return jsonify({"success": False, "error": f"Voice '{voice}' is not available for language '{language}'."}), 400

    # --- Generate speech ---
    try:
        filename = generate_speech(text, language, voice, speed)
        audio_url = f"/api/audio/{filename}"
        # 201 Created — a new audio resource was successfully generated
        return jsonify({"success": True, "audio_url": audio_url}), 201

    except ConnectionError as e:
        # External TTS service (gTTS / Google) is unreachable
        return jsonify({
            "success": False,
            "error": "Text-to-Speech service is currently unavailable. Please try again later."
        }), 503

    except Exception as e:
        error_msg = str(e)
        # gTTS raises a generic Exception with "connect" in the message on network issues
        if "connect" in error_msg.lower() or "failed" in error_msg.lower():
            return jsonify({
                "success": False,
                "error": "Text-to-Speech service is currently unavailable. Please try again later."
            }), 503
        return jsonify({"success": False, "error": f"Speech generation failed: {error_msg}"}), 500


@tts_bp.route("/audio/<filename>", methods=["GET"])
def serve_audio(filename):
    """Serve a generated audio file."""
    try:
        return send_from_directory(os.path.abspath(AUDIO_DIR), filename)
    except FileNotFoundError:
        return jsonify({"success": False, "error": "Audio file not found."}), 404


@tts_bp.route("/upload", methods=["POST"])
def upload_text_file():
    """
    Accept a TXT file upload and return its text content.
    The frontend can then populate the text area with it.
    """
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided."}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"success": False, "error": "No file selected."}), 400

    # Validate extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        return jsonify({
            "success": False,
            "error": f"Unsupported file type '{ext}'. Only .txt files are allowed."
        }), 400

    # Validate file size
    file.seek(0, 2)          # seek to end
    size = file.tell()
    file.seek(0)             # reset

    if size > MAX_UPLOAD_BYTES:
        return jsonify({
            "success": False,
            "error": f"File is too large. Maximum allowed size is {MAX_UPLOAD_BYTES // 1024}KB."
        }), 400

    # Read and decode
    try:
        text = file.read().decode("utf-8")
    except UnicodeDecodeError:
        return jsonify({
            "success": False,
            "error": "Could not read file. Make sure it is a UTF-8 encoded text file."
        }), 400

    text = text.strip()

    if not text:
        return jsonify({"success": False, "error": "The uploaded file is empty."}), 400

    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]
        return jsonify({
            "success": True,
            "text": text,
            "warning": f"File was trimmed to {MAX_TEXT_LENGTH} characters."
        }), 200

    return jsonify({"success": True, "text": text}), 200
