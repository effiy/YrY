/**
 * YrY · H5 Template Engine — loads template.html files and provides sync rendering
 *
 * Templates are parsed from <template id="tpl-xxx"> elements inside template.html
 * using DOMParser. Placeholders use {key} syntax and are replaced via simple
 * string interpolation at render time.
 *
 * Usage:
 *   const tpl = loadTemplate('Chat', '../Chat/template.html');
 *   const html = tpl.render('tpl-chat-message', { role: 'is-user', ... });
 */

/**
 * Synchronously load and parse a template.html file.
 * Uses synchronous XHR (small files, instant at module init time).
 *
 * @param {string} name - component name for caching
 * @param {string} url - path to template.html (relative to current module)
 * @returns {{ render: (id:string, data:object) => string }}
 */
export function loadTemplate(name, url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false); // sync — template.html files are tiny (<5KB)
  try { xhr.send(); } catch (_) {}

  const templates = {};

  if (xhr.status === 200 && xhr.responseText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xhr.responseText, 'text/html');
    doc.querySelectorAll('template[id]').forEach(el => {
      templates[el.id] = el.innerHTML;
    });
  }

  return {
    /**
     * Render a template by id with the given data.
     * Replaces all {key} placeholders with their values.
     * @param {string} id - template element id (e.g. 'tpl-chat-message')
     * @param {Object} data - key/value pairs for placeholder substitution
     * @returns {string} rendered HTML
     */
    render(id, data = {}) {
      const tpl = templates[id];
      if (tpl == null) {
        console.warn(`[Template] "${id}" not found in "${name}"`);
        return '';
      }
      let result = tpl;
      for (const [k, v] of Object.entries(data)) {
        if (result.indexOf(`{${k}}`) === -1) continue;
        const re = new RegExp(`\\{${k}\\}`, 'g');
        result = result.replace(re, v == null ? '' : String(v));
      }
      return result;
    },

    /** Check if a template exists */
    has(id) { return id in templates; },

    /** Get raw template string (without substitution) */
    raw(id) { return templates[id] || ''; }
  };
}
