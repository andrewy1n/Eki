from string import ascii_uppercase
from typing import Union
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, db, storage
from dotenv import load_dotenv
import os
from schemas import Book, EmptyStamp, Geocode, Location, Place
import base64
import requests
from datetime import datetime
from fastapi.encoders import jsonable_encoder
from recommendation import get_place_names

load_dotenv()

app = FastAPI()

cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS"))
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv("DATABASE_URL"),
    'storageBucket': os.getenv("STORAGE_BUCKET")
})

bucket = storage.bucket()

class UserCreateRequest(BaseModel):
    email: str
    password: str
    display_name: Union[str, None] = None
    profile_photo: Union[str, None] = None

class UserUpdateRequest(BaseModel):
    bio: Union[str, None] = None
    profile_photo: Union[str, None] = None

class BookCreateRequest(BaseModel):
    uid: str
    city: str
    state: str
    attractions: Union[list[Location], None] = None

class StampCreateRequest(BaseModel):
    uid: str
    location: Location
    photo_url: str
    stamp_url: str
    stamp_coords: str
    notes: Union[str, None] = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/auth/create")
def create_user(user: UserCreateRequest):
    try:
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.display_name
        )

        user_data = {
            "email": user.email,
            "display_name": user.display_name,
            "profile_photo": user.profile_photo
        }

        ref = db.reference(f"/users/{user_record.uid}")
        ref.set(user_data)

        return {
            "message": "User created successfully",
            "user_id": user_record.uid,
            "email": user_record.email
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/account/update")
async def update_account(uid: str, update: UserUpdateRequest):
    if update.profile_photo:
        db.reference(f"/users/{uid}/profile_photo").update(update.profile_photo)
    
    if update.bio:
        db.reference(f"/users/{uid}/bio").update(update.bio)
    
    return {
        "message": "User updated successfully",
        "user_id": uid,
    }

@app.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    try:
        blob = bucket.blob(f"{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        download_url = blob.public_url

        return {"message": "Photo uploaded successfully", "download_url": download_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stampbook/create")
async def create_book(request: BookCreateRequest):
    try:
        url = "https://api.hyperbolic.xyz/v1/image/generation"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('HYPERBOLIC_API_KEY')}"
        }

        data = {
            "model_name": "FLUX.1-dev",
            "prompt": f"make an illustration of {request.city}, {request.state}, include landmarks",
            "steps": 30,
            "cfg_scale": 5,
            "enable_refiner": False,
            "height": 1024,
            "width": 1024,
            "backend": "auto"
        }
        
        response = requests.post(url, headers=headers, json=data)
        image_data = base64.b64decode(response.json()['images'][0]['image'])
        
        blob = bucket.blob(f"ai_generated_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
        blob.upload_from_string(image_data, content_type='image/png')
        download_url = blob.public_url

        pages = None
        if request.attractions:
            pages = {letter: [] for letter in ascii_uppercase}
            for attraction in request.attractions:
                starts_with = attraction.name[0].upper()
                pages[starts_with] = EmptyStamp(
                    location=jsonable_encoder(attraction)
                )

        book_data = Book(
            cover=download_url,
            pages=pages,
            city=request.city,
            state=request.state
        )

        ref = db.reference(f"/users/{request.uid}/books").push(jsonable_encoder(book_data))

        return {
            "message": "Book created successfully",
            "book_id": ref.key,
            "book_data": jsonable_encoder(book_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stampbook/generate-stamp-image")
async def generate_stamp_image(request: str):
    return {}

@app.post("/stampbook/create-stamp")
async def create_stamp(request: StampCreateRequest):
    return {}

@app.get("/travel/rec")
async def travel_rec(city: str, state: str):
    try:
        
        place_names = get_place_names(f"{city}, {state}")
        
        output = {
            'places': []
        }

        print(place_names)

        for name in place_names:
            url = "https://places.googleapis.com/v1/places:searchText"
            headers = {
                "X-Goog-Api-Key": os.getenv('GOOGLE_API_KEY'),
                "X-Goog-FieldMask": "places.displayName,places.googleMapsUri,places.location,places.formattedAddress,places.rating,places.photos"
            }
            data = {
                "textQuery": f"{name} {city}, {state}",
            }

            response = requests.post(url, headers=headers, json=data)
            data = response.json()
            print(data)

            if response.status_code == 200:
                places = data.get('places', [])
                if places:
                    place_data = places[0]
                    
                    display_name = place_data.get('displayName', {}).get('text', None)
                    google_maps_uri = place_data.get('googleMapsUri', None)
                    lat = place_data.get('location', {}).get('latitude', None)
                    lng = place_data.get('location', {}).get('longitude', None)
                    formatted_address = place_data.get('formattedAddress', None)
                    rating = place_data.get('rating', None)
                    photo_uri = None
                    
                    if 'photos' in place_data and place_data['photos']:
                        author_attributions = place_data['photos'][0].get('authorAttributions', [])
                        if author_attributions:
                            photo_uri = author_attributions[0].get('uri', None)

                    if display_name and google_maps_uri and lat is not None and lng is not None:
                        output['places'].append(jsonable_encoder(
                            Place(
                                display_name=display_name,
                                google_maps_uri=google_maps_uri,
                                geocode=Geocode(lat=lat, lng=lng),
                                formatted_address=formatted_address,
                                rating=rating,
                                photo_uri=photo_uri
                            )
                        ))
            else:
                continue
        
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))