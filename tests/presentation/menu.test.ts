import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import type { AppData } from "../../src/types/AppData.ts";
import type { City } from "../../src/types/City.ts";
import { TEMPERATURE_UNIT } from "../../src/types/Weather.ts";
import * as input from "../../src/presentation/input.ts";
import * as output from "../../src/presentation/output.ts";
import * as addCityAction from "../../src/actions/addCity.ts";
import * as forecastAction from "../../src/actions/forecast.ts";
import * as getWeatherAction from "../../src/actions/getWeather.ts";
import * as listCitiesAction from "../../src/actions/listCities.ts";
import * as removeCityAction from "../../src/actions/removeCity.ts";
import * as setDefaultCityAction from "../../src/actions/setDefaultCity.ts";
import * as settingsAction from "../../src/actions/settings.ts";
import { runMenu } from "../../src/presentation/menu.ts";

const city: City = { id: "1", name: "Panama", country: "Panama", latitude: 8, longitude: -79 };
const data: AppData = { cities: [city], defaultCityId: "1", settings: { temperatureUnit: TEMPERATURE_UNIT.CELSIUS } };
let answers: any;
let waitForEnter: any;
let printMessage: any;
let printMenu: any;
let printLoading: any;
let printSuccess: any;
let printFailure: any;
let printCurrentWeather: any;
let printCurrentWeatherError: any;
let printForecast: any;
let printForecastError: any;
let selectCity: any;
let selectGeocodingResult: any;
let getWeather: any;
let getForecast: any;
let listCities: any;
let addCity: any;
let removeCity: any;
let setDefaultCity: any;
let toggleTemperatureUnit: any;

beforeEach(() => {
  answers = spyOn(input, "ask").mockReturnValue("9");
  waitForEnter = spyOn(input, "waitForEnter").mockImplementation(() => undefined);
  printMessage = spyOn(output, "printMessage").mockImplementation(() => undefined);
  printMenu = spyOn(output, "printMenu").mockImplementation(() => undefined);
  printLoading = spyOn(output, "printLoading").mockImplementation(() => undefined);
  printSuccess = spyOn(output, "printSuccess").mockImplementation(() => undefined);
  printFailure = spyOn(output, "printFailure").mockImplementation(() => undefined);
  printCurrentWeather = spyOn(output, "printCurrentWeather").mockImplementation(() => undefined);
  printCurrentWeatherError = spyOn(output, "printCurrentWeatherError").mockImplementation(() => undefined);
  printForecast = spyOn(output, "printForecast").mockImplementation(() => undefined);
  printForecastError = spyOn(output, "printForecastError").mockImplementation(() => undefined);
  selectCity = spyOn(input, "selectCity").mockReturnValue(city);
  selectGeocodingResult = spyOn(input, "selectGeocodingResult").mockReturnValue({ id: 1, name: city.name, country: city.country, latitude: city.latitude, longitude: city.longitude });
  getWeather = spyOn(getWeatherAction, "getWeather").mockResolvedValue({ time: "10:00", temperature_2m: 29 });
  getForecast = spyOn(forecastAction, "getForecast").mockResolvedValue([]);
  listCities = spyOn(listCitiesAction, "listCities").mockReturnValue([city]);
  addCity = spyOn(addCityAction, "addCity").mockResolvedValue({ status: "added", city });
  removeCity = spyOn(removeCityAction, "removeCity").mockResolvedValue({ status: "removed", city });
  setDefaultCity = spyOn(setDefaultCityAction, "setDefaultCity").mockResolvedValue(undefined);
  toggleTemperatureUnit = spyOn(settingsAction, "toggleTemperatureUnit").mockResolvedValue(TEMPERATURE_UNIT.FAHRENHEIT);
});

afterEach(() => {
  for (const fn of [answers, waitForEnter, printMessage, printMenu, printLoading, printSuccess, printFailure, printCurrentWeather, printCurrentWeatherError, printForecast, printForecastError, selectCity, selectGeocodingResult, getWeather, getForecast, listCities, addCity, removeCity, setDefaultCity, toggleTemperatureUnit]) fn.mockRestore();
});

test("runMenu routes every action, invalid input, and exit without blocking", async () => {
  const queue = ["1", "2", "3", "Panama", "4", "s", "5", "6", "8", "bad", "9"];
  answers.mockImplementation(() => queue.shift() ?? "9");

  await runMenu(data);

  expect(getWeather).toHaveBeenCalledWith(city, TEMPERATURE_UNIT.CELSIUS);
  expect(getForecast).toHaveBeenCalledWith(city, TEMPERATURE_UNIT.CELSIUS);
  expect(addCity).toHaveBeenCalled();
  expect(removeCity).toHaveBeenCalledWith(data, city, true, expect.any(Function));
  expect(setDefaultCity).toHaveBeenCalledWith(data, city, expect.any(Function));
  expect(toggleTemperatureUnit).toHaveBeenCalledWith(data, expect.any(Function));
  expect(listCities).toHaveBeenCalledWith(data);
  expect(printMessage).toHaveBeenCalledWith("\nOpción inválida.");
  expect(printMessage).toHaveBeenCalledWith("\nHasta luego.");
});

test.each([null, "9"]) ("runMenu exits when the selected option is %p", async (option) => {
  answers.mockReturnValue(option);

  await runMenu(data);

  expect(printMessage).toHaveBeenCalledWith("\nHasta luego.");
  expect(printMenu).toHaveBeenCalledTimes(1);
});

test("showDefaultWeather reports when no default city exists", async () => {
  answers.mockReturnValueOnce("1").mockReturnValueOnce("9");
  const withoutDefault = { ...data, defaultCityId: null };

  await runMenu(withoutDefault);

  expect(printMessage).toHaveBeenCalledWith("\nTodavía no tienes una ciudad predeterminada. Agrega una desde la opción 3.");
  expect(getWeather).not.toHaveBeenCalled();
  expect(waitForEnter).toHaveBeenCalledTimes(1);
});

test("showDefaultWeather reports a weather failure", async () => {
  answers.mockReturnValueOnce("1").mockReturnValueOnce("9");
  const error = new Error("weather unavailable");
  getWeather.mockRejectedValueOnce(error);

  await runMenu(data);

  expect(printCurrentWeatherError).toHaveBeenCalledWith(city, error);
});

test("showAllWeather reports when there are no saved cities", async () => {
  answers.mockReturnValueOnce("2").mockReturnValueOnce("9");
  listCities.mockReturnValueOnce([]);

  await runMenu({ ...data, cities: [] });

  expect(printMessage).toHaveBeenCalledWith("\nNo tienes ciudades guardadas. Agrega una desde la opción 3.");
  expect(waitForEnter).toHaveBeenCalledTimes(1);
});

test("showAllWeather reports failures for individual cities", async () => {
  answers.mockReturnValueOnce("2").mockReturnValueOnce("9");
  const error = new Error("weather unavailable");
  getWeather.mockRejectedValueOnce(error);

  await runMenu(data);

  expect(printCurrentWeatherError).toHaveBeenCalledWith(city, error);
});

test("addCity returns without waiting when the city name is empty", async () => {
  answers.mockReturnValueOnce("3").mockReturnValueOnce("").mockReturnValueOnce("9");

  await runMenu(data);

  expect(addCity).not.toHaveBeenCalled();
  expect(waitForEnter).not.toHaveBeenCalled();
});

test("addCity waits after geocoding cancellation", async () => {
  answers.mockReturnValueOnce("3").mockReturnValueOnce("Panama").mockReturnValueOnce("9");
  addCity.mockResolvedValueOnce({ status: "cancelled" as const });

  await runMenu(data);

  expect(waitForEnter).toHaveBeenCalledTimes(1);
  expect(printSuccess).not.toHaveBeenCalled();
});

test("addCity reports duplicate and action failures", async () => {
  answers.mockReturnValueOnce("3").mockReturnValueOnce("Panama").mockReturnValueOnce("3").mockReturnValueOnce("Panama").mockReturnValueOnce("9");
  const error = new Error("geocoding unavailable");
  addCity.mockResolvedValueOnce({ status: "duplicate" as const, city });
  addCity.mockRejectedValueOnce(error);

  await runMenu(data);

  expect(printSuccess).toHaveBeenCalledWith("\nPanama, Panama ya está guardada.");
  expect(printFailure).toHaveBeenCalledWith("\nNo se pudo agregar la ciudad: geocoding unavailable");
});

test("removeCity handles selection and confirmation cancellation", async () => {
  answers.mockReturnValueOnce("4").mockReturnValueOnce("n").mockReturnValueOnce("9");
  removeCity.mockResolvedValueOnce({ status: "cancelled" as const });

  await runMenu(data);

  expect(removeCity).toHaveBeenCalledWith(data, city, false, expect.any(Function));
  expect(printMessage).toHaveBeenCalledWith("\nOperación cancelada.");
});

test("removeCity waits when no city is selected", async () => {
  answers.mockReturnValueOnce("4").mockReturnValueOnce("9");
  selectCity.mockReturnValueOnce(undefined);

  await runMenu(data);

  expect(removeCity).not.toHaveBeenCalled();
  expect(waitForEnter).toHaveBeenCalledTimes(1);
});

test("setDefaultCity handles selection cancellation", async () => {
  answers.mockReturnValueOnce("5").mockReturnValueOnce("9");
  selectCity.mockReturnValueOnce(undefined);

  await runMenu(data);

  expect(setDefaultCity).not.toHaveBeenCalled();
  expect(waitForEnter).toHaveBeenCalledTimes(1);
});

test("showSevenDayForecast handles absent city and failures", async () => {
  answers.mockReturnValueOnce("6").mockReturnValueOnce("6").mockReturnValueOnce("9");
  selectCity.mockReturnValueOnce(undefined).mockReturnValueOnce(city);
  const error = new Error("forecast unavailable");
  getForecast.mockRejectedValueOnce(error);

  await runMenu(data);

  expect(getForecast).toHaveBeenCalledWith(city, TEMPERATURE_UNIT.CELSIUS);
  expect(printForecastError).toHaveBeenCalledWith(city, error);
  expect(waitForEnter).toHaveBeenCalledTimes(2);
});

test("changeTemperatureUnit delegates and reports the selected unit", async () => {
  answers.mockReturnValueOnce("8").mockReturnValueOnce("9");
  toggleTemperatureUnit.mockResolvedValueOnce(TEMPERATURE_UNIT.FAHRENHEIT);

  await runMenu(data);

  expect(toggleTemperatureUnit).toHaveBeenCalledWith(data, expect.any(Function));
  expect(printSuccess).toHaveBeenCalledWith("\nUnidad de temperatura actualizada a °F.");
  expect(waitForEnter).toHaveBeenCalledTimes(1);
});
