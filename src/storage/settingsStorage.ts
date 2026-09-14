import type { AppData } from "../types/AppData.ts";
import { saveAppData } from "./dataFile.ts";

export function saveSettings(data: AppData): Promise<void> {
  return saveAppData(data);
}
