---
doc_type: module
prd_task_id: "YP-M03"
title: "YP-M03: 图片批量处理工具 — 13 合 1 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.6
source_prd: "03-功能实现-图片批量处理工具.md"
source_okr: [yipet-004]
related_tests: ["03-prd-test-图片批量处理工具"]
---

# YP-M03: 图片批量处理工具 — 开发方案

> 来源 PRD：[03-功能实现-图片批量处理工具.md](../../prds/2026-09/03-功能实现-图片批量处理工具.md)
> 需求编号：M03 · 13 个批量工具 · 人天：2.6d · 状态：已完成
> 测试方案：[03-prd-test-图片批量处理工具.md](../../tests/2026-09/03-prd-test-图片批量处理工具.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、组件清单](#sec-4)
- [五、实施路线图](#sec-5)
- [六、代码审查检查清单](#sec-6)
- [七、技术风险](#sec-7)
- [八、实现完成记录](#sec-8)
- [九、已知缺口与技术债](#sec-9)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 批量处理分类

13 个工具按处理类型分为四层：

| 层 | 工具 | 核心能力 | 并行策略 |
|----|------|---------|---------|
| 转换层 | 格式转换/压缩优化/压缩预测/压缩对比/PDF转换 | Canvas toBlob + 格式参数 | Worker 池并行 |
| 变换层 | 批量缩放/批量裁剪/批量旋转 | Canvas transform + 参数批量 | 主线程串行（共享 Canvas） |
| 叠加层 | 水印（文字/图片/平铺/对角线） | Canvas drawImage + Path2D | 主线程串行 |
| 组织层 | 批量重命名/高级重命名/ZIP打包 | 字符串模板 + JSZip | 主线程 |

### 1.2 文件清单

```
YiPet/src/imageEditor/
├── batch/
│   ├── formatConverter.ts        # 6 格式转换（PNG/JPEG/WebP/AVIF/BMP/TIFF）
│   ├── compressionOptimizer.ts   # 4 格式压缩 + Worker 池 + EXIF 处理
│   ├── compressionPredictor.ts   # 压缩大小预测（质量 vs 大小 曲线）
│   ├── compressionComparator.ts  # 3×3 并排对比 + 格式推荐 + 差异高亮
│   ├── batchRename.ts            # 前缀/日期/编号/后缀 + EXIF 三级 fallback
│   ├── batchRenameAdvanced.ts    # 正则替换/大小写/查找替换/元数据变量
│   ├── pdfConverter.ts           # 图片→PDF + A4/Letter/自定义 + jsPDF
│   ├── watermark.ts              # 文字/图片水印 + 平铺/单个/对角线 + 九宫格
│   ├── batchResize.ts            # 按比例/像素/百分比/预设批量缩放
│   ├── batchCrop.ts              # 统一裁剪区域批量应用
│   ├── batchRotate.ts            # 批量 90°/180°/270°/自定义角度
│   └── zipPacker.ts              # JSZip 打包下载 + 进度回调
├── workers/
│   └── compression.worker.ts     # 压缩 Worker（4 格式并行压缩）
├── components/
│   ├── BatchPanel.vue            # 批量处理面板（文件列表 + 操作选择 + 进度）
│   ├── FormatComparisonGrid.vue  # 3×3 对比网格组件
│   ├── CompressionPreview.vue    # 压缩预览（大小/质量曲线图）
│   ├── RenameRuleEditor.vue      # 重命名规则编辑器（变量插入/预览）
│   ├── WatermarkConfig.vue       # 水印配置（文字/图片/位置/透明度）
│   └── ProgressBar.vue           # 批量进度条（当前/总数/失败/速度）
├── composables/
│   ├── useBatchProcessor.ts      # 批量处理队列（并发控制/重试/取消）
│   ├── useFileList.ts            # 文件列表管理（添加/删除/排序/预览）
│   └── useCompressionEstimate.ts # 压缩预估（采样压缩 + 外推）
```

### 1.3 批量处理管道

```
用户添加文件 → useFileList（验证/排序/预览）
  → 选择操作 + 参数配置
  → useBatchProcessor.enqueue(files, operation, params)
  → 按并行策略分发：
      转换层 → Worker 池（navigator.hardwareConcurrency 个 Worker）
      变换层/叠加层 → 主线程串行（共享 Canvas 上下文复用）
  → 每文件完成回调 → ProgressBar 更新
  → 全部完成 → ZIP 打包（可选）→ 下载
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：Worker 池仅用于格式转换和压缩

格式转换（PNG→WebP）和压缩不需要 Canvas 上下文，纯 `ImageData → toBlob` 可在 Worker 中通过 `OffscreenCanvas` 完成。变换和叠加需要共享 Canvas 上下文，在 Worker 中复制的开销（transfer ImageData 8MB/张）超过串行处理时间。Worker 池大小 = `navigator.hardwareConcurrency - 1`（保留 1 核给 UI）。

### D-02：压缩预测 — 采样压缩 + 线性外推

全分辨率压缩预览（1080p × 质量 1-100 全扫描）耗时过长。改为采样策略：对 3 个质量点（30/60/90）各压缩 1 次，绘制质量-大小曲线，其余质量点通过 Catmull-Rom 插值估计。全分辨率压缩误差 < 5%。

### D-03：重命名 — EXIF 三级 fallback

文件日期优先从 EXIF `DateTimeOriginal` 提取（最准确），无 EXIF 时降级到 `File.lastModified`（文件系统时间），再降级到 `Date.now()`（当前时间）。确保批量重命名后的文件名时间戳始终有值。

### D-04：批量处理队列 — 并发控制 + 部分失败不中断

`useBatchProcessor` 维护并发上限（Worker 池大小），队列中等待的项在 Worker 空闲时出队。单个文件失败不中断队列，继续处理剩余文件，完成后汇总失败列表。支持用户取消（`AbortController`），已完成文件保留。

### D-05：PDF 转换 — jsPDF + 每图一页

不使用服务端 PDF 渲染（Chrome 扩展无服务端）。jsPDF 的 `addImage` 将每张图片作为独立页面，支持 A4/Letter/自定义尺寸。图片自动缩放适配页面宽度，保持宽高比。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 批量处理队列

```typescript
interface BatchProcessorOptions {
  concurrency: number;           // Worker 池大小，默认 navigator.hardwareConcurrency - 1
  retryFailed: boolean;          // 失败项是否重试
  maxRetries: number;            // 最大重试次数，默认 1
  signal?: AbortSignal;          // 取消信号
}

interface BatchTask<T> {
  id: string;
  file: File;
  operation: BatchOperation;
  params: Record<string, unknown>;
  onProgress?: (percent: number) => void;
  execute: () => Promise<T>;
}

interface BatchResult<T> {
  completed: Array<{ task: BatchTask<T>; result: T }>;
  failed: Array<{ task: BatchTask<T>; error: Error }>;
  cancelled: boolean;
  duration: number;              // ms
}

function useBatchProcessor<T>(options: BatchProcessorOptions): {
  enqueue: (tasks: BatchTask<T>[]) => void;
  start: () => Promise<BatchResult<T>>;
  cancel: () => void;
  progress: Ref<{ completed: number; total: number; failed: number }>;
  isRunning: Ref<boolean>;
};
```

### 3.2 格式转换

```typescript
type ImageFormat = "png" | "jpeg" | "webp" | "avif" | "bmp" | "tiff";

interface FormatConversionOptions {
  targetFormat: ImageFormat;
  quality?: number;              // JPEG/WebP/AVIF: 0-100
  preserveExif?: boolean;
  background?: string;           // PNG→JPEG 透明填充色
}

interface CompressionOptions extends FormatConversionOptions {
  maxSizeKB?: number;            // 目标大小上限
  stripMetadata?: boolean;       // 移除 EXIF/XMP/ICC
  progressive?: boolean;         // JPEG progressive encoding
}

// Worker 通信
// → { type: "compress", imageData: ImageData, options: CompressionOptions }
// ← { type: "result", blob: Blob, originalSize: number, compressedSize: number }
```

### 3.3 批量重命名

```typescript
interface RenameRule {
  type: "prefix" | "suffix" | "numbering" | "date" | "findReplace" | "regex" | "case";
  value: string;                 // 前缀文本/后缀文本/编号格式("001")/日期格式("YYYY-MM-DD")
  position?: "before" | "after";
  findPattern?: string;          // 查找/正则模式
  replaceWith?: string;
}

interface RenamePreview {
  original: string;
  renamed: string;
  conflict: boolean;             // 与其他文件名冲突
}

function generateRename(file: File, rules: RenameRule[], index: number): RenamePreview;
```

### 3.4 水印

```typescript
interface WatermarkConfig {
  type: "text" | "image";
  content: string | ImageData;   // 文字内容 或 图片 ImageData
  position: "center" | "tile" | "diagonal" | GridPosition;
  opacity: number;               // 0-1
  rotation?: number;             // 角度（对角线水印）
  font?: { family: string; size: number; color: string };
  margin?: number;               // 距边缘距离（px）
}

type GridPosition = "topLeft" | "topCenter" | "topRight" | "midLeft" | "center" | "midRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
```

### 3.5 PDF 转换

```typescript
interface PDFOptions {
  pageSize: "a4" | "letter" | [number, number];  // 预设 或 [width(mm), height(mm)]
  orientation: "portrait" | "landscape";
  margin: number;                // mm
  imageFit: "contain" | "cover" | "fill";
  quality: number;               // 0-1，图片在 PDF 中的压缩质量
}

async function imagesToPdf(images: ImageData[], options: PDFOptions): Promise<Blob>;
```

---

<a id="sec-4"></a>
## 四、组件清单

| 组件 | 职责 | 关键行为 |
|------|------|---------|
| `BatchPanel.vue` | 批量处理主面板 | 拖拽/选择添加文件、缩略图列表、文件排序/删除、操作选择器、一键执行 |
| `FormatComparisonGrid.vue` | 3×3 格式对比 | 原图 + 3 格式 × 3 质量档 = 9 格网格，hover 高亮，点击选择最优 |
| `CompressionPreview.vue` | 压缩预览 | 质量-大小曲线图（Canvas 折线图），3 个采样点 + 插值曲线，预估大小标注 |
| `RenameRuleEditor.vue` | 重命名规则编辑 | 变量按钮（{date}/{num}/{ext}/{orig}）、实时预览列表、冲突高亮 |
| `WatermarkConfig.vue` | 水印配置 | 文字/图片 Tab、九宫格位置选择器、透明度/旋转滑块、平铺密度 |
| `ProgressBar.vue` | 批量进度条 | 百分比 + 当前/总数计数 + 失败计数 + 处理速度（items/s）、取消按钮 |

---

<a id="sec-5"></a>
## 五、实施路线图

### 阶段一：核心转换（P2，约 0.9d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 格式转换工厂（6 格式 + 批量 + ZIP） | `formatConverter.ts` + `zipPacker.ts` | 0.2 |
| 图片压缩与优化（4 格式 + Worker 池 + EXIF） | `compressionOptimizer.ts` + `compression.worker.ts` | 0.3 |
| 压缩预测 + 质量对比 | `compressionPredictor.ts` + `compressionComparator.ts` | 0.2 |
| 批量处理队列 + 文件列表 | `useBatchProcessor.ts` + `useFileList.ts` | 0.2 |

### 阶段二：变换与叠加（P2，约 0.9d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 批量缩放 + 批量裁剪 + 批量旋转 | `batchResize.ts` + `batchCrop.ts` + `batchRotate.ts` | 0.3 |
| 水印（文字/图片/平铺/对角线/九宫格） | `watermark.ts` | 0.2 |
| PDF 转换（jsPDF + 页面设置） | `pdfConverter.ts` | 0.2 |
| 前端组件（BatchPanel/ProgressBar） | 2 个 Vue 组件 | 0.2 |

### 阶段三：组织与预览（P2，约 0.8d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 批量重命名 + 高级重命名 | `batchRename.ts` + `batchRenameAdvanced.ts` | 0.2 |
| 压缩预览曲线 + 格式对比网格 | `CompressionPreview.vue` + `FormatComparisonGrid.vue` | 0.2 |
| 重命名规则编辑器 + 水印配置面板 | `RenameRuleEditor.vue` + `WatermarkConfig.vue` | 0.2 |
| 集成测试 + 端到端验证 | 批量处理完整流程验证 | 0.2 |

**总计：2.6d**

---

<a id="sec-6"></a>
## 六、代码审查检查清单

### 批量队列

- [ ] 并发数 = `navigator.hardwareConcurrency - 1`（最小 1）
- [ ] 单个文件失败不中断队列，完成后汇总
- [ ] AbortSignal 取消后已完成文件保留
- [ ] 重试次数 ≤ `maxRetries`

### 格式转换

- [ ] 6 格式（PNG/JPEG/WebP/AVIF/BMP/TIFF）全部支持
- [ ] PNG→JPEG 透明背景填充为白色
- [ ] EXIF 保留模式：JPEG→JPEG preserve EXIF
- [ ] Worker transfer ImageData 零拷贝

### 水印

- [ ] 文字水印字体加载完成后再绘制（document.fonts.ready）
- [ ] 图片水印保持长宽比（contain 模式）
- [ ] 平铺模式间距均匀，无边缘截断
- [ ] 对角线水印角度 30°-45° 可调

### 重命名

- [ ] EXIF DateTimeOriginal → File.lastModified → Date.now() 三级 fallback
- [ ] 冲突检测（重名文件自动追加 `_1` 后缀）
- [ ] 预览列表实时更新（规则变更立即刷新）

### PDF

- [ ] A4/Letter/自定义页面尺寸
- [ ] 图片自适应缩放（contain 模式保持比例）
- [ ] 多页 PDF（每图一页）

---

<a id="sec-7"></a>
## 七、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| Worker 池耗尽导致 UI 卡顿 | 中 | 中 | 保留 1 核给 UI 线程 | 降级为主线程串行 |
| AVIF 编码耗时过长 | 高 | 中 | AVIF 编码在 Worker 中执行，单张超时 30s | 超时后跳过该文件并汇总失败 |
| jsPDF 大图 PDF 内存溢出 | 中 | 高 | 图片在加入 PDF 前降采样到页面分辨率（A4 300dpi ≈ 2480×3508px） | 降采样到 150dpi |
| 批量重命名后文件关联丢失 | 低 | 中 | 重命名前保存原始文件名映射 | 提供撤销功能（映射表保留 5 分钟） |

---

<a id="sec-8"></a>
## 八、实现完成记录

> **完成日期**：2026-09-10 · **复核日期**：2026-09-15
> **状态**：全部 13 个工具已实现并测试通过

### 8.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 批量处理模块 | 12 | 转换/压缩/预测/对比/重命名×2/PDF/水印/缩放/裁剪/旋转/ZIP |
| Worker | 1 | compression.worker.ts |
| Vue 组件 | 6 | BatchPanel + FormatComparisonGrid + CompressionPreview + RenameRuleEditor + WatermarkConfig + ProgressBar |
| Composables | 3 | useBatchProcessor + useFileList + useCompressionEstimate |
| **合计** | **22** | |

---

<a id="sec-9"></a>
## 九、已知缺口与技术债

### 9.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | TIFF 格式仅支持导出不支持导入 | TIFF→其他格式方向不可用 | Canvas 不支持 TIFF 解码 | 引入 `utif` 库（~20KB gzip） |
| 2 | 批量裁剪不支持每图不同区域 | 只能所有图片应用相同裁剪区域 | 未实现 | 独立需求（需逐图编辑 UI） |
| 3 | PDF 不支持 OCR 文字层 | 图片转 PDF 后不可搜索文字 | jsPDF 不支持 OCR | 后端 OCR 服务（YiAi 扩展） |

### 9.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | AVIF 编码 polyfill 体积大 | P2 | 0.3 | @jsquash/avif 约 150KB gzip，当前仅在 Chrome 85+ 原生支持 | ✅ 已完成（fallback WebP） |
| 2 | 压缩预测仅采样 3 点 | P3 | 0.1 | 对非线性压缩曲线（WebP 低质量段）误差 > 5% | 待实施（采样 5 点） |
| 3 | 批量处理大文件（>50 张 4K）内存管理 | P2 | 0.3 | 全部文件 ImageData 驻留内存可能导致 OOM | ✅ 已完成（流式处理，用完即释放） |
| 4 | Worker 初始化延迟 | P3 | 0.1 | Worker 首次创建耗时 ~50ms，批量开始时感知延迟 | 待实施（BatchPanel 打开时预创建 Worker） |

---