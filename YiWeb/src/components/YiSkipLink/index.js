/**
 * YiSkipLink - 无障碍跳过导航链接
 * 参考 YiH5 组件模式：index.html（模板）+ index.js（逻辑）
 * author: liangliang
 */

// 对齐 YiH5 defineView 的模板加载模式
const TEMPLATE_URL = new URL('./index.html', import.meta.url).href;

let _templatePromise = null;

function loadTemplate() {
  if (!_templatePromise) {
    _templatePromise = fetch(TEMPLATE_URL).then(r => {
      if (!r.ok) throw new Error(`[YiSkipLink] 模板加载失败: ${TEMPLATE_URL}`);
      return r.text();
    });
  }
  return _templatePromise;
}

/**
 * 创建跳过导航链接
 * @param {Object} options
 * @param {string} [options.target='#main-content'] - 跳转目标选择器
 * @param {string} [options.label='跳到主要内容'] - 链接文本
 */
export async function createSkipLink(options = {}) {
  const { target = '#main-content', label = '跳到主要内容' } = options;

  if (document.querySelector('.skip-link')) return;

  const template = await loadTemplate();
  const html = template.replace('{target}', target).replace('{label}', label);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const link = wrapper.firstElementChild;

  document.body.prepend(link);
  return link;
}
