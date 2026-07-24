/**
 * YiNoScript - 无脚本回退提示
 * 参考 YiH5 组件模式：index.html（模板）+ index.js（逻辑）
 * author: liangliang
 */

// 对齐 YiH5 defineView 的模板加载模式
const TEMPLATE_URL = new URL('./index.html', import.meta.url).href;

let _templatePromise = null;

function loadTemplate() {
  if (!_templatePromise) {
    _templatePromise = fetch(TEMPLATE_URL).then(r => {
      if (!r.ok) throw new Error(`[YiNoScript] 模板加载失败: ${TEMPLATE_URL}`);
      return r.text();
    });
  }
  return _templatePromise;
}

/**
 * 创建 noscript 回退提示
 * @param {Object} options
 * @param {string} [options.message='请启用 JavaScript 以使用此页面'] - 提示文案
 * @param {string} [options.container='body'] - 注入容器
 */
export async function createNoScript(options = {}) {
  const {
    message = '请启用 JavaScript 以使用此页面',
    container = 'body'
  } = options;

  if (document.querySelector('.noscript-fallback')) return;

  const template = await loadTemplate();
  const html = template.replace('{message}', message);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const noscript = wrapper.firstElementChild;

  document.querySelector(container).appendChild(noscript);
  return noscript;
}
