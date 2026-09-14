import { saveSettings } from "../storage/settingsStorage.ts";
import {
  TEMPERATURE_UNIT,
  type TemperatureUnit,
} from "../types/Weather.ts";
import type { AppData } from "../types/AppData.ts";

export async function toggleTemperatureUnit(
  data: AppData,
  beforeSave?: () => void,
): Promise<TemperatureUnit> {
  data.settings.temperatureUnit =
    data.settings.temperatureUnit === TEMPERATURE_UNIT.CELSIUS
      ? TEMPERATURE_UNIT.FAHRENHEIT
      : TEMPERATURE_UNIT.CELSIUS;
  beforeSave?.();
  await saveSettings(data);
  return data.settings.temperatureUnit;
}
