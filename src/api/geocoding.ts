import { fetchJson } from "./http.ts";
import { GEOCODING_API_URL } from "../utils/constants.ts";
import type { GeocodingResponse, GeocodingResult } from "../types/City.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.country === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number"
  );
}

function isGeocodingResponse(value: unknown): value is GeocodingResponse {
  return (
    isRecord(value) &&
    (value.results === undefined ||
      (Array.isArray(value.results) && value.results.every(isGeocodingResult)))
  );
}

export async function findCities(name: string): Promise<GeocodingResult[]> {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const response: unknown = await fetchJson(url);

  if (!isGeocodingResponse(response) || !response.results?.length) {
    throw new Error(`No se encontró la ciudad "${name}".`);
  }

  return response.results;
}
