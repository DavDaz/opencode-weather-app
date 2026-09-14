export const TEMPERATURE_UNIT = {
  CELSIUS: "celsius",
  FAHRENHEIT: "fahrenheit",
} as const;

export type TemperatureUnit =
  (typeof TEMPERATURE_UNIT)[keyof typeof TEMPERATURE_UNIT];

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
}

export interface WeatherResponse {
  current?: CurrentWeather;
}

export interface ForecastDay {
  date: string;
  minimumTemperature: number;
  maximumTemperature: number;
  precipitationProbability: number;
}

export interface DailyForecastResponse {
  time: string[];
  temperature_2m_min: number[];
  temperature_2m_max: number[];
  precipitation_probability_max: number[];
}

export interface ForecastResponse {
  daily?: DailyForecastResponse;
}
