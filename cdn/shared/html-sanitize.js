/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN · Shared HTML Sanitize Utility
   适用: 组件接收不可信 HTML 内容时,在 v-html 之前调用 YrYHtml.sanitize()

   功能:
     - 白名单标签/属性过滤(允许常见格式化标签,拒绝 script/iframe/object 等)
     - 非法协议过滤(javascript:/data:/vbscript: 等)
     - 事件属性过滤(on-prefixed attributes: onclick, onerror, etc.)
     - 必要时保留 class/style 供样式控制

   使用方式:
     [script src="../../shared/html-sanitize.js"][/script]
     [script]
       // 在 props 的 computed 或 method 中:
       sanitizedDesc: function () {
         return YrYHtml.sanitize(this.desc);
       }
     [/script]
     <!-- 模板中: -->
     [div v-html="sanitizedDesc"][/div]

   白名单(默认):
     标签: a/b/strong/em/code/pre/br/p/ul/ol/li/span/div/h1-h6/blockquote/q/sub/sup
     属性: href(仅 http/https/mailto/tel:#)/title/class/style

   对应场景: docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var ALLOWED_TAGS = {
    a: true,
    b: true,
    strong: true,
    i: true,
    em: true,
    code: true,
    pre: true,
    kbd: true,
    samp: true,
    var: true,
    br: true,
    p: true,
    ul: true,
    ol: true,
    li: true,
    span: true,
    div: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    blockquote: true,
    q: true,
    sub: true,
    sup: true,
    hr: true,
    small: true,
    mark: true,
    del: true,
    ins: true,
    abbr: true,
    cite: true,
    dfn: true,
    time: true,
    u: true,
    s: true
  };

  var ALLOWED_ATTRS = {
    href: true,
    title: true,
    class: true,
    style: true,
    alt: true,
    'data-label': true,
    'data-href': true,
    target: true,
    rel: true
  };

  var SAFE_URL_PROTOCOLS = /^(https?:|mailto:|tel:|#|\.\/|\.\.\/|\/)/i;
  var DANGEROUS_ATTR_PREFIX = /^on/i;

  function sanitizeAttribute(tagName, attrName, attrValue) {
    if (DANGEROUS_ATTR_PREFIX.test(attrName)) return null;
    if (!ALLOWED_ATTRS[attrName]) return null;
    if (attrName === 'href') {
      var trimmed = String(attrValue || '').trim();
      if (trimmed === '') return null;
      if (!SAFE_URL_PROTOCOLS.test(trimmed)) {
        if (
          /^javascript:/i.test(trimmed) ||
          /^vbscript:/i.test(trimmed) ||
          /^data:/i.test(trimmed)
        ) {
          return null;
        }
      }
      return trimmed;
    }
    return String(attrValue || '');
  }

  function sanitizeNode(node) {
    var nodeName = node.nodeName.toLowerCase();
    if (nodeName === '#text' || nodeName === '#comment') return;
    if (!ALLOWED_TAGS[nodeName]) {
      node.parentNode && node.parentNode.removeChild(node);
      return;
    }
    var attrs = Array.prototype.slice.call(node.attributes || []);
    for (var i = attrs.length - 1; i >= 0; i--) {
      var attr = attrs[i];
      var sanitized = sanitizeAttribute(nodeName, attr.name, attr.value);
      if (sanitized === null) {
        node.removeAttribute(attr.name);
      } else if (sanitized !== attr.value) {
        node.setAttribute(attr.name, sanitized);
      }
    }
    var children = Array.prototype.slice.call(node.childNodes);
    for (var j = 0; j < children.length; j++) {
      sanitizeNode(children[j]);
    }
  }

  function sanitize(html) {
    if (html == null) return '';
    var str = String(html);
    if (str === '') return '';
    var doc = new DOMParser().parseFromString('<div>' + str + '</div>', 'text/html');
    var root = doc.body.firstChild;
    if (!root) return '';
    var children = Array.prototype.slice.call(root.childNodes);
    for (var i = 0; i < children.length; i++) {
      sanitizeNode(children[i]);
    }
    return root.innerHTML;
  }

  function sanitizeAll(html, options) {
    var opts = options || {};
    if (opts.allowAllTags) return String(html || '');
    return sanitize(html);
  }

  window.YrYHtml = {
    sanitize: sanitize,
    sanitizeAll: sanitizeAll,
    ALLOWED_TAGS: ALLOWED_TAGS,
    ALLOWED_ATTRS: ALLOWED_ATTRS
  };
})();
