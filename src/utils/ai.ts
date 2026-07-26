/**
 * AI utility — sends messages to Gemini via Puter.js.
 *
 * Improvements:
 *  - Always injects today's real date/time into the system prompt
 *  - Runs weather + search tools based on user intent before calling AI
 *  - Maintains a rolling 10-message conversation context window
 *  - Uses TEMPERATURE = 0.3 for focused, concise, direct answers
 *  - STREAMING — users see text appear as it is generated, not all at once
 *  - Falls back through multiple models if one fails
 */

import { getDateContext } from './date';
import { runTools } from './tools';

declare global {
  interface Window {
    puter: any;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY = 10;
const TEMPERATURE = 0.3; // low → more direct / deterministic / faster

// ─── System Prompt ────────────────────────────────────────────

function buildSystemPrompt(extraContext: string): string {
  return `You are a helpful, accurate, and confident AI assistant.

${getDateContext()}
${extraContext ? `\n${extraContext}\n` : ''}
CORE RULES:
- Answer the user's question directly and concisely.
- Sound natural, confident, and informative.
- For general factual questions (people, places, concepts, definitions), provide a clear, direct answer in 2–5 sentences using your existing knowledge.
- Keep responses brief, well-structured, and easy to understand.
- Avoid filler phrases like "Great question", "Let me think", "Based on my knowledge", etc.
- Use the same language as the user.
- If the question is ambiguous, ask one short clarifying question.

ABSOLUTE RULES — NEVER VIOLATE:
- NEVER mention "search results", "I don't have results", "no results found", "based on the information provided", "according to my search", or any similar phrasing.
- NEVER imply you are using or missing a search/browsing system.
- NEVER refer to any [BACKGROUND INFO], [LIVE WEATHER DATA] or other bracketed blocks above — silently use that information as if it were your own knowledge.
- If extra context is provided above, weave it naturally into your answer without citing it as an external source.
- If you don't have specific real-time details (like exact prices, today's news), give what is generally known about the topic confidently, without referencing missing data.
- Only mention browsing or sources if the user explicitly asks "did you search?" or "what is your source?".

WEATHER QUESTIONS:
- If live weather data appears in the context above, present it naturally as the current conditions (e.g. "It's currently 18°C and partly cloudy in London…"). Do not say "according to the data".
- If no live weather is available, give general climate information for that location instead of saying you lack data.

Examples:
User: What is the capital of France?
Assistant: Paris.

User: Who created Python?
Assistant: Python was created by Guido van Rossum, a Dutch programmer, in 1991. It was designed to emphasize code readability and simplicity.

User: Tell me about Mars.
Assistant: Mars is the fourth planet from the Sun and the second-smallest in the solar system. Often called the Red Planet due to its iron-oxide surface, it has two small moons — Phobos and Deimos — and a thin atmosphere mostly made of carbon dioxide. NASA and other agencies have sent multiple rovers to study its surface.`;
}

// ─── Puter.js helpers ────────────────────────────────────────

function waitForPuter(timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.puter?.ai) { resolve(); return; }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.puter?.ai) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Puter.js failed to load. Please refresh.'));
      }
    }, 200);
  });
}

// ─── Model list ────────────────────────────────────────────────

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gpt-4o-mini',
  'claude-3-haiku',
];

// ─── Streaming call (returns nothing, calls onChunk) ────────

/**
 * Stream a response from the AI. Chunks are emitted via onChunk.
 * Returns true on success, false if all models failed.
 */
export async function sendMessageToAIStreamed(
  userMessage: string,
  history: ChatMessage[],
  onChunk: (partial: string, delta: string) => void
): Promise<boolean> {
  await waitForPuter();

  const toolContext = await runTools(userMessage);
  const contextBlocks: string[] = [];
  if (toolContext.weatherContext) contextBlocks.push(toolContext.weatherContext);
  if (toolContext.searchContext) contextBlocks.push(toolContext.searchContext);

  const systemPrompt = buildSystemPrompt(contextBlocks.join('\n\n'));
  const trimmedHistory = history.slice(-MAX_HISTORY);

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  // Try each model in order with streaming
  for (const model of MODELS) {
    try {
      const response = await window.puter.ai.chat(messages, {
        model,
        stream: true,
        temperature: TEMPERATURE,
      });

      // Stream the chunks
      let full = '';
      for await (const part of response) {
        if (part && typeof part.text === 'string') {
          const delta = part.text;
          full += delta;
          onChunk(full, delta);
        }
      }

      if (full.trim().length > 0) return true;
    } catch (err) {
      console.warn(`[AI] Model "${model}" (stream) failed:`, err);
    }
  }

  // All models failed — give fallback non-streaming try
  try {
    const response = await window.puter.ai.chat(messages, {
      model: 'gemini-2.0-flash',
      temperature: TEMPERATURE,
    });
    const text = typeof response === 'string'
      ? response
      : response?.message?.content ?? response?.text ?? '';
    if (text) {
      onChunk(text, text);
      return true;
    }
  } catch (err) {
    console.warn('[AI] fallback also failed', err);
  }

  onChunk("I'm having trouble connecting right now. Please try again in a moment.", '');
  return false;
}

// ─── Non-streaming call (kept for simplicity / tests) ───────

/**
 * Non-streaming version. Kept for simple one-off calls.
 */
export async function sendMessageToAI(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  return new Promise(async (resolve) => {
    let finalText = '';
    const ok = await sendMessageToAIStreamed(userMessage, history, (full) => {
      finalText = full;
    });
    if (!ok && !finalText) {
      resolve("I'm having trouble connecting. Please try again.");
    } else {
      resolve(finalText);
    }
  });
}
