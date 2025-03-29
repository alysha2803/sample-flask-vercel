from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    # This will eventually
    # fetch data for dashboard
    return render_template('dashboard.html')

@app.route('/upload')
def upload():
    # This will eventually handle file uploads and model predictions
    return render_template('upload.html')

@app.route('/reports')
def reports():
    # This will eventually handle report generation
    return render_template('reports.html')

if __name__ == '__main__':
    app.run(debug=True)