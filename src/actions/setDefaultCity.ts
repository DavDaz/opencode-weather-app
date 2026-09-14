import { saveData } from "../storage/citiesStorage.ts";
import type { AppData } from "../types/AppData.ts";
import type { City } from "../types/City.ts";

export async function setDefaultCity(
  data: AppData,
  city: City,
  beforeSave?: () => void,
): Promise<void> {
  data.defaultCityId = city.id;
  beforeSave?.();
  await saveData(data);
}
