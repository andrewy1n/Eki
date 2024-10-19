from pydantic import BaseModel
from typing import Union

class Book(BaseModel):
    cover: str
    pages: Union[dict[str, list[str]], None] = None
    city: str
    state: str

class Geocode(BaseModel):
    lat: float
    lng: float

class Location(BaseModel):
    name: str
    geocode: Geocode

class EmptyStamp(BaseModel):
    location: Location

class Stamp(BaseModel):
    photo_url: str
    stamp_url: str
    stamp_coords: str # Change
    date: str
    notes: Union[str, None] = None
    location_name: str
    geocode: Geocode

class Place(BaseModel):
    display_name: str
    google_maps_uri: str
    geocode: Geocode
    formatted_address: str
    rating: float
    photo_uri: str
