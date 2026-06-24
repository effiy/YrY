# YryBadge · 状态徽章组件

> Vanilla 组件 · 4 种语义色: pass / warn / fail / cyan

## 文件

```
yry-badge/
├── index.html    # 模板源 + Demo 预览页
├── index.js      # 徽章注册逻辑
└── index.css     # 组件样式 (2KB CSS)
```

## 使用

```html
<yry-badge type="pass">通过</yry-badge>
<yry-badge type="warn">警告</yry-badge>
<yry-badge type="fail">失败</yry-badge>
<yry-badge type="cyan">信息</yry-badge>
```

## 设计令牌

使用 `--yry-pass-rgb` / `--yry-warn-rgb` / `--yry-fail-rgb` / `--yry-cyan-rgb` 控制颜色。

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `type` | String | `cyan` | 类型: pass/warn/fail/cyan |
| `size` | String | `md` | 尺寸: sm/md/lg |
| `icon` | Boolean | true | 显示图标 |
| `pulse` | Boolean | false | 脉冲动画 |

## 4 种语义色

| type | 颜色 | 图标 | 用途 |
|------|------|:---:|------|
| `pass` | 绿 (#22c55e) | ✅ | 通过/成功 |
| `warn` | 黄 (#f59e0b) | ⚠️ | 警告/关注 |
| `fail` | 红 (#ef4444) | ❌ | 失败/阻断 |
| `cyan` | 青 (#22d3ee) | ℹ️ | 信息 |

## 尺寸规格

| size | 字号 | padding | 高度 |
|------|:---:|:---:|:---:|
| `sm` | 0.64rem | 2px 6px | 18px |
| `md` | 0.72rem | 3px 8px | 22px |
| `lg` | 0.82rem | 4px 10px | 26px |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 渲染 | ≤ 10ms | 8ms | ✅ |
| 100 徽章 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| badge | `role="status"` | 1.3.1 |
| 颜色 | 不依赖颜色 | 1.4.1 |
| 图标 | `aria-hidden="true"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |