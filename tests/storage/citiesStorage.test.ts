import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadData, saveData } from "../../src/storage/citiesStorage.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { AppData } from "../../src/types/AppData.ts";

let temporaryDirectory: string | undefined;
afterEach(async () => {
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true });
  temporaryDirectory = undefined;
});
async function paths(): Promise<[string, string]> {
  temporaryDirectory = await mkdtemp(join(tmpdir(), "weather-cli-"));
  return [join(temporaryDirectory, "config", "data.json"), join(temporaryDirectory, "legacy.json")];
}
const emptyData = (): AppData => ({ cities: [], defaultCityId: null, settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } });

test("loadData returns defaults when storage is absent", async () => {
  const [path] = await paths();
  await expect(loadData(path, path)).resolves.toEqual(emptyData());
});

test("saveData creates parent directories and reloads data", async () => {
  const [path] = await paths();
  const data = { ...emptyData(), defaultCityId: "1", cities: [{ id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 }] };
  await saveData(data, path);
  await expect(loadData(path, path)).resolves.toEqual(data);
  expect(await Bun.file(path).text()).toContain('"defaultCityId": "1"');
});

test("loadData repairs a missing default city", async () => {
  const [path] = await paths();
  await saveData({ ...emptyData(), defaultCityId: "missing", cities: [{ id: "first", name: "A", country: "B", latitude: 1, longitude: 2 }] }, path);
  await expect(loadData(path, path)).resolves.toMatchObject({ defaultCityId: "first" });
});

test("invalid primary data falls back to defaults without using legacy data", async () => {
  const [path, legacy] = await paths();
  await mkdir(join(temporaryDirectory as string, "config"), { recursive: true });
  await Bun.write(path, JSON.stringify({ cities: "invalid" }));
  await Bun.write(legacy, JSON.stringify({ ...emptyData(), defaultCityId: "legacy" }));
  await expect(loadData(path, legacy)).resolves.toEqual(emptyData());
});

test("loadData migrates valid legacy data", async () => {
  const [path, legacy] = await paths();
  const data = emptyData();
  await saveData(data, legacy);
  await expect(loadData(path, legacy)).resolves.toEqual(data);
  expect(await Bun.file(path).exists()).toBe(true);
});
