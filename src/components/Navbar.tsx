import React from 'react';
import { CloudSun, Compass, MapPin, Thermometer } from 'lucide-react';
import { TemperatureUnit, WindSpeedUnit } from '../types';

interface NavbarProps {
  tempUnit: TemperatureUnit;
  onToggleTempUnit: (unit: TemperatureUnit) => void;
  windUnit: WindSpeedUnit;
  onToggleWindUnit: (unit: WindSpeedUnit) => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation: boolean;
  selectedCityName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  tempUnit,
  onToggleTempUnit,
  windUnit,
  onToggleWindUnit,
  onUseCurrentLocation,
  isLoadingLocation,
  selectedCityName,
}) => {
  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white ring-1 ring-white/20">
            <CloudSun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Weather Intelligence</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {selectedCityName ? `Real-time analytics for ${selectedCityName}` : 'Global weather insights & daily recommendations'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Current Location Button */}
          <button
            id="geo-location-btn"
            onClick={onUseCurrentLocation}
            disabled={isLoadingLocation}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-700/80 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Use current location via GPS"
          >
            <MapPin className={`w-3.5 h-3.5 ${isLoadingLocation ? 'animate-bounce text-sky-400' : 'text-sky-400'}`} />
            <span>{isLoadingLocation ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Temperature Unit Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 shadow-inner">
            <button
              id="unit-celsius-btn"
              onClick={() => onToggleTempUnit('celsius')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                tempUnit === 'celsius'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              id="unit-fahrenheit-btn"
              onClick={() => onToggleTempUnit('fahrenheit')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                tempUnit === 'fahrenheit'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Wind Unit Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 shadow-inner">
            <button
              id="unit-kmh-btn"
              onClick={() => onToggleWindUnit('kmh')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                windUnit === 'kmh'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              km/h
            </button>
            <button
              id="unit-mph-btn"
              onClick={() => onToggleWindUnit('mph')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                windUnit === 'mph'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              mph
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
