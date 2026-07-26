/**
 * Weather tool using:
 * - Open-Meteo Geocoding API (free, no key) to resolve city name → lat/lon
 * - Open-Meteo Forecast API (free, no key) to get current weather + 3-day forecast
 */

export interface WeatherResult {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherDescription: string;
  weatherEmoji: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  emoji: string;
}

// WMO Weather code → description + emoji
function decodeWeatherCode(code: number): { description: string; emoji: string } {
  if (code === 0) return { description: 'Clear sky', emoji: '☀️' };
  if (code <= 2) return { description: 'Partly cloudy', emoji: '⛅' };
  if (code === 3) return { description: 'Overcast', emoji: '☁️' };
  if (code <= 49) return { description: 'Foggy', emoji: '🌫️' };
  if (code <= 57) return { description: 'Drizzle', emoji: '🌦️' };
  if (code <= 67) return { description: 'Rain', emoji: '🌧️' };
  if (code <= 77) return { description: 'Snow', emoji: '❄️' };
  if (code <= 82) return { description: 'Rain showers', emoji: '🌧️' };
  if (code <= 86) return { description: 'Snow showers', emoji: '🌨️' };
  if (code <= 99) return { description: 'Thunderstorm', emoji: '⛈️' };
  return { description: 'Unknown', emoji: '🌡️' };
}

export async function getWeather(cityName: string): Promise<WeatherResult> {
  // Step 1: Geocode the city
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error('Geocoding service unavailable.');

  const geoData = await geoRes.json();
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City "${cityName}" not found. Please check the spelling.`);
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  // Step 2: Get weather
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=auto&forecast_days=4`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error('Weather service unavailable.');

  const weatherData = await weatherRes.json();
  const current = weatherData.current;
  const daily = weatherData.daily;

  const { description, emoji } = decodeWeatherCode(current.weather_code);

  // Build 3-day forecast (skip today at index 0)
  const forecast: ForecastDay[] = [];
  for (let i = 1; i <= 3; i++) {
    const dayCode = daily.weather_code[i];
    const { description: dayDesc, emoji: dayEmoji } = decodeWeatherCode(dayCode);
    forecast.push({
      date: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      description: dayDesc,
      emoji: dayEmoji,
    });
  }

  return {
    city: name,
    country,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    weatherDescription: description,
    weatherEmoji: emoji,
    forecast,
  };
}

/**
 * Format the weather result into a nice readable string for the AI context.
 */
export function formatWeatherForAI(w: WeatherResult): string {
  const forecastLines = w.forecast
    .map((d) => `  • ${d.date}: ${d.emoji} ${d.description}, ${d.minTemp}°C – ${d.maxTemp}°C`)
    .join('\n');

  // Framed as the AI's own knowledge — present naturally, never cite as a data source.
  return (
    `[CURRENT WEATHER KNOWLEDGE for ${w.city}, ${w.country} — use silently and present naturally]\n` +
    `Right now: ${w.weatherEmoji} ${w.weatherDescription}, ${w.temperature}°C ` +
    `(feels like ${w.feelsLike}°C), Humidity ${w.humidity}%, Wind ${w.windSpeed} km/h\n` +
    `Next 3 days:\n${forecastLines}`
  );
}
