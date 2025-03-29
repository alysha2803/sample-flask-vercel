import firebase_admin
from firebase_admin import credentials, firestore

# Path to your Firebase service account key
cred = credentials.Certificate(r'C:\Users\Alysha\Downloads\Sample-Flask-Vercel\cubachups1-firebase-adminsdk-fbsvc-0daafa8d0a.json')
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()