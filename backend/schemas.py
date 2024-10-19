from pydantic import BaseModel
from typing import Union

class Geocode(BaseModel):
    lat: float
    lng: float

class Position(BaseModel):
    x: float
    y: float

class Transformation(BaseModel):
    position: Position
    scale: float
    rotation: float

class Location(BaseModel):
    name: str
    geocode: Geocode

class Stamp(BaseModel):
    photo_url: str
    stamp_url: str
    stamp_transformation: Transformation
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

class Book(BaseModel):
    cover: str
    pages: Union[dict[str, list[Location]], None] = None
    city: str
    state: str