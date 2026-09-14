import { afterEach, expect, test } from "bun:test";
import { findCities } from "../../src/api/geocoding.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("findCities builds the geocoding request and maps valid results", async () => {
  let requested: URL | undefined;
  globalThis.fetch = (async (input: string | URL | Request) => {
    requested = new URL(String(input));
    return Response.json({ results: [{ id: 1, name: "Santiago", country: "Chile", latitude: -33.4, longitude: -70.6 }] });
  }) as unknown as typeof fetch;

  await expect(findCities("Santiago")).resolves.toEqual([
    { id: 1, name: "Santiago", country: "Chile", latitude: -33.4, longitude: -70.6 },
  ]);
  expect(requested?.searchParams.get("name")).toBe("Santiago");
  expect(requested?.searchParams.get("count")).toBe("5");
  expect(requested?.searchParams.get("language")).toBe("es");
});

test("findCities rejects missing and malformed results", async () => {
  for (const response of [{}, { results: [] }, { results: [{ id: 1 }] }]) {
    globalThis.fetch = (async () => Response.json(response)) as unknown as typeof fetch;
    await expect(findCities("Unknown")).rejects.toThrow('No se encontró la ciudad "Unknown".');
  }
});
