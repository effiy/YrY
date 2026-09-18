---
doc_type: module
prd_task_id: "YP-M04"
title: "YP-M04: 图片高级编辑工具 — 18 合 1 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 3.6
source_prd: "04-功能实现-图片高级编辑工具.md"
source_okr: [yipet-004]
related_tests: ["04-prd-test-图片高级编辑工具"]
---

# YP-M04: 图片高级编辑工具 — 开发方案

> 来源 PRD：[04-功能实现-图片高级编辑工具.md](../../prds/2026-09/04-功能实现-图片高级编辑工具.md)
> 需求编号：M04 · 18 个工具 · 人天：3.6d · 状态：已完成
> 测试方案：[04-prd-test-图片高级编辑工具.md](../../tests/2026-09/04-prd-test-图片高级编辑工具.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、技术风险](#sec-6)
- [七、实现完成记录](#sec-7)
- [八、已知缺口与技术债](#sec-8)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 工具分类

18 个工具按技术领域分为 6 组，总计 3.6d。

| 组 | 工具 | 核心技术 | 人天 |
|----|------|---------|------|
| 图层与合成 | 图层管理/混合模式/抠图/背景替换 | Canvas compositing + alpha matting | 0.8 |
| 元数据 | EXIF 编辑/IPTC/XMP 读写 | 二进制解析 + 序列化 | 0.4 |
| 几何变换 | 变形/超分辨率放大 | 双线性/双三次插值 +  Lanczos | 0.5 |
| 修复 | 水印去除 | 图像修复（inpainting）+ 频域滤波 | 0.5 |
| 分析与诊断 | 直方图/质量评估/构图分析/色彩分析 | 统计 + 色彩空间转换 | 0.6 |
| 通道与滤波 | 通道分离合并/阈值/边缘检测/频率域 | 卷积核 + FFT | 0.8 |

### 1.2 文件清单

```
YiPet/src/imageEditor/
├── advanced/
│   ├── layerManager.ts           # 图层管理（添加/删除/排序/混合模式/透明度）
│   ├── cutout.ts                 # AI 抠图（GrabCut 简化 + 边缘优化）
│   ├── backgroundReplace.ts      # 背景替换（alpha matting + 新背景合成）
│   ├── metadataEditor.ts         # EXIF/IPTC/XMP 读写（piexifjs）
│   ├── warp.ts                   # 变形（透视/球面/波浪/漩涡 4 种）
│   ├── superResolution.ts        # 超分辨率（Lanczos 放大 + 锐化）
│   ├── watermarkRemoval.ts       # 水印去除（频域陷波滤波 + inpainting）
│   ├── frequencyDomain.ts        # 频率域处理（FFT→滤波→IFFT）
│   ├── channelOps.ts             # 通道操作（分离/合并/混合/提取）
│   ├── threshold.ts              # 阈值处理（全局/自适应/大津法）
│   ├── edgeDetection.ts          # 边缘检测（Canny/Sobel/Prewitt/Laplacian）
│   ├── histogramOps.ts           # 直方图（均衡化/匹配/拉伸）
│   ├── qualityAssessor.ts        # 质量评估（清晰度/噪声/曝光/blur）
│   ├── compositionAnalyzer.ts    # 构图分析（三分法/黄金比例/对称检测）
│   └── colorAnalyzer.ts          # 色彩分析（调色板提取/色相分布/互补色）
├── components/
│   ├── LayerPanel.vue            # 图层面板（缩略图/排序/拖拽/可见性）
│   ├── HistogramFull.vue         # 全功能直方图（RGB+Luma+统计标注）
│   ├── MetadataPanel.vue         # 元数据面板（EXIF 表格/编辑/导出）
│   └── AnalysisDashboard.vue     # 分析仪表盘（质量/构图/色彩综合）
└── workers/
    ├── fft.worker.ts              # FFT/IFFT Worker
    └── superResolution.worker.ts  # Lanczos 放大 Worker
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：抠图 — GrabCut 简化版而非深度学习模型

深度学习抠图模型（MODNet/U2Net）在浏览器中有两个问题：模型文件 > 10MB（Chrome 扩展体积限制 100MB，但加载延迟不可接受）和 WebGL 推理耗时 > 500ms（UI 卡顿）。GrabCut 简化版基于颜色分布（前景/背景高斯混合模型）+ 边缘优化（alpha matting 闭合解），在 1080p 图片上耗时约 100ms，对于轻度抠图场景（产品图/头像）精度足够。

### D-02：频率域处理 — FFT 在 Worker 中执行

2D FFT 计算量 O(N²logN)，1080p 图片 FFT 在主线程中耗时 > 2s。使用 Worker 执行 FFT→滤波→IFFT，`transfer` 传输 ImageData 避免拷贝。频域陷波滤波（notch filter）是水印去除的核心——周期性水印（网纹/半色调）在频域中表现为孤立的亮点，人工选择 → 陷波滤波消除。

### D-03：超分辨率 — Lanczos 放大 + Unsharp Mask

真实超分辨率（ESRGAN/Real-ESRGAN）模型 > 50MB，浏览器中不现实。Lanczos 插值（8×8 核）是高质量上采样的数学最优解，配合 Unsharp Mask（高斯模糊 → 原图 − 模糊 = 细节层 → 叠加）恢复放大后损失的纹理感。2× 放大 1080p 耗时 < 200ms。

### D-04：EXIF 编辑 — piexifjs 库

JPEG EXIF 二进制格式解析复杂（TIFF IFD 结构），自实现维护成本高。piexifjs 是对 EXIF 2.3 标准的完整实现（~15KB gzip），支持 GPS/IPTC/XMP 读写。

---

<a id="sec-3"></a>
## 三、模块与接口契约

```typescript
// 图层管理
interface Layer {
  id: string; name: string;
  imageData: ImageData;
  visible: boolean; opacity: number;  // 0-1
  blendMode: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "difference";
  mask?: ImageData;                   // 图层蒙版
}
interface LayerManager {
  layers: Layer[];
  addLayer(imageData: ImageData, name?: string): string;
  removeLayer(id: string): void;
  reorder(fromIndex: number, toIndex: number): void;
  setBlendMode(id: string, mode: BlendMode): void;
  composite(): ImageData;             // 从上到下混合所有可见图层
}

// 抠图
interface CutoutOptions {
  foregroundStrokes: Point[];         // 用户标记的前景笔画
  backgroundStrokes: Point[];         // 用户标记的背景笔画
  refineEdge: boolean;                // alpha matting 边缘优化
}
function grabCut(imageData: ImageData, options: CutoutOptions): { mask: ImageData; alpha: ImageData };

// 频率域
interface FrequencyFilter {
  type: "lowpass" | "highpass" | "bandpass" | "notch";
  cutoff: number;                     // 归一化频率 0-1
  notchPoints?: Point[];              // 陷波点（水印去除）
}
function applyFrequencyFilter(imageData: ImageData, filter: FrequencyFilter): ImageData;

// 超分辨率
function lanczosUpscale(imageData: ImageData, scale: number, sharpen: boolean): ImageData;

// 质量评估
interface QualityReport {
  sharpness: number;                  // 0-100 (Laplacian variance)
  noise: number;                      // 0-100 (高频能量/总能量)
  exposure: { under: number; over: number };  // 欠曝/过曝百分比
  blur: number;                       // 0-100 (边缘宽度估计)
  overall: number;                    // 综合质量 0-100
}
function assessQuality(imageData: ImageData): QualityReport;
```

---

<a id="sec-4"></a>
## 四、实施路线图

### 阶段一：图层 + 元数据（P2，约 1.2d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 图层管理（7 种混合模式 + 蒙版 + 透明度） | `layerManager.ts` + `LayerPanel.vue` | 0.4 |
| AI 抠图（GrabCut + alpha matting） | `cutout.ts` | 0.3 |
| 背景替换（抠图 + 新背景合成） | `backgroundReplace.ts` | 0.2 |
| EXIF 元数据编辑（piexifjs） | `metadataEditor.ts` + `MetadataPanel.vue` | 0.3 |

### 阶段二：变换 + 修复（P2，约 1.0d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 变形（4 种：透视/球面/波浪/漩涡） | `warp.ts` | 0.3 |
| 超分辨率（Lanczos + Unsharp Mask） | `superResolution.ts` + Worker | 0.3 |
| 水印去除（频域陷波 + inpainting） | `watermarkRemoval.ts` | 0.4 |

### 阶段三：分析 + 通道（P2，约 1.4d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 频率域处理（FFT→滤波→IFFT） | `frequencyDomain.ts` + Worker | 0.3 |
| 通道操作（分离/合并/混合/提取） | `channelOps.ts` | 0.2 |
| 阈值处理（全局/自适应/大津法） | `threshold.ts` | 0.1 |
| 边缘检测（4 种算子） | `edgeDetection.ts` | 0.1 |
| 直方图处理（均衡化/匹配/拉伸） | `histogramOps.ts` + `HistogramFull.vue` | 0.2 |
| 质量评估 + 构图分析 + 色彩分析 | `qualityAssessor.ts` + `compositionAnalyzer.ts` + `colorAnalyzer.ts` + `AnalysisDashboard.vue` | 0.5 |

**总计：3.6d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

- [x] 图层合成：混合模式按 CSS Compositing Level 1 规范实现
- [x] GrabCut 简化版：迭代次数 5 次（精度/性能平衡）
- [x] EXIF 编辑：修改后 JPEG 可被其他软件正常解析
- [x] Lanczos 8×8 核：权重和 = 1.0，无亮度偏移
- [x] FFT 在 Worker 中执行，transfer ImageData 零拷贝
- [x] 频域陷波滤波器：阶数可调（1-3 阶）
- [x] 大津法阈值：灰度直方图 → 类间方差最大化的阈值
- [x] Canny 双阈值：低/高比 = 1:2 或 1:3

---

<a id="sec-6"></a>
## 六、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| GrabCut 抠图边缘粗糙 | 中 | 中 | 提供"精细边缘"刷子手动修正 alpha matte | 降级为矩形选区 |
| FFT Worker 大图 OOM | 中 | 高 | 2D FFT 内存 = 原图 × 4（复数），4K 图 = 128MB | 降采样到 2K 再处理 |
| piexifjs 不兼容特定相机 EXIF MakerNote | 低 | 中 | MakerNote 为厂商私有格式，piexifjs 保留原始字节 | 提示"厂商特定数据未解析" |

---

<a id="sec-7"></a>
## 七、实现完成记录

> **完成日期**：2026-09-10 · **复核日期**：2026-09-15
> **状态**：全部 18 个工具已实现

### 7.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 高级编辑模块 | 15 | 图层/抠图/背景/元数据/变形/超分辨/水印去除/频率域/通道/阈值/边缘/直方图/质量/构图/色彩 |
| Vue 组件 | 4 | LayerPanel + HistogramFull + MetadataPanel + AnalysisDashboard |
| Workers | 2 | fft + superResolution |
| **合计** | **21** | |

---

<a id="sec-8"></a>
## 八、已知缺口与技术债

### 8.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | 深度学习抠图（MODNet/U2Net） | GrabCut 对毛发/半透明物体效果差 | 模型 > 10MB，浏览器推理慢 | 远期：WebGPU 推理 |
| 2 | 真实超分辨率（ESRGAN） | Lanczos 无法恢复丢失的细节纹理 | 模型 > 50MB | 远期：后端推理 |

### 8.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | FFT 大图内存优化 | P2 | 0.3 | 4K 图 FFT 需要 128MB，手机端可能 OOM | ✅ 已完成（降采样到 2K） |
| 2 | 图层历史记录/撤销 | P2 | 0.3 | 图层操作（添加/删除/合并）无撤销 | 待实施 |
| 3 | GrabCut 迭代次数动态调整 | P3 | 0.1 | 简单图片 5 次过多，复杂图片可能不足 | 待实施（基于前景/背景颜色分离度自适应） |

---