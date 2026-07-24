import { defineAsyncComponent, defineComponent } from 'vue'

const cssCache = new Set()
const templateCache = new Map()

/**
 * 定义带异步模板加载的 Vue 组件
 *
 * 支持 YiPet 4 文件模式：
 *   - index.html    模板（异步 fetch）
 *   - index.js      组件逻辑（本文件）
 *   - index.css     样式（自动注入为 <link>）
 *
 * @param {Object} opts
 * @param {string} opts.html - index.html 的相对路径
 * @param {string} [opts.css] - index.css 的相对路径
 * @param {string} opts.name - 组件名
 * @param {Function} opts.setup - setup 函数
 * @param {Object} [opts.props] - props 定义
 * @param {string[]} [opts.emits] - emits 定义
 * @param {Object} [opts.components] - 子组件
 * @returns {import('vue').Component}
 */
export function defineView({ html, css, name, setup, props, emits, components }) {
  // 注入 CSS（仅一次）
  if (css && !cssCache.has(css)) {
    cssCache.add(css)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = css
    document.head.appendChild(link)
  }

  // 预取模板
  if (!templateCache.has(html)) {
    templateCache.set(html, fetch(html).then(r => {
      if (!r.ok) throw new Error(`[defineView] 模板加载失败: ${html}`)
      return r.text()
    }))
  }

  return defineAsyncComponent({
    loader: () => templateCache.get(html).then(template =>
      defineComponent({ name, template, setup, props, emits, components })
    ),
    delay: 0
  })
}
