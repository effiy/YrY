---

doc_type: module
prd_task_id: "YP-09-S24"
title: "翻译窗口交互 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "35-prd-翻译窗口交互.md"
tags: [开发方案, UI, 交互, 翻译窗口]

type: task
---

# 翻译窗口交互 — 开发方案

## 架构与数据流

```
事件来源                          Translate/index.jsx                     子组件
────────                         ───────────────────                     ──────
clipboard.rs                      useEffect 事件监听
  ├── "clipboard-changed" ──→     剪贴板文本变化
  └── "new_text"          ──→     输入翻译模式                ┌── WindowControl (macOS 红绿灯/Win 关闭)
                                       │                      │
tray.rs                                ├── setText(text) ───→ ├── LanguageArea (源/目标语言选择 + 监听开关)
  └── "input_translate"  ──→           │                      │
                                       ├── parallelDispatch() → ├── SourceArea (原文展示 + contentEditable)
OCR Window                             │                      │
  └── "translate-from-ocr" ──→         ├── setResults() ────→ └── TargetArea
                                       │                           ├── ResultCard × N (每个服务独立卡片)
用户操作                               │                           └── ErrorBanner (聚合错误)
  ├── Esc              ──→  关闭窗口   │
  ├── 窗口外 click      ──→  关闭窗口   ├── 操作栏
  └── 原文编辑          ──→  重新翻译   │   ├── 复制 → clipboard.rs writeText
                                       │   ├── 朗读 → services/tts/**
                                       │   └── 收藏 → Collection store (Jotai atom)
                                       │
                                       └── 窗口位置记忆 (localStorage)
```

**上游依赖**: `clipboard.rs` (选中文本) / `lang_detect.rs` (自动检测源语言) / `tray.rs` (托盘菜单触发)
**下游消费者**: `Collection` (收藏记录) / `History` (翻译历史)

## 关键实现

### 主容器 Translate/index.jsx

```jsx
// src/window/Translate/index.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import WindowControl from "@/components/WindowControl";
import LanguageArea from "./components/LanguageArea";
import SourceArea from "./components/SourceArea";
import TargetArea from "./components/TargetArea";

export default function Translate() {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [fromLang, setFromLang] = useState("auto");
  const [toLang, setToLang] = useState("zh");
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const positionRef = useRef(loadPosition()); // localStorage 位置记忆

  const translateAll = useCallback(async (inputText) => {
    // 取消上一次请求
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const services = getEnabledServices("translate");
    const dispatchResults = await parallelDispatch(inputText, services, {
      timeout: 10000,
      signal: controller.signal,
    });

    if (!controller.signal.aborted) {
      setResults(dispatchResults);
    }
  }, [fromLang, toLang]);

  // 监听剪贴板变化
  useEffect(() => {
    const unlisten = listen("clipboard-changed", (event) => {
      const selectedText = event.payload;
      if (isListening && selectedText?.trim()) {
        setText(selectedText);
        translateAll(selectedText);
      }
    });
    return () => unlisten.then((fn) => fn());
  }, [isListening, translateAll]);

  // 监听输入翻译事件 (托盘菜单)
  useEffect(() => {
    const unlisten = listen("new_text", (event) => {
      if (event.payload === "[INPUT_TRANSLATE]") return; // 空白窗口
      setText(event.payload);
      translateAll(event.payload);
    });
    return () => unlisten.then((fn) => fn());
  }, [translateAll]);

  // 窗口关闭: Esc / 外部点击
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") closeWindow(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // 原文编辑防抖重新翻译
  const handleTextChange = (newText) => {
    setText(newText);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => translateAll(newText), 300);
  };

  // 窗口位置记忆
  const handleResize = () => {
    positionRef.current = { x: window.screenX, y: window.screenY, w: window.outerWidth, h: window.outerHeight };
    savePosition(positionRef.current);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="translate-window" style={{ /* positionRef.current */ }}>
      <WindowControl platform={platform} />
      <LanguageArea fromLang={fromLang} toLang={toLang} isListening={isListening}
        onFromChange={setFromLang} onToChange={setToLang} onToggleListen={setIsListening} />
      <SourceArea text={text} onTextChange={handleTextChange} detectedLang={fromLang} />
      <TargetArea results={results} onCopy={handleCopy} onSpeak={handleSpeak} onCollect={handleCollect} />
    </div>
  );
}
```

### SourceArea 组件

```jsx
// src/window/Translate/components/SourceArea/index.jsx
export default function SourceArea({ text, onTextChange, detectedLang }) {
  const ref = useRef(null);

  useEffect(() => {
    if (text === "" && ref.current) {
      ref.current.focus(); // 输入翻译模式自动聚焦
    }
  }, [text]);

  return (
    <div className="source-area">
      <div className="source-header">
        <span className="detected-lang">{detectedLang}</span>
        <span className="char-count">{text.length}/5000</span>
      </div>
      <div ref={ref} className="source-text" contentEditable suppressContentEditableWarning
        onInput={(e) => {
          const value = e.currentTarget.textContent || "";
          if (value.length > 5000) {
            e.currentTarget.textContent = value.slice(0, 5000);
            return;
          }
          onTextChange(value);
        }}>
        {text}
      </div>
    </div>
  );
}
```

### 窗口预创建与复用 (Tauri)

```rust
// src-tauri/src/main.rs
fn get_or_create_translate_window(app: &AppHandle) -> WebviewWindow {
    if let Some(window) = app.get_webview_window("translate") {
        window.show().unwrap();
        window.set_focus().unwrap();
        return window;
    }

    WebviewWindowBuilder::new(app, "translate", WebviewUrl::App("/translate".into()))
        .title("Pot - Translate")
        .inner_size(350.0, 500.0)
        .decorations(false)
        .always_on_top(true)
        .visible_on_all_workspaces(true)
        .build()
        .unwrap()
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 窗口复用 | Tauri `get_or_create` 模式 | 避免重复创建开销，首次创建后 < 50ms 显示 |
| 原文编辑 | `contentEditable` 直接编辑 | 无 vDOM diff 开销，长文本输入更流畅 |
| 原文变更重新翻译 | 300ms 防抖 | 避免每次按键都发起 API 请求 |
| 快速连续选文 | AbortController 取消旧请求 | 只展示最新结果，节省带宽 |
| 窗口位置记忆 | 单条 localStorage key, resize 事件 debounce | 非频繁读写，10s 保存一次 |
| 窗口外部点击关闭 | Tauri 窗口 `focus` 事件 + 全局 mousedown 委托 | 跨平台一致行为 |

## 性能优化

| 优化项 | 措施 | 目标 |
|--------|------|------|
| 窗口预创建 | `WebviewWindowBuilder` 首次创建后复用 | 选中文本 → 窗口弹出 < 500ms |
| 首条翻译展示 | 利用 parallelDispatch `fulfilled` 排序 | 窗口弹出 → 首条翻译 < 1000ms |
| 结果列表虚拟滚动 | 超过 3 个服务结果启用虚拟滚动 | 避免大量 DOM 节点 |
| 窗口关闭清理 | 关闭后释放翻译结果 DOM 节点 + AbortController | 内存不回涨 |
| 语言切换 | 直接触发重新翻译, 无额外渲染 | 切换 → 重新发起 < 200ms |

## 错误处理

| 场景 | 输入 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 选中文本为空 | 空白/仅空格 | 不弹出窗口 | 静默忽略 |
| 选中文本超长 | > 5000 字符 | 截断 + "..."，原文区域可滚动 | contentEditable 限制 5000 字符 |
| 无可用翻译服务 | 所有服务禁用 | 窗口显示 "请启用翻译服务" | 链接到设置页面 |
| 全部服务错误 | 网络断开 | 窗口保留，显示错误 + "重试" 按钮 | 用户手动重试 |
| 窗口超出屏幕 | 屏幕边缘弹出 | 自动调整到可见区域 | 检测 `screen.availWidth/Height` |
| 朗读服务不支持 | TTS 无此语言 | 按钮灰显, tooltip "不支持该语言" | 禁用交互 |
| 翻译服务窗口已存在 | OCR → 翻译 | 在已有窗口追加文字 | Tauri event `translate-from-ocr` |

## 交叉引用

- [34-prd-并行调度策略](../prds/2026-09/34-prd-并行调度策略.md) — 多服务并行翻译调度
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 窗口联动
- [40-prd-Rust剪贴板模块](../prds/2026-09/40-prd-Rust剪贴板模块.md) — 剪贴板监听
- [47-prd-ADR-多窗口架构](../prds/2026-09/47-prd-ADR-多窗口架构.md) — 翻译窗口独立存在的原因