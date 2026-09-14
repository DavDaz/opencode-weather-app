import type { AppData } from "../types/AppData.ts";
import type { City } from "../types/City.ts";

export function listCities(data: AppData): City[] {
  return data.cities;
}
