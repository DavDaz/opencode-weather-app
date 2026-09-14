export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}
