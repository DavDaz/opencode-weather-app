import { afterEach, expect, spyOn, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { AppData } from "../../src/types/AppData.ts";
import type { City } from "../../src/types/City.ts";

const city: City = {
  id: "1",
  name: "Panama",
  country: "Panama",
  latitude: 8,
  longitude: -79,
};
const result = {
  id: 1,
  name: "Panama",
  country: "Panama",
  latitude: 8,
  longitude: -79,
};
const data = (): AppData => ({
  cities: [],
  defaultCityId: null,
  settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS },
});
import * as citiesStorage from "../../src/storage/citiesStorage.ts";
import { addCity } from "../../src/actions/addCity.ts";
const saveData = spyOn(citiesStorage, "saveData").mockResolvedValue(undefined);

const originalFetch = globalThis.fetch;
afterEach(() => {
  saveData.mockRestore();
  globalThis.fetch = originalFetch;
});

test("addCity handles cancellation, duplicates, and first-city defaulting", async () => {
  globalThis.fetch = (async () =>
    Response.json({ results: [result] })) as unknown as typeof fetch;
  const cancelled = await addCity(data(), "Panama", () => undefined);
  expect(cancelled).toEqual({ status: "cancelled" });
  const existing = data();
  existing.cities.push(city);
  existing.defaultCityId = city.id;
  expect(await addCity(existing, "Panama", () => result)).toEqual({
    status: "duplicate",
    city,
  });
  const fresh = data();
  expect(await addCity(fresh, "Panama", () => result)).toEqual({
    status: "added",
    city,
  });
  expect(fresh.defaultCityId).toBe("1");
  expect(saveData).toHaveBeenCalledTimes(1);
});
