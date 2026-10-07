---

doc_type: module
prd_task_id: "YP-09-S25"
title: "OCR 识别窗口交互 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "36-prd-OCR窗口交互.md"
tags: [开发方案, OCR, UI, 交互]

type: task
---

# OCR 识别窗口交互 — 开发方案

## 架构与数据流

```
事件来源                          Recognize/index.jsx                     子组件
────────                         ───────────────────                     ──────
screenshot.rs 截图完成
  └── imageDataUrl ──────────→   图片 Base64 数据               ┌── ImageArea (截图预览)
                                       │                        │   ├── 缩放: 鼠标滚轮 0.5x ~ 3x
clipboard.rs 粘贴图片                  ├── parallelDispatch()     │   └── 拖拽: 图片 > 容器时
  └── 外部图片 Base64 ────────→        │   (在线 API + 系统 OCR) │
                                       │                        ├── TextArea (识别文字, contentEditable)
system_ocr.rs                          ├── setResults() ────────→│   ├── 原始快照: originalResults
  └── 系统原生 OCR 结果 ───────→        │                        │   └── 编辑态: 允许用户修正
                                       │                        │
parallelDispatch                       │                        └── ControlArea (操作栏)
  └── 在线 API 结果 ──────────→        │                            ├── 复制全文 → clipboard.rs
                                       │                            ├── 一键翻译 → emit "translate-from-ocr"
用户操作                               │                            ├── 重新框选 → emit "re-screenshot"
  ├── Esc / 窗口外 click → 关闭        │                            ├── 还原原始 → 从快照恢复
  ├── 文字编辑 → 本地状态更新          │                            └── 系统 OCR toggle
  └── 滚轮 → 图片缩放                  │
                                       │
                                       └── 截图原图缓存 (Rust 层 Base64 或临时文件)
```

**上游依赖**: `screenshot.rs` (截图流程) / `system_ocr.rs` (macOS/Windows 系统 OCR) / `clipboard.rs` (剪贴板图片)
**下游消费者**: `Translate/index.jsx` (一键翻译) / `Collection` (识别文字保存)

## 关键实现

### 主容器 Recognize/index.jsx

```jsx
// src/window/Recognize/index.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import ImageArea from "./ImageArea";
import TextArea from "./TextArea";
import ControlArea from "./ControlArea";

export default function Recognize() {
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [results, setResults] = useState([]);
  const [originalResults, setOriginalResults] = useState([]); // 快照
  const [editedTexts, setEditedTexts] = useState({}); // serviceId → text
  const [useSystemOcr, setUseSystemOcr] = useState(true);
  const [scale, setScale] = useState(1);
  const abortRef = useRef(null);

  // 监听截图完成事件
  useEffect(() => {
    const unlisten = listen("ocr-result", (event) => {
      const { imageBase64, systemOcrText } = event.payload;
      setImageDataUrl(`data:image/png;base64,${imageBase64}`);
      runOcr(imageBase64, systemOcrText);
    });
    return () => unlisten.then((fn) => fn());
  }, [useSystemOcr]);

  const runOcr = useCallback(async (imageBase64, systemOcrText) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 系统 OCR 结果
    const allResults = [];
    if (useSystemOcr && systemOcrText) {
      allResults.push({ service: { id: "system", name: "系统 OCR" }, status: "fulfilled", data: { text: systemOcrText }, elapsed: 0 });
    }

    // 在线 API 并行调度
    const onlineServices = getEnabledServices("recognize");
    if (onlineServices.length > 0) {
      const onlineResults = await parallelDispatch(imageBase64, onlineServices, {
        timeout: 10000,
        signal: controller.signal,
      });
      allResults.push(...onlineResults);
    }

    if (!controller.signal.aborted) {
      setResults(allResults);
      setOriginalResults(allResults.map((r) => ({ ...r }))); // 保存快照
    }
  }, [useSystemOcr]);

  // 文字编辑
  const handleTextEdit = (serviceId, newText) => {
    setEditedTexts((prev) => ({ ...prev, [serviceId]: newText }));
  };

  // 还原原始识别
  const handleRestore = () => {
    setResults(originalResults);
    setEditedTexts({});
  };

  // 一键翻译
  const handleTranslate = () => {
    const allText = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => editedTexts[r.service.id] || r.data?.text || "")
      .join("\n");
    emit("translate-from-ocr", { text: allText, fromLang: "auto" });
  };

  // 图片缩放
  const handleWheel = (e) => {
    e.preventDefault();
    setScale((prev) => Math.min(3, Math.max(0.5, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  return (
    <div className="recognize-window">
      <ImageArea imageDataUrl={imageDataUrl} scale={scale} onWheel={handleWheel} />
      <TextArea results={results} editedTexts={editedTexts} onTextEdit={handleTextEdit} />
      <ControlArea onCopy={() => copyAllText(results, editedTexts)} onTranslate={handleTranslate}
        onReScreenshot={() => emit("re-screenshot")} onRestore={handleRestore}
        useSystemOcr={useSystemOcr} onToggleSystemOcr={setUseSystemOcr} />
    </div>
  );
}
```

### 图片预览组件 (ImageArea)

```jsx
export default function ImageArea({ imageDataUrl, scale, onWheel }) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (scale <= 1) return; // 缩放 > 1x 才可拖拽
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  return (
    <div className="image-area" onWheel={onWheel} onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}>
      {imageDataUrl ? (
        <img src={imageDataUrl} style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          objectFit: "contain", maxHeight: "100%" }} draggable={false} alt="screenshot" />
      ) : (
        <div className="image-placeholder">拖拽图片到此或粘贴截图</div>
      )}
    </div>
  );
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 双栏布局 | 左侧截图预览, 右侧文字展示 | 对照查看, 方便验证 OCR 结果 |
| 截图原图缓存 | Rust 层 Base64 或临时文件 | 避免 JS 层大内存占用 (截图可达 10MB+) |
| 图片预览缩放 | CSS `transform: scale()` + 鼠标滚轮 | 使用 GPU 合成层, 无需 JS 缩放图片 |
| 原始结果快照 | `originalResults` 状态保存 | 用户编辑后可一键还原 |
| 系统 OCR 与在线 API 并存 | 并行展示两类结果 | 离线可用 (macOS/Windows), 在线更高精度 |
| 不自动合并多服务结果 | 每个服务独立卡片展示 | 用户自行判断, 避免错误合并 |

## 性能优化

| 优化项 | 措施 | 目标 |
|--------|------|------|
| 截图压缩 | Rust 层压缩 > 4MB 图片, 保持可读 | 减少上传带宽 60-80% |
| 图片渲染 | CSS `max-height` + `object-fit: contain` | GPU 加速, 避免 JS Canvas 缩放 |
| 虚拟滚动 | 结果列表超过 3 个服务启用虚拟滚动 | 大幅减少 DOM 节点 |
| 分阶段耗时记录 | 截图压缩 / 网络传输 / API 处理 三段计时 | 定位性能瓶颈 |
| 重新框选 | 关闭当前窗口 + 触发截图, < 300ms | 用户快速重新选择区域 |

## 错误处理

| 场景 | 输入 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 截图无文字 | 纯色/风景截图 | "未检测到文字" | 提供 "重新截图" 按钮 |
| 截图模糊 | 低分辨率 | "识别精度有限" + 置信度标注 | 建议重新截取高清区域 |
| 系统 OCR 不可用 | Linux | 系统 OCR 结果显示 "不可用" | 仅展示在线 API 结果 |
| 图片过大 | > 10MB | Rust 层压缩到 <= 4MB + 提示 | 自动压缩 |
| 用户编辑后想还原 | 手动修改 OCR 文字 | "还原原始识别" 按钮 | 从 originalResults 快照恢复 |
| 翻译窗口已存在 | OCR → 翻译 | 已有窗口追加文字 (不替换) | Tauri event 发送新文字 |
| 剪贴板图片非截图 | 外部粘贴图片 | 同样走 OCR 流程, 标注图片来源 | — |

## 交叉引用

- [32-prd-百度腾讯OCR](../prds/2026-09/32-prd-百度腾讯OCR.md) — 在线 OCR 服务
- [33-prd-讯飞合合火山OCR](../prds/2026-09/33-prd-讯飞合合火山OCR.md) — 在线 OCR 服务
- [34-prd-并行调度策略](../prds/2026-09/34-prd-并行调度策略.md) — 多 OCR 服务并行调度
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 翻译窗口联动
- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — Rust 层截图和系统 OCR
- [53-prd-task-翻译窗口交互实现](./53-prd-task-翻译窗口交互实现.md) — 翻译窗口开发方案