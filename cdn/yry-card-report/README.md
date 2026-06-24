# YryCardReport · 卡片分析报告模态框

> 一个 vanilla JS 组件，暴露 `window.YryCardReport.open(card)` — 传入卡片 DOM，弹出该卡片的内容分析报告模态框。每张卡片有独立报告。

## 文件结构

```
yry-card-report/
├── index.css     # 模态框样式: 深色主题 · 遮罩 · 三档评分块
└── index.js      # window.YryCardReport.open(card) / close()
```

## 使用场景

`docs/index.html` 与 `cdn/index.html` 中,每张 `.item-card` / `.story-card` / `.scene-card` 的 `.ydb-score-badge` 被点击时,调用 `YryCardReport.open(card)` 打开该卡片专属的分析报告。

```html
<link rel="stylesheet" href="../cdn/yry-card-report/index.css">
<script src="../cdn/yry-card-report/index.js"></script>
```

```js
badge.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (window.YryCardReport) window.YryCardReport.open(card);
});
```

## 报告内容

模态框从卡片 DOM 提取以下信息并渲染:

| 区块 | 来源 | 说明 |
|------|------|------|
| 标题 | `.name` / `.story-name` / `.scene-name` | 卡片名称 |
| 类型 | 卡片 class | 组件 / 故事 / 场景 (含 iconModifier) |
| 描述 | `.desc` / `.story-desc` / `.scene-desc` | 卡片描述文本 |
| 三档评分 | `.ydb-badge-num` 文本 | 🩺健康 · 🧪测试 · 🧬自改进 |
| 综合分析 | 由分数推导 | 高分维度表扬 · 低分维度建议 |
| 上下文 chips | tags / meta / href | 标签 · 元信息 · 是否含源码链接 |
| 场景列表 | `.story-scenes .scene-tag` | 仅故事卡显示 |

## 行为

| 行为 | 触发 | 详情 |
|------|------|------|
| 打开 | `YryCardReport.open(card)` | 注入遮罩 + 模态框到 body,显示 `is-open` 类 |
| 关闭 | 点击 ✕ / 点击背景 / 按 Esc | 移除 `is-open` 类,焦点回到原触发元素 |
| 键盘 | Enter / 空格 | 调用方在 badge 上监听后触发 open |

## 评分等级映射

| 分数区间 | 等级 | 文本 | 颜色 |
|----------|------|------|------|
| ≥ 80 | A | 优秀/良好 | `#22c55e` 绿 |
| 60-79 | B | 良好/一般 | `#f59e0b` 黄 |
| 40-59 | C | 一般/偏弱 | `#ef4444` 红 |
| < 40 | D | 风险 | `#ef4444` 红 |

分析文本基于最低分维度生成针对性建议:
- 健康度最低 → 排查健康检查告警,关注依赖/体积/范式合规
- 测试度最低 → 补充单元/集成测试
- 自改进最低 → 沉淀经验为技能并接入自循环报告
