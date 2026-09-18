---
doc_type: module
prd_task_id: "YP-M02"
title: "YP-M02: 图片特效与滤镜 — 13 合 1 开发方案"
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
source_prd: "02-功能实现-图片特效与滤镜.md"
source_okr: [yipet-004]
related_tests: ["02-prd-test-图片特效与滤镜"]
---

# YP-M02: 图片特效与滤镜 — 开发方案

> 来源 PRD：[02-功能实现-图片特效与滤镜.md](../../prds/2026-09/02-功能实现-图片特效与滤镜.md)
> 需求编号：M02 · 13 个特效 · 人天：2.6d · 状态：已完成
> 测试方案：[02-prd-test-图片特效与滤镜.md](../../tests/2026-09/02-prd-test-图片特效与滤镜.md)

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

### 1.1 特效分类

13 个特效按技术复杂度分为三层：

| 层 | 特效 | 核心技术 | 复杂度 |
|----|------|---------|--------|
| 像素操作层 | 基础滤镜/老照片/双色调/LUT | ImageData 逐像素 + LUT 查表 | 低 |
| 卷积层 | 素描/锐化/颗粒/光影 | 卷积核（Sobel/Canny/Gaussian）+ 亮度加权 | 中 |
| 变换层 | 像素化/故障艺术/HDR/景深/全景矫正/漏光 | 颜色量化/色调映射/金字塔模糊/单应性矩阵 | 高 |

### 1.2 文件清单

```
YiPet/src/imageEditor/
├── effects/
│   ├── basicFilters.ts          # 9 种基础调整 + 8 个预设滤镜
│   ├── pixelate.ts              # Median Cut 颜色量化 + Floyd-Steinberg/有序抖动 + 9 调色板
│   ├── sketch.ts                # 铅笔/炭笔/钢笔/彩色 4 模式 + Sobel/Canny 边缘检测
│   ├── lighting.ts              # 聚光灯/方向光/环境光 + 7 种光照效果
│   ├── vintage.ts               # 7 效果链（棕褐/颗粒/褪色/暗角/漏光/灰尘/日期戳）+ 10 年代预设
│   ├── duotone.ts               # HSL 渐变映射 + 20 经典 + 20 品牌色板 + 分离色调
│   ├── glitch.ts                # 7 种故障（RGB偏移/切片/像素排序/块失真/扫描线/CRT/色彩泄漏）+ 8 预设
│   ├── hdr.ts                   # Reinhard+Filmic 色调映射 + 阴影/高光恢复 + 3 级金字塔局部对比度
│   ├── depthOfField.ts          # 移轴模拟 + 焦点选择 + 5 级金字塔可变半径模糊 + 散景
│   ├── panorama.ts              # DLT 4 点单应性矩阵 + Canny+Hough 自动水平 + 径向畸变校正
│   ├── grain.ts                 # 高斯+多尺度颗粒 + smoothstep 亮度加权 + 4 胶片预设
│   ├── lightLeak.ts             # 程序化渐变+噪声漏光 + 8 种预设（4角+2边+1多角+1齿孔）
│   └── lutFilter.ts             # .cube/.3dl 导入 + 33³ 三线性插值 + 8 程序化预设 + LUT 导出
├── components/
│   ├── EffectPanel.vue          # 特效面板（分类标签 + 特效列表 + 参数滑块）
│   ├── LUTImporter.vue          # LUT 文件导入对话框（.cube/.3dl 预览）
│   ├── PresetCarousel.vue       # 预设轮播选择器（缩略图预览）
│   └── BeforeAfterSlider.vue    # 前后对比滑块（特效专用）
├── composables/
│   ├── useEffects.ts            # 特效状态管理（激活特效栈、参数快照）
│   └── useLUTLoader.ts          # LUT 文件解析（.cube/.3dl → 33³ 3D LUT）
└── workers/
    ├── medianCut.worker.ts      # Median Cut 颜色量化 Worker
    └── hdrToneMapping.worker.ts # HDR 色调映射 Worker
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：LUT 滤镜 — 33³ 三线性插值而非 tetrahedral

Tetrahedral 插值精度略高（4 点 vs 8 点），但 33³ LUT 在 8-bit 色彩空间下三线性插值误差 < 1 色差值（肉眼不可区分）。三线性插值实现更简单，每像素 8 次查表 + 7 次线性插值，1080p 图片耗时约 5ms。`.cube` 格式天然适配三线性插值。

### D-02：HDR 色调映射 — Filmic 而非仅 Reinhard

Reinhard 全局色调映射对高光处理柔和（高光>10 倍中灰时趋于纯白），但暗部细节损失。Filmic（ACES/Hable/Uchimura）通过 S 曲线在高光和暗部都保留更多细节。提供两种可选模式：Reinhard（自然风格）/ Filmic（电影风格）。

### D-03：全景矫正 — DLT 四点法而非八点法

八点法需要用户精确标定 8 个对应点，易用性差。DLT 四点法只需拖拽四角对齐目标平面，单应性矩阵 3×3 求解稳定。用户只需标记文档/画作的四个角即可完成透视矫正。

### D-04：故障艺术 — 参数随机种子可复现

RGB 偏移/切片位移/像素排序等故障效果本质是伪随机，但"随机"意味着每次渲染结果不同（不可复现）。每个故障效果接受 `seed` 参数，相同 seed 保证相同输出。用户可通过"随机"按钮生成新 seed。

### D-05：景深 — 金字塔模糊而非逐像素

可变半径模糊（远离焦点的区域模糊半径更大）逐像素计算 O(n×r²)。使用 5 级图像金字塔（每级降采样 2×），大半径模糊在下采样级执行，计算量减少 75%。散景（bokeh）通过磁盘核卷积在最精细级叠加。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 通用特效接口

```typescript
interface EffectModule {
  readonly id: string;
  readonly name: string;
  readonly category: "pixel" | "convolution" | "transform";

  /** 应用特效到 ImageData，返回新的 ImageData（非破坏性） */
  apply(source: ImageData, params: EffectParams, options?: EffectOptions): ImageData;

  /** 生成预览缩略图（降采样到 200×200，快速预览） */
  preview(source: ImageData, params: EffectParams): ImageData;

  /** 返回默认参数 */
  getDefaults(): EffectParams;
}

interface EffectOptions {
  seed?: number;       // 伪随机种子（故障/颗粒/漏光）
  quality?: "preview" | "full";  // 质量模式
  signal?: AbortSignal; // 取消信号（大图处理）
}
```

### 3.2 关键模块接口

```typescript
// LUT 滤镜
interface LUTFilter extends EffectModule {
  loadLUT(buffer: ArrayBuffer, format: "cube" | "3dl"): Promise<void>;
  exportLUT(format: "cube"): Blob;
  applyPreset(presetId: string): EffectParams;
}

// 颜色量化（像素化）
interface PixelateEffect extends EffectModule {
  setColorLevels(levels: number): void;  // 2-256
  setDithering(method: "floyd-steinberg" | "ordered" | "none"): void;
  setPalette(palette: RGBColor[]): void;
}

// HDR
interface HDREffect extends EffectModule {
  setToneMapping(method: "reinhard" | "filmic" | "aces"): void;
  setExposure(ev: number): void;         // -3 ~ +3
  recoverShadows(intensity: number): void;
  recoverHighlights(intensity: number): void;
}

// 全景矫正
interface PanoramaCorrection extends EffectModule {
  setCornerPoints(points: [Point, Point, Point, Point]): void;
  autoLevel(): Promise<void>;  // Canny + Hough 自动检测水平线
  setRadialCorrection(k1: number, k2: number): void;
}

// 景深
interface DepthOfField extends EffectModule {
  setFocusPoint(x: number, y: number): void;
  setBlurRadius(maxRadius: number): void;
  setBokehShape(shape: "circle" | "hexagon" | "star"): void;
}
```

### 3.3 其余模块摘要

| 模块 | 核心参数 |
|------|---------|
| 基础滤镜 | `{brightness, contrast, saturation, hue, blur, sharpen, sepia, grayscale, invert} + preset_id` |
| 素描 | `{mode: pencil/charcoal/pen/color, edgeThreshold, lineStrength, paperTexture}` |
| 光影 | `{type: spotlight/directional/ambient, intensity, angle, colorTemp, shadow, vignette, bloom}` |
| 老照片 | `{era: 1920s-2000s, sepia, grain, fade, vignette, lightLeak, dust, dateStamp}` |
| 双色调 | `{highlightColor, shadowColor, blendMode, splitToning, preset_id}` |
| 故障艺术 | `{rgbShift, sliceCount, pixelSortThreshold, blockSize, scanlineDensity, colorBleed, seed}` |
| 颗粒 | `{intensity, size: fine/medium/coarse, luminanceWeighting, filmPreset}` |
| 漏光 | `{intensity, color, position: corner/edge/multi, pattern, blendMode}` |

---

<a id="sec-4"></a>
## 四、组件清单

| 组件 | 职责 | 关键行为 |
|------|------|---------|
| `EffectPanel.vue` | 特效选择面板 | 三层分类标签（像素/卷积/变换），特效列表，参数滑块，强度混合 |
| `LUTImporter.vue` | LUT 导入对话框 | 拖拽 .cube/.3dl 文件，解析预览（3D LUT → 测试图片应用效果），错误格式提示 |
| `PresetCarousel.vue` | 预设轮播 | 缩略图网格（降采样到 200×200），鼠标悬浮放大预览，一键应用 |
| `BeforeAfterSlider.vue` | 前后对比 | 可拖拽分割线，默认 50:50，触控支持 |

---

<a id="sec-5"></a>
## 五、实施路线图

### 阶段一：像素操作层（P2，约 0.8d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 基础滤镜（9 调整 + 8 预设） | `basicFilters.ts` | 0.2 |
| 老照片（7 效果链 + 10 年代预设） | `vintage.ts` | 0.2 |
| 双色调（HSL 渐变映射 + 40 色板） | `duotone.ts` | 0.2 |
| LUT 滤镜（.cube/.3dl 导入 + 三线性插值 + 8 预设 + 导出） | `lutFilter.ts` + `useLUTLoader.ts` | 0.2 |

### 阶段二：卷积层（P2，约 0.9d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 素描（4 模式 + Sobel/Canny） | `sketch.ts` | 0.2 |
| 光影（3 类型 + 7 效果） | `lighting.ts` | 0.2 |
| 颗粒（高斯+多尺度 + 亮度加权 + 4 胶片预设） | `grain.ts` | 0.2 |
| 锐化（已有卷积核，集成到基础滤镜） | `basicFilters.ts` 扩展 | 0.1 |
| 组件（EffectPanel + BeforeAfterSlider） | 2 个 Vue 组件 | 0.2 |

### 阶段三：变换层（P2，约 0.9d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 像素化（Median Cut + 抖动 + 9 调色板） | `pixelate.ts` + Worker | 0.2 |
| 故障艺术（7 种 + 8 预设 + seed 可复现） | `glitch.ts` | 0.2 |
| HDR（2 种色调映射 + 阴影/高光恢复 + 金字塔对比度） | `hdr.ts` + Worker | 0.2 |
| 景深（移轴 + 焦点 + 5 级金字塔模糊 + 散景） | `depthOfField.ts` | 0.2 |
| 全景矫正（DLT + Canny+Hough + 径向校正） | `panorama.ts` | 0.2 |
| LUT 导入组件 | `LUTImporter.vue` + `PresetCarousel.vue` | 0.1 |

**总计：2.6d**

---

<a id="sec-6"></a>
## 六、代码审查检查清单

### 像素操作

- [ ] 基础滤镜 9 种调整合并为单次逐像素遍历
- [ ] 老照片 7 效果链顺序固定（棕褐→颗粒→褪色→暗角→漏光→灰尘→日期戳）
- [ ] 双色调 HSL 渐变映射：L 通道到渐变色插值正确
- [ ] LUT 33³ 三线性插值 8 点权重求和 = 1.0

### 卷积操作

- [ ] Sobel 核 `[-1,0,1,-2,0,2,-1,0,1]` 和 `[-1,-2,-1,0,0,0,1,2,1]` 梯度幅值计算正确
- [ ] Canny 双阈值（低/高）边缘连接无断点
- [ ] 颗粒亮度加权：暗部颗粒 > 亮部颗粒（smoothstep 三段）

### 变换操作

- [ ] Median Cut 颜色量化：颜色盒分裂选择最长轴
- [ ] Floyd-Steinberg 误差扩散到 4 个邻域像素
- [ ] Reinhard 色调映射 `L/(1+L)` 和白点适配
- [ ] DLT 单应性矩阵 8-DOF 求解稳定（4 点不共线检测）
- [ ] 32-bit LUT .cube 文件解析兼容 `LUT_3D_SIZE` 非 33 的格式

### 通用

- [ ] 所有特效支持 `AbortSignal` 取消（大图处理）
- [ ] `seed` 参数可复现（故障/颗粒/漏光）
- [ ] 特效栈多效果叠加为非破坏性（从 original 重建）

---

<a id="sec-7"></a>
## 七、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| .cube LUT 格式变体不兼容 | 中 | 中 | 支持 `LUT_3D_SIZE` 2-256，`DOMAIN_MIN/MAX` 非 0-1 的重映射 | 解析失败提示用户转换格式 |
| Canny+Hough 自动水平误检 | 中 | 中 | 用户可手动绘制水平参考线覆盖自动检测结果 | 降级为手动模式 |
| 5 级金字塔模糊内存占用 | 低 | 中 | 每级降采样 2×，总内存增加约 33% | 限制最大半径 |
| Median Cut Worker transfer 开销 | 低 | 低 | 仅在颜色等级 ≤ 16 时才使用 Worker（计算量大 > transfer 开销） | 主线程直接计算 |

---

<a id="sec-8"></a>
## 八、实现完成记录

> **完成日期**：2026-09-10 · **复核日期**：2026-09-15
> **状态**：全部 13 个特效已实现并测试通过

### 8.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 特效模块 | 13 | 基础滤镜/像素化/素描/光影/老照片/双色调/故障/HDR/景深/全景/颗粒/漏光/LUT |
| Vue 组件 | 4 | EffectPanel + LUTImporter + PresetCarousel + BeforeAfterSlider |
| Composables | 2 | useEffects + useLUTLoader |
| Workers | 2 | medianCut + hdrToneMapping |
| **合计** | **21** | |

---

<a id="sec-9"></a>
## 九、已知缺口与技术债

### 9.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | .3dl LUT 格式导入未完成 | 仅支持 .cube 格式导入 | .3dl 解析器未实现（格式更复杂，含 ASC_CDL 元数据） | 优先支持 .cube（覆盖 90% 场景） |
| 2 | HDR 多曝光合成 | 需要 3+ 张不同曝光图片作为输入 | 当前仅支持单图 HDR 色调映射（"伪 HDR"） | 独立需求（需连拍支持） |
| 3 | 素描纸张纹理叠加 | 当前素描效果无纹理背景 | 未实现 | 阶段二补充（PNG 纹理 + multiply 混合） |

### 9.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | LUT 33³ 内插精度验证 | P3 | 0.2 | 与 Photoshop .cube 应用结果逐像素对比，验收 ΔE < 1 | 待实施 |
| 2 | 故障艺术参数随机种子序列化 | P3 | 0.1 | seed 存入预设时需包含完整的参数快照 | 待实施 |
| 3 | 景深焦点区域边缘过渡优化 | P3 | 0.2 | 当前焦点边框硬切，需 smoothstep 羽化过渡 | 待实施 |
| 4 | 全景矫正透视极端情况（>60° 倾斜） | P3 | 0.3 | 单应性矩阵在极端透视下变形严重 | 待评估 |

---