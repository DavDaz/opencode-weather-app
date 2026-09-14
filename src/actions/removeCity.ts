import { saveData } from "../storage/citiesStorage.ts";
import type { AppData } from "../types/AppData.ts";
import type { City } from "../types/City.ts";

export type RemoveCityResult =
  | { status: "cancelled"; city: City }
  | { status: "removed"; city: City };

export async function removeCity(
  data: AppData,
  city: City,
  confirmed: boolean,
  beforeSave?: () => void,
): Promise<RemoveCityResult> {
  if (!confirmed) {
    return { status: "cancelled", city };
  }

  data.cities = data.cities.filter((savedCity) => savedCity.id !== city.id);

  if (data.defaultCityId === city.id) {
    data.defaultCityId = data.cities[0]?.id ?? null;
  }

  beforeSave?.();
  await saveData(data);
  return { status: "removed", city };
}
