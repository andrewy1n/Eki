import os
from firebase_admin import credentials, storage
import firebase_admin

# Initialize Firebase app
cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS'))
firebase_admin.initialize_app(cred, {'storageBucket': os.getenv("STORAGE_BUCKET")})

# Get the Firebase Storage bucket
bucket = storage.bucket()

# Specify the local file path
local_file_path = 'tests/loopy2.png'  # Ensure this path is correct

# Check if the file exists
if os.path.exists(local_file_path):
    # Specify the path in the bucket and create a blob
    blob = bucket.blob('loopy2.png')  # Change this to the desired path in the bucket

    # Upload the file
    try:
        blob.upload_from_filename(local_file_path)
        # Make the blob publicly accessible
        blob.make_public()

        # Get the download URL
        download_url = blob.public_url
        print(f"File uploaded successfully! Download URL: {download_url}")

    except Exception as e:
        print(f"Error uploading file: {e}")
else:
    print(f"File does not exist: {local_file_path}")
