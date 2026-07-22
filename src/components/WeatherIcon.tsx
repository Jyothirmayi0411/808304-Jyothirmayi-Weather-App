import React from 'react';
import * as LucideIcons from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6' }) => {
  // Safe mapping fallback
  const IconComponent = (LucideIcons as Record<string, React.ElementType>)[name] || LucideIcons.CloudSun;
  return <IconComponent className={className} />;
};
