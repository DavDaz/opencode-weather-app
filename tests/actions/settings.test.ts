import { afterEach, expect, spyOn, test } from "bun:test";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import type { AppData } from "../../src/types/AppData.ts";

const data = (): AppData => ({ cities: [], defaultCityId: null, settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } });
import * as settingsStorage from "../../src/storage/settingsStorage.ts";
import { toggleTemperatureUnit } from "../../src/actions/settings.ts";
const saveData = spyOn(settingsStorage, "saveSettings").mockResolvedValue(undefined);

afterEach(() => {
  saveData.mockClear();
});

test("settings toggle persists the selected temperature unit", async () => {
  const state = data();
  await expect(toggleTemperatureUnit(state)).resolves.toBe(TEMPERATURE_UNIT.FAHRENHEIT);
  expect(saveData).toHaveBeenCalledTimes(1);
});

test("settings toggle calls beforeSave before persisting and toggles back", async () => {
  const state = data();
  const events: string[] = [];
  await expect(toggleTemperatureUnit(state, () => events.push("before-save"))).resolves.toBe(
    TEMPERATURE_UNIT.FAHRENHEIT,
  );
  events.push("after-save");
  expect(saveData).toHaveBeenCalledWith(state);
  expect(events).toEqual(["before-save", "after-save"]);
  await expect(toggleTemperatureUnit(state)).resolves.toBe(TEMPERATURE_UNIT.CELSIUS);
});
