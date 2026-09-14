import { fetchJson } from "./http.ts";
import { FORECAST_API_URL } from "../utils/constants.ts";
import type { City } from "../types/City.ts";
import type {
  CurrentWeather,
  DailyForecastResponse,
  ForecastDay,
  ForecastResponse,
  TemperatureUnit,
  WeatherResponse,
} from "../types/Weather.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCurrentWeather(value: unknown): value is CurrentWeather {
  return (
    isRecord(value) &&
    typeof value.time === "string" &&
    typeof value.temperature_2m === "number"
  );
}

function isWeatherResponse(value: unknown): value is WeatherResponse {
  return isRecord(value) && isCurrentWeather(value.current);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isDailyForecastResponse(value: unknown): value is DailyForecastResponse {
  if (
    !isRecord(value) ||
    !isStringArray(value.time) ||
    !isNumberArray(value.temperature_2m_min) ||
    !isNumberArray(value.temperature_2m_max) ||
    !isNumberArray(value.precipitation_probability_max)
  ) {
    return false;
  }

  const length = value.time.length;
  return (
    length > 0 &&
    value.temperature_2m_min.length === length &&
    value.temperature_2m_max.length === length &&
    value.precipitation_probability_max.length === length
  );
}

function isForecastResponse(value: unknown): value is ForecastResponse {
  return isRecord(value) && isDailyForecastResponse(value.daily);
}

export async function getCurrentWeather(
  city: City,
  temperatureUnit: TemperatureUnit,
): Promise<CurrentWeather> {
  const url = new URL(FORECAST_API_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("temperature_unit", temperatureUnit);
  url.searchParams.set("timezone", "auto");

  const response: unknown = await fetchJson(url);

  if (!isWeatherResponse(response)) {
    throw new Error("La respuesta del clima tiene un formato inválido.");
  }

  const current = response.current;

  if (!current) {
    throw new Error("La respuesta del clima no incluye las condiciones actuales.");
  }

  return current;
}

export async function getSevenDayForecast(
  city: City,
  temperatureUnit: TemperatureUnit,
): Promise<ForecastDay[]> {
  const url = new URL(FORECAST_API_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set(
    "daily",
    "temperature_2m_min,temperature_2m_max,precipitation_probability_max",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("temperature_unit", temperatureUnit);
  url.searchParams.set("timezone", "auto");

  const response: unknown = await fetchJson(url);

  if (!isForecastResponse(response) || !response.daily) {
    throw new Error("La respuesta del pronóstico tiene un formato inválido.");
  }

  const days: ForecastDay[] = [];

  for (let index = 0; index < response.daily.time.length; index += 1) {
    const date = response.daily.time[index];
    const minimumTemperature = response.daily.temperature_2m_min[index];
    const maximumTemperature = response.daily.temperature_2m_max[index];
    const precipitationProbability = response.daily.precipitation_probability_max[index];

    if (
      date === undefined ||
      minimumTemperature === undefined ||
      maximumTemperature === undefined ||
      precipitationProbability === undefined
    ) {
      throw new Error("La respuesta del pronóstico tiene datos incompletos.");
    }

    days.push({
      date,
      minimumTemperature,
      maximumTemperature,
      precipitationProbability,
    });
  }

  return days;
}
