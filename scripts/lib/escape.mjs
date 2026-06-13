// scripts/lib/escape.mjs — HTML 转义工具
const RE = /[&<>"']/g;
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** 转义 HTML 文本中的元字符。null/undefined 输出空串。 */
export const esc = (s) => (s == null ? '' : String(s).replace(RE, c => MAP[c]));
