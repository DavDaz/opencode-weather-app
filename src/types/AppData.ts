import type { City } from "./City.ts";
import type { TemperatureUnit } from "./Weather.ts";

export interface Settings {
  temperatureUnit: TemperatureUnit;
}

export interface AppData {
  cities: City[];
  defaultCityId: string | null;
  settings: Settings;
}
