import React, { useState } from 'react';
import { Clock, CloudRain, Wind, Thermometer, ChevronRight, ChevronLeft } from 'lucide-react';
import { HourlyData, TemperatureUnit, WindSpeedUnit } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';
import { formatHourTime, formatTemperature, formatWindSpeed } from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  hourly?: HourlyData;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  tempUnit,
  windUnit,
}) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  if (!hourly || !hourly.time || hourly.time.length === 0) {
    return null;
  }

  // Slice next 24 hours starting from current hour
  const nowHour = new Date().getHours();
  const next24 = hourly.time.slice(nowHour, nowHour + 24).map((timeStr, idx) => {
    const globalIdx = nowHour + idx;
    return {
      index: globalIdx,
      time: timeStr,
      temp: hourly.temperature_2m[globalIdx] ?? 0,
      weatherCode: hourly.weather_code[globalIdx] ?? 0,
      precipProb: hourly.precipitation_probability[globalIdx] ?? 0,
      windSpeed: hourly.wind_speed_10m[globalIdx] ?? 0,
      uv: hourly.uv_index[globalIdx] ?? 0,
    };
  });

  const selectedHour = next24[selectedHourIndex] || next24[0];
  const selectedInfo = getWeatherCodeInfo(selectedHour.weatherCode);

  // Min and Max temperatures for relative bar calculation
  const temps = next24.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div id="hourly-forecast-section" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Hourly Forecast</h3>
            <p className="text-xs text-slate-400">Next 24-hour meteorological timeline</p>
          </div>
        </div>

        {/* Selected Hour Details Badge */}
        {selectedHour && (
          <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-slate-200">
            <span className="font-semibold text-sky-300">{formatHourTime(selectedHour.time)}</span>
            <span className="text-slate-500">•</span>
            <span>{selectedInfo.label}</span>
            <span className="text-slate-500">•</span>
            <span className="font-bold text-white">{formatTemperature(selectedHour.temp, tempUnit)}</span>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Track */}
      <div className="relative">
        <div id="hourly-scroll-track" className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {next24.map((hour, idx) => {
            const isSelected = idx === selectedHourIndex;
            const hourDate = new Date(hour.time);
            const isDaytime = hourDate.getHours() >= 6 && hourDate.getHours() <= 19;
            const weatherInfo = getWeatherCodeInfo(hour.weatherCode, isDaytime);
            
            // Relative height percentage for temperature bar
            const heightPercent = Math.max(20, Math.min(100, ((hour.temp - minTemp) / tempRange) * 100));

            return (
              <button
                key={hour.time}
                onClick={() => setSelectedHourIndex(idx)}
                className={`flex-shrink-0 flex flex-col items-center justify-between w-20 p-3 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-500/20 to-blue-600/30 border-sky-400 text-white shadow-lg ring-2 ring-sky-500/30 scale-105'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-white'
                }`}
              >
                {/* Time Label */}
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  {idx === 0 ? 'Now' : hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                </span>

                {/* Weather Icon */}
                <div className="my-2 p-2 rounded-xl bg-slate-900/50 group-hover:scale-110 transition-transform">
                  <WeatherIcon name={weatherInfo.icon} className="w-6 h-6 text-sky-300" />
                </div>

                {/* Temperature Value */}
                <span className="text-sm font-bold text-white mb-2">
                  {formatTemperature(hour.temp, tempUnit)}
                </span>

                {/* Rain Chance Bar */}
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-center gap-0.5 text-[10px] text-blue-300 font-medium">
                    <CloudRain className="w-2.5 h-2.5" />
                    <span>{hour.precipProb}%</span>
                  </div>
                  
                  {/* Height bar representing temp curve */}
                  <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all"
                      style={{ width: `${heightPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
