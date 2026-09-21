import os
import time
import uuid
from gtts import gTTS

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "generated_audio")

# ---------------------------------------------------------------------------
# Available languages and voices
# gTTS does not support gender-specific voices, so we expose one voice per
# language with a "Standard" label. Swap this structure out when upgrading
# to a provider that supports voice selection (ElevenLabs, Azure, etc.).
# ---------------------------------------------------------------------------
LANGUAGES = [
    {
        "name": "English (US)",
        "code": "en",
        "voices": [
            {"label": "Standard", "value": "en-standard"}
        ]
    },
    {
        "name": "Hindi",
        "code": "hi",
        "voices": [
            {"label": "Standard", "value": "hi-standard"}
        ]
    },
    {
        "name": "Gujarati",
        "code": "gu",
        "voices": [
            {"label": "Standard", "value": "gu-standard"}
        ]
    },
    {
        "name": "Marathi",
        "code": "mr",
        "voices": [
            {"label": "Standard", "value": "mr-standard"}
        ]
    },
    {
        "name": "Spanish",
        "code": "es",
        "voices": [
            {"label": "Standard", "value": "es-standard"}
        ]
    },
    {
        "name": "French",
        "code": "fr",
        "voices": [
            {"label": "Standard", "value": "fr-standard"}
        ]
    },
    {
        "name": "German",
        "code": "de",
        "voices": [
            {"label": "Standard", "value": "de-standard"}
        ]
    },
]


def get_available_voices() -> list:
    """Return the list of supported languages and their voices."""
    return LANGUAGES


def generate_speech(text: str, language: str, voice: str,
                    speed: str = "normal", retries: int = 2) -> str:
    """
    Convert text to speech using gTTS and save as an MP3 file.

    speed: "slow" | "normal" | "fast"
      - "slow"   → gTTS slow=True
      - "normal" → gTTS slow=False
      - "fast"   → gTTS slow=False (gTTS has no native fast mode;
                    fast is handled on the frontend via the audio player's playback rate)

    Retries up to `retries` times on network errors.
    Returns the generated filename.
    Raises an exception if all attempts fail.
    """
    slow_mode = speed == "slow"

    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    last_error = None
    for attempt in range(1, retries + 1):
        try:
            tts = gTTS(text=text, lang=language, slow=slow_mode)
            tts.save(filepath)
            return filename
        except Exception as e:
            last_error = e
            if attempt < retries:
                time.sleep(1)

    raise RuntimeError(f"gTTS failed after {retries} attempts: {last_error}")
