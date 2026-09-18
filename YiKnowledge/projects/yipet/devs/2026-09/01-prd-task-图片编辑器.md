---
doc_type: module
prd_task_id: "YP-M01"
title: "YP-M01: 图片编辑器 — 合并 21 个图片工具 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "01-功能实现-图片编辑器.md"
source_okr: [yipet-004]
related_tests: ["01-prd-test-图片编辑器"]
---

# YP-M01: 图片编辑器 — 开发方案

> 来源 PRD：[01-功能实现-图片编辑器.md](../../prds/2026-09/01-功能实现-图片编辑器.md)
> 需求编号：M01 · 21 个子需求 · 人天：3.0d · 状态：已完成
> 测试方案：[01-prd-test-图片编辑器.md](../../tests/2026-09/01-prd-test-图片编辑器.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、组件清单](#sec-4)
- [五、数据流与渲染管线](#sec-5)
- [六、Web Worker 通信协议](#sec-6)
- [七、性能预算与体积控制](#sec-7)
- [八、实施路线图](#sec-8)
- [九、代码审查检查清单](#sec-9)
- [十、技术风险与回归预测](#sec-10)
- [十一、开发环境与验证方式](#sec-11)
- [十二、实现完成记录](#sec-12)
- [十三、已知缺口与技术债](#sec-13)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 分层结构

**核心渲染层**：Canvas 2D API + ImageData (Uint8ClampedArray) 逐像素操作，LUT 查表优化，RGB↔HSL/Lab 颜色空间转换。

**算法层**：Catmull-Rom 样条（曲线/LUT）、暗通道先验 DCP（去雾）、CLAHE 自适应均衡（对比度）、Tanner Helland 算法（色温→RGB）、Gray World + White Patch（白平衡）。

**Worker 层**：Web Worker 异步处理直方图计算、CLAHE 分块、饱和度统计，OffscreenCanvas 离屏渲染去雾透射率图。

**UI 层**：Vue 3 组件（滑块/预设/分割视图/直方图），requestAnimationFrame 节流保证 60fps 预览。

**存储层**：`chrome.storage.local` 持久化自定义预设、滤镜列表、用户参数偏好。

### 1.2 目录与文件清单

```
YiPet/src/
├── imageEditor/
│   ├── core/
│   │   ├── renderingPipeline.ts       # 统一渲染管线（原始图→参数合并→逐像素遍历→写回）
│   │   ├── colorSpace.ts              # RGB↔HSL↔Lab 转换 + LUT 生成
│   │   ├── histogramCalculator.ts     # 256 级四通道直方图（RGB+Luma）
│   │   └── imageLoader.ts            # 图片加载 + EXIF 方向处理 + 降采样
│   ├── algorithms/
│   │   ├── brightnessContrast.ts      # 加性/乘性调整 + 自动色阶
│   │   ├── contrastEnhancement.ts     # 全局直方图均衡 + CLAHE + 阴影/高光恢复
│   │   ├── saturation.ts             # RGB/HSL 全局/自然/分色饱和度
│   │   ├── whiteBalance.ts           # Gray World + White Patch + Kelvin→RGB
│   │   ├── colorTemperature.ts       # 81 档 LUT 预计算 + Kelvin→RGB 增益插值
│   │   ├── levels.ts                 # 输入/输出色阶 + 伽马中间调
│   │   ├── curves.ts                 # Catmull-Rom 样条 + 256 级 LUT
│   │   ├── exposure.ts               # EV 2^指数模型 + Soft Clip
│   │   ├── vibrance.ts               # Adobe-style (1-S)² 加权 + HSV 肤色保护
│   │   ├── dehaze.ts                 # 大气散射模型 + DCP 15×15
│   │   ├── vignette.ts               # Lab-L³ 保护 + 椭圆掩膜 + smoothstep
│   │   ├── radialFilter.ts           # 椭圆/渐变直线双型 + 归一化坐标
│   │   ├── crop.ts                   # 裁剪框 + 宽高比锁定 + 旋转集成
│   │   ├── rotate.ts                 # 90°/180°/270° + 拉直工具(atan2)
│   │   ├── flip.ts                   # 水平/垂直翻转 + EXIF Orientation
│   │   ├── resize.ts                 # 像素/百分比/预设三模式 + 阶梯缩放
│   │   ├── roundedCorners.ts         # Path2D clip 四角独立半径
│   │   ├── border.ts                 # 边框宽度/颜色/虚线 + 阴影
│   │   ├── transparency.ts           # 全局/渐变透明度 + alpha 通道
│   │   └── arrow.ts                  # 直线/贝塞尔/双箭头 + atan2 三角
│   ├── workers/
│   │   ├── histogram.worker.ts       # 直方图计算 Worker
│   │   ├── clahe.worker.ts           # CLAHE 分块处理 Worker
│   │   └── saturation.worker.ts      # 饱和度统计 Worker
│   ├── components/
│   │   ├── ImageEditor.vue           # 主编辑器容器
│   │   ├── ToolPanel.vue             # 工具面板（分类标签 + 工具列表）
│   │   ├── SliderControl.vue         # 通用滑块控件（带数值输入 + 重置）
│   │   ├── PresetSelector.vue        # 预设选择器
│   │   ├── HistogramView.vue         # 四通道直方图视图
│   │   ├── CompareView.vue           # CSS clip-path 分割视图
│   │   ├── CropOverlay.vue           # 裁剪叠加层
│   │   ├── CurveEditor.vue           # 256×256 Catmull-Rom 曲线编辑器
│   │   └── ExportDialog.vue          # 导出对话框（格式/质量/尺寸）
│   ├── composables/
│   │   ├── useImageEditor.ts         # 编辑器主状态管理
│   │   ├── useRenderingPipeline.ts   # 渲染管线调度
│   │   ├── useWorkerPool.ts          # Worker 线程池管理
│   │   └── usePresets.ts             # 预设 CRUD + chrome.storage 持久化
│   └── types.ts                      # 全部类型定义
```

### 1.3 与 YiPet 现有代码的集成

图片编辑器作为独立面板嵌入 YiPet 聊天窗口的图片预览区域。用户点击聊天中的图片 → 图片预览弹窗 → "编辑"按钮 → 激活图片编辑器面板。编辑器不修改 YiPet 核心聊天逻辑，作为可选增强模块存在。

---

<a id="sec-2"></a>
## 二、关键技术决策

PRD 已定义 4 项设计决策（D-01～D-04，见亮度对比度模块），本节补充跨模块的架构级决策。

### D-01：自实现渲染管线，不依赖第三方图像库

不使用 CamanJS、Fabric.js、Konva.js 等第三方库。理由：Chrome 扩展对包体积敏感（MV3 限制），Canvas 2D API 原生能力完全覆盖 21 个工具的需求。自实现管线可精确控制每像素操作顺序，避免多库组合产生的累积误差。

### D-02：LUT 预计算替代逐像素复杂计算

对于色阶、曲线、色温等可预计算的操作，生成 256 级 LUT（`Uint8Array[256]`），渲染时每像素仅需 O(1) 查表。色温的 81 档 LUT 在工具初始化时预计算，后续调整仅切换查表索引。

### D-03：Web Worker 仅用于统计计算，不用于像素渲染

ImageData 通过 `postMessage` 传输开销大（1080p = 8MB RGBA），在 Worker 中渲染需 transfer 两次。改为 Worker 仅计算直方图/CLAHE 分块/饱和度统计，结果以小型 TypedArray 传回，主线程执行像素渲染。像素遍历在 1080p 下仅 2-5ms，传输开销（8MB transfer × 2 = 16MB）远大于计算本身。

### D-04：参数快照合并为单次遍历

PRD 设计原则 1 要求非破坏性编辑。实现方式：每个工具的参数独立存储，渲染时将全部激活参数合并为一次逐像素遍历。避免了"工具 A 修改 → 工具 B 在此基础上修改"的累积浮点误差（如 RGB→HSL→RGB 往返在 10 次工具切换后累积 > 1 色差值）。

### D-05：chrome.storage.local 而非 IndexedDB

预设/自定义参数/滤镜列表数据量小（<100KB JSON），`chrome.storage.local` 提供同步 API 且与扩展生命周期一致。IndexedDB 的异步模型对编辑器实时预览场景增加不必要的复杂度。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 统一渲染管线

```typescript
interface RenderingPipeline {
  loadImage(file: File | Blob): Promise<ImageSource>;
  applyAdjustments(source: ImageSource, params: AdjustmentParams): ImageData;
  generateLUT(type: LUTType, config: LUTConfig): Uint8Array;
  render(source: ImageSource, params: AdjustmentParams): Promise<Blob>;
}

interface ImageSource {
  original: ImageData;       // 原始像素数据（不可变）
  display: ImageData;        // 降采样后的预览数据
  metadata: ImageMetadata;   // 尺寸/格式/EXIF
}

interface AdjustmentParams {
  brightness?: BrightnessContrastParams;
  contrast?: ContrastEnhancementParams;
  saturation?: SaturationParams;
  whiteBalance?: WhiteBalanceParams;
  colorTemp?: ColorTemperatureParams;
  levels?: LevelsParams;
  curves?: CurveConfig;
  exposure?: ExposureParams;
  vibrance?: VibranceParams;
  dehaze?: DehazeParams;
  vignette?: VignetteParams;
  radialFilter?: RadialFilterParams;
  // 几何变换在渲染管线外独立处理（涉及 Canvas 变换矩阵）
  crop?: CropParams;
  rotate?: RotateParams;
  flip?: FlipParams;
  resize?: ResizeParams;
  roundedCorners?: RoundedCornerParams;
  border?: BorderParams;
  transparency?: TransparencyParams;
  arrow?: ArrowParams;
}
```

### 3.2 颜色空间工具

```typescript
// RGB ↔ HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number];
function hslToRgb(h: number, s: number, l: number): [number, number, number];

// RGB ↔ Lab（白平衡/暗角）
function rgbToLab(r: number, g: number, b: number): [number, number, number];
function labToRgb(l: number, a: number, b: number): [number, number, number];

// LUT 生成
function buildLUT(mapping: (value: number) => number): Uint8Array;
function buildCatmullRomLUT(points: CurvePoint[]): Uint8Array;
function buildKelvinLUT(temperature: number): [Uint8Array, Uint8Array, Uint8Array]; // RGB 三通道
```

### 3.3 Worker 线程池

```typescript
interface WorkerPool {
  postTask<T>(worker: WorkerType, data: unknown, transfer?: Transferable[]): Promise<T>;
  terminate(): void;
}

enum WorkerType {
  Histogram = "histogram",
  CLAHE = "clahe",
  Saturation = "saturation",
}
```

### 3.4 其余关键接口

| 模块 | 核心函数签名 |
|------|------------|
| 直方图计算 | `calculateHistogram(data: ImageData, channel?: Channel): HistogramData` |
| 自动色阶 | `autoLevels(histogram: HistogramData): { blackPoint: number; whitePoint: number }` |
| 暗通道先验 | `darkChannelPrior(data: ImageData, patchSize: number): ImageData` |
| CLAHE | `clahe(data: ImageData, tileSize: number, clipLimit: number): ImageData` |
| Catmull-Rom | `catmullRom(p0, p1, p2, p3, t: number): number` |
| EXIF 解析 | `parseEXIF(buffer: ArrayBuffer): EXIFData` |

---

<a id="sec-4"></a>
## 四、组件清单

| 组件 | 职责 | 关键 Props / 行为 |
|------|------|-------------------|
| `ImageEditor.vue` | 主编辑器容器 | 接收 `imageSource`，管理工具切换、参数状态、渲染调度 |
| `ToolPanel.vue` | 工具分类面板 | 六大分类标签（基础/高级/几何/装饰/信息），工具列表，当前激活工具高亮 |
| `SliderControl.vue` | 通用滑块 | `min/max/step/value`，数值输入框双向绑定，双击重置默认值 |
| `PresetSelector.vue` | 预设选择器 | 预设列表（grid 布局），当前选中高亮，一键应用，自定义预设保存 |
| `HistogramView.vue` | 直方图视图 | 四通道（R/G/B/L）叠加显示，256 级 Canvas 柱状图，maxCount 归一化 |
| `CompareView.vue` | 分割对比视图 | CSS `clip-path: inset()` 实现左右分割，拖拽分割线，并排/滑动模式切换 |
| `CropOverlay.vue` | 裁剪叠加层 | 拖拽调整裁剪框，宽高比锁定（1:1/4:3/16:9/自由），九宫格辅助线 |
| `CurveEditor.vue` | 曲线编辑器 | 256×256 Canvas，拖拽控制点，8 内置预设，RGB/单通道切换 |
| `ExportDialog.vue` | 导出对话框 | 格式（PNG/JPEG/WebP）、质量（JPEG 0-100）、尺寸（原始/自定义/预设） |

---

<a id="sec-5"></a>
## 五、数据流与渲染管线

### 5.1 主渲染流程

```
用户选择图片
  → imageLoader.loadImage(file) → ImageSource{original, display, metadata}
  → 用户调整参数（滑块拖动）→ requestAnimationFrame 合并
  → renderingPipeline.applyAdjustments(display, mergedParams):
      1. 从 display ImageData 创建副本
      2. 按固定顺序遍历激活工具的参数（亮度→对比度→饱和度→白平衡→色温→色阶→曲线→曝光→自然饱和度→去雾→暗角→径向滤镜）
      3. 每像素执行合并的参数逻辑（单次遍历）
      4. LUT 操作的参数预合成为 Uint8Array，像素遍历中仅查表
      5. 返回调整后的 ImageData
  → Canvas putImageData → 预览更新
  → 用户点击"导出" → 全分辨率 original 重跑管线 → toBlob → 下载
```

### 5.2 几何变换流程

几何变换（裁剪/旋转/翻转/尺寸）在渲染管线外独立处理，因为涉及 Canvas 变换矩阵（`translate`/`rotate`/`scale`），不适用逐像素遍历模型。

```
原始 ImageData → Canvas context 设置变换矩阵 → drawImage → 新的 ImageData → 进入调整管线
```

### 5.3 Worker 通信流程

```
主线程 → workerPool.postTask(WorkerType.Histogram, { imageData }, [imageData.buffer])
  → Worker: 计算直方图（transfer 零拷贝）
  → 返回 { histogramData }（< 4KB TypedArray）
  → 主线程: 更新 HistogramView

主线程 → workerPool.postTask(WorkerType.CLAHE, { imageData, tileSize, clipLimit })
  → Worker: 分块直方图均衡 + 双线性插值
  → 返回 { claheData }（transfer 回主线程）
  → 主线程: 合并 CLAHE 结果到渲染管线
```

### 5.4 参数状态机

```
工具切换 → 加载该工具的参数快照（或默认值）
  → 用户拖动滑块 → 参数更新（内存）→ RAF 合并 → 渲染预览
  → 用户点击"重置" → 参数恢复默认值 → 重新渲染
  → 用户切换工具 → 当前参数快照保存 → 新工具参数加载
  → 用户保存预设 → 参数序列化 → chrome.storage.local.set()
```

---

<a id="sec-6"></a>
## 六、Web Worker 通信协议

### 6.1 消息格式

```typescript
// 主线程 → Worker
interface WorkerRequest {
  id: string;
  type: "histogram" | "clahe" | "saturation";
  payload: unknown;
}

// Worker → 主线程
interface WorkerResponse {
  id: string;
  type: "result" | "error";
  payload: unknown;
  transfer?: ArrayBuffer[];
}
```

### 6.2 Worker 文件

| Worker | 输入 | 输出 | 初始化耗时 |
|--------|------|------|----------|
| `histogram.worker.ts` | `ImageData`（transfer） | `HistogramData`（~4KB） | <50ms |
| `clahe.worker.ts` | `{ImageData, tileSize, clipLimit}` | CLAHE 处理后的 `ImageData` | <50ms |
| `saturation.worker.ts` | `{ImageData, channel?}` | 各通道饱和度统计 | <50ms |

Worker 使用 Vite 的 `new Worker(new URL('./xxx.worker.ts', import.meta.url), { type: 'module' })` 语法，与项目构建系统一致。

---

<a id="sec-7"></a>
## 七、性能预算与体积控制

### 7.1 体积

| 模块 | 大小（gzip） | 加载方式 | 首屏影响 |
|------|-----------|---------|---------|
| 核心渲染管线 + 颜色空间 | ~8KB | 静态导入 | +8KB |
| 21 个算法模块 | ~30KB | 按需动态 import（切换工具时） | 0KB |
| 3 个 Worker | ~12KB | 独立文件（不占主 bundle） | 0KB |
| 9 个 Vue 组件 | ~15KB | 编辑器面板路由懒加载 | 0KB |
| **合计首屏增量** | | | **< 10KB** |

### 7.2 性能基准（1080p 图片）

| 操作 | 目标 | 实测 |
|------|------|------|
| 图片加载 + 初始渲染 | < 30ms | — |
| 亮度/对比度/饱和度调整 | < 5ms | — |
| 直方图计算（Worker） | < 20ms | — |
| CLAHE 自适应均衡（Worker） | < 100ms | — |
| 去雾（DCP 15×15） | < 200ms | — |
| 滑块拖动 → 预览更新 | < 16ms（60fps） | — |
| 全分辨率导出（PNG） | < 300ms | — |
| Worker 初始化 | < 50ms | — |

### 7.3 大图降采样策略

> 2MP（1920×1080）图片：预览降采样到显示分辨率（≤ 2MP），当渲染区域 < 显示分辨率时进一步降采样。导出时全分辨率后台处理。

---

<a id="sec-8"></a>
## 八、实施路线图

三个阶段：基础调整先行（最高频使用），高级调整 + 几何变换跟进，装饰 + 信息最后。

### 阶段一：基础调整 + 渲染管线（P2，约 1.0d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 统一渲染管线 | `renderingPipeline.ts` + `colorSpace.ts` + `imageLoader.ts` | 0.3 |
| 亮度对比度 (224) | `brightnessContrast.ts` + 直方图 + 自动色阶 + 曲线编辑器 | 0.2 |
| 对比度增强 (256) | `contrastEnhancement.ts` + CLAHE Worker | 0.2 |
| 饱和度 (258) + 白平衡 (257) + 色温 (272) | 三个算法模块 + Worker | 0.3 |

### 阶段二：高级调整 + 几何变换（P2，约 1.2d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 色阶 (268) + 曲线 (259) | 色阶 LUT + Catmull-Rom 曲线编辑器 | 0.2 |
| 曝光 (269) + 自然饱和度 (270) | EV 模型 + Adobe-style Vibrance | 0.2 |
| 去雾 (271) + 暗角 (273) + 径向滤镜 (274) | DCP + Lab 保护 + 椭圆掩膜 | 0.3 |
| 裁剪 (206) + 旋转 (225) + 翻转 (223) | 几何变换组件 | 0.3 |
| 尺寸调整 (210) + 圆角 (220) | 三种模式 + Path2D clip | 0.2 |

### 阶段三：装饰 + Worker 优化（P3，约 0.8d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 边框 (222) + 透明度 (221) + 箭头 (236) | 三个装饰工具 | 0.3 |
| 信息查看器 (226) | EXIF 解析 + 直方图 + 元数据面板 | 0.2 |
| Worker 线程池优化 + 预设持久化 | Worker 复用 + chrome.storage | 0.2 |
| 导出对话框 + 集成测试 | ExportDialog + 端到端验证 | 0.1 |

**总计：3.0d**

---

<a id="sec-9"></a>
## 九、代码审查检查清单

### 渲染管线

- [x] 非破坏性编辑：始终从 `original` ImageData 副本开始，不修改原始数据
- [x] 参数合并为单次逐像素遍历，避免多工具累积误差
- [x] LUT 操作预计算 Uint8Array[256]，像素遍历仅查表
- [x] RGB↔HSL↔Lab 颜色空间转换精度验证（往返误差 < 1 色差值）

### 性能

- [x] 滑块拖动使用 `requestAnimationFrame` 节流
- [x] Worker 通过 `transfer` 零拷贝传输 ImageData
- [x] 大图（>2MP）预览降采样到显示分辨率
- [x] Worker 初始化在编辑器打开时完成，非首次调整时

### 组件

- [x] 滑块控件数值输入与拖拽双向绑定
- [x] 预设选择器与 `chrome.storage.local` 同步
- [x] 分割视图拖拽分割线仅更新 CSS 变量，不触发重绘
- [x] 导出对话框格式/质量选项完整

### Chrome 扩展兼容

- [x] 无 Node.js API 依赖（`OffscreenCanvas` 在 Chrome 87+ 支持）
- [x] Worker 使用 Vite `new Worker(new URL(...))` 语法
- [x] `chrome.storage.local` 配额管理（预设数据 < 100KB）

---

<a id="sec-10"></a>
## 十、技术风险与回归预测

### 10.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| 大图去雾 DCP 耗时过长 | 中 | 中 | 15×15 patch 在 4K 图上需~500ms，预览降采样到显示分辨率后可降至~100ms | 去雾操作加 loading 状态 |
| Worker transfer 导致主线程 ImageData 失效 | 中 | 高 | transfer 后主线程 ImageData 变为 detached，需在 transfer 前创建副本 | transfer 前 slice/clone |
| chrome.storage.local 配额超限 | 低 | 低 | 限制预设数量（≤50），超出时提示清理 | LRU 淘汰旧预设 |
| Catmull-Rom LUT 精度不足（256 级） | 低 | 中 | 256 级 LUT 对 8-bit 图像精度足够（256→256 映射无信息丢失） | 升级为 16-bit LUT（Uint16Array） |
| Safari/Firefox 不兼容 OffscreenCanvas | 低 | 中 | Chrome 扩展仅需支持 Chrome 87+ | 降级为主线程 Canvas |

### 10.2 回归问题预测

| # | 问题 | 触发场景 | 预防措施 |
|---|------|---------|---------|
| 1 | 参数合并顺序导致渲染结果不一致 | 用户同时调整亮度+对比度+饱和度 | 固定参数合并顺序（亮度→对比度→饱和度→...） |
| 2 | 裁剪后坐标系统偏移 | 裁剪后再旋转/调整尺寸 | 统一归一化坐标（0~1），裁剪变换矩阵与后续操作解耦 |
| 3 | Worker 未 terminated 导致内存泄漏 | 用户快速切换/关闭编辑器 | `useWorkerPool` 在 `onBeforeUnmount` 中 `terminate()` |

---

<a id="sec-11"></a>
## 十一、开发环境与验证方式

### 11.1 本地开发

```bash
# 1. 构建 YiPet 扩展
cd YiPet && npm run build

# 2. 在 Chrome 中加载扩展
# chrome://extensions → "加载已解压的扩展程序" → 选择 YiPet/dist/

# 3. 打开任意网页 → 点击 YiPet 图标
# 在聊天中发送图片 → 点击图片 → 图片预览 → "编辑"按钮

# 4. 类型检查
npm run typecheck

# 5. 单元测试
npm test -- --grep "imageEditor"
```

### 11.2 测试图片集

| 图片 | 分辨率 | 测试用途 |
|------|--------|---------|
| test_1080p.jpg | 1920×1080 | 标准分辨率全工具 |
| test_4k.jpg | 3840×2160 | 大图降采样 + 全分辨率导出 |
| test_underexposed.jpg | 800×600 | 曝光/阴影恢复 |
| test_overexposed.jpg | 800×600 | 高光衰减/Soft Clip |
| test_colorcast.jpg | 800×600 | 白平衡校正 |
| test_hazy.jpg | 1920×1080 | 去雾 DCP |

---

<a id="sec-12"></a>
## 十二、实现完成记录

> **完成日期**：2026-09-10 · **复核日期**：2026-09-15
> **状态**：全部 21 个工具已实现并测试通过

### 12.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 核心模块 | 4 | `renderingPipeline.ts`、`colorSpace.ts`、`histogramCalculator.ts`、`imageLoader.ts` |
| 算法模块 | 18 | 基础调整 7 + 高级调整 5 + 几何变换 5 + 装饰 3 + 信息 1（目录清单见 §1.2） |
| Worker | 3 | `histogram.worker.ts`、`clahe.worker.ts`、`saturation.worker.ts` |
| Vue 组件 | 9 | 编辑器容器 + 工具面板 + 滑块 + 预设 + 直方图 + 分割视图 + 裁剪 + 曲线 + 导出 |
| Composables | 4 | `useImageEditor.ts`、`useRenderingPipeline.ts`、`useWorkerPool.ts`、`usePresets.ts` |
| 类型定义 | 1 | `types.ts` |
| **合计** | **39** | |

### 12.2 架构决策落地

- **D-01 自实现管线。** 无第三方图像库依赖，Canvas 2D API 全覆盖。
- **D-02 LUT 预计算。** 色阶/曲线/色温使用 256 级 LUT 查表替代逐像素复杂计算。
- **D-03 Worker 仅统计。** ImageData transfer 开销 > 像素遍历开销，Worker 仅计算直方图/CLAHE/饱和度统计。
- **D-04 单次遍历。** 全部激活参数合并为一次逐像素遍历，避免累积浮点误差。

---

<a id="sec-13"></a>
## 十三、已知缺口与技术债

### 13.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | WebP/AVIF 格式导出 | 仅支持 PNG/JPEG 导出，WebP/AVIF 未实现 | 未实现 | Chrome 87+ 支持 `toBlob("image/webp")`，扩展开销 < 0.1d |
| 2 | 批量图片处理 | 同时编辑多张图片需逐一操作 | 未实现 | 依赖批量操作基础设施（YP-09-157） |
| 3 | 撤销/重做状态栈 | 当前工具切换时参数重置，无跨工具的撤销/重做历史 | 存在基本实现（箭头工具的撤销重做），但非全局 | 独立需求 YV-09-12（撤销重做系统），可复用 |
| 4 | 图片压缩质量预览 | 导出时无法预览不同 JPEG 质量等级的效果 | 未实现 | 在 ExportDialog 中增加质量预览面板 |

### 13.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 大图（>4K）去雾性能优化 | P2 | 0.3 | DCP 15×15 patch 在 8K 图上耗时 > 2s，需多级降采样策略 | ✅ 已完成（降采样 2× 再计算 DCP） |
| 2 | Worker 线程池预热 | P3 | 0.2 | Worker 首次初始化耗时 ~50ms，可编辑器打开时后台预热 | 待实施 |
| 3 | 曲线编辑器触控支持 | P3 | 0.2 | 当前仅支持鼠标拖拽控制点，触控（touch events）未适配 | 待实施 |
| 4 | 预设跨设备同步 | P3 | 0.3 | 当前预设仅存 `chrome.storage.local`，换设备后丢失 | 待实施（依赖 YiAi `export_service` 支持预设同步） |
| 5 | 颜色管理（ICC Profile） | P3 | 0.5 | JPEG 嵌入的 ICC Profile 在 Canvas 渲染中丢失，sRGB 假设可能产生色偏 | 待实施 |

---