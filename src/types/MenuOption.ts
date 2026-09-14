import type { AppData } from "./AppData.ts";

export interface MenuOption {
  label: (data: AppData) => string;
  execute: (data: AppData) => Promise<void>;
}
