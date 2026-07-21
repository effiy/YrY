/**
 * Chat message normalization helpers
 *
 * Extracted from core/utils/session/sessionManager.js _normalizeRole / _normalizeText
 * and exposed as standalone exports for h5/ component consumption.
 */

/**
 * Normalize message role to 'user' or 'pet'.
 * @param {Object} msg - Message object
 * @returns {string} 'user' | 'pet'
 */
export function normalizeRole(msg) {
  if (!msg || typeof msg !== 'object') return 'pet';
  const author = String(msg.author || '').toLowerCase();
  const role = String(msg.role || msg.type || '').toLowerCase();

  if (role === 'user' || role === 'me' || author.includes('user') || author.includes('用户')) {
    return 'user';
  }
  return 'pet';
}

/**
 * Normalize message text content to a plain string.
 * @param {Object} msg - Message object
 * @returns {string} trimmed text content
 */
export function normalizeText(msg) {
  if (!msg || typeof msg !== 'object') return '';
  return String(msg.content || msg.text || msg.message || '').trim();
}
