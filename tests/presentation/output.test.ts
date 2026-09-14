import { afterEach, expect, mock, test } from "bun:test";
import {
  printCurrentWeather,
  printCurrentWeatherError,
  printFailure,
  printForecast,
  printForecastError,
  printLoading,
  printMenu,
  printMessage,
  printSuccess,
} from "../../src/presentation/output.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";

const city = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const originalLog = console.log;
const originalError = console.error;

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
});

test("print helpers send formatted messages to the appropriate console", () => {
  const log = mock((..._args: unknown[]) => undefined);
  const error = mock((..._args: unknown[]) => undefined);
  console.log = log;
  console.error = error;

  printMenu("menu");
  printMessage("message");
  printLoading("loading");
  printSuccess("success");
  printFailure("failure");
  printCurrentWeather(city, { time: "10:00", temperature_2m: 29.456 }, TEMPERATURE_UNIT.CELSIUS);
  printForecast(city, [{ date: "2026-09-03", minimumTemperature: 24.12, maximumTemperature: 31.45, precipitationProbability: 30 }], TEMPERATURE_UNIT.FAHRENHEIT);

  expect(log.mock.calls.map(([value]) => value)).toEqual([
    "\x1b[36mmenu\x1b[0m",
    "message",
    "\x1b[36mloading\x1b[0m",
    "\x1b[32msuccess\x1b[0m",
    "\nPanama, Panama",
    "\x1b[33m  Temperatura actual: 29.5°C\x1b[0m",
    "  Hora local: 10:00",
    "\nPronóstico de 7 días para Panama, Panama",
    "2026-09-03: \x1b[33mmín 24.1°F, máx 31.4°F\x1b[0m, lluvia 30%",
  ]);
  expect(error.mock.calls).toEqual([["\x1b[31mfailure\x1b[0m"]]);
});

test("weather error helpers format Error and unknown failures", () => {
  const error = mock((..._args: unknown[]) => undefined);
  console.error = error;

  printCurrentWeatherError(city, new Error("offline"));
  printForecastError(city, "offline");

  expect(error.mock.calls).toEqual([
    ["\x1b[31m\nNo se pudo obtener el clima de Panama, Panama: offline\x1b[0m"],
    ["\x1b[31m\nNo se pudo obtener el pronóstico de Panama, Panama: Error desconocido\x1b[0m"],
  ]);
});
