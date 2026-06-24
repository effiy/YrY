# YryTypewriterDemo · 终端演示组件

> Vanilla 组件 · 自定义元素 `<yry-typewriter-demo>` · 6KB JS · 打字机完整实现

## 文件

```
yry-typewriter-demo/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 终端演示逻辑 (6KB JS)
└── index.css     # 组件样式 (4KB CSS)
```

## 功能

- 终端风格打字机动画
- 命令行提示符效果
- 可配置打字速度和延迟
- 使用 3 种语义色令牌 (accent / cyan / fail)

## 与 yry-typewriter 的关系

`yry-typewriter` 是基础打字机引擎，`yry-typewriter-demo` 是完整的终端演示实现。

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `lines` | Array | `[]` | 终端行数组 |
| `speed` | Number | 50 | 打字速度 (ms/字符) |
| `prompt` | String | `$` | 提示符 |
| `loop` | Boolean | false | 循环 |
| `autoStart` | Boolean | true | 自动开始 |

## 终端行 schema

```json
{
  "type": "command",
  "text": "/rui init",
  "delay": 500
}
```

## 行类型

| type | 样式 | 用途 |
|------|------|------|
| `command` | 青 | 用户命令 |
| `output` | 默认 | 命令输出 |
| `error` | 红 | 错误信息 |
| `success` | 绿 | 成功信息 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 7KB | 6KB | ✅ |
| CSS 体积 | ≤ 5KB | 4KB | ✅ |
| 打字动画 | 50ms/字符 | 50ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 终端 | `role="log"` | 1.3.1 |
| 输出 | `aria-live="polite"` | 4.1.3 |
| 命令 | `role="code"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |