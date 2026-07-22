import { ActivityScore, TemperatureUnit, WeatherForecastResponse, WeatherInsightAlert, WindSpeedUnit } from '../types';

export function convertTemperature(tempC: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatTemperature(tempC: number, unit: TemperatureUnit): string {
  const val = convertTemperature(tempC, unit);
  return `${val}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function convertWindSpeed(speedKmh: number, unit: WindSpeedUnit): number {
  if (unit === 'mph') {
    return Math.round(speedKmh * 0.621371);
  }
  if (unit === 'ms') {
    return Math.round((speedKmh / 3.6) * 10) / 10;
  }
  return Math.round(speedKmh);
}

export function formatWindSpeed(speedKmh: number, unit: WindSpeedUnit): string {
  const val = convertWindSpeed(speedKmh, unit);
  const unitLabel = unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'm/s';
  return `${val} ${unitLabel}`;
}

export function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
}

export function getUVLabel(uv: number): { label: string; colorClass: string; bgClass: string } {
  if (uv < 3) return { label: 'Low', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500' };
  if (uv < 6) return { label: 'Moderate', colorClass: 'text-amber-400', bgClass: 'bg-amber-500' };
  if (uv < 8) return { label: 'High', colorClass: 'text-orange-400', bgClass: 'bg-orange-500' };
  if (uv < 11) return { label: 'Very High', colorClass: 'text-rose-400', bgClass: 'bg-rose-500' };
  return { label: 'Extreme', colorClass: 'text-purple-400', bgClass: 'bg-purple-600' };
}

export function calculateActivityScores(
  tempC: number,
  weatherCode: number,
  windKmh: number,
  humidity: number,
  uvIndex: number,
  precipProb: number,
  isDay: boolean,
  cloudCover: number = 20
): ActivityScore[] {
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isStorm = [95, 96, 99].includes(weatherCode);

  // 1. Running
  let runScore = 100;
  if (tempC < 5) runScore -= (5 - tempC) * 4;
  else if (tempC > 22) runScore -= (tempC - 22) * 5;
  if (isRain) runScore -= 40;
  if (isSnow) runScore -= 50;
  if (isStorm) runScore -= 80;
  if (windKmh > 25) runScore -= (windKmh - 25) * 1.5;
  if (humidity > 80) runScore -= 15;
  runScore = Math.max(0, Math.min(100, Math.round(runScore)));

  // 2. Cycling
  let bikeScore = 100;
  if (tempC < 8) bikeScore -= (8 - tempC) * 5;
  else if (tempC > 28) bikeScore -= (tempC - 28) * 4;
  if (windKmh > 18) bikeScore -= (windKmh - 18) * 3;
  if (isRain) bikeScore -= 50;
  if (isSnow) bikeScore -= 70;
  if (isStorm) bikeScore -= 90;
  bikeScore = Math.max(0, Math.min(100, Math.round(bikeScore)));

  // 3. Picnic & Outdoor Dining
  let picnicScore = 100;
  if (tempC < 16) picnicScore -= (16 - tempC) * 6;
  else if (tempC > 30) picnicScore -= (tempC - 30) * 5;
  if (precipProb > 20) picnicScore -= precipProb * 0.7;
  if (isRain || isSnow) picnicScore -= 70;
  if (windKmh > 20) picnicScore -= (windKmh - 20) * 2.5;
  if (uvIndex > 8) picnicScore -= 15;
  picnicScore = Math.max(0, Math.min(100, Math.round(picnicScore)));

  // 4. Beach & Swimming
  let beachScore = 100;
  if (tempC < 23) beachScore -= (23 - tempC) * 8;
  if (!isDay) beachScore -= 60;
  if (isRain || isSnow) beachScore -= 80;
  if (cloudCover > 60) beachScore -= (cloudCover - 60) * 0.8;
  if (windKmh > 30) beachScore -= 30;
  beachScore = Math.max(0, Math.min(100, Math.round(beachScore)));

  // 5. Stargazing
  let starScore = 100;
  if (isDay) {
    starScore = 0;
  } else {
    starScore -= cloudCover * 0.9;
    if (isRain || isSnow) starScore -= 90;
    if (tempC < -5) starScore -= 20;
  }
  starScore = Math.max(0, Math.min(100, Math.round(starScore)));

  // 6. Driving
  let driveScore = 100;
  if (weatherCode === 45 || weatherCode === 48) driveScore -= 45; // Fog
  if (isSnow) driveScore -= 40;
  if (isStorm) driveScore -= 50;
  if (windKmh > 40) driveScore -= 25;
  if (precipProb > 60) driveScore -= 20;
  driveScore = Math.max(0, Math.min(100, Math.round(driveScore)));

  const getLabelAndReason = (score: number, activity: string): { label: ActivityScore['label']; reason: string } => {
    if (score >= 85) return { label: 'Ideal', reason: `Perfect parameters for ${activity.toLowerCase()}.` };
    if (score >= 65) return { label: 'Good', reason: `Favorable conditions for ${activity.toLowerCase()}.` };
    if (score >= 45) return { label: 'Fair', reason: `Acceptable, but keep an eye on changing conditions.` };
    if (score >= 20) return { label: 'Poor', reason: `Sub-optimal weather for ${activity.toLowerCase()}.` };
    return { label: 'Hazardous', reason: `Unfavorable or risky conditions. Indoor alternatives suggested.` };
  };

  const activities = [
    { id: 'running', name: 'Running & Jogging', iconName: 'Activity', score: runScore },
    { id: 'cycling', name: 'Cycling', iconName: 'Bike', score: bikeScore },
    { id: 'picnic', name: 'Picnic & Outings', iconName: 'TreePark', score: picnicScore },
    { id: 'beach', name: 'Beach & Swimming', iconName: 'Waves', score: beachScore },
    { id: 'stargazing', name: 'Stargazing', iconName: 'Sparkles', score: starScore },
    { id: 'driving', name: 'Driving Conditions', iconName: 'Car', score: driveScore },
  ];

  return activities.map((act) => {
    const { label, reason } = getLabelAndReason(act.score, act.name);
    return {
      id: act.id,
      name: act.name,
      iconName: act.iconName,
      score: act.score,
      label,
      reason,
    };
  });
}

export function generateWeatherAlerts(
  tempC: number,
  weatherCode: number,
  windKmh: number,
  humidity: number,
  uvIndex: number,
  precipProb: number,
  precipSum: number = 0
): WeatherInsightAlert[] {
  const alerts: WeatherInsightAlert[] = [];

  // Umbrella
  const isRainyCode = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  if (isRainyCode || precipProb >= 40 || precipSum > 0.5) {
    alerts.push({
      id: 'umbrella',
      type: 'umbrella',
      title: 'Umbrella Essential',
      message: precipProb >= 70
        ? `High rain probability (${precipProb}%). Don't leave without a sturdy umbrella or waterproof coat.`
        : `Rain expected today (${precipProb}% chance). Keep an umbrella handy.`,
      level: precipProb >= 70 ? 'alert' : 'warning',
      icon: 'Umbrella',
    });
  } else {
    alerts.push({
      id: 'umbrella_no',
      type: 'umbrella',
      title: 'No Umbrella Needed',
      message: `Low probability of rain (${precipProb}%). Great day for outdoor plans.`,
      level: 'success',
      icon: 'SunMedium',
    });
  }

  // Clothing
  let dressTitle = 'Standard Attire';
  let dressMessage = '';
  let dressIcon = 'Shirt';

  if (tempC <= 0) {
    dressTitle = 'Heavy Winter Clothing';
    dressMessage = 'Sub-zero temperatures. Wear heavy thermal layers, insulated winter coat, gloves, beanie & scarf.';
    dressIcon = 'Sparkles';
  } else if (tempC <= 10) {
    dressTitle = 'Cold Weather Layering';
    dressMessage = 'Crisp cold air. Wear a warm jacket or heavy coat with comfortable trousers.';
    dressIcon = 'Shirt';
  } else if (tempC <= 18) {
    dressTitle = 'Mild Layered Outfit';
    dressMessage = 'Mild conditions. A light jacket, fleece, sweater or denim jacket will keep you comfortable.';
    dressIcon = 'Shirt';
  } else if (tempC <= 26) {
    dressTitle = 'Comfortable Casual Outfit';
    dressMessage = 'Pleasant warm weather. Cotton t-shirt, light pants or shorts recommended.';
    dressIcon = 'Glasses';
  } else {
    dressTitle = 'Hot Weather Wear';
    dressMessage = 'Warm temperatures! Wear lightweight, breathable fabrics, shorts, sunglasses, and stay hydrated.';
    dressIcon = 'Sun';
  }

  alerts.push({
    id: 'clothing',
    type: 'clothing',
    title: dressTitle,
    message: dressMessage,
    level: 'info',
    icon: dressIcon,
  });

  // UV Alert
  if (uvIndex >= 8) {
    alerts.push({
      id: 'uv_extreme',
      type: 'uv',
      title: 'Very High UV Warning',
      message: `UV Index is ${uvIndex}. Apply SPF 50+ broad-spectrum sunscreen every 2 hours, wear UV sunglasses & stay shaded 11 AM - 4 PM.`,
      level: 'alert',
      icon: 'Sun',
    });
  } else if (uvIndex >= 5) {
    alerts.push({
      id: 'uv_moderate',
      type: 'uv',
      title: 'Moderate UV Exposure',
      message: `UV Index is ${uvIndex}. Sunscreen SPF 30+ and hat recommended if staying outdoors extended period.`,
      level: 'warning',
      icon: 'Sun',
    });
  }

  // Wind Alert
  if (windKmh >= 35) {
    alerts.push({
      id: 'wind_high',
      type: 'wind',
      title: 'Strong Gusty Winds',
      message: `Wind speeds reaching ${Math.round(windKmh)} km/h. Secure lightweight outdoor furniture and stay mindful of falling debris.`,
      level: windKmh >= 50 ? 'alert' : 'warning',
      icon: 'Wind',
    });
  }

  return alerts;
}

export function formatDayOfWeek(dateStr: string, isToday: boolean = false): string {
  if (isToday) return 'Today';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatHourTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
