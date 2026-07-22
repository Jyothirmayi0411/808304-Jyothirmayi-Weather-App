export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string; // State / Region
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  relative_humidity: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts?: number;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  weather_code: number[];
  uv_index: number[];
  wind_speed_10m: number[];
}

export interface DailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather_units?: Record<string, string>;
  current_weather?: {
    time: string;
    interval?: number;
    temperature: number;
    windspeed: number;
    winddirection: number;
    is_day: number;
    weathercode: number;
  };
  current?: CurrentWeatherData;
  hourly?: HourlyData;
  daily?: DailyData;
}

export interface ActivityScore {
  id: string;
  name: string;
  iconName: string;
  score: number; // 0 to 100
  label: 'Ideal' | 'Good' | 'Fair' | 'Poor' | 'Hazardous';
  reason: string;
}

export interface WeatherInsightAlert {
  id: string;
  type: 'umbrella' | 'clothing' | 'uv' | 'wind' | 'general' | 'temperature';
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'alert';
  icon: string;
}

export interface SelectedLocation {
  name: string;
  country?: string;
  countryCode?: string;
  region?: string;
  lat: number;
  lon: number;
  timezone?: string;
}
