# YiPot · 用户故事与组件化分析

> 轴线：**前端 → 组件化**（见 `.claude/skills/yry-init/rules/architecture-direction.md`）。
> 分析口径：以**页面 / 窗口**为大模块，每个模块下展开用户故事；以**组件化**为基础组织使用场景。
> 源码根：`YiPot/src/`（React + Tauri）。生成于 2026-07-24。

## 故事目录

| 页面 / 窗口（大模块） | 路径 | 故事 | 场景数 |
|------------------------|------|------|--------|
| 主窗口 | `src/App.jsx` + `src/main.jsx` | [翻译主界面](main-window/index.md) | 5 |
| 子窗口 | `src/window/` | [配置 / 历史 / 关于](sub-windows/index.md) | 3 |
| 划词 / 全屏翻译模式 | overlay | [浮层翻译](overlay-modes/index.md) | 2 |

横切：`hooks/`（自定义 Hook）、`services/`（翻译引擎 / OCR / TTS 适配）、`i18n/`（多语）、`utils/`。

## 组件化方向（下一步提取机会）

| 机会 | 现状 | 建议提取 |
|------|------|----------|
| 引擎选择器 | 主窗口内联 | `<EngineSelector>` props(engines, value, onChange) |
| 结果对比面板 | 切换查看 | `<ResultCompare>` 多引擎并排 |
| OCR 面板 | 内联 | `<OCRPanel>` + `useOCR()` Hook |
| 浮层容器 | overlay 自管 | `<OverlayFrame>` 统一拖拽 / 关闭 / 主题 |
| Hook 抽象 | `hooks/` 内可能存在重复副作用 | 抽 `useAsyncAction()` / `useClipboard()` 基础 Hook |
| i18n 字符串 | `i18n/` 静态 | 引入 key 注册表，缺失 key fail-fast |

## 非目标

- 不在本阶段切换为多窗口 SSR（Tauri 单进程多窗口够用）。
- 不强制引入 Redux / Zustand（当前 Hook + 服务抽象够用）。

## 链接

- 架构场景：`../arch/index.html`
- 测试场景：`../test/index.html`
- 文件清单：`../files/index.html`
- API 清单：`../apis/index.html`
