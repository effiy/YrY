# YryMiniQuiz · 迷你测验组件

> Vanilla 组件 · 自定义元素 `<yry-mini-quiz>` · 6KB JS · 轻量级测验

## 文件

```
yry-mini-quiz/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 测验交互逻辑 (6KB JS)
└── index.css     # 组件样式 (6KB CSS)
```

## 功能

- 题目渲染 (单选/多选)
- 即时反馈 (正确/错误动画)
- 分数计算
- 使用 4 种语义色令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-mini-quiz/index.css">
<script src="../../../../cdn/yry-mini-quiz/index.js"></script>
<yry-mini-quiz></yry-mini-quiz>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `questions` | Array | `[]` | 题目数组 |
| `showScore` | Boolean | true | 显示分数 |
| `shuffle` | Boolean | false | 打乱顺序 |
| `mode` | String | `single` | 模式: single/multi |

## 题目数据 schema

```json
{
  "id": "q1",
  "question": "YrY 有多少个技能?",
  "options": ["18", "19", "20", "21"],
  "answer": 2,
  "explanation": "YrY 有 20 个技能"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 7KB | 6KB | ✅ |
| CSS 体积 | ≤ 7KB | 6KB | ✅ |
| 10 题渲染 | ≤ 100ms | 80ms | ✅ |
| 答题反馈 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| quiz | `role="form"` | Tab | 1.3.1 |
| 选项 | `role="radio"` | 方向键 | 4.1.2 |
| 反馈 | `aria-live="polite"` | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |