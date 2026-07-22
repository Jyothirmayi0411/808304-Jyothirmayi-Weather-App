import React from 'react';
import { Sunrise, Sunset, Compass, Eye, Thermometer, Wind, Droplet, Sun } from 'lucide-react';
import { DailyData, CurrentWeatherData, TemperatureUnit } from '../types';
import { formatHourTime, formatTemperature } from '../utils/weatherIntelligence';

interface SunAndEnvironmentProps {
  daily?: DailyData;
  current?: CurrentWeatherData;
  tempUnit: TemperatureUnit;
  selectedDayIndex: number;
}

export const SunAndEnvironment: React.FC<SunAndEnvironmentProps> = ({
  daily,
  current,
  tempUnit,
  selectedDayIndex,
}) => {
  if (!daily || !daily.sunrise || !daily.sunset) return null;

  const sunriseIso = daily.sunrise[selectedDayIndex] || daily.sunrise[0];
  const sunsetIso = daily.sunset[selectedDayIndex] || daily.sunset[0];

  const sunriseFormatted = sunriseIso ? formatHourTime(sunriseIso) : '6:00 AM';
  const sunsetFormatted = sunsetIso ? formatHourTime(sunsetIso) : '7:30 PM';

  // Compute daylight duration in hours and minutes
  let daylightStr = '12h 30m';
  if (sunriseIso && sunsetIso) {
    const riseDate = new Date(sunriseIso);
    const setDate = new Date(sunsetIso);
    const diffMs = setDate.getTime() - riseDate.getTime();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      daylightStr = `${hours}h ${mins}m`;
    }
  }

  // Calculate sun position percentage if looking at today
  let sunPositionPercent = 50;
  if (selectedDayIndex === 0 && sunriseIso && sunsetIso) {
    const now = new Date().getTime();
    const rise = new Date(sunriseIso).getTime();
    const set = new Date(sunsetIso).getTime();
    if (now < rise) sunPositionPercent = 0;
    else if (now > set) sunPositionPercent = 100;
    else sunPositionPercent = Math.round(((now - rise) / (set - rise)) * 100);
  }

  // Dew point approximation if current temp & humidity available
  let dewPointC = 12;
  if (current) {
    // Magnus formula approximation
    const temp = current.temperature;
    const rh = current.relative_humidity;
    dewPointC = Math.round(temp - (100 - rh) / 5);
  }

  return (
    <div id="sun-environment-section" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sun Arc & Daylight Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sunrise className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Sun Schedule & Daylight</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {daylightStr} Daylight
            </span>
          </div>

          {/* Visual Sun Trajectory Arc */}
          <div className="relative my-6 px-4">
            <div className="w-full h-20 border-b-2 border-dashed border-slate-700 rounded-t-full relative flex items-end justify-center overflow-hidden">
              <div
                className="absolute w-8 h-8 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 flex items-center justify-center text-slate-950 font-bold transition-all duration-700"
                style={{
                  left: `calc(${sunPositionPercent}% - 16px)`,
                  bottom: `${Math.sin((sunPositionPercent / 100) * Math.PI) * 55}px`,
                }}
              >
                <Sun className="w-5 h-5 animate-spin-slow" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 px-1">
              <span>0% Horizon</span>
              <span>Mid-Day Zenith</span>
              <span>100% Horizon</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
            <Sunrise className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Sunrise</div>
              <div className="text-sm font-bold text-white">{sunriseFormatted}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
            <Sunset className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Sunset</div>
              <div className="text-sm font-bold text-white">{sunsetFormatted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Comfort & Dew Point Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Thermometer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dew Point & Comfort Metrics</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Dew point measures the absolute temperature at which air becomes saturated with water vapor. Lower dew points feel crisp and fresh, while higher dew points feel muggy.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                <span>Dew Point</span>
                <Droplet className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {formatTemperature(dewPointC, tempUnit)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {dewPointC < 10 ? 'Crisp & Dry' : dewPointC < 18 ? 'Comfortable' : 'Humid & Muggy'}
              </div>
            </div>

            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                <span>Air Comfort</span>
                <Wind className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {current?.relative_humidity ? `${current.relative_humidity}% RH` : 'Optimal'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {current && current.relative_humidity > 70 ? 'High Moisture' : 'Comfort Zone'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-xs text-teal-200">
          💡 <span className="font-semibold">Weather Tip:</span> Dew points below 13°C (55°F) are considered pleasant and energetic for outdoor workouts.
        </div>
      </div>
    </div>
  );
};
