import { afterEach, expect, spyOn, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { City } from "../../src/types/City.ts";
import * as weather from "../../src/api/weather.ts";
import { getForecast } from "../../src/actions/forecast.ts";

const city: City = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const forecast = [{ date: "2026-09-03", minimumTemperature: 24, maximumTemperature: 31, precipitationProbability: 30 }];
const getSevenDayForecast = spyOn(weather, "getSevenDayForecast").mockResolvedValue(forecast);

afterEach(() => {
  getSevenDayForecast.mockRestore();
});

test("getForecast delegates the city and temperature unit", async () => {
  await expect(getForecast(city, TEMPERATURE_UNIT.CELSIUS)).resolves.toEqual(forecast);
  expect(getSevenDayForecast).toHaveBeenCalledWith(city, TEMPERATURE_UNIT.CELSIUS);
});
