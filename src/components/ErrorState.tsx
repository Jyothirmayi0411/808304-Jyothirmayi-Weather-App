import React from 'react';
import { AlertTriangle, RefreshCw, Search, MapPin } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onSelectPopular?: (cityName: string) => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onSelectPopular,
}) => {
  return (
    <div id="error-state-card" className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6 backdrop-blur-xl">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
        <AlertTriangle className="w-8 h-8 animate-bounce" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Weather Service Alert</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          {message || 'Unable to retrieve meteorological data for this location.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            id="retry-fetch-btn"
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>

      {/* Suggested cities fallback */}
      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400 mb-2">Or try searching one of these popular hubs:</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['London', 'New York', 'Tokyo', 'Paris', 'Sydney'].map((city) => (
            <button
              key={city}
              onClick={() => onSelectPopular?.(city)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors cursor-pointer"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
