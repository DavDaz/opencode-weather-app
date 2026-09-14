import { afterEach, expect, spyOn, test } from "bun:test";
import type { AppData } from "../../src/types/AppData.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";

import * as dataFile from "../../src/storage/dataFile.ts";
import { saveSettings } from "../../src/storage/settingsStorage.ts";
const saveAppData = spyOn(dataFile, "saveAppData").mockResolvedValue(undefined);

afterEach(() => {
  saveAppData.mockRestore();
});

test("saveSettings delegates to saveAppData", async () => {
  const data: AppData = {
    cities: [],
    defaultCityId: null,
    settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS },
  };

  await saveSettings(data);

  expect(saveAppData).toHaveBeenCalledWith(data);
});
