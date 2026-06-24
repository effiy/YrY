/**
 * Tests for shared/html-sanitize.js — YrYHtml.sanitize()
 *
 * 验证项:
 *   - 白名单标签保留(格式化标签)
 *   - 危险标签移除(script/iframe/object/embed)
 *   - 事件属性移除(on* 前缀)
 *   - 危险协议过滤(javascript:/vbscript:/data:)
 *   - 安全 URL 协议保留(http/https/mailto/tel/#)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SHARED_DIR = path.resolve(import.meta.dirname, '../shared');
const loaderCode = fs.readFileSync(`${SHARED_DIR}/html-sanitize.js`, 'utf8');

let sanitize;
let YrYHtml;

beforeAll(() => {
  const sandbox = { console, window: {}, navigator: {}, DOMParser };

  (0, eval)(loaderCode);
  YrYHtml = window.YrYHtml;
  sanitize = YrYHtml.sanitize;
});

describe('YrYHtml.sanitize — 白名单标签', () => {
  it('保留格式化标签(p/strong/em/code)', () => {
    const result = sanitize('<p>hello <strong>world</strong> <em>foo</em> <code>bar</code></p>');
    expect(result).toContain('<p>hello <strong>world</strong> <em>foo</em> <code>bar</code></p>');
  });

  it('保留列表标签(ul/ol/li)', () => {
    const result = sanitize('<ul><li>a</li><li>b</li></ul>');
    expect(result).toContain('<ul><li>a</li><li>b</li></ul>');
  });

  it('保留标题标签(h1-h6)', () => {
    const result = sanitize('<h1>title</h1><h2>sub</h2>');
    expect(result).toContain('<h1>title</h1>');
    expect(result).toContain('<h2>sub</h2>');
  });

  it('保留链接(a)及 href', () => {
    const result = sanitize('<a href="https://example.com">link</a>');
    expect(result).toContain('<a href="https://example.com">');
    expect(result).toContain('link</a>');
  });
});

describe('YrYHtml.sanitize — 危险标签移除', () => {
  it('移除 <script> 及其内容', () => {
    const result = sanitize('<p>safe</p><script>alert(1)</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert(1)');
    expect(result).toContain('<p>safe</p>');
  });

  it('移除 <iframe>', () => {
    const result = sanitize('<p>x</p><iframe src="evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
    expect(result).toContain('<p>x</p>');
  });

  it('移除 <object> 和 <embed>', () => {
    const result = sanitize('<object data="evil.swf"></object><embed src="x.swf">');
    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
  });

  it('移除 <style> 标签', () => {
    const result = sanitize('<style>body{color:red}</style><p>x</p>');
    expect(result).not.toContain('<style');
    expect(result).toContain('<p>x</p>');
  });
});

describe('YrYHtml.sanitize — 事件属性移除', () => {
  it('移除 onclick', () => {
    const result = sanitize('<a href="https://x.com" onclick="evil()">link</a>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('href="https://x.com"');
  });

  it('移除 onerror onload onmouseover', () => {
    const result = sanitize('<img src="x" onerror="alert(1)" onload="evil()" onmouseover="x()">');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('onload');
    expect(result).not.toContain('onmouseover');
  });

  it('移除所有 on* 前缀属性(大小写不敏感)', () => {
    const result = sanitize('<div OnClick="x()" ONERROR="y()">z</div>');
    expect(result).not.toMatch(/onclick/i);
    expect(result).not.toMatch(/onerror/i);
  });
});

describe('YrYHtml.sanitize — 危险协议过滤', () => {
  it('过滤 javascript: 协议', () => {
    const result = sanitize('<a href="javascript:alert(1)">x</a>');
    expect(result).not.toContain('javascript:');
  });

  it('过滤 vbscript: 协议', () => {
    const result = sanitize('<a href="vbscript:msgbox(1)">x</a>');
    expect(result).not.toContain('vbscript:');
  });

  it('过滤 data: 协议(防 HTML 注入)', () => {
    const result = sanitize('<a href="data:text/html,<script>alert(1)</script>">x</a>');
    expect(result).not.toContain('data:text/html');
  });

  it('保留 http/https 协议', () => {
    const result = sanitize('<a href="https://safe.example.com">ok</a>');
    expect(result).toContain('https://safe.example.com');
  });

  it('保留 mailto: 和 tel: 协议', () => {
    expect(sanitize('<a href="mailto:a@b.com">m</a>')).toContain('mailto:a@b.com');
    expect(sanitize('<a href="tel:+8612345678901">t</a>')).toContain('tel:+8612345678901');
  });

  it('保留锚点(#)', () => {
    expect(sanitize('<a href="#section">s</a>')).toContain('href="#section"');
  });
});

describe('YrYHtml.sanitize — 边界情况', () => {
  it('空字符串返回空', () => {
    expect(sanitize('')).toBe('');
  });

  it('null 返回空', () => {
    expect(sanitize(null)).toBe('');
  });

  it('undefined 返回空', () => {
    expect(sanitize(undefined)).toBe('');
  });

  it('纯文本无标签保留', () => {
    expect(sanitize('just text')).toBe('just text');
  });

  it('保留 class 属性', () => {
    const result = sanitize('<p class="highlight">x</p>');
    expect(result).toContain('class="highlight"');
  });

  it('移除未在白名单的属性(如 tabindex)', () => {
    const result = sanitize('<p tabindex="1">x</p>');
    expect(result).not.toContain('tabindex');
  });
});

describe('YrYHtml — 导出 API', () => {
  it('导出 sanitize 函数', () => {
    expect(typeof YrYHtml.sanitize).toBe('function');
  });

  it('导出 ALLOWED_TAGS 白名单', () => {
    expect(YrYHtml.ALLOWED_TAGS).toBeDefined();
    expect(YrYHtml.ALLOWED_TAGS.p).toBe(true);
    expect(YrYHtml.ALLOWED_TAGS.script).toBeUndefined();
  });

  it('导出 ALLOWED_ATTRS 白名单', () => {
    expect(YrYHtml.ALLOWED_ATTRS).toBeDefined();
    expect(YrYHtml.ALLOWED_ATTRS.href).toBe(true);
    expect(YrYHtml.ALLOWED_ATTRS.onclick).toBeUndefined();
  });
});
