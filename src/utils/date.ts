/**
 * Returns a rich date/time context string for the AI system prompt.
 * Uses the user's local timezone automatically.
 */
export function getDateContext(): string {
  const now = new Date();

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return `Today's date: ${dateStr}. Current time: ${timeStr} (${timezone}).`;
}
