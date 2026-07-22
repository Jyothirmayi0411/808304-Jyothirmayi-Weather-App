import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityScore,
  SelectedLocation,
  TemperatureUnit,
  WeatherForecastResponse,
  WeatherInsightAlert,
  WindSpeedUnit,
} from './types';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherIntelligence } from './components/WeatherIntelligence';
import { SunAndEnvironment } from './components/SunAndEnvironment';
import { ErrorState } from './components/ErrorState';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { calculateActivityScores, generateWeatherAlerts } from './utils/weatherIntelligence';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

const DEFAULT_LOCATION: SelectedLocation = {
  name: 'Tokyo',
  country: 'Japan',
  countryCode: 'JP',
  region: 'Tokyo',
  lat: 35.6895,
  lon: 139.6917,
  timezone: 'Asia/Tokyo',
};

const RECENT_SEARCHES_KEY = 'weather_app_recent_searches';
const TEMP_UNIT_KEY = 'weather_app_temp_unit';
const WIND_UNIT_KEY = 'weather_app_wind_unit';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active view date selection (0 = Today, 1 = Day 2, etc.)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Preference state
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem(TEMP_UNIT_KEY) as TemperatureUnit) || 'celsius';
  });
  const [windUnit, setWindUnit] = useState<WindSpeedUnit>(() => {
    return (localStorage.getItem(WIND_UNIT_KEY) as WindSpeedUnit) || 'kmh';
  });

  // Recent searches history
  const [recentSearches, setRecentSearches] = useState<SelectedLocation[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [DEFAULT_LOCATION];
    } catch {
      return [DEFAULT_LOCATION];
    }
  });

  // Unit handlers
  const handleToggleTempUnit = (unit: TemperatureUnit) => {
    setTempUnit(unit);
    localStorage.setItem(TEMP_UNIT_KEY, unit);
  };

  const handleToggleWindUnit = (unit: WindSpeedUnit) => {
    setWindUnit(unit);
    localStorage.setItem(WIND_UNIT_KEY, unit);
  };

  // Add location to recent searches
  const addRecentSearch = (loc: SelectedLocation) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => Math.abs(item.lat - loc.lat) > 0.05 || Math.abs(item.lon - loc.lon) > 0.05
      );
      const updated = [loc, ...filtered].slice(0, 8);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveRecent = (lat: number, lon: number) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => Math.abs(item.lat - lat) > 0.05 || Math.abs(item.lon - lon) > 0.05);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Fetch Weather from Open-Meteo API
  const fetchWeatherData = useCallback(async (location: SelectedLocation) => {
    setIsLoadingWeather(true);
    setErrorMsg(null);
    setSelectedDayIndex(0); // reset to Today on location change

    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${
        location.lon
      }&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&current_weather=true&timezone=auto`;

      const response = await fetch(forecastUrl);
      if (!response.ok) {
        throw new Error(`Weather service returned HTTP ${response.status}`);
      }

      const data: WeatherForecastResponse = await response.json();
      
      // Basic sanity check on payload
      if (!data || (!data.current && !data.current_weather)) {
        throw new Error('City not found or weather data unavailable.');
      }

      setWeatherData(data);
    } catch (err: any) {
      console.error('Error fetching Open-Meteo forecast:', err);
      setErrorMsg(
        err.message || 'Failed to fetch weather data. Please check your network connection and try again.'
      );
      setWeatherData(null);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Fetch initial default location weather
  useEffect(() => {
    fetchWeatherData(selectedLocation);
  }, [fetchWeatherData, selectedLocation]);

  // Handle location selection from search bar
  const handleSelectLocation = (loc: SelectedLocation) => {
    setSelectedLocation(loc);
    addRecentSearch(loc);
  };

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingGeo(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Attempt reverse geocoding
          const revUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(2)},${longitude.toFixed(2)}&count=1&language=en&format=json`;
          const revRes = await fetch(revUrl);
          let locName = 'Current Location';
          let country = '';
          let countryCode = '';

          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData.results && revData.results[0]) {
              locName = revData.results[0].name;
              country = revData.results[0].country || '';
              countryCode = revData.results[0].country_code || '';
            }
          }

          const currentLocation: SelectedLocation = {
            name: locName,
            country,
            countryCode,
            lat: latitude,
            lon: longitude,
          };

          setSelectedLocation(currentLocation);
          addRecentSearch(currentLocation);
        } catch {
          // Fallback location object
          const currentLocation: SelectedLocation = {
            name: 'Current Location',
            lat: latitude,
            lon: longitude,
          };
          setSelectedLocation(currentLocation);
        } finally {
          setIsLoadingGeo(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLoadingGeo(false);
        setErrorMsg('Unable to retrieve location. Please grant location permissions or search for your city.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Compute Weather Intelligence metrics for selected day
  const getSelectedDayMetrics = () => {
    if (!weatherData) return { alerts: [], activities: [], dayLabel: 'Today' };

    const daily = weatherData.daily;
    const current = weatherData.current || {
      temperature: weatherData.current_weather?.temperature || 20,
      weather_code: weatherData.current_weather?.weathercode || 0,
      wind_speed: weatherData.current_weather?.windspeed || 10,
      relative_humidity: 50,
      is_day: 1,
    };

    const isToday = selectedDayIndex === 0;

    const temp = isToday ? current.temperature : (daily?.temperature_2m_max[selectedDayIndex] ?? 20);
    const weatherCode = isToday ? current.weather_code : (daily?.weather_code[selectedDayIndex] ?? 0);
    const windSpeed = isToday ? current.wind_speed : (daily?.wind_speed_10m_max[selectedDayIndex] ?? 10);
    const humidity = isToday ? current.relative_humidity : 55;
    const uv = daily?.uv_index_max[selectedDayIndex] ?? 4;
    const precipProb = daily?.precipitation_probability_max[selectedDayIndex] ?? 10;
    const precipSum = daily?.precipitation_sum?.[selectedDayIndex] ?? 0;
    const isDayTime = isToday ? (current.is_day === 1) : true;

    const alerts = generateWeatherAlerts(temp, weatherCode, windSpeed, humidity, uv, precipProb, precipSum);
    const activities = calculateActivityScores(temp, weatherCode, windSpeed, humidity, uv, precipProb, isDayTime);

    const dayLabel = isToday
      ? 'Today'
      : daily?.time[selectedDayIndex]
      ? new Date(daily.time[selectedDayIndex] + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      : `Day ${selectedDayIndex + 1}`;

    return { alerts, activities, dayLabel };
  };

  const { alerts, activities, dayLabel } = getSelectedDayMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white pb-16">
      {/* Navbar */}
      <Navbar
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        windUnit={windUnit}
        onToggleWindUnit={handleToggleWindUnit}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLoadingLocation={isLoadingGeo}
        selectedCityName={selectedLocation.name}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Search Bar Header */}
        <SearchBar
          onSelectLocation={handleSelectLocation}
          isLoading={isLoadingWeather}
          recentSearches={recentSearches}
          onClearRecent={handleClearRecent}
          onRemoveRecent={handleRemoveRecent}
        />

        {/* Error Banner / Error State */}
        {errorMsg && !weatherData && (
          <ErrorState
            message={errorMsg}
            onRetry={() => fetchWeatherData(selectedLocation)}
            onSelectPopular={(city) => {
              const preset = [
                { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
                { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
                { name: 'Tokyo', country: 'JP', lat: 35.6895, lon: 139.6917 },
                { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
                { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
              ].find((c) => c.name === city);
              if (preset) handleSelectLocation(preset);
            }}
          />
        )}

        {/* Loading Skeleton */}
        {isLoadingWeather && <LoadingSkeleton />}

        {/* Weather Dashboard Content */}
        {!isLoadingWeather && weatherData && (
          <div className="space-y-6 animate-fade-in">
            {/* Current Weather Card */}
            <CurrentWeather
              location={selectedLocation}
              weather={weatherData}
              tempUnit={tempUnit}
              windUnit={windUnit}
            />

            {/* Hourly Forecast Timeline */}
            <HourlyForecast
              hourly={weatherData.hourly}
              tempUnit={tempUnit}
              windUnit={windUnit}
            />

            {/* 7-Day Forecast & Weather Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 7-Day Forecast */}
              <div className="lg:col-span-5">
                <DailyForecast
                  daily={weatherData.daily}
                  tempUnit={tempUnit}
                  windUnit={windUnit}
                  selectedDayIndex={selectedDayIndex}
                  onSelectDay={setSelectedDayIndex}
                />
              </div>

              {/* Right Column: Planning Recommendations & Intelligence */}
              <div className="lg:col-span-7 space-y-6">
                <WeatherIntelligence
                  alerts={alerts}
                  activities={activities}
                  selectedDayLabel={dayLabel}
                />

                {/* Sun & Atmospheric Environment Card */}
                <SunAndEnvironment
                  daily={weatherData.daily}
                  current={weatherData.current}
                  tempUnit={tempUnit}
                  selectedDayIndex={selectedDayIndex}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-16 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Weather Intelligence App • Powered by Open-Meteo Geocoding & Forecast APIs</span>
        </div>
        <div className="text-slate-400">
          No secrets or keys required. Public global meteorological data.
        </div>
      </footer>
    </div>
  );
}
