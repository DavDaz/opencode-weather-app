import { addCity as addCityAction } from "../actions/addCity.ts";
import { getForecast } from "../actions/forecast.ts";
import { getWeather } from "../actions/getWeather.ts";
import { listCities } from "../actions/listCities.ts";
import { removeCity as removeCityAction } from "../actions/removeCity.ts";
import { setDefaultCity as setDefaultCityAction } from "../actions/setDefaultCity.ts";
import { toggleTemperatureUnit } from "../actions/settings.ts";
import {
  ask,
  selectCity,
  selectGeocodingResult,
  waitForEnter,
} from "./input.ts";
import {
  printCurrentWeather,
  printCurrentWeatherError,
  printForecast,
  printForecastError,
  printFailure,
  printLoading,
  printMenu,
  printMessage,
  printSuccess,
} from "./output.ts";
import { MENU_SEPARATOR } from "../utils/constants.ts";
import { cityLabel, errorMessage, unitLabel } from "../utils/format.ts";
import { TEMPERATURE_UNIT } from "../types/Weather.ts";
import type { AppData } from "../types/AppData.ts";
import type { City } from "../types/City.ts";
import type { MenuOption } from "../types/MenuOption.ts";

function renderMenu(data: AppData): void {
  const options = Object.entries(MENU_ACTIONS)
    .map(([option, action]) => `  ${option}. ${action.label(data)}`)
    .join("\n");

  printMenu(`\n${MENU_SEPARATOR}
          WEATHER CLI
${MENU_SEPARATOR}
${options}
  9. Salir
${MENU_SEPARATOR}`);
}

function getDefaultCity(data: AppData): City | undefined {
  return data.cities.find((city) => city.id === data.defaultCityId);
}

async function showWeather(data: AppData, city: City): Promise<void> {
  try {
    printLoading(`\nConsultando el clima de ${cityLabel(city)}...`);
    const weather = await getWeather(city, data.settings.temperatureUnit);
    printCurrentWeather(city, weather, data.settings.temperatureUnit);
  } catch (error) {
    printCurrentWeatherError(city, error);
  }
}

async function showDefaultWeather(data: AppData): Promise<void> {
  const city = getDefaultCity(data);

  if (!city) {
    printMessage("\nTodavía no tienes una ciudad predeterminada. Agrega una desde la opción 3.");
  } else {
    await showWeather(data, city);
  }

  waitForEnter();
}

async function showAllWeather(data: AppData): Promise<void> {
  if (data.cities.length === 0) {
    printMessage("\nNo tienes ciudades guardadas. Agrega una desde la opción 3.");
  } else {
    for (const city of listCities(data)) {
      await showWeather(data, city);
    }
  }

  waitForEnter();
}

async function addCity(data: AppData): Promise<void> {
  const name = ask("\nIngresa el nombre de la ciudad: ");

  if (!name) {
    return;
  }

  try {
    printLoading("\nBuscando ciudades...");
    const result = await addCityAction(
      data,
      name,
      selectGeocodingResult,
      () => printLoading("Guardando ciudad..."),
    );

    if (result.status === "cancelled") {
      waitForEnter();
      return;
    }

    if (result.status === "duplicate") {
      printSuccess(`\n${cityLabel(result.city)} ya está guardada.`);
    } else {
      printSuccess(`\n${cityLabel(result.city)} fue agregada correctamente.`);
    }
  } catch (error) {
    printFailure(`\nNo se pudo agregar la ciudad: ${errorMessage(error)}`);
  }

  waitForEnter();
}

async function removeCity(data: AppData): Promise<void> {
  const city = selectCity(data, "Ciudades guardadas:");

  if (!city) {
    waitForEnter();
    return;
  }

  const confirmation = ask(`¿Eliminar ${cityLabel(city)}? (s/N): `);
  const result = await removeCityAction(
    data,
    city,
    confirmation?.toLowerCase() === "s",
    () => printLoading("Guardando cambios..."),
  );

  if (result.status === "cancelled") {
    printMessage("\nOperación cancelada.");
  } else {
    printSuccess(`\n${cityLabel(result.city)} fue eliminada.`);
  }

  waitForEnter();
}

async function setDefaultCity(data: AppData): Promise<void> {
  const city = selectCity(data, "Selecciona la nueva ciudad predeterminada:");

  if (city) {
    await setDefaultCityAction(data, city, () => printLoading("Guardando cambios..."));
    printSuccess(`\n${cityLabel(city)} es ahora la ciudad predeterminada.`);
  }

  waitForEnter();
}

async function showSevenDayForecast(data: AppData): Promise<void> {
  const city = selectCity(data, "Selecciona una ciudad para el pronóstico:");

  if (!city) {
    waitForEnter();
    return;
  }

  try {
    printLoading(`\nConsultando el pronóstico de ${cityLabel(city)}...`);
    const forecast = await getForecast(city, data.settings.temperatureUnit);
    printForecast(city, forecast, data.settings.temperatureUnit);
  } catch (error) {
    printForecastError(city, error);
  }

  waitForEnter();
}

async function changeTemperatureUnit(data: AppData): Promise<void> {
  const temperatureUnit = await toggleTemperatureUnit(
    data,
    () => printLoading("Guardando cambios..."),
  );
  printSuccess(`\nUnidad de temperatura actualizada a ${unitLabel(temperatureUnit)}.`);
  waitForEnter();
}

const MENU_ACTIONS = {
  "1": {
    label: () => "Clima de ciudad default",
    execute: showDefaultWeather,
  },
  "2": {
    label: (data) => `Clima de todas las ciudades (${data.cities.length})`,
    execute: showAllWeather,
  },
  "3": {
    label: () => "Buscar y agregar ciudad",
    execute: addCity,
  },
  "4": {
    label: () => "Eliminar ciudad",
    execute: removeCity,
  },
  "5": {
    label: () => "Establecer ciudad default",
    execute: setDefaultCity,
  },
  "6": {
    label: () => "Pronóstico de 7 días",
    execute: showSevenDayForecast,
  },
  "8": {
    label: (data) => `Ajustes (${unitLabel(data.settings.temperatureUnit)})`,
    execute: changeTemperatureUnit,
  },
} satisfies Record<string, MenuOption>;

export async function runMenu(data: AppData): Promise<void> {
  while (true) {
    renderMenu(data);
    const option = ask("  Selecciona una opción: ");

    if (option === null || option === "9") {
      printMessage("\nHasta luego.");
      return;
    }

    const action = MENU_ACTIONS[option as keyof typeof MENU_ACTIONS];

    if (!action) {
      printMessage("\nOpción inválida.");
      waitForEnter();
      continue;
    }

    await action.execute(data);
  }
}
