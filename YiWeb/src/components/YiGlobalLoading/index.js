/**
 * YiGlobalLoading - 全局加载指示器组件
 * 参考 YiH5 组件模式：index.html（模板）+ index.js（逻辑）+ index.css（样式）
 * author: liangliang
 */

// 对齐 YiH5 defineView 的模板加载模式，使用 fetch + import.meta.url
const TEMPLATE_URL = new URL('./index.html', import.meta.url).href;
const LOADING_ID = 'global-loading-indicator';

let _templatePromise = null;

/**
 * 加载 HTML 模板（带缓存，对齐 defineView 的 templateCache）
 * @returns {Promise<string>}
 */
function loadTemplate() {
  if (!_templatePromise) {
    _templatePromise = fetch(TEMPLATE_URL).then(r => {
      if (!r.ok) throw new Error(`[YiGlobalLoading] 模板加载失败: ${TEMPLATE_URL}`);
      return r.text();
    });
  }
  return _templatePromise;
}

/**
 * 创建全局加载指示器并注入到页面
 * @param {Object} options
 * @param {string} [options.text='正在加载...'] - 加载提示文字
 * @param {string} [options.container='body'] - 注入容器选择器
 */
export async function createGlobalLoading(options = {}) {
  const { text = '正在加载...', container = 'body' } = options;

  if (document.getElementById(LOADING_ID)) return;

  const template = await loadTemplate();
  const html = template.replace('{text}', text);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const section = wrapper.firstElementChild;

  document.querySelector(container).appendChild(section);
  return section;
}

/**
 * 显示加载指示器
 */
export function showGlobalLoading() {
  const el = document.getElementById(LOADING_ID);
  if (el) el.style.display = '';
}

/**
 * 隐藏加载指示器
 */
export function hideGlobalLoading() {
  const el = document.getElementById(LOADING_ID);
  if (el) el.style.display = 'none';
}
