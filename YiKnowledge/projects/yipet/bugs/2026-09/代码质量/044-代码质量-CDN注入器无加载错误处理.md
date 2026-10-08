---
title: CDN injector 未处理资源加载失败的降级
tags: [yipet, code-quality, resilience]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# CDN injector 未处理资源加载失败的降级

## 现象

`content/cdn/injector.ts` 中资源注入使用 `document.createElement('script')` / `link` 动态加载，但未监听 `onerror` 事件来处理加载失败：

```typescript
const el = document.createElement('script');
el.src = url;
document.head.appendChild(el);
// 无 onerror 处理
```

## 涉及文件

- `src/content/cdn/injector.ts`

## 修复方案

添加 `el.onerror` 处理记录加载失败，并在多次失败后跳过该资源。


## 影响范围

**影响模块**：`src/content/cdn/injector.ts` 资源加载逻辑。
**影响用户**：当 CDN 资源加载失败时，依赖该资源的功能静默不可用。用户看到宠物覆盖层不完整或聊天窗口功能缺失，但无任何错误提示。
**影响范围**：所有依赖 CDN 资源的 MAIN World 功能。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 资源加载失败时显示用户可见的降级提示 | 开发者 |
| 代码 | 为关键资源（Vue、Element Plus）提供加载失败的降级方案 | 开发者 |
| 体验 | 加载失败累计超过阈值时触发错误通知 | 开发者 |
| 监控 | 记录 CDN 资源加载失败率和失败原因 | DevOps |


## 经验教训

静默失败是用户体验最差的错误处理方式——用户感知到功能异常但不知道为什么。CDN 资源加载是扩展初始化的关键路径，失败时必须有用户可见的反馈。至少应在控制台输出警告，最好是可视化的降级 UI。
