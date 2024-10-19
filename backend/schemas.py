from pydantic import BaseModel
from typing import Union

class Book(BaseModel):
    cover: str
    pages: dict[str, list[str]]
    city: str
    state: str

class Geocode(BaseModel):
    lat: float
    lng: float

class Location(BaseModel):
    city: str
    state: str
    name: str
    geocode: Geocode

class EmptyStamp(BaseModel):
    location: Location

class Stamp(BaseModel):
    photo_url: str
    stamp_url: str
    stamp_coords: str # Change
    time: str
    notes: Union[str, None] = None
    location: Location

class Place(BaseModel):
    display_name: str
    google_maps_uri: str
    geocode: Geocode
    formatted_address: str
    rating: float
    photo_uri: str
