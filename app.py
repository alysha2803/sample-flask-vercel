from flask import Flask, render_template, request, redirect, url_for
from firebase_config import db  # Import your Firebase configuration
import os

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True)