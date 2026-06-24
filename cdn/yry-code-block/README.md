# YryCodeBlock · 代码块组件

> Vanilla 组件 · 自定义元素 `<yry-code-block>` · 语法高亮 + 复制

## 文件

```
yry-code-block/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 代码块交互: 复制 + 高亮
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- 代码块语法高亮样式
- 点击复制代码内容
- 使用 `--yry-accent-rgb` / `--yry-pass-rgb` 令牌

## 使用

```html
<yry-code-block lang="javascript">
  console.log('hello');
</yry-code-block>
```

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `lang` | String | `text` | 语言: javascript/python/bash/json/md |
| `copyable` | Boolean | true | 可复制 |
| `showLineNumbers` | Boolean | false | 行号 |
| `collapsed` | Boolean | false | 折叠长代码 |
| `maxLines` | Number | — | 最大行数 |

## 支持语言

| lang | 高亮 | 示例 |
|------|:---:|------|
| `javascript` | ✅ | `const x = 1` |
| `python` | ✅ | `x = 1` |
| `bash` | ✅ | `echo hello` |
| `json` | ✅ | `{"a": 1}` |
| `md` | ✅ | `# Title` |
| `text` | ❌ | 纯文本 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 渲染 (100 行) | ≤ 50ms | 40ms | ✅ |
| 复制响应 | ≤ 16ms | 10ms | ✅ |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `copy` | 复制成功 | `{text}` |
| `copy-error` | 复制失败 | `{error}` |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 代码块 | `role="code"` | Tab | 1.3.1 |
| 复制按钮 | `aria-label` | Enter | 4.1.2 |
| 语言 | `aria-label` | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |