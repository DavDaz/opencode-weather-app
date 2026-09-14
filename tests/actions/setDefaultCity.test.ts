import { afterEach, expect, spyOn, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { AppData } from "../../src/types/AppData.ts";
import type { City } from "../../src/types/City.ts";

const city: City = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const data = (): AppData => ({ cities: [], defaultCityId: null, settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } });
import * as citiesStorage from "../../src/storage/citiesStorage.ts";
import { setDefaultCity } from "../../src/actions/setDefaultCity.ts";
const saveData = spyOn(citiesStorage, "saveData").mockResolvedValue(undefined);

afterEach(() => {
  saveData.mockRestore();
});

test("setDefaultCity saves the selected city", async () => {
  const state = data();
  await setDefaultCity(state, city);
  expect(state.defaultCityId).toBe("1");
  expect(saveData).toHaveBeenCalledTimes(1);
});
