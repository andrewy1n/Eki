export interface Transformations {
    position: {
      x: number;
      y: number;
    };
    scale: number;
    rotation: number;
  }
  
export interface Stamp {
  id: string;
  imageUri: string;
  imageSize: { width: number; height: number } | undefined;
  transformations: Transformations;
}

export interface Page {
  photo_url: string
  stamp_url: string
  stamp_transformation: Transformations
  stamp_size: { width: number; height: number }
  date: string
  notes?: string
  location_name: string
  geocode: {
    latitude: number;
    longitude: number;
  } 
}

export interface ScaffoldedPage {
  location_name: string
  geocode: {
    latitude: number;
    longitude: number;
  }
}