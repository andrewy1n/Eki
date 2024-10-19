from string import ascii_uppercase
from typing import Union
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, db, storage
from dotenv import load_dotenv
import os
from schemas import Book, EmptyStamp, Geocode, Location, Place, Stamp
import base64
import requests
from datetime import datetime
from fastapi.encoders import jsonable_encoder
from recommendation import get_place_names
import pandas as pd

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
    bookid: str
    location_name: str
    geocode: Geocode
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
async def generate_stamp_image(reference_image: UploadFile = File(...)):
    try:
        # Read and encode the reference image to base64
        file_content = await reference_image.read()
        base64_img = base64.b64encode(file_content).decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading the image: {str(e)}")

    api = "https://api.hyperbolic.xyz/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('HYPERBOLIC_API_KEY')}",
    }

    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe this image to someone who would draw it without the reference image. Make sure to be detailed."},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"},
                    },
                ],
            }
        ],
        "model": "meta-llama/Llama-3.2-90B-Vision-Instruct",
        "max_tokens": 2048,
        "temperature": 0.7,
        "top_p": 0.9,
    }

    try:
        response = requests.post(api, headers=headers, json=payload)
        response.raise_for_status()
        description = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
        if not description:
            raise HTTPException(status_code=500, detail="Failed to retrieve description from API.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error with the API call for description: {str(e)}")
    except KeyError:
        raise HTTPException(status_code=500, detail="Unexpected response structure from the API when fetching description.")

    # Draw reference image
    url = "https://api.hyperbolic.xyz/v1/image/generation"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('HYPERBOLIC_API_KEY')}"
    }

    data = {
        "model_name": "FLUX.1-dev",
        "prompt": description,
        "steps": 30,
        "cfg_scale": 5,
        "enable_refiner": False,
        "height": 1024,
        "width": 1024,
        "backend": "auto"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        image_data = base64.b64decode(response.json().get('images', [{}])[0].get('image', ''))
        if not image_data:
            raise HTTPException(status_code=500, detail="Failed to retrieve image data from the API.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error with the API call for image generation: {str(e)}")
    except KeyError:
        raise HTTPException(status_code=500, detail="Unexpected response structure from the API when generating image.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error decoding image data: {str(e)}")

    try:
        blob = bucket.blob(f"ai_generated_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
        blob.upload_from_string(image_data, content_type='image/png')
        download_url = blob.public_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image to storage: {str(e)}")
    
    return {
        'message': 'Stamp successfully generated',
        'image_url': download_url
    }

@app.post("/stampbook/create-stamp")
async def create_stamp(request: StampCreateRequest):
    stamp_data = Stamp(
        photo_url=request.photo_url,
        stamp_url=request.stamp_url,
        stamp_coords=request.stamp_coords,
        date=datetime.now().strftime("%m/%d/%Y"),
        notes=request.notes,
        location_name=request.location_name,
        geocode=request.geocode
    )

    ref = db.reference(f"/users/{request.uid}/books/{request.bookid}/pages")
    pages = ref.get()

    if pages is None:
        pages = {letter: [] for letter in ascii_uppercase}
    
    first_letter = request.location_name[0].upper()
    pages[first_letter].append(jsonable_encoder(stamp_data))

    ref.set(pages)
    
    return {
        "message": "Stamp created successfully",
        "stamp_data": jsonable_encoder(stamp_data)
    }

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

@app.get('/stampbook')
async def get_stampbooks(uid: str):
    try:
        ref = db.reference(f"/users/{uid}/books")

        books = ref.get()

        if books is None:
            print('No books found.')
            return
        
        stampbook_data = {
            'stampbooks': []
        }

        for book_id, book_info in books.items():
            stampbook_data['stampbooks'].append({
                'book_id': book_id,
                'city': book_info['city'],
                'state': book_info['state'],
                'cover': book_info['cover']
            })
        
        return {
            'message': f'Stampbooks for user: {uid}',
            'stampbook_data': stampbook_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/stampbook/{book_id}')
async def get_book_pages(uid: str, book_id: str):
    try:
        ref = db.reference(f"/users/{uid}/books/{book_id}/pages")

        stampbook_pages = ref.get()
        
        return {
            'message': f'Stampbook {book_id} for user: {uid}',
            'stampbook_pages': stampbook_pages
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))