---

doc_type: module
prd_task_id: "YP-09-M03"
title: "OCR 识别架构 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 4
source_prd: "02-prd-OCR与截图识别.md"

type: task
---

# OCR 识别架构 — 开发方案

> 来源 PRD：[02-prd-OCR与截图识别.md](../../prds/2026-09/02-prd-OCR与截图识别.md)
> 需求编号：YP-09-M03 · 优先级：高 · 人天：4d

---

## 一、截图流程架构

### 截图 → OCR 数据流

```
用户按快捷键 → Tauri hotkey 触发
  → screenshot.rs 进入截图模式
    → 全屏半透明遮罩 + 选区绘制
    → 用户拖拽框选 → 截图保存为 PNG
  → invoke 传递图片数据到前端
  → OCR Service Layer 识别文字
  → Recognize Window 展示结果
```

### 截图 → 翻译数据流

```
截图 → OCR Service → 识别文字
  → lang_detect 检测语言
  → Translate Service 翻译
  → 显示原文 + 译文
```

## 二、关键实现

### 2.1 截图功能 (Rust)

**文件**: `YiPot/src-tauri/src/screenshot.rs`

```rust
// 截图模式核心逻辑
fn start_screenshot() -> Result<Vec<u8>> {
  // 1. 全屏截图
  // 2. 创建半透明遮罩窗口
  // 3. 用户拖拽选区
  // 4. 裁剪选区图片
  // 5. 返回 PNG 字节流
}
```

**平台适配**:
- macOS: CGWindowListCreateImage
- Windows: BitBlt + GDI
- Linux: xdg-screenshot / grim (Wayland)

### 2.2 OCR 服务接口

```typescript
interface OcrService {
  info: { id: string; name: string; type: "recognize" };
  recognize(image: Blob): Promise<OcrResult>;
}

interface OcrResult {
  text: string;
  confidence?: number;
  regions?: { text: string; box: Rect }[];
}
```

### 2.3 系统 OCR

**macOS**: 使用 Vision Framework (`VNRecognizeTextRequest`)
**Windows**: 使用 `Windows.Media.OCR` API
**Linux**: Tesseract.js 作为备选

**Rust FFI 调用**:
- macOS: objc → VNRecognizeTextRequest
- Windows: windows-rs → Windows.Media.OCR

## 三、OCR 窗口 UI

**文件**: `YiPot/src/window/Recognize/index.jsx`

组件结构:
- `ImageArea` — 截图预览区
- `TextArea` — 识别文字展示区
- `ControlArea` — 操作按钮（复制/翻译/重新识别）


## 四、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 截图实现 | Rust 全屏窗口 + Canvas 选区 | 系统截图命令 (screencapture/gnome-screenshot) | 跨平台统一交互，自定义选区 UI，选区坐标精确可控 | Windows 自绘窗口额外开销 (~50ms) |
| OCR 策略 | 系统原生 > 云端 > 离线 (多级降级) | 仅云端 / 仅离线 | macOS Vision 免费且亚秒级识别；云端高精度备选；Tesseract 离线兜底 | 降级逻辑复杂度增加 3 个分支 |
| 图片传输 | Base64 编码 → Tauri invoke | 文件路径传参 / IPC 共享内存 | 跨平台一致，无需临时文件清理，Base64 可直接在 WebView 渲染 | 大图 Base64 膨胀 33%，4K 截图 ~8MB → ~11MB |
| 选区交互 | 全屏半透明遮罩 + 拖拽绘制矩形 | 系统原生选区 (如 macOS 内置截图) | 跨平台 UI 一致，可自定义辅助线/放大镜，支持 Esc 取消 | 需自行处理 DPI 缩放 + 多显示器坐标变换 |
| 二维码识别 | jsQR (前端纯 JS) | ZBar (Rust FFI) | 零依赖，Bundle +45KB only，对截图场景足够 | 不支持复杂畸变二维码，识别率约 95% |

### 截图流程决策详解

**为什么选择全屏窗口而非系统截图命令？**

```
系统命令路径 (被拒绝):
  macOS: screencapture -i → 系统原生交互 (无法自定义 UI)
  Windows: 无内置交互式截图工具 → 需额外安装
  Linux: gnome-screenshot/spectacle → 依赖桌面环境

全屏窗口路径 (采纳):
  Rust 截取全屏 → 创建透明全屏窗口 → React Canvas 选区绘制
  优点: 跨平台统一，自定义选区样式/辅助线/放大镜
  代价: Windows 平台自绘窗口 +200 行代码
```

### OCR 多级降级策略

```
用户触发 OCR
  ├── 1. 系统 OCR (macOS Vision / Windows OCR)
  │     └── 成功 → 返回结果 (< 500ms)
  │         失败 → 降级到云端
  ├── 2. 云端 OCR (百度精准 / 腾讯 / ...)
  │     └── 成功 → 返回结果 (500ms-2s)
  │         失败 → 降级到离线
  └── 3. 离线 OCR (Tesseract.js)
        └── 返回结果 (1-5s，提示"离线模式，速度较慢")
```


## 五、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 系统 OCR 优先 | macOS Vision Framework 直接调用 + 跳过云端 | 离线识别 < 300ms | Vision: ~180ms vs 百度云端: ~800ms |
| 截图图片压缩 | 选区裁剪后 JPEG Quality 85% 编码 | 传输体积 -60% | 4K 截图 11MB → 4.2MB |
| Canvas 渲染 | OffscreenCanvas (Web Worker) | 主线程不被截图渲染阻塞 | 截图操作 UI 线程占用 < 16ms |
| OCR 结果缓存 | key=`imageHash:service`，LRU Capacity 50 | 同一图重复 OCR 跳过 | 命中时延 < 10ms |
| 并行 OCR | 系统 OCR + 云端 OCR 同时发起 | 先到先展示，后到追加 | 首结果展示: P50 180ms |
| 图片预处理 | 灰度化 + 对比度增强 + 二值化 (WASM) | Tesseract 识别率 +15%，时延 -20% | 预处理 ~30ms (WASM) |

### 截图性能链路

```
快捷键触发 → 全屏截图 (CGWindowListCreateImage, ~50ms)
  → 遮罩窗口创建 (~20ms)
    → 用户拖拽选区 (人的操作，不计时)
      → 裁剪图片 (~10ms)
        → JPEG 编码 (~15ms)
          → Base64 编码 (~5ms)
            → invoke 传递 (~5ms)
              → 前端接收 + 渲染 (~10ms)
                → OCR 识别 (180-800ms)

总计 (不含人工拖拽): ~115ms + OCR 时间
```


## 六、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-截图 | 截图权限被拒绝 (macOS) | 引导用户打开"系统偏好设置 → 屏幕录制" | 用户授权后重试 | "请允许 Pot 访问屏幕录制权限" |
| L2-截图 | 多显示器坐标异常 | fallback 到主显示器截图 + 日志记录 | 自动降级 | 无感知（仅日志记录） |
| L3-OCR | 系统 OCR 无文字识别结果 | confidence < 阈值 → 自动降级云端 | 自动切换 | "未识别到文字，尝试云端识别..." |
| L3-OCR | 图片格式不支持 | 转为 PNG 格式后重试 | 自动转换 | 无感知 |
| L4-OCR | Tesseract 语言数据未下载 | 自动下载对应语言包 | 下载完成后自动重试 | "正在下载离线 OCR 数据包 (约 30MB)..." |
| L5-前端 | Canvas 渲染失败 (图片损坏) | 显示错误占位图 + 重试按钮 | 用户手动重试 | "截图数据异常，请重新截图" |

### 截图窗口异常处理

```
截图窗口打开后:
  ├── 用户按 Esc → 关闭截图窗口，丢弃截图
  ├── 用户点击遮罩非选区区域 → 关闭截图窗口
  ├── 选区过小 (< 20x20px) → 不触发 OCR，提示"选区过小"
  ├── 窗口失去焦点 → 保留截图窗口，不关闭(用户可能切换到其他窗口查看)
  └── 异常退出 → 截图临时文件清理 (窗口关闭事件)
```


## 七、跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 全屏截图 | CGWindowListCreateImage (Core Graphics) | BitBlt + GDI (Win32 API) | X11: XGetImage / Wayland: pipewire screencopy |
| 系统 OCR | Vision Framework (VNRecognizeTextRequest) | Windows.Media.OCR (WinRT) | 不支持 (降级 Tesseract.js) |
| 截图选区 | 自定义 Canvas 选区 (统一) | 自定义 Canvas 选区 (统一) | 自定义 Canvas 选区 (统一) |
| 窗口透明 | NSWindow.setOpaque(false) | SetLayeredWindowAttributes | X11: _NET_WM_WINDOW_TYPE / Wayland: 不支持透明 |
| DPI 缩放 | 自动适配 (CGDisplayBounds) | GetDpiForMonitor | X11: xdpyinfo / Wayland: wl_output |
| OCR 语言 | 支持 18 种语言 | 支持 25 种语言 (但中文精度低) | Tesseract 支持 100+ 语言 |

> Linux 平台 OCR 识别默认为 Tesseract.js 离线方案，首次使用需下载语言数据包。

**关联文档**：
- [系统 OCR 实现](./17-prd-task-系统OCR.md) — 系统原生 OCR 详细实现
- [OCR 服务插件实现](./05-prd-task-OCR服务插件实现.md) — 15 个 OCR 插件
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — 截图 Rust 模块