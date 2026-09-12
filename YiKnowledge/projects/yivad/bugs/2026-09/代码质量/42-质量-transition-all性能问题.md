---
title: transition: all 导致不必要的布局属性动画
tags: [yivad, code-quality, css-performance]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# transition: all 导致不必要的布局属性动画

## 现象

多个 SCSS 文件使用 `transition: all 0.2s` 作为通用过渡效果：

```scss
// SelectIcon/index.scss:27
transition: all 0.2s;

// styles/common.scss:107
transition: all 0.2s;
```

`transition: all` 会对**所有** CSS 属性变化执行动画，包括布局触发性属性（`width`、`height`、`top`、`left`、`margin`、`padding`），导致：
- 浏览器在动画期间频繁重新计算布局（Layout Thrashing）
- 页面滚动或窗口调整大小时出现掉帧
- 不必要的 GPU 合成层创建

## 根因分析

- `transition: all` 是"方便但昂贵"的写法，适合原型但不应出现在生产样式中
- 开发者只需动画 `opacity`、`transform`、`color` 等合成属性
- CSS 性能最佳实践推荐显式列出过渡属性

## 涉及文件

- `components/SelectIcon/index.scss:27`
- `styles/common.scss:107`

## 修复方案

```scss
// 仅过渡合成属性（不触发 layout）
transition: opacity 0.2s, transform 0.2s, color 0.2s;
```

## 预防措施

- Stylelint 规则禁止 `transition: all`（`declaration-property-value-disallowed-list`）

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

