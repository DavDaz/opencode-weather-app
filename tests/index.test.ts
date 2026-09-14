import { afterEach, expect, mock, spyOn, test } from "bun:test";
import type { AppData } from "../src/types/AppData.ts";
import { TEMPERATURE_UNIT } from "../src/types/Weather.ts";
import * as citiesStorage from "../src/storage/citiesStorage.ts";
import * as menu from "../src/presentation/menu.ts";
import * as output from "../src/presentation/output.ts";

const data: AppData = { cities: [], defaultCityId: null, settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } };
const loadData = spyOn(citiesStorage, "loadData").mockResolvedValue(data);
const runMenu = spyOn(menu, "runMenu").mockResolvedValue(undefined);
const printLoading = spyOn(output, "printLoading").mockImplementation(() => undefined);
const originalError = console.error;
const originalExitCode = process.exitCode;

afterEach(() => {
  console.error = originalError;
  process.exitCode = originalExitCode;
  loadData.mockRestore();
  runMenu.mockRestore();
  printLoading.mockRestore();
});

test("startup hands off successfully and reports initialization failures", async () => {
  await import("../src/index.ts?startup" as string);
  await Bun.sleep(0);

  expect(printLoading).toHaveBeenCalledWith("Cargando configuración...");
  expect(loadData).toHaveBeenCalledTimes(1);
  expect(runMenu).toHaveBeenCalledWith(data);

  loadData.mockClear();
  loadData.mockImplementation(async () => { throw new Error("storage unavailable"); });
  const error = mock((..._args: unknown[]) => undefined);
  console.error = error;

  await import("../src/index.ts?failure" as string);
  await Bun.sleep(0);

  expect(error).toHaveBeenCalledWith("\nLa aplicación terminó con un error: storage unavailable");
  expect(process.exitCode).toBe(1);
  process.exitCode = 0;
});
