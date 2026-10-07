---

doc_type: module
prd_task_id: "YP-09-S30"
title: "窗口动画过渡 — 开发方案"
status: 已完成
priority: P3
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "52-prd-窗口动画过渡.md"

type: task
---

# 窗口动画过渡 — 开发方案

> 来源 PRD：[52-prd-窗口动画过渡](../../prds/2026-09/52-prd-窗口动画过渡.md)
> 需求编号：YP-09-S30 · 优先级：P3 · 人天：0.5d

## 一、技术栈

- **Framer Motion 10.x**: 组件级动画（AnimatePresence、motion.div、staggerChildren）
- **React Spring 9.x**: 窗口级弹性动画（useTransition、useSpring）
- **CSS Transition**: `prefers-reduced-motion` 降级方案

## 二、核心实现

### AnimationProvider (全局控制)

```jsx
// src/components/AnimationProvider.jsx
import { createContext, useContext } from "react";
import { useConfig } from "../hooks/useConfig";

const AnimationContext = createContext({ enabled: true, reducedMotion: false });

export function AnimationProvider({ children }) {
  const [animEnabled] = useConfig("animations_enabled", true);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const enabled = animEnabled && !reducedMotion;

  return (
    <AnimationContext.Provider value={{ enabled, reducedMotion }}>
      {children}
    </AnimationContext.Provider>
  );
}

export const useAnimation = () => useContext(AnimationContext);
```

### 翻译窗口弹出动画

```jsx
// window/Translate/index.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useAnimation } from "../../components/AnimationProvider";

function TranslateWindow({ visible, onClose, result }) {
  const { enabled } = useAnimation();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={enabled ? { opacity: 0, scale: 0.95 } : false}
          animate={enabled ? { opacity: 1, scale: 1 } : false}
          exit={enabled ? { opacity: 0, scale: 0.95 } : false}
          transition={{ duration: enabled ? 0.15 : 0, ease: "easeOut" }}
        >
          <TranslateContent result={result} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 翻译结果展开 (React Spring)

```jsx
// window/Translate/components/TargetArea/index.jsx
import { useSpring, animated } from "@react-spring/web";

function TargetArea({ result, visible }) {
  const { enabled } = useAnimation();
  const spring = useSpring({
    height: visible ? "auto" : 0,
    opacity: visible ? 1 : 0,
    config: { tension: 200, friction: 20 },
    immediate: !enabled
  });

  return (
    <animated.div style={spring}>
      <TranslateResult result={result} />
    </animated.div>
  );
}
```

### 多结果 staggered 出现

```jsx
<motion.div variants={{
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
}} initial="hidden" animate="visible">
  {results.map((r, i) => (
    <motion.div key={i} variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 }
    }}>
      <ServiceResult result={r} />
    </motion.div>
  ))}
</motion.div>
```

## 三、设计决策

| 决策点 | 方案 | 理由 | 权衡 |
|--------|------|------|------|
| 动画库 | Framer Motion + React Spring 互补 | FM 擅长声明式进出场；RS 擅长物理弹簧效果 | 两个库增加 bundle ~30KB gzip |
| 快速操作中断 | 跳至目标状态（不等待当前动画完成） | `AnimatePresence` 自动处理，无需额外代码 | 无平滑过渡（符合预期的苹果式交互） |
| reduced-motion | `transition.duration = 0` | 1 行代码实现，无需条件渲染 | CSS 动画仍在但瞬间完成（GPU 无开销） |
| 窗口拖拽时暂停 | 监听拖拽状态 → `immediate: true` | 防止拖拽卡顿 | Spring 动画突然中断 |
| 动画性能 | 仅使用 `transform` + `opacity` | 仅触发 composite，不触发 layout/paint | 无法使用 `height` 动画（需用 scaleY 替代） |

## 四、性能优化

| 优化点 | 手段 | 效果 |
|--------|------|------|
| GPU 合成 | `will-change: transform, opacity` | 动画在合成线程执行 |
| 退出时释放 | `AnimatePresence` 自动 unmount | 退出后 DOM 和动画状态释放 |
| 低电量感知 | `navigator.getBattery()` 检测 | 省电模式自动关闭动画 |
| 下拉关闭阈值 | 拖拽 50px+ = 关闭，不等待动画 | 操作响应 < 16ms |

## 五、错误处理

| 场景 | 处理 |
|------|------|
| Framer Motion 加载失败 | try-catch 包裹 → fallback 到 `<div>` (无动画) |
| `prefers-reduced-motion` 不支持 | `matchMedia` 返回 false → 默认开启动画 |
| `navigator.getBattery` 不支持 | catch → 忽略省电检测，保持动画开启 |

## 六、交叉引用

| 文档 | 路径 |
|------|------|
| PRD | [52-prd-窗口动画过渡](../../prds/2026-09/52-prd-窗口动画过渡.md) |
| 测试 | [97-prd-test-窗口动画过渡](../../tests/2026-09/97-prd-test-窗口动画过渡.md) |
| 源码 | `YiPot/src/components/AnimationProvider.jsx` |
| 翻译窗口 | `YiPot/src/window/Translate/` |