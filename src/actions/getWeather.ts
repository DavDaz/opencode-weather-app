import { getCurrentWeather } from "../api/weather.ts";
import type { City } from "../types/City.ts";
import type { CurrentWeather, TemperatureUnit } from "../types/Weather.ts";

export function getWeather(
  city: City,
  temperatureUnit: TemperatureUnit,
): Promise<CurrentWeather> {
  return getCurrentWeather(city, temperatureUnit);
}
