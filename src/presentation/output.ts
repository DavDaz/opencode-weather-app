import { failure, loading, menu, success, temperature } from "../utils/colors.ts";
import { cityLabel, errorMessage, unitLabel } from "../utils/format.ts";
import type { City } from "../types/City.ts";
import type { ForecastDay, CurrentWeather, TemperatureUnit } from "../types/Weather.ts";

export function printMenu(text: string): void {
  console.log(menu(text));
}

export function printMessage(text: string): void {
  console.log(text);
}

export function printLoading(text: string): void {
  console.log(loading(text));
}

export function printSuccess(text: string): void {
  console.log(success(text));
}

export function printFailure(text: string): void {
  console.error(failure(text));
}

export function printCurrentWeather(
  city: City,
  weather: CurrentWeather,
  temperatureUnit: TemperatureUnit,
): void {
  console.log(`\n${cityLabel(city)}`);
  console.log(
    temperature(
      `  Temperatura actual: ${weather.temperature_2m.toFixed(1)}${unitLabel(temperatureUnit)}`,
    ),
  );
  console.log(`  Hora local: ${weather.time}`);
}

export function printForecast(
  city: City,
  forecast: ForecastDay[],
  temperatureUnit: TemperatureUnit,
): void {
  console.log(`\nPronóstico de 7 días para ${cityLabel(city)}`);

  for (const day of forecast) {
    console.log(
      `${day.date}: ${temperature(`mín ${day.minimumTemperature.toFixed(1)}${unitLabel(temperatureUnit)}, máx ${day.maximumTemperature.toFixed(1)}${unitLabel(temperatureUnit)}`)}, lluvia ${day.precipitationProbability}%`,
    );
  }
}

export function printCurrentWeatherError(city: City, error: unknown): void {
  console.error(
    failure(`\nNo se pudo obtener el clima de ${cityLabel(city)}: ${errorMessage(error)}`),
  );
}

export function printForecastError(city: City, error: unknown): void {
  console.error(
    failure(`\nNo se pudo obtener el pronóstico de ${cityLabel(city)}: ${errorMessage(error)}`),
  );
}
