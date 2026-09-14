import { afterEach, expect, spyOn, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { City } from "../../src/types/City.ts";
import * as weather from "../../src/api/weather.ts";
import { getWeather } from "../../src/actions/getWeather.ts";

const city: City = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const currentWeather = { time: "2026-09-03T10:00", temperature_2m: 29.4 };
const getCurrentWeather = spyOn(weather, "getCurrentWeather").mockResolvedValue(currentWeather);

afterEach(() => {
  getCurrentWeather.mockRestore();
});

test("getWeather delegates the city and temperature unit", async () => {
  await expect(getWeather(city, TEMPERATURE_UNIT.FAHRENHEIT)).resolves.toEqual(currentWeather);
  expect(getCurrentWeather).toHaveBeenCalledWith(city, TEMPERATURE_UNIT.FAHRENHEIT);
});
