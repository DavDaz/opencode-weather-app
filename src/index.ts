import { loadData } from "./storage/citiesStorage.ts";
import { runMenu } from "./presentation/menu.ts";
import { printLoading } from "./presentation/output.ts";

async function main(): Promise<void> {
  printLoading("Cargando configuración...");
  const data = await loadData();
  await runMenu(data);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`\nLa aplicación terminó con un error: ${message}`);
  process.exitCode = 1;
});
