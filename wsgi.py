import sys
import os

# Make sure the backend directory is on the Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, backend_dir)

from app import create_app

app = create_app()
