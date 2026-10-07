---

doc_type: module
prd_task_id: "YP-09-M03"
title: "OCR 截图识别 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 4
source_prd: "02-prd-OCR与截图识别.md"

type: task
---

# OCR 截图识别 — 开发方案

> 来源 PRD：[02-prd-OCR与截图识别.md](../../prds/2026-09/02-prd-OCR与截图识别.md)
> 需求编号：YP-09-M03 · 优先级：高 · 人天：4d

> **文档职责**：本文档定义截图 OCR、截图翻译、系统 OCR 集成的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、截图 OCR 实现方案

### 1.1 全平台截图策略

| 平台 | 方案 | 技术选型 | 优势 |
|------|------|---------|------|
| macOS | `screencapture -i -r -x` 系统命令 | Rust `std::process::Command` | 零开发成本、体验原生（Space 窗口截图/Option 修改锚点） |
| Windows | 自定义全屏 Canvas 窗口 | React + `screenshots` crate | 跨平台一致 UI |
| Linux | 自定义全屏 Canvas 窗口 | React + `screenshots` crate | 跨平台一致 UI |

**决策理由**：macOS 的 `screencapture -i` 是系统级原生工具，提供完整的手势操作（Space 切换窗口截图、Option 修改选区锚点、Shift 锁定方向），自行实现复杂度极高且体验不如原生。Windows/Linux 缺少等效工具，统一走自定义 Canvas 路线。

### 1.2 截图窗口架构

```
Screenshot Window (Tauri)
  ├─ label: "screenshot"
  ├─ decorations: false, alwaysOnTop: true, fullscreen: true
  ├─ skipTaskbar: true
  └─ React Canvas 选区组件
       ├─ onMouseDown → 记录起始坐标 (x1, y1)
       ├─ onMouseMove → 实时绘制选区矩形 + 尺寸标注 (60fps)
       ├─ onMouseUp → 固定选区, 显示操作栏 (确认/取消)
       ├─ onKeyDown(Esc) → 关闭截图窗口
       └─ onKeyDown(Enter) → 裁剪选区 → invoke OCR
```

### 1.3 图片处理管线

```typescript
// 截图 → OCR 全流程
async function screenshotToOCR(): Promise<OCRResult> {
  // 1. 截图 (Rust 侧)
  const imageBytes = await invoke<Uint8Array>('capture_screenshot', { 
    x, y, width, height 
  });
  
  // 2. 预处理 (前端)
  const processed = await preprocessImage(imageBytes, {
    maxWidth: 2048,        // 超过则自动缩放
    format: 'image/png',
  });
  
  // 3. base64 编码
  const base64 = arrayBufferToBase64(processed);
  
  // 4. 并行调用 OCR 服务
  const results = await Promise.allSettled(
    enabledOCRServices.map(s => s.recognize(base64))
  );
  
  return aggregateResults(results);
}
```

**图片过大处理（> 10MB base64）**：前端检测 base64 长度，超过阈值时自动将图片缩放至 2048px 宽边（保持比例），JPEG 质量下调至 60%。

---

## 二、截图翻译流水线

### 2.1 串联流水线

```
截图 → OCR 识别 → 语言检测 → 翻译 → 结果展示
  │        │          │         │        │
  100ms   1-3s      50ms     0.5-2s
  (PNG)  (云/本地)  (detect) (并行翻译)
```

**性能目标**：云 OCR 全流程 ≤ 4s（P95），本地 OCR 全流程 ≤ 2s（P95）。

### 2.2 OCR 结果 → 翻译的衔接

```typescript
interface ScreenshotTranslatePipeline {
  async execute(imageBase64: string, targetLang: string) {
    // 步骤 1: OCR 识别
    const ocrResult = await ocrService.recognize(imageBase64);
    
    // 步骤 2: 语言检测
    const detectedLang = await langDetect(ocrResult.text);
    
    // 步骤 3: 仅翻译外文部分 (源语言与目标语言相同则跳过)
    if (detectedLang === targetLang) {
      return { translated: false, message: '源语言与目标语言相同' };
    }
    
    // 步骤 4: 并行翻译 (见翻译核心架构)
    const translated = await translateService.translate(
      ocrResult.text, detectedLang, targetLang
    );
    
    return { translated: true, original: ocrResult.text, translated };
  }
}
```

---

## 三、系统 OCR 集成

### 3.1 平台适配架构

```rust
// Rust 侧 — OCR 能力抽象
#[tauri::command]
async fn system_ocr(image_base64: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    return macos_vision_ocr(&image_base64).await;
    
    #[cfg(target_os = "windows")]
    return windows_media_ocr(&image_base64).await;
    
    #[cfg(target_os = "linux")]
    return tesseract_ocr(&image_base64).await;
}
```

### 3.2 智能降级链

```
系统 OCR (首选, 离线, 无 API Key)
  ├─ 置信度 ≥ 0.8 → 直接返回
  ├─ 置信度 < 0.8 且无网络 → 降级 Tesseract.js
  └─ 置信度 < 0.8 且有网络 → 云 OCR
      ├─ 中文文本 → 百度精准 OCR
      ├─ 多语言 → 火山 OCR
      └─ 通用 → 腾讯 OCR
          └─ 全部失败 → Tesseract 降级 (最终保障)
```

**决策理由**：离线优先策略保证隐私和数据安全。置信度阈值 0.8 为经验值——低于此值的系统 OCR 结果通常有较多错字，云 OCR 可明显改善。Tesseract 作为最终 fallback 保证无论如何都有结果返回。

---

## 四、多 OCR 并行聚合

### 4.1 并行策略

同一截图的多个 OCR 服务结果之间是互补关系，不是竞争关系。策略：

1. 所有启用的 OCR 服务并行调用（`Promise.allSettled`）
2. 按置信度排序结果，最高置信度的结果作为主结果
3. 各服务识别的文字区域取并集（去重合并）
4. 重叠区域保留高置信度版本

```typescript
interface OCRResultAggregator {
  results: OCRResult[];
  getBestResult(): OCRResult;                       // 置信度最高
  getMergedText(): string;                          // 去重合并
  getResultByService(serviceId: string): OCRResult | null;
  getConflicts(): { region: Rect; texts: string[] }[]; // 冲突区域
}
```

---

## 五、错误处理

| 错误 | 处理 |
|------|------|
| macOS `screencapture` 失败 | 回退到自定义 Canvas 截图窗口 + 引导开启屏幕录制权限 |
| 截图区域 < 50x50px | 前端拦截，提示"选区过小" |
| 截图图片 > 10MB base64 | 自动压缩为 2048px 宽 + JPEG 质量 60% 后重试 |
| 所有 OCR 均失败 | 显示"识别无结果"，保留截图图片供检查 |
| OCR 超时（云 5s / 本地 3s） | 标记该服务超时，切换到下一优先级服务 |

---

## 六、跨平台差异

| 特性 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 截图方式 | `screencapture -i` | Canvas 自定义窗口 | Canvas 自定义窗口 |
| 系统 OCR | Vision Framework | Windows.Media.OCR | Tesseract.js |
| 权限要求 | 屏幕录制 + 辅助功能 | 无需 | 无需 |
| 截图性能 | 系统级 < 100ms | 全屏截取 ≤ 150ms | 全屏截取 ≤ 150ms |

---

## 七、交叉引用

- 开发方案: [05-prd-task-OCR服务插件实现](./05-prd-task-OCR服务插件实现.md)
- 开发方案: [25-prd-task-Rust截图OCR](./25-prd-task-Rust截图OCR.md)
- 开发方案: [17-prd-task-系统OCR](./17-prd-task-系统OCR.md)
- 开发方案: [27-prd-task-百度腾讯OCR](./27-prd-task-百度腾讯OCR.md)
- 开发方案: [28-prd-task-讯飞合合火山OCR](./28-prd-task-讯飞合合火山OCR.md)
- 开发方案: [32-prd-task-OCR服务全景实现](./32-prd-task-OCR服务全景实现.md)
- 开发方案: [39-prd-task-截图选区实现](./39-prd-task-截图选区实现.md)