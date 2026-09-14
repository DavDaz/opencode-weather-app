import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { TEMPERATURE_UNIT, type TemperatureUnit } from "../types/Weather.ts";
import type { AppData } from "../types/AppData.ts";
import type { City } from "../types/City.ts";

const HOME_DIRECTORY = Bun.env.HOME ?? Bun.env.USERPROFILE ?? ".";
const STORAGE_PATH = `${HOME_DIRECTORY}/.config/weather-cli/data.json`;
const LEGACY_STORAGE_PATH = `${HOME_DIRECTORY}/.weather-cli.json`;

function createDefaultData(): AppData {
  return {
    cities: [],
    defaultCityId: null,
    settings: {
      temperatureUnit: TEMPERATURE_UNIT.CELSIUS,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return (
    value === TEMPERATURE_UNIT.CELSIUS ||
    value === TEMPERATURE_UNIT.FAHRENHEIT
  );
}

function isCity(value: unknown): value is City {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.country === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number"
  );
}

function isAppData(value: unknown): value is AppData {
  if (!isRecord(value) || !Array.isArray(value.cities)) {
    return false;
  }

  if (
    !value.cities.every(isCity) ||
    (typeof value.defaultCityId !== "string" && value.defaultCityId !== null)
  ) {
    return false;
  }

  return (
    isRecord(value.settings) &&
    isTemperatureUnit(value.settings.temperatureUnit)
  );
}

function repairDefaultCity(data: AppData): AppData {
  if (
    data.defaultCityId !== null &&
    !data.cities.some((city) => city.id === data.defaultCityId)
  ) {
    data.defaultCityId = data.cities[0]?.id ?? null;
  }

  return data;
}

async function readData(storagePath: string): Promise<AppData | undefined> {
  const file = Bun.file(storagePath);

  try {
    const content: unknown = JSON.parse(await file.text());

    if (!isAppData(content)) {
      throw new Error("El archivo de configuración tiene un formato inválido.");
    }

    return repairDefaultCity(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.warn(`No se pudo cargar la configuración: ${message}`);
    return undefined;
  }
}

export async function loadAppData(
  storagePath = STORAGE_PATH,
  legacyStoragePath = LEGACY_STORAGE_PATH,
): Promise<AppData> {
  if (await Bun.file(storagePath).exists()) {
    return (await readData(storagePath)) ?? createDefaultData();
  }

  if (storagePath !== legacyStoragePath && (await Bun.file(legacyStoragePath).exists())) {
    const legacyData = await readData(legacyStoragePath);

    if (legacyData) {
      await saveAppData(legacyData, storagePath);
      return legacyData;
    }
  }

  return createDefaultData();
}

export async function saveAppData(
  data: AppData,
  storagePath = STORAGE_PATH,
): Promise<void> {
  repairDefaultCity(data);
  await mkdir(dirname(storagePath), { recursive: true });
  await Bun.write(storagePath, `${JSON.stringify(data, null, 2)}\n`);
}
