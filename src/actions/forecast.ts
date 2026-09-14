import { getSevenDayForecast } from "../api/weather.ts";
import type { City } from "../types/City.ts";
import type { ForecastDay, TemperatureUnit } from "../types/Weather.ts";

export function getForecast(
  city: City,
  temperatureUnit: TemperatureUnit,
): Promise<ForecastDay[]> {
  return getSevenDayForecast(city, temperatureUnit);
}
