import os
from flask import Flask, jsonify
from google.cloud import firestore
from google.oauth2 import service_account
from flask_cors import CORS  # ✅ Import CORS

# Set Firebase JSON file path
json_path = "cubachups1-firebase-adminsdk-fbsvc-9dc37da141.json"

# Load Firebase credentials
cred = service_account.Credentials.from_service_account_file(json_path)
db = firestore.Client(credentials=cred)

app = Flask(__name__)

# ✅ Allow requests from your Next.js frontend (localhost:3000)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/summary', methods=['GET'])
def get_summary():
    predictions_ref = db.collection('test_collection')  
    docs = predictions_ref.stream()

    prediction_counts = {}
    for doc in docs:
        prediction = doc.to_dict().get("prediction", "Unknown")
        prediction_counts[prediction] = prediction_counts.get(prediction, 0) + 1  

    data = [{"prediction": key, "count": value} for key, value in prediction_counts.items()]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
