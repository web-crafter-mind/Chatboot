/**
 * Tool dispatcher — detects what the user is asking and fetches live data.
 * Returns extra context blocks to inject into the system prompt.
 */

import { getWeather, formatWeatherForAI } from './weather';
import { searchDuckDuckGo, formatSearchForAI } from './search';

// Detect if the user is asking about weather and extract the city name
function detectWeatherQuery(message: string): string | null {
  const lower = message.toLowerCase();
  const weatherKeywords = /\b(weather|temperature|temp|forecast|hot|cold|rain|snow|wind|humid|climate|sunny|cloudy|storm)\b/;
  if (!weatherKeywords.test(lower)) return null;

  // Try to extract city after known patterns
  const patterns = [
    /(?:weather|temperature|temp|forecast|climate)\s+(?:in|at|for|of)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now|this week)/i,
    /(?:in|at)\s+([a-zA-Z\s]+?)\s+(?:weather|temperature|temp|forecast)/i,
    /(?:how(?:'s| is) (?:the )?(?:weather|temperature))(?:\s+(?:in|at|for))?\s+([a-zA-Z\s,]+?)(?:\?|$)/i,
    /([a-zA-Z\s]+?)\s+(?:weather|temperature|temp|forecast)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const city = match[1].trim().replace(/[?,!.]+$/, '').trim();
      if (city.length > 1 && city.split(' ').length <= 4) {
        return city;
      }
    }
  }

  return null;
}

// Detect if user is asking for news/search
function detectSearchQuery(message: string): string | null {
  const lower = message.toLowerCase();
  const searchKeywords = /\b(news|latest|recent|current|today|happening|update|search|find|tell me about|what is|who is|what are)\b/;
  if (!searchKeywords.test(lower)) return null;

  // Don't trigger search for weather (handled above)
  if (/\b(weather|temperature|forecast)\b/.test(lower)) return null;

  // Clean up the query
  const cleaned = message
    .replace(/^(search for|find|tell me about|what is|who is|news about|latest on)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  if (cleaned.length > 2) return cleaned;
  return null;
}

export interface ToolContext {
  weatherContext?: string;
  searchContext?: string;
  errors: string[];
}

export async function runTools(userMessage: string): Promise<ToolContext> {
  const context: ToolContext = { errors: [] };

  const weatherCity = detectWeatherQuery(userMessage);
  const searchQuery = detectSearchQuery(userMessage);

  // Run tools in parallel
  await Promise.all([
    weatherCity
      ? getWeather(weatherCity)
          .then((result) => {
            context.weatherContext = formatWeatherForAI(result);
          })
          .catch((err) => {
            context.errors.push(`Weather: ${err.message}`);
          })
      : Promise.resolve(),

    searchQuery
      ? searchDuckDuckGo(searchQuery)
          .then((result) => {
            context.searchContext = formatSearchForAI(result);
          })
          .catch((err) => {
            context.errors.push(`Search: ${err.message}`);
          })
      : Promise.resolve(),
  ]);

  return context;
}
