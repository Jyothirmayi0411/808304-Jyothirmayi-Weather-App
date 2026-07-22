import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, History, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { GeocodingResult, SelectedLocation } from '../types';

interface SearchBarProps {
  onSelectLocation: (location: SelectedLocation) => void;
  isLoading: boolean;
  recentSearches: SelectedLocation[];
  onClearRecent: () => void;
  onRemoveRecent: (lat: number, lon: number) => void;
}

const POPULAR_CITIES: SelectedLocation[] = [
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6895, lon: 139.6917, region: 'Tokyo' },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, region: 'England' },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.006, region: 'New York' },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, region: 'Île-de-France' },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, region: 'New South Wales' },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708, region: 'Dubai' },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, region: 'Singapore' },
  { name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.9068, lon: -43.1729, region: 'Rio de Janeiro' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  isLoading,
  recentSearches,
  onClearRecent,
  onRemoveRecent,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setErrorMsg(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setErrorMsg(null);
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=8&language=en&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
          setErrorMsg(null);
        } else {
          setSuggestions([]);
          setErrorMsg(`No cities found for "${query}"`);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setSuggestions([]);
        setErrorMsg('Search service unavailable. Please check your network.');
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (result: GeocodingResult) => {
    const loc: SelectedLocation = {
      name: result.name,
      country: result.country,
      countryCode: result.country_code,
      region: result.admin1,
      lat: result.latitude,
      lon: result.longitude,
      timezone: result.timezone,
    };
    onSelectLocation(loc);
    setQuery(result.name);
    setIsOpen(false);
  };

  const handleSelectPreset = (loc: SelectedLocation) => {
    onSelectLocation(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  const handleClearInput = () => {
    setQuery('');
    setSuggestions([]);
    setErrorMsg(null);
  };

  const getCountryFlagEmoji = (countryCode?: string) => {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto space-y-3">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          id="city-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city globally (e.g. London, Tokyo, Chicago, Mumbai)..."
          className="w-full pl-11 pr-10 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-white placeholder-slate-400 rounded-xl border border-slate-700/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm md:text-base outline-none transition-all shadow-lg"
          autoComplete="off"
        />

        {query && (
          <button
            id="clear-search-btn"
            onClick={handleClearInput}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
            title="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown Popover */}
        {isOpen && (query.length >= 2 || suggestions.length > 0 || errorMsg) && (
          <div
            id="search-suggestions-dropdown"
            className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/80 backdrop-blur-xl max-h-80 overflow-y-auto"
          >
            {isSearching && (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                Searching Open-Meteo Geocoding database...
              </div>
            )}

            {!isSearching && errorMsg && (
              <div className="p-4 text-center text-xs text-amber-300/90 flex items-center justify-center gap-2 bg-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isSearching && suggestions.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-sky-400" /> Matching Locations
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectCity(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/90 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{getCountryFlagEmoji(item.country_code)}</span>
                      <div>
                        <div className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {[item.admin1, item.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Access Pills: Recent & Popular */}
      <div className="flex flex-col gap-2">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1 mr-1 text-[11px] font-medium">
              <History className="w-3 h-3 text-sky-400" /> Recent:
            </span>
            {recentSearches.slice(0, 5).map((loc) => (
              <span
                key={`${loc.lat}-${loc.lon}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 hover:border-sky-500/50 hover:text-white transition-all text-xs"
              >
                <button
                  onClick={() => handleSelectPreset(loc)}
                  className="hover:underline cursor-pointer"
                >
                  {loc.name} {loc.countryCode ? `(${loc.countryCode})` : ''}
                </button>
                <button
                  onClick={() => onRemoveRecent(loc.lat, loc.lon)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 ml-0.5"
                  title="Remove from history"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={onClearRecent}
              className="text-[10px] text-slate-500 hover:text-slate-300 underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Popular Preset Cities */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1 text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" /> Popular:
          </span>
          {POPULAR_CITIES.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleSelectPreset(loc)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 hover:text-sky-300 border border-slate-700/50 transition-all text-xs cursor-pointer active:scale-95"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
