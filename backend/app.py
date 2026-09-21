import os
from flask import Flask
from flask_cors import CORS
from routes.tts_routes import tts_bp


def create_app():
    app = Flask(__name__)

    # ---------------------------------------------------------------------------
    # CORS
    # In development:  FRONTEND_URL is not set, so we allow localhost:5173
    # In production:   Set FRONTEND_URL to your Vercel URL in Render dashboard
    #                  e.g. https://your-app.vercel.app
    # ---------------------------------------------------------------------------
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})

    # Ensure the audio output directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "generated_audio"), exist_ok=True)

    # Register blueprints
    app.register_blueprint(tts_bp, url_prefix="/api")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
