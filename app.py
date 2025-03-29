from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
from flask_cors import CORS  # Added CORS support

# Try to import Firebase config, with fallback for when it's not available
try:
    from firebase_config import db
except ImportError:
    import logging
    logging.warning("Firebase config not available. Using mock database.")

    # Create a mock db object for development or when Firebase isn't set up
    class MockDB:
        def collection(self, name):
            return MockCollection()

    class MockCollection:
        def get(self):
            return []

    db = MockDB()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/reports')
def reports():
    # For initial page load, we'll let the JavaScript handle the data loading
    # This allows for a more interactive experience without page refreshes
    return render_template('reports.html', initial_images=[])

# Add health check endpoint for Vercel
@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "environment": os.environ.get('VERCEL', 'development')})

if __name__ == '__main__':
    app.run(debug=True)