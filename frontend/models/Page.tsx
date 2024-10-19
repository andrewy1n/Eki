// models/Page.ts

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
    borderRadius: number;
    transformations: Transformations;
  }
  
  export interface Page {
    id: string;
    stampbookId: string; // Added to associate the page with a stampbook
    imageUri: string | null;
    imageTransformations: Transformations | undefined;
    stamps: Stamp[];
    notes: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
    stamped: boolean;
  }
  