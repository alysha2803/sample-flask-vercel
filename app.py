from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
from flask_cors import CORS

# Try to import Firebase config
try:
    from firebase_config import db, firebase_app
except ImportError:
    import logging
    logging.warning("Firebase config not available. Using mock database.")
    db = None
    firebase_app = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Helper function to check if Firebase is initialized
def is_firebase_available():
    return db is not None and firebase_app is not None

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
    firebase_status = "available" if is_firebase_available() else "unavailable"
    # Pass Firebase status to the template
    return render_template('reports.html', firebase_status=firebase_status)

# Add health check endpoint for Vercel
@app.route('/api/health')
def health_check():
    env = os.environ.get('VERCEL', 'development')
    firebase_status = "available" if is_firebase_available() else "unavailable"
    return jsonify({
        "status": "ok",
        "environment": env,
        "firebase": firebase_status
    })

# Add a route to check Firebase configuration
@app.route('/api/firebase-config')
def firebase_config():
    if is_firebase_available():
        return jsonify({
            "status": "connected",
            "project_id": os.environ.get("FIREBASE_PROJECT_ID", "unknown")
        })
    else:
        return jsonify({
            "status": "not_connected",
            "error": "Firebase is not properly configured"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)