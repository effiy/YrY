/**
 * Vitest 测试辅助 — 从组件 index.html 提取 x-template 模板字符串
 */

import fs from 'node:fs';
import path from 'node:path';

const CDN_DIR = path.resolve(import.meta.dirname, '..');

export function extractTemplate(componentName, templateId) {
  const html = fs.readFileSync(`${CDN_DIR}/${componentName}/index.html`, 'utf8');
  // 剥离 HTML 注释,避免注释中出现的 <script type="text/x-template"> 文本被误匹配
  const stripped = html.replace(/<!--[\s\S]*?-->/g, '');
  // 属性需在同一行(用 [^>\n] 代替 [^>] 避免跨行匹配注释中的文本)
  const re = new RegExp(
    `<script[^>\\n]*type="text/x-template"[^>\\n]*id="${templateId}"[^>\\n]*>([\\s\\S]*?)</script>`
  );
  let m = stripped.match(re);
  if (!m) {
    const reAlt = new RegExp(
      `<script[^>\\n]*id="${templateId}"[^>\\n]*type="text/x-template"[^>\\n]*>([\\s\\S]*?)</script>`
    );
    m = stripped.match(reAlt);
  }
  if (!m) throw new Error(`template ${templateId} not found in ${componentName}/index.html`);
  return m[1].trim();
}

export { CDN_DIR };
