import { findCities } from "../api/geocoding.ts";
import { saveData } from "../storage/citiesStorage.ts";
import type { AppData } from "../types/AppData.ts";
import type { City, GeocodingResult } from "../types/City.ts";

export type CitySelection = (
  results: GeocodingResult[],
) => GeocodingResult | undefined;

export type AddCityResult =
  | { status: "cancelled" }
  | { status: "duplicate"; city: City }
  | { status: "added"; city: City };

export async function addCity(
  data: AppData,
  name: string,
  selectResult: CitySelection,
  beforeSave?: () => void,
): Promise<AddCityResult> {
  const results = await findCities(name);
  const result = selectResult(results);

  if (!result) {
    return { status: "cancelled" };
  }

  const city: City = {
    id: String(result.id),
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  };

  if (data.cities.some((savedCity) => savedCity.id === city.id)) {
    return { status: "duplicate", city };
  }

  data.cities.push(city);

  if (data.defaultCityId === null) {
    data.defaultCityId = city.id;
  }

  beforeSave?.();
  await saveData(data);
  return { status: "added", city };
}
