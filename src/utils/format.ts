import { TEMPERATURE_UNIT, type TemperatureUnit } from "../types/Weather.ts";
import type { City, GeocodingResult } from "../types/City.ts";

export function unitLabel(unit: TemperatureUnit): string {
  return unit === TEMPERATURE_UNIT.CELSIUS ? "°C" : "°F";
}

export function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

export function resultLabel(result: GeocodingResult): string {
  return `${result.name}, ${result.country}`;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error desconocido";
}
