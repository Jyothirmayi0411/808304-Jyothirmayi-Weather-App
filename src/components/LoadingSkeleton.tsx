import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Hero card skeleton */}
      <div className="h-96 rounded-3xl bg-slate-800/60 border border-slate-700/50 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-700 rounded" />
            <div className="h-8 w-64 bg-slate-700 rounded-lg" />
          </div>
          <div className="h-12 w-32 bg-slate-700 rounded-xl" />
        </div>
        <div className="h-20 w-48 bg-slate-700 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-700/50 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Hourly forecast skeleton */}
      <div className="h-44 rounded-3xl bg-slate-800/60 border border-slate-700/50 p-6" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-800/60 border border-slate-700/50 p-6" />
        <div className="h-96 rounded-3xl bg-slate-800/60 border border-slate-700/50 p-6" />
      </div>
    </div>
  );
};
