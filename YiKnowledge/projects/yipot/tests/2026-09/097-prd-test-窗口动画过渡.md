---

doc_type: test
title: "窗口动画过渡 — 测试方案"
status: 已完成
priority: P3
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["52-prd-窗口动画过渡"]
source_modules: ["52-prd-窗口动画过渡"]

type: test
---

# 窗口动画过渡 — 测试方案

> 来源 PRD：[52-prd-窗口动画过渡](../../prds/2026-09/52-prd-窗口动画过渡.md)
> 状态：已完成 · 优先级：P3

---

## 一、核心功能测试

| 编号 | 测试项 | 操作步骤 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-ANIM-01 | 翻译窗口弹出动画 | 1. 选中文本 → 按快捷键触发翻译 | 窗口以 scale(0.95→1) + opacity(0→1) 在 150ms 内弹出 | P0 |
| TC-ANIM-02 | 翻译窗口关闭动画 | 1. 翻译窗口可见 → 点击浮窗外部 | 窗口以 scale(1→0.95) + opacity(1→0) 在 100ms 内关闭 | P0 |
| TC-ANIM-03 | 翻译结果展开动画 | 1. 触发翻译 → 等待结果返回 | 结果区域以 height: 0→auto 在 200ms 内平滑展开 | P0 |
| TC-ANIM-04 | 多接口结果逐个出现 | 1. 启用 3 个翻译服务 → 触发翻译 | 各服务结果以 50ms stagger 逐个出现 | P1 |
| TC-ANIM-05 | 动画帧率 60fps | 1. 连续触发 10 次翻译窗口弹出/关闭 | 帧率稳定 ≥ 60fps，无掉帧 | P0 |
| TC-ANIM-06 | prefers-reduced-motion 跳过动画 | 1. 系统设置 reduced motion → 触发翻译 | 窗口瞬间出现 (0ms transition)，无动画 | P0 |
| TC-ANIM-07 | 用户手动关闭动画 | 1. 设置页 → 外观 → 关闭动画 → 触发翻译 | 窗口瞬间出现，无过渡效果 | P1 |

## 二、边界与异常测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-ANIM-E01 | 快速连续打开/关闭 | 0.1s 内触发 5 次翻译 | 中断当前动画，窗口最终状态正确（开/关），无动画残留 | P1 |
| TC-ANIM-E02 | 动画中切换语言 | 翻译窗口弹出动画进行中 → 切换目标语言 | 动画完成后再更新语言，无闪烁 | P2 |
| TC-ANIM-E03 | 结果为空时跳过展开 | 翻译返回空结果 (API 异常) | 跳过 height 展开动画，直接显示空状态 | P2 |
| TC-ANIM-E04 | 拖拽窗口时暂停动画 | 翻译窗口展开 → 拖拽窗口 | 拖拽期间暂停动画，释放后恢复 | P2 |
| TC-ANIM-E05 | 低电量模式 | macOS 低电量模式或 `navigator.getBattery().level < 20%` | 自动禁用非必要动画 | P2 |
| TC-ANIM-E06 | 窗口最小化恢复 | 翻译窗口最小化到托盘 → 恢复 | 恢复时跳过入场动画，窗口直接显示 | P2 |
| TC-ANIM-E07 | 多窗口同时动画 | 翻译窗口 + OCR 窗口同时弹出 | 每个窗口独立动画，帧率不下降 | P1 |
| TC-ANIM-E08 | 动画库加载失败 | 模拟 CDN 加载 Framer Motion 失败 | try-catch fallback 到 CSS transition，窗口仍可正常弹出 | P2 |

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-ANIM-P01 | 弹出动画首帧 | First paint timing | < 16ms | > 32ms | Chrome DevTools Performance 面板 |
| TC-ANIM-P02 | 窗口弹出总时长 | 动画开始到完成 | 150ms ± 10ms | > 200ms | Framer Motion `onAnimationComplete` + `performance.now()` |
| TC-ANIM-P03 | 窗口关闭总时长 | 动画开始到窗口销毁 | 100ms ± 10ms | > 150ms | 同上 |
| TC-ANIM-P04 | GPU 合成开销 | GPU 使用率增加 | < 5% | > 10% | Activity Monitor (macOS) / Task Manager GPU |
| TC-ANIM-P05 | 低端设备帧率 | Intel HD Graphics 620 | ≥ 50fps | < 45fps | `requestAnimationFrame` 帧计数 |
| TC-ANIM-P06 | 动画内存峰值 | 动画期间 JS heap | < 5MB 额外 | > 10MB 额外 | Chrome DevTools Memory |

## 四、可访问性与安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-ANIM-A01 | reduced-motion 媒体查询 | `window.matchMedia('(prefers-reduced-motion: reduce)')` 模拟 | 所有动画 duration 置为 0 | P0 |
| TC-ANIM-A02 | aria-live 不重复播报 | 动画期间使用屏幕阅读器 | 仅播报最终状态，不播报中间帧 | P1 |
| TC-ANIM-A03 | 设置页动画开关 | 关闭后触发所有动画场景 | 无任何动画，组件直接渲染最终状态 | P1 |
| TC-ANIM-A04 | 动画完成内存释放 | 窗口关闭后 Memory 面板检查 | 无 Framer Motion/React Spring 残留引用 | P2 |

## 五、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 优先级 |
|------|---------|---------|--------|
| REG-01 | 翻译窗口弹出/关闭动画正常 | 核心动画 | P0 |
| REG-02 | reduced-motion 跳过动画 | 无障碍 | P0 |
| REG-03 | 快速连续操作无动画残留 | 稳定性 | P1 |
| REG-04 | 多窗口独立动画 | 并行动画 | P1 |
| REG-05 | 动画关闭开关生效 | 可配置性 | P1 |
| REG-06 | 结果展开动画流畅 | 反馈动画 | P1 |

## 六、参考文档

- PRD: [52-prd-窗口动画过渡](../../prds/2026-09/52-prd-窗口动画过渡.md)
- 翻译窗口交互测试: [20-prd-test-翻译窗口交互](./020-prd-test-翻译窗口交互.md)
- OCR 窗口交互测试: [21-prd-test-OCR窗口交互](./021-prd-test-OCR窗口交互.md)
- 性能基准测试: [22-prd-test-性能基准](./022-prd-test-性能基准.md)