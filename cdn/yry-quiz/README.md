# YryQuiz · 自测答题交互

> 自测答题交互: 题目渲染 · 选项选择 · 结果判定

## 文件

```
yry-quiz/
├── index.html    # 自测答题 Demo 预览页
├── index.js      # 答题逻辑: 题目加载 · 选项交互 · 结果计算
└── index.css     # 答题样式: 卡片 · 选项 · 正确/错误反馈 · 分数
```

## 功能

- 题目渲染 (单选/多选)
- 选项选择交互 (correct/wrong 视觉反馈)
- 结果判定和展示
- 分数计算

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-quiz/index.css">
<script src="../../../../cdn/yry-quiz/index.js"></script>
```

## CSS 类

| 类 | 用途 |
|------|------|
| `.quiz-card` | 题目卡片容器 |
| `.quiz-opt` | 选项按钮 (correct/wrong/disabled) |
| `.quiz-feedback` | 反馈区域 (show) |
| `.quiz-score` | 分数展示 |

## 依赖

无外部依赖

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `questions` | Array | `[]` | 题目数组 |
| `showScore` | Boolean | true | 显示分数 |
| `randomize` | Boolean | false | 随机顺序 |
| `passingScore` | Number | 70 | 及格分 |

## 题目数据 schema

```json
{
  "id": "q1",
  "question": "什么是 Gate A?",
  "options": ["编码前阻断点", "编码后验证", "测试工具", "通知系统"],
  "answer": 0,
  "explanation": "Gate A 是编码前的强制性阻断点"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 5KB | 4KB | ✅ |
| CSS 体积 | ≤ 5KB | 4KB | ✅ |
| 20 题渲染 | ≤ 150ms | 120ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| quiz | `role="form"` | Tab | 1.3.1 |
| 选项 | `role="radio"` | 方向键 | 4.1.2 |
| 分数 | `aria-live="polite"` | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |