import { afterEach, expect, test } from "bun:test";
import { fetchJson } from "../../src/api/http.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("fetchJson returns parsed JSON for successful responses", async () => {
  globalThis.fetch = (async () => Response.json({ ok: true })) as unknown as typeof fetch;

  await expect(fetchJson(new URL("https://example.test/data"))).resolves.toEqual({ ok: true });
});

test("fetchJson reports HTTP status failures", async () => {
  globalThis.fetch = (async () => new Response("unavailable", { status: 503 })) as unknown as typeof fetch;

  await expect(fetchJson(new URL("https://example.test/data"))).rejects.toThrow(
    "La API respondió con el estado 503.",
  );
});

test("fetchJson translates connection failures", async () => {
  globalThis.fetch = (async () => {
    throw new Error("DNS failure");
  }) as unknown as typeof fetch;

  await expect(fetchJson(new URL("https://example.test/data"))).rejects.toThrow(
    "No se pudo conectar con Open-Meteo: DNS failure",
  );
});

test("fetchJson translates timeout failures", async () => {
  globalThis.fetch = (async () => {
    throw new DOMException("timed out", "TimeoutError");
  }) as unknown as typeof fetch;

  await expect(fetchJson(new URL("https://example.test/data"))).rejects.toThrow(
    "Tiempo de espera agotado al conectar con Open-Meteo.",
  );
});
