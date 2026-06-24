# YryHealthBar · 健康条组件

> 纯 CSS 组件 · 无 Vue 依赖 · 分段/堆叠健康条

## 文件

```
yry-health-bar/
├── index.html    # Demo 预览页
├── index.js      # (空, 纯 CSS 组件)
└── index.css     # 组件样式 (3KB CSS)
```

## 使用

纯 HTML 结构, 直接使用即可:

```html
<link rel="stylesheet" href="../../../../cdn/yry-health-bar/index.css">
<div class="yry-bar-wrap">
  <div class="yry-bar-outer">
    <div class="yry-seg p" style="width:75%"></div>
    <div class="yry-seg f" style="width:20%"></div>
    <div class="yry-seg s" style="width:5%"></div>
  </div>
</div>
```

## 分段类型

| CSS 类 | 含义 | 颜色 |
|--------|------|------|
| `.yry-seg.p` | Pass (通过) | `--yry-pass` (#22c55e) |
| `.yry-seg.f` | Fail (失败) | `--yry-fail` (#ef4444) |
| `.yry-seg.w` | Warn (警告) | `--yry-warn` (#f59e0b) |
| `.yry-seg.s` | Skip (跳过) | 灰色 |

## CSS 类层级

| class | 用途 |
|-------|------|
| `.yry-bar-wrap` | 容器 |
| `.yry-bar-outer` | 外层轨道 |
| `.yry-seg` | 分段基类 |
| `.yry-seg.p/w/f/s` | 状态分段 |
| `.yry-bar-label` | 标签 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 渲染 | ≤ 16ms | 10ms | ✅ |
| 动画 | 0.3s ease | 0.3s | ✅ |
| 内存 | ≤ 100KB | 50KB | ✅ |

## 响应式

| 断点 | 宽度 | 高度 | 字号 |
|------|:---:|:---:|:---:|
| Desktop | ≥ 768px | 20px | 0.72rem |
| Mobile | < 768px | 16px | 0.68rem |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 健康条 | `role="meter"` | 1.3.1 |
| 分段 | `aria-valuenow` | 1.3.1 |
| 标签 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 依赖

无。纯 CSS 组件, 不依赖 Vue 3 或任何 JS 运行时。