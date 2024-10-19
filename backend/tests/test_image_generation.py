import requests
import base64
from PIL import Image
from io import BytesIO
import pandas as pd
import os
from firebase_admin import credentials, storage
import firebase_admin

cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS'))
firebase_admin.initialize_app(cred, {'storageBucket': os.getenv("STORAGE_BUCKET")})

bucket = storage.bucket()

url = "https://api.hyperbolic.xyz/v1/image/generation"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMXlpbkB1Y3NkLmVkdSIsImlhdCI6MTcyOTIyMTczNX0.tXz4DS8WDAh-Vs-xPk7auO5V7RN_-I9hdPhgo3lMfzM"
}
data = {
    "model_name": "FLUX.1-dev",
    "prompt": "make an illustration of san diego, include landmarks",
    "steps": 30,
    "cfg_scale": 5,
    "enable_refiner": False,
    "height": 1024,
    "width": 1024,
    "backend": "auto"
}
  
response = requests.post(url, headers=headers, json=data)
data = response.json()

print(pd.json_normalize(data))

image_data = base64.b64decode(data['images'][0]['image'])

blob = bucket.blob('ai_generated_image.png')

try:
    blob.upload_from_string(image_data, content_type='image/png')
    download_url = blob.public_url
    print(f"File uploaded successfully! Download URL: {download_url}")
except Exception as e:
    print(f"Error uploading file: {e}")
