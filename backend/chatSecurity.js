/**
 * Helpers for validating chat input and limiting message frequency.
 */

const MAX_MESSAGE_LENGTH = 500;
const DEFAULT_MAX_MESSAGES = 30;
const DEFAULT_WINDOW_MS = 1000;

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Sanitize a chat message. Returns null when the input is not a usable string.
 */
const sanitizeChatMessage = (message, maxLength = MAX_MESSAGE_LENGTH) => {
  if (typeof message !== "string") return null;

  const cleaned = message
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);

  if (cleaned.length === 0) return null;

  return cleaned.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
};

/**
 * Sliding-window rate limiter keyed by connection id.
 */
const createRateLimiter = (
  maxMessages = DEFAULT_MAX_MESSAGES,
  windowMs = DEFAULT_WINDOW_MS
) => {
  const hits = new Map();

  return {
    allow(connectionId, now = Date.now()) {
      const recent = (hits.get(connectionId) || []).filter(
        (t) => now - t < windowMs
      );
      if (recent.length >= maxMessages) {
        hits.set(connectionId, recent);
        return false;
      }
      recent.push(now);
      hits.set(connectionId, recent);
      return true;
    },
    clear(connectionId) {
      hits.delete(connectionId);
    },
  };
};

module.exports = {
  MAX_MESSAGE_LENGTH,
  sanitizeChatMessage,
  createRateLimiter,
};
