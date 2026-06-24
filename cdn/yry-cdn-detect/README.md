# YryCdnDetect · CDN 加载耗时检测

> Live Bar 徽章: 检测 CDN 资源加载耗时并可视化展示

## 文件

```
yry-cdn-detect/
├── index.html    # 检测面板 Demo 预览页
├── index.js      # 检测逻辑: Performance API 收集 + 渲染
└── index.css     # Live Bar 样式: 固定底栏 · 颜色编码 (绿/黄/红)
```

## 功能

- 使用 Performance API 测量 CDN 资源加载耗时
- 在页面底部渲染 Live Bar 徽章 (颜色编码: 绿/黄/红)
- 支持自定义阈值

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-cdn-detect/index.css">
<script src="../../../../cdn/yry-cdn-detect/index.js"></script>
```

自动检测页面中所有 CDN 资源加载耗时,渲染为彩色徽章。

## 依赖

无外部依赖

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `data-threshold-green` | Number | 300 | 绿色阈值 (ms) |
| `data-threshold-yellow` | Number | 1000 | 黄色阈值 (ms) |
| `data-position` | String | `bottom` | 位置: bottom/top |
| `data-filter` | String | `cdn` | 资源过滤 |

## 颜色编码

| 耗时 | 颜色 | 状态 |
|------|------|------|
| < 300ms | 绿 | 优秀 |
| 300-1000ms | 黄 | 良好 |
| > 1000ms | 红 | 需优化 |

## Performance API 指标

| 指标 | API | 用途 |
|------|------|------|
| DNS | `domainLookupEnd - domainLookupStart` | DNS 解析 |
| TCP | `connectEnd - connectStart` | TCP 连接 |
| TTFB | `responseStart - requestStart` | 首字节 |
| Download | `responseEnd - responseStart` | 下载 |
| Total | `responseEnd - fetchStart` | 总耗时 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 检测延迟 | ≤ 100ms | 50ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| Live Bar | `role="status"` | 1.3.1 |
| 徽章 | `aria-live="polite"` | 4.1.3 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |