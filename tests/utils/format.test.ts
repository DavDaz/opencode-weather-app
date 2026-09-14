import { expect, test } from "bun:test";
import { cityLabel, errorMessage, resultLabel, unitLabel } from "../../src/utils/format.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";

const city = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const result = { id: 1, name: "Panama", country: "Panama", latitude: 8, longitude: -79 };

test("format utilities produce stable labels", () => {
  expect(unitLabel(TEMPERATURE_UNIT.CELSIUS)).toBe("°C");
  expect(cityLabel(city)).toBe("Panama, Panama");
  expect(cityLabel({ ...city, country: "" })).toBe("Panama");
  expect(resultLabel(result)).toBe("Panama, Panama");
  expect(errorMessage(new Error("broken"))).toBe("broken");
  expect(errorMessage("broken")).toBe("Error desconocido");
});
