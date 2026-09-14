import { expect, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import { listCities } from "../../src/actions/listCities.ts";
import type { AppData } from "../../src/types/AppData.ts";

const data = (): AppData => ({ cities: [], defaultCityId: null, settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } });

test("listCities returns the state cities", () => {
  const state = data();
  expect(listCities(state)).toBe(state.cities);
});
