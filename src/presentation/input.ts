import { printMessage } from "./output.ts";
import { cityLabel, resultLabel } from "../utils/format.ts";
import type { AppData } from "../types/AppData.ts";
import type { City, GeocodingResult } from "../types/City.ts";

export function ask(question: string): string | null {
  const answer = prompt(question);
  return answer?.trim() || null;
}

export function waitForEnter(): void {
  prompt("\nPresiona Enter para continuar...");
}

export function selectGeocodingResult(
  results: GeocodingResult[],
): GeocodingResult | undefined {
  if (results.length === 1) {
    return results[0];
  }

  printMessage("\nSe encontraron varias ciudades:");
  results.forEach((result, index) => {
    printMessage(`  ${index + 1}. ${resultLabel(result)}`);
  });

  const selection = ask("Selecciona una ciudad (Enter para cancelar): ");
  const index = selection === null ? Number.NaN : Number(selection) - 1;

  if (!Number.isInteger(index) || index < 0 || index >= results.length) {
    printMessage("\nSelección cancelada.");
    return undefined;
  }

  return results[index];
}

export function selectCity(data: AppData, action: string): City | undefined {
  if (data.cities.length === 0) {
    printMessage("\nNo tienes ciudades guardadas. Agrega una desde la opción 3.");
    return undefined;
  }

  printMessage(`\n${action}`);
  data.cities.forEach((city, index) => {
    const marker = city.id === data.defaultCityId ? " (default)" : "";
    printMessage(`  ${index + 1}. ${cityLabel(city)}${marker}`);
  });

  const selection = ask("Selecciona una ciudad: ");
  const index = selection === null ? Number.NaN : Number(selection) - 1;

  if (!Number.isInteger(index) || index < 0 || index >= data.cities.length) {
    printMessage("\nSelección inválida.");
    return undefined;
  }

  return data.cities[index];
}
