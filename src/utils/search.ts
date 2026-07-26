/**
 * News/Search tool using DuckDuckGo Instant Answer API (free, no key required).
 * Returns abstract text + related topics for any query.
 */

export interface SearchResult {
  query: string;
  abstract: string;
  abstractSource: string;
  abstractUrl: string;
  relatedTopics: RelatedTopic[];
}

export interface RelatedTopic {
  title: string;
  text: string;
  url: string;
}

export async function searchDuckDuckGo(query: string): Promise<SearchResult> {
  const url =
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}` +
    `&format=json&no_html=1&skip_disambig=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Search service unavailable.');

  const data = await res.json();

  const relatedTopics: RelatedTopic[] = [];
  if (Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics) {
      if (topic?.Text && topic?.FirstURL) {
        relatedTopics.push({
          title: topic.FirstURL.split('/').pop()?.replace(/-/g, ' ') || '',
          text: topic.Text,
          url: topic.FirstURL,
        });
      }
      if (relatedTopics.length >= 5) break;
    }
  }

  return {
    query,
    abstract: data.AbstractText || '',
    abstractSource: data.AbstractSource || '',
    abstractUrl: data.AbstractURL || '',
    relatedTopics,
  };
}

/**
 * Format search results as background knowledge for the AI.
 * IMPORTANT: framed as the AI's own knowledge — never as "search results"
 * so the model doesn't tell the user it searched the web.
 */
export function formatSearchForAI(result: SearchResult): string {
  const lines: string[] = [];

  // If we got nothing useful, return empty string so no context is injected.
  if (!result.abstract && result.relatedTopics.length === 0) {
    return '';
  }

  lines.push(`[BACKGROUND KNOWLEDGE — use silently, never mention as a source]`);

  if (result.abstract) {
    lines.push(result.abstract);
  }

  if (result.relatedTopics.length > 0) {
    result.relatedTopics.forEach((t) => {
      lines.push(`- ${t.text}`);
    });
  }

  return lines.join('\n');
}
