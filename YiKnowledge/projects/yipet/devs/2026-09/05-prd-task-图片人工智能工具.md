---
doc_type: module
prd_task_id: "YP-M05"
title: "YP-M05: 图片 AI 工具 — 开发方案"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.2
source_prd: "05-功能实现-图片人工智能工具.md"
source_okr: [yipet-004]
related_tests: ["05-prd-test-图片人工智能工具"]
---

# YP-M05: 图片 AI 工具 — 开发方案

> 来源 PRD：[05-功能实现-图片人工智能工具.md](../../prds/2026-09/05-功能实现-图片人工智能工具.md)
> 需求编号：M05 · 11 个 AI 工具 · 人天：2.2d · 状态：待开始
> 测试方案：[05-prd-test-图片人工智能工具.md](../../tests/2026-09/05-prd-test-图片人工智能工具.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、实施路线图](#sec-4)
- [五、技术风险](#sec-5)
- [六、实现完成记录](#sec-6)
- [七、已知缺口与技术债](#sec-7)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 工具分类

11 个 AI 工具按执行位置分为客户端和 YiAi 后端两类：

| 类型 | 工具 | 核心技术 | 执行位置 |
|------|------|---------|---------|
| 客户端 | 瘦脸/红眼/美肤/牙齿美白 | face-api.js 人脸标记 + Canvas 像素操作 | 浏览器 |
| 客户端 | 智能裁剪 | 显著区域检测（Saliency Detection） | 浏览器 |
| 客户端 | 人脸标记 | face-api.js 68 点/468 点 landmark | 浏览器 |
| 客户端 | 相似度搜索 | pHash + 感知哈希 | 浏览器 |
| 混合 | 批量优化/批量压缩 | Canvas 压缩管线 + YiAi 质量评估 | 浏览器 + YiAi |
| 混合 | 优化报告/质量评分 | YiAi vision 模型评分 + 前端雷达图 | YiAi + 浏览器 |

### 1.2 文件清单

```
YiPet/src/imageEditor/
├── ai/
│   ├── faceSlimming.ts           # 瘦脸（液化变形 + face-api.js landmark）
│   ├── redEyeRemoval.ts          # 红眼移除（红色检测 + 去饱和）
│   ├── skinSmoothing.ts          # 美肤（双边滤波 + 高频保留）
│   ├── teethWhitening.ts         # 牙齿美白（mask 区域 L 通道提升）
│   ├── smartCrop.ts              # 智能裁剪（显著区域检测）
│   ├── faceLandmark.ts           # 人脸标记（face-api.js 68/468 点）
│   ├── similaritySearch.ts       # 相似度搜索（pHash + 汉明距离）
│   ├── batchOptimizer.ts         # 批量优化（格式/尺寸/质量自动选择）
│   ├── batchCompressor.ts        # 批量压缩（目标大小自适应质量）
│   ├── optimizationReport.ts     # 优化报告（压缩比/质量变化/推荐）
│   └── qualityScorer.ts          # 质量评分（YiAi vision 模型）
├── components/
│   ├── FaceToolPanel.vue         # 人脸工具面板（瘦脸/红眼/美肤/牙齿）
│   ├── AIScoreDashboard.vue      # AI 评分仪表盘
│   └── OptimizationReport.vue    # 优化报告视图
└── api/
    └── aiImageService.ts         # YiAi 多模态 API 封装
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：瘦脸 — 液化变形而非三角剖分

液化变形（Liquify）是 Photoshop 风格的局部变形：在鼠标拖动半径内，像素向拖动方向位移，位移量随距离衰减（smoothstep）。三角剖分（Delaunay + 仿射变换）更适合整体变形但交互复杂。液化变形对局部微调（下巴/脸颊）更直观。

### D-02：美肤 — 双边滤波而非高斯模糊

高斯模糊会同时模糊皮肤纹理和边缘（眉毛/眼睛边界），导致"塑料感"。双边滤波在平滑区域内的高斯权重外，额外考虑像素值差异——边缘两侧像素值差异大 → 权重降低 → 边缘被保留。皮肤纹理被平滑，但眉毛/发际线保持清晰。

### D-03：智能裁剪 — 显著区域检测而非 AI 模型

深度学习显著检测模型（U2Net）精度高但模型 > 5MB。简化方案：使用图像梯度幅值密度图（边缘密集区域 ≈ 感兴趣区域），加权中心偏置（构图规则：主体通常在画面中部偏上）。对产品图/人像/风景准确率 > 80%。

### D-04：混合执行位置

人脸处理（瘦脸/红眼/美肤/牙齿）必须在客户端——实时交互（拖动滑块/画笔）不能承受 RPC 往返延迟（> 100ms）。质量评分/优化报告可走 YiAi——不需要实时响应，vision 模型推理需要 GPU。

---

<a id="sec-3"></a>
## 三、模块与接口契约

```typescript
// 人脸工具共享接口
interface FaceTool {
  /** 应用人脸工具，基于 face-api.js landmark 定位 */
  apply(imageData: ImageData, landmarks: FaceLandmarks,
        params: FaceToolParams, brushStrokes?: BrushStroke[]): ImageData;
}

// 瘦脸
interface LiquifyParams {
  radius: number;        // 液化笔刷半径 (px)
  strength: number;      // 变形强度 0-1
  center: Point;         // 笔刷中心
  direction: Point;      // 拖动方向
}

// 美肤
function bilateralFilter(imageData: ImageData, spatialSigma: number,
                         rangeSigma: number, mask?: ImageData): ImageData;

// 红眼移除
function removeRedEye(imageData: ImageData, eyeRegion: Rect): ImageData;
// 策略：检测红色像素区域（R > G+B 阈值）→ 去饱和 → 降低亮度

// 牙齿美白
function whitenTeeth(imageData: ImageData, teethLandmarks: Point[]): ImageData;
// 策略：mouth 内部区域 → HSL-L 通道 +20 → clamp

// 智能裁剪
function detectSaliencyRegion(imageData: ImageData): Rect;
// 策略：梯度密度 + 中心偏置 → 最显著矩形区域

// 相似度搜索
function computePHash(imageData: ImageData): bigint;  // 64-bit 感知哈希
function hammingDistance(hash1: bigint, hash2: bigint): number;

// YiAi API
interface AiImageService {
  scoreQuality(imageData: ImageData): Promise<QualityScore>;
  generateReport(before: ImageData, after: ImageData): Promise<OptimizationReport>;
}
```

---

<a id="sec-4"></a>
## 四、实施路线图

### 阶段一：客户端人脸工具（P2，约 1.2d）

| 任务 | 产出 | 人天 |
|------|------|------|
| face-api.js 集成 + 人脸标记 | `faceLandmark.ts` + 模型加载 | 0.3 |
| 瘦脸（液化变形） | `faceSlimming.ts` | 0.3 |
| 美肤（双边滤波） | `skinSmoothing.ts` | 0.2 |
| 红眼移除 + 牙齿美白 | `redEyeRemoval.ts` + `teethWhitening.ts` | 0.2 |
| FaceToolPanel 组件 | `FaceToolPanel.vue` | 0.2 |

### 阶段二：智能裁剪 + 搜索（P2，约 0.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 显著区域检测 | `smartCrop.ts` | 0.2 |
| 感知哈希 + 相似度搜索 | `similaritySearch.ts` | 0.2 |
| 集成到图片编辑器 | 裁剪/搜索入口 | 0.1 |

### 阶段三：批量优化 + YiAi 集成（P2，约 0.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 批量优化（格式/尺寸/质量自动选择） | `batchOptimizer.ts` | 0.2 |
| 批量压缩（目标大小自适应） | `batchCompressor.ts` | 0.1 |
| YiAi API 封装 | `aiImageService.ts` | 0.1 |
| AIScoreDashboard + OptimizationReport | 2 个 Vue 组件 | 0.1 |

**总计：2.2d**

### 阶段四：YiAi 后端（独立需求，不计入本期）

| 任务 | 人天 |
|------|------|
| vision 模型部署（质量评分） | 1.0 |
| 批量优化建议（格式/尺寸推荐） | 0.5 |

---

<a id="sec-5"></a>
## 五、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| face-api.js 模型加载失败 | 低 | 高 | 首次使用时异步加载 + 加载中提示 | 人脸工具不可用（非阻断编辑） |
| 双边滤波大图性能 | 中 | 中 | spatialSigma=10 时在 1080p 上 < 50ms | 仅处理人脸区域（非全图） |
| YiAi vision 模型未部署 | 高 | 高 | 质量评分/优化报告处于待开始状态 | 前端 mock 评分数据 |

---

<a id="sec-6"></a>
## 六、实现完成记录

> **状态**：待开始。依赖 YiAi 多模态能力（vision 模型部署）和 face-api.js 模型加载方案就绪。

### 6.1 产出清单（待填充）

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| AI 工具模块 | 11 | — |
| Vue 组件 | 3 | — |
| API 封装 | 1 | — |
| **合计** | **0** | — |

---

<a id="sec-7"></a>
## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | YiAi vision 模型未部署 | 质量评分/优化报告不可用 | 后端模型待部署 | 阶段四独立需求 |
| 2 | face-api.js 模型托管方案 | 模型文件（tiny_face_detector ~200KB）需随扩展打包或 CDN 加载 | 未确定托管方案 | 扩展打包（200KB 可接受） |
| 3 | 感知哈希仅支持 64-bit | 碰撞概率 ~1/2^64，百万级图片库可能误判 | 未实现多哈希融合 | 远期：192-bit 多哈希 |

### 7.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 双边滤波无 GPU 加速 | P3 | 0.3 | 当前纯 CPU，大半径 > 20 时耗时可观 | 待实施（WebGL fragment shader） |
| 2 | 液化变形无历史状态 | P3 | 0.2 | 多次液化操作后无法撤销到中间状态 | 待实施（snapshot 栈） |

---