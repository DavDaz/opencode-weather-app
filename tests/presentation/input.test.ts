import { afterEach, expect, mock, test } from "bun:test";
import { ask, selectCity, selectGeocodingResult } from "../../src/presentation/input.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { AppData } from "../../src/types/AppData.ts";

const originalPrompt = globalThis.prompt;
const city = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const result = { id: 1, name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const data: AppData = { cities: [city], defaultCityId: "1", settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } };

afterEach(() => {
  globalThis.prompt = originalPrompt;
});

test("ask trims answers and converts empty input to null", () => {
  globalThis.prompt = mock(() => "  hello  ");
  expect(ask("Question")).toBe("hello");
  globalThis.prompt = mock(() => "   ");
  expect(ask("Question")).toBeNull();
});

test("selection helpers support single, valid, and invalid selections", () => {
  globalThis.prompt = mock(() => "2");
  expect(selectGeocodingResult([result, { ...result, id: 2, name: "Colon" }])?.id).toBe(2);
  globalThis.prompt = mock(() => "bad");
  expect(selectGeocodingResult([result, { ...result, id: 2 }])).toBeUndefined();
  globalThis.prompt = mock(() => "1");
  expect(selectCity(data, "Choose")?.id).toBe("1");
  expect(selectCity({ ...data, cities: [] }, "Choose")).toBeUndefined();
});
