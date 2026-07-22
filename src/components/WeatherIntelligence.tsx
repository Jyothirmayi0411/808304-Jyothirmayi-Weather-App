import React from 'react';
import {
  Sparkles,
  Umbrella,
  Shirt,
  Sun,
  Wind,
  Activity,
  Bike,
  Trees as TreePark,
  Waves,
  Car,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { ActivityScore, WeatherInsightAlert } from '../types';

interface WeatherIntelligenceProps {
  alerts: WeatherInsightAlert[];
  activities: ActivityScore[];
  selectedDayLabel: string;
}

export const WeatherIntelligence: React.FC<WeatherIntelligenceProps> = ({
  alerts,
  activities,
  selectedDayLabel,
}) => {
  const getAlertStyle = (level: WeatherInsightAlert['level']) => {
    switch (level) {
      case 'alert':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-200';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
      default:
        return 'bg-sky-500/10 border-sky-500/30 text-sky-200';
    }
  };

  const getAlertIcon = (type: WeatherInsightAlert['type'], level: WeatherInsightAlert['level']) => {
    if (level === 'alert') return <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />;
    if (level === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    if (level === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    if (type === 'umbrella') return <Umbrella className="w-5 h-5 text-sky-400 shrink-0" />;
    if (type === 'clothing') return <Shirt className="w-5 h-5 text-indigo-400 shrink-0" />;
    return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'Bike':
        return <Bike className="w-4 h-4 text-sky-400" />;
      case 'TreePark':
        return <TreePark className="w-4 h-4 text-amber-400" />;
      case 'Waves':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'Car':
        return <Car className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-sky-400" />;
    }
  };

  const getScoreBadgeStyle = (label: ActivityScore['label']) => {
    switch (label) {
      case 'Ideal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Good':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Fair':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Poor':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Hazardous':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 60) return 'bg-sky-400';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div id="weather-intelligence-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-sky-400" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">Weather Intelligence & Planning</h3>
            <p className="text-xs text-sky-200">Customized planning advice for {selectedDayLabel}</p>
          </div>
        </div>

        {/* Actionable Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border ${getAlertStyle(alert.level)} transition-all backdrop-blur-md flex items-start gap-3`}
            >
              {getAlertIcon(alert.type, alert.level)}
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">{alert.title}</h4>
                <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Suitability Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-white">Outdoor Activity Suitability Index</h4>
            <p className="text-xs text-slate-400">Calculated based on temperature, wind, humidity, precipitation & UV index</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                      {getActivityIcon(act.iconName)}
                    </div>
                    <span className="text-sm font-bold text-white">{act.name}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeStyle(act.label)}`}>
                    {act.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {act.reason}
                </p>
              </div>

              {/* Progress Bar & Numeric Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Suitability</span>
                  <span className="text-white font-bold">{act.score}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(act.score)}`}
                    style={{ width: `${act.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
