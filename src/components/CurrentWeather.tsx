import React from 'react';
import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Eye,
  Gauge,
  Cloud,
  Navigation,
  Thermometer,
  CloudRain,
  ArrowDown,
  ArrowUp,
  Clock,
} from 'lucide-react';
import { SelectedLocation, TemperatureUnit, WeatherForecastResponse, WindSpeedUnit } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';
import {
  formatTemperature,
  formatWindSpeed,
  getWindDirectionLabel,
  getUVLabel,
  formatDateShort,
} from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  location: SelectedLocation;
  weather: WeatherForecastResponse;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  location,
  weather,
  tempUnit,
  windUnit,
}) => {
  const current = weather.current || {
    temperature: weather.current_weather?.temperature || 0,
    apparent_temperature: weather.current_weather?.temperature || 0,
    weather_code: weather.current_weather?.weathercode || 0,
    wind_speed: weather.current_weather?.windspeed || 0,
    wind_direction: weather.current_weather?.winddirection || 0,
    relative_humidity: 60,
    is_day: weather.current_weather?.is_day ?? 1,
    precipitation: 0,
    cloud_cover: 30,
    pressure_msl: 1013,
    time: new Date().toISOString(),
  };

  const isDay = current.is_day === 1;
  const weatherInfo = getWeatherCodeInfo(current.weather_code, isDay);

  // Today max/min from daily forecast
  const todayMaxC = weather.daily?.temperature_2m_max?.[0] ?? current.temperature;
  const todayMinC = weather.daily?.temperature_2m_min?.[0] ?? current.temperature;
  const todayUvMax = weather.daily?.uv_index_max?.[0] ?? 0;
  const todayPrecipProbMax = weather.daily?.precipitation_probability_max?.[0] ?? 0;

  const uvInfo = getUVLabel(todayUvMax);
  const windDirLabel = getWindDirectionLabel(current.wind_direction);

  const bgGradient = isDay ? weatherInfo.bgGradientDay : weatherInfo.bgGradientNight;

  // Formatted Local Time string
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      id="current-weather-card"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgGradient} border border-white/10 p-6 sm:p-8 shadow-2xl transition-all duration-500 backdrop-blur-xl text-white`}
    >
      {/* Subtle glowing ambient backdrop */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sky-200 text-sm font-medium">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              {location.region ? `${location.region}, ` : ''}
              {location.country || 'Global Location'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
            {location.name}
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-sky-300" /> Local Time: {formattedTime}
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-sm">
              {formatDateShort(new Date().toISOString().split('T')[0])}
            </span>
          </div>
        </div>

        {/* Condition Icon & Badge */}
        <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md self-start md:self-center">
          <div className="p-3 rounded-xl bg-white/10 text-sky-300 shadow-inner">
            <WeatherIcon name={weatherInfo.icon} className="w-10 h-10 text-sky-300 animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {weatherInfo.label}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
                {isDay ? 'Day' : 'Night'}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xs">{weatherInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Hero Temperature & High/Low Display */}
      <div className="relative z-10 my-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <span id="current-temperature-value" className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-md">
            {formatTemperature(current.temperature, tempUnit)}
          </span>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-sky-200 flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-sky-300" />
              Feels like {formatTemperature(current.apparent_temperature, tempUnit)}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/30 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="flex items-center text-emerald-300">
                <ArrowUp className="w-3.5 h-3.5 mr-0.5" /> High {formatTemperature(todayMaxC, tempUnit)}
              </span>
              <span className="text-slate-500">|</span>
              <span className="flex items-center text-sky-300">
                <ArrowDown className="w-3.5 h-3.5 mr-0.5" /> Low {formatTemperature(todayMinC, tempUnit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Weather Metrics */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {/* Humidity */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3.5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium">Humidity</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">{current.relative_humidity}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {current.relative_humidity > 70 ? 'Moist / Humid' : current.relative_humidity < 30 ? 'Dry air' : 'Comfortable'}
          </div>
        </div>

        {/* Wind */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3.5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium">Wind</span>
            <Wind className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            {formatWindSpeed(current.wind_speed, windUnit)}
          </div>
          <div className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
            <Navigation
              className="w-3 h-3 text-indigo-300 inline"
              style={{ transform: `rotate(${current.wind_direction}deg)` }}
            />
            <span>{windDirLabel} ({current.wind_direction}°)</span>
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3.5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium">UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
            {todayUvMax.toFixed(1)}
            <span className={`text-xs font-semibold ${uvInfo.colorClass}`}>{uvInfo.label}</span>
          </div>
          {/* Mini gauge bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full ${uvInfo.bgClass} transition-all`}
              style={{ width: `${Math.min(100, (todayUvMax / 12) * 100)}%` }}
            />
          </div>
        </div>

        {/* Rain / Precip Probability */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3.5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium">Rain Chance</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{todayPrecipProbMax}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {todayPrecipProbMax > 50 ? 'Rain likely' : todayPrecipProbMax > 20 ? 'Slight chance' : 'Dry conditions'}
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3.5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium">Cloud Cover</span>
            <Cloud className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-xl font-bold text-white">{current.cloud_cover}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {current.cloud_cover > 80 ? 'Overcast' : current.cloud_cover > 40 ? 'Partly cloudy' : 'Clear skies'}
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3.5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium">Pressure</span>
            <Gauge className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-white">{Math.round(current.pressure_msl)} <span className="text-xs font-normal text-slate-300">hPa</span></div>
          <div className="text-[10px] text-slate-400 mt-1">
            {current.pressure_msl > 1013 ? 'High pressure (Stable)' : 'Low pressure'}
          </div>
        </div>
      </div>
    </div>
  );
};
