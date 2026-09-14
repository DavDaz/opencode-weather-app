import { afterEach, expect, spyOn, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { AppData } from "../../src/types/AppData.ts";
import type { City } from "../../src/types/City.ts";

const city: City = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const data = (): AppData => ({ cities: [], defaultCityId: null, settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } });
import * as citiesStorage from "../../src/storage/citiesStorage.ts";
import { removeCity } from "../../src/actions/removeCity.ts";
const saveData = spyOn(citiesStorage, "saveData").mockResolvedValue(undefined);

afterEach(() => {
  saveData.mockRestore();
});

test("removeCity respects cancellation and repairs the default", async () => {
  const state = { ...data(), cities: [city, { ...city, id: "2", name: "Colon" }], defaultCityId: "1" };
  expect(await removeCity(state, city, false)).toEqual({ status: "cancelled", city });
  expect(state.cities).toHaveLength(2);
  expect(await removeCity(state, city, true)).toEqual({ status: "removed", city });
  expect(state.defaultCityId).toBe("2");
});
