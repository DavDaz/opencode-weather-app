import { afterEach, expect, test } from "bun:test";
import { getCurrentWeather, getSevenDayForecast } from "../../src/api/weather.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { City } from "../../src/types/City.ts";

const originalFetch = globalThis.fetch;
const city: City = { id: "1", name: "Panama", country: "Panama", latitude: 8.9824, longitude: -79.5199 };

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("getCurrentWeather maps a valid response and sends unit and coordinates", async () => {
  let requested: URL | undefined;
  globalThis.fetch = (async (input: string | URL | Request) => {
    requested = new URL(String(input));
    return Response.json({ current: { time: "2026-09-03T10:00", temperature_2m: 29.4 } });
  }) as unknown as typeof fetch;

  await expect(getCurrentWeather(city, TEMPERATURE_UNIT.FAHRENHEIT)).resolves.toEqual({
    time: "2026-09-03T10:00",
    temperature_2m: 29.4,
  });
  expect(requested?.searchParams.get("latitude")).toBe("8.9824");
  expect(requested?.searchParams.get("longitude")).toBe("-79.5199");
  expect(requested?.searchParams.get("temperature_unit")).toBe("fahrenheit");
});

test("getCurrentWeather rejects malformed responses", async () => {
  for (const response of [{}, { current: {} }, { current: { time: "now", temperature_2m: "hot" } }]) {
    globalThis.fetch = (async () => Response.json(response)) as unknown as typeof fetch;
    await expect(getCurrentWeather(city, TEMPERATURE_UNIT.CELSIUS)).rejects.toThrow(
      "La respuesta del clima tiene un formato inválido.",
    );
  }
});

test("getSevenDayForecast maps parallel daily arrays", async () => {
  globalThis.fetch = (async () => Response.json({
    daily: {
      time: ["2026-09-03", "2026-09-04"],
      temperature_2m_min: [24.1, 24.3],
      temperature_2m_max: [31.2, 31.5],
      precipitation_probability_max: [30, 45],
    },
  })) as unknown as typeof fetch;

  await expect(getSevenDayForecast(city, TEMPERATURE_UNIT.CELSIUS)).resolves.toEqual([
    { date: "2026-09-03", minimumTemperature: 24.1, maximumTemperature: 31.2, precipitationProbability: 30 },
    { date: "2026-09-04", minimumTemperature: 24.3, maximumTemperature: 31.5, precipitationProbability: 45 },
  ]);
});

test("getSevenDayForecast rejects empty or mismatched daily arrays", async () => {
  for (const daily of [
    { time: [], temperature_2m_min: [], temperature_2m_max: [], precipitation_probability_max: [] },
    { time: ["2026-09-03"], temperature_2m_min: [], temperature_2m_max: [30], precipitation_probability_max: [10] },
  ]) {
    globalThis.fetch = (async () => Response.json({ daily })) as unknown as typeof fetch;
    await expect(getSevenDayForecast(city, TEMPERATURE_UNIT.CELSIUS)).rejects.toThrow(
      "La respuesta del pronóstico tiene un formato inválido.",
    );
  }
});
