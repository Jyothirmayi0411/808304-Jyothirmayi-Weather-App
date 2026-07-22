import React from 'react';
import { Calendar, CloudRain, Wind, Sun, ArrowUp, ArrowDown } from 'lucide-react';
import { DailyData, TemperatureUnit, WindSpeedUnit } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';
import {
  formatDateShort,
  formatDayOfWeek,
  formatTemperature,
  formatWindSpeed,
} from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  daily?: DailyData;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  daily,
  tempUnit,
  windUnit,
  selectedDayIndex,
  onSelectDay,
}) => {
  if (!daily || !daily.time || daily.time.length === 0) {
    return null;
  }

  // Calculate overall weekly min and max temperatures to normalize bar length
  const weeklyMinC = Math.min(...daily.temperature_2m_min);
  const weeklyMaxC = Math.max(...daily.temperature_2m_max);
  const weeklyRange = weeklyMaxC - weeklyMinC || 1;

  return (
    <div id="daily-forecast-section" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">7-Day Forecast</h3>
            <p className="text-xs text-slate-400">Click any day to view customized intelligence</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {daily.time.length} Days
        </span>
      </div>

      {/* Forecast list */}
      <div className="space-y-2.5">
        {daily.time.map((dateStr, idx) => {
          const isSelected = idx === selectedDayIndex;
          const isToday = idx === 0;
          const maxTemp = daily.temperature_2m_max[idx];
          const minTemp = daily.temperature_2m_min[idx];
          const weatherCode = daily.weather_code[idx];
          const precipProb = daily.precipitation_probability_max[idx] ?? 0;
          const windSpeed = daily.wind_speed_10m_max[idx] ?? 0;

          const weatherInfo = getWeatherCodeInfo(weatherCode, true);

          // Calculate bar offsets relative to week's temperature extremes
          const leftPercent = ((minTemp - weeklyMinC) / weeklyRange) * 100;
          const widthPercent = Math.max(10, ((maxTemp - minTemp) / weeklyRange) * 100);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDay(idx)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-800 border-sky-500/80 shadow-lg ring-1 ring-sky-500/40'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {/* Day & Icon */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="p-2 rounded-xl bg-slate-900/60 text-sky-300 border border-slate-700/50">
                  <WeatherIcon name={weatherInfo.icon} className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {formatDayOfWeek(dateStr, isToday)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>{formatDateShort(dateStr)}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 truncate max-w-[120px]">{weatherInfo.label}</span>
                  </div>
                </div>
              </div>

              {/* Rain Chance & Wind */}
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1 text-blue-300 min-w-[65px]">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span className="font-semibold">{precipProb}%</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 min-w-[85px] hidden md:flex">
                  <Wind className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatWindSpeed(windSpeed, windUnit)}</span>
                </div>
              </div>

              {/* Temperature Bar & High / Low */}
              <div className="flex items-center gap-3 min-w-[200px] justify-end">
                <span className="text-xs font-semibold text-sky-300 min-w-[45px] text-right">
                  {formatTemperature(minTemp, tempUnit)}
                </span>

                {/* Range Bar */}
                <div className="w-24 sm:w-28 bg-slate-900 rounded-full h-2 relative overflow-hidden border border-slate-700/50">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-amber-300 min-w-[45px]">
                  {formatTemperature(maxTemp, tempUnit)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
