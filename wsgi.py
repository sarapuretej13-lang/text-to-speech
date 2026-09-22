import sys
import os

# Insert backend directory at the front of the path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

os.environ.setdefault("FLASK_ENV", "production")

from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__, 
                template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"),
                root_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})

    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "generated_audio"), exist_ok=True)

    from routes.tts_routes import tts_bp
    app.register_blueprint(tts_bp, url_prefix="/api")

    return app

app = create_app()
