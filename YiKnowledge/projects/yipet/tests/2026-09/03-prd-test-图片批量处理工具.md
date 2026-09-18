---
doc_type: test
title: "M03: 图片批量处理工具 — 测试用例"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-M03"
source_prds: ["03-功能实现-图片批量处理工具"]
source_modules: ["03-prd-task-图片批量处理工具"]
source_okr: [yipet-004]
---

# M03: 图片批量处理工具 — 测试用例

> 来源 PRD：[03-功能实现-图片批量处理工具.md](../../prds/2026-09/03-功能实现-图片批量处理工具.md)
> 开发方案：[03-prd-task-图片批量处理工具.md](../../devs/2026-09/03-prd-task-图片批量处理工具.md)
> 需求编号：M03 · 13 个批量工具 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。覆盖格式转换、压缩、重命名、水印、PDF 等 13 个批量工具。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、单元测试 — 格式转换与压缩](#sec-3)
- [四、单元测试 — 重命名与水印](#sec-4)
- [五、单元测试 — 批量队列](#sec-5)
- [六、集成测试](#sec-6)
- [七、性能验收测试](#sec-7)
- [八、缺陷分级](#sec-8)
- [九、自动化现状](#sec-9)

---

<a id="sec-1"></a>
## 一、测试范围与目标

| 层 | 工具 | 关键测试点 |
|----|------|----------|
| 转换层 | 格式转换/压缩/预测/对比/PDF | 6 格式输出正确、压缩比准确性、Worker 并行 |
| 变换层 | 批量缩放/裁剪/旋转 | 所有文件输出一致、EXIF 方向保留 |
| 叠加层 | 水印（文字/图片/平铺/对角线） | 位置准确、透明度、渲染一致性 |
| 组织层 | 重命名/高级重命名/ZIP | 模板变量替换、冲突处理、ZIP 完整性 |

---

<a id="sec-2"></a>
## 二、测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试（算法） | Vitest | 格式转换参数/重命名规则/水印坐标/压缩预测 | 45% |
| 单元测试（队列） | Vitest | 并发控制/失败重试/取消/进度 | 20% |
| 集成测试 | Vitest + 测试图片 | 端到端批量处理流程 + Worker 通信 | 30% |
| 端到端 | 手动验证 | 真实批量处理场景 | 5% |

---

<a id="sec-3"></a>
## 三、单元测试 — 格式转换与压缩

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-FC-01 | PNG→JPEG | 800×600 PNG 图片 | JPEG blob，MIME=`image/jpeg` |
| UT-FC-02 | PNG→WebP（Chrome 85+） | 800×600 PNG | WebP blob，MIME=`image/webp` |
| UT-FC-03 | PNG→JPEG 透明填充 | 半透明 PNG | 背景填充为白色（alpha→255） |
| UT-FC-04 | 6 格式全部可用 | 同一图片转 6 种格式 | 6 个 blob 非空，MIME 正确 |
| UT-CP-01 | JPEG 质量 90 → 大小 < 原图 | 1MB JPEG 图片 | `compressedSize < originalSize` |
| UT-CP-02 | 质量 10 → 大小 << 质量 90 | 同一图片 | `size(quality=10) < size(quality=90)` |
| UT-CP-03 | EXIF 保留 | JPEG→JPEG，preserveExif=true | EXIF 字段不丢失 |
| UT-CP-04 | 元数据剥离 | stripMetadata=true | EXIF/XMP/ICC 全部移除 |
| UT-PR-01 | 压缩预测误差 < 5% | 采样 3 点(30/60/90) + Catmull-Rom 插值 | 实际大小 vs 预测大小 < 5% |
| UT-PR-02 | 格式推荐 | 图片含大面积纯色 | 推荐 PNG；含照片 → 推荐 JPEG |
| UT-PD-01 | 图片→PDF 单页 | 1 张图片 | PDF 1 页，输出可解析 |
| UT-PD-02 | 图片→PDF 多页 | 5 张图片 | PDF 5 页 |

---

<a id="sec-4"></a>
## 四、单元测试 — 重命名与水印

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-RN-01 | 前缀 + 编号 | `img001.jpg` → 前缀"vacation_" + 3位编号 | `vacation_001.jpg` |
| UT-RN-02 | 日期变量 | 文件 EXIF 日期 2026-09-15 | 文件名含 `2026-09-15` |
| UT-RN-03 | EXIF fallback | 无 EXIF → File.lastModified | 使用 lastModified 日期 |
| UT-RN-04 | 三级 fallback | 无 EXIF + 无 lastModified | 使用 Date.now() |
| UT-RN-05 | 冲突检测 | `img.jpg` → `img.jpg`（冲突） | 重命名为 `img_1.jpg` |
| UT-RN-06 | 查找替换 | `IMG_001.jpg` → 删除"IMG_" | `001.jpg` |
| UT-WM-01 | 九宫格位置 | 位置="topLeft" | 水印左上角坐标 = (margin, margin) |
| UT-WM-02 | 平铺模式 | 水印 100×50，画布 400×200 | 4×4 = 16 个水印（覆盖全部） |
| UT-WM-03 | 对角线水印 | 角度 30° | 水印旋转 30° |
| UT-WM-04 | 透明度 50% | 半透明水印 | 水印区域 alpha < 255 |

---

<a id="sec-5"></a>
## 五、单元测试 — 批量队列

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-BQ-01 | 并发控制 | concurrency=2，5 个任务 | 同时运行 ≤ 2 个 |
| UT-BQ-02 | 部分失败不中断 | 5 任务中第 3 个失败 | 其余 4 个完成，failed 列表含第 3 个 |
| UT-BQ-03 | 取消后保留已完成 | 5 任务中 cancel 在第 3 个完成后 | completed 含前 3 个结果，cancelled=true |
| UT-BQ-04 | 重试失败项 | maxRetries=1，首次失败 | 自动重试 1 次 |
| UT-BQ-05 | 进度回调 | 5 任务 | completed 从 0→5 依次递增 |
| UT-BQ-06 | 处理速度计算 | 5 任务耗时 500ms | items/s ≈ 10 |

---

<a id="sec-6"></a>
## 六、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-BT-01 | 完整批量流程 | 添加 10 张图片 → 格式转换 JPEG q=80 → Worker 并行处理 → 进度条更新 → ZIP 下载 |
| IT-BT-02 | 批量缩放 + 水印 + 重命名 | 10 张图片 → 缩放到 50% → 添加文字水印 → 重命名 → 全部完成 |
| IT-BT-03 | Worker 并行压缩 | 8 张 1080p → 压缩 WebP q=80 | 4 Worker 并行，总时间 < 串行的 1/3 |
| IT-BT-04 | 大文件处理 | 10 张 4K 图片 → 缩放到 1080p | 无 OOM，完成后 ImageData 已释放 |
| IT-BT-05 | PDF 导出多页 | 5 张图片 → PDF A4 横版 | PDF 可打开，5 页，图片缩放适配 |
| IT-BT-06 | ZIP 打包完整性 | 10 张处理后的图片 → ZIP | ZIP 可解压，10 个文件，文件名正确 |

---

<a id="sec-7"></a>
## 七、性能验收测试

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|------|
| PT-01 | PNG→JPEG q=80（1080p，单张） | < 100ms | `performance.now()` |
| PT-02 | PNG→WebP（1080p，单张） | < 200ms | `performance.now()` |
| PT-03 | Worker 池 4 并行压缩 10 张 | < 串行时间的 40% | 计时对比 |
| PT-04 | 10 张 4K → 缩放 1080p | < 2s | 批量完成时间 |
| PT-05 | 压缩预测（3 点采样，单张） | < 500ms | 3 次压缩 + 插值时间 |
| PT-06 | ZIP 打包 10 张图片 | < 2s | JSZip 完成时间 |

---

<a id="sec-8"></a>
## 八、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 批量处理崩溃 | Worker 池导致浏览器标签页卡死 |
| S1 — 严重 | 核心功能错误 | 格式转换后图片损坏、ZIP 文件解压失败 |
| S2 — 一般 | 单个工具异常 | 水印位置偏移 > 10px、EXIF fallback 逻辑跳级 |
| S3 — 轻微 | 体验问题 | 进度条未实时更新、取消后进度残留 |
| S4 — 建议 | 优化 | Worker 预热、压缩预测曲线平滑度 |

---

<a id="sec-9"></a>
## 九、自动化现状

| 模块 | 状态 | 用例数 | 说明 |
|------|------|--------|------|
| 格式转换/压缩 | 待扩展 | 当前 4，目标 10 | 6 格式全覆盖 + EXIF 保留 |
| 重命名规则 | 待实施 | 0 → 6 | 纯字符串操作 |
| 水印坐标 | 待实施 | 0 → 4 | 纯坐标计算 |
| 批量队列 | 待实施 | 0 → 6 | mock 任务 |
| 集成测试 | 待实施 | 0 → 6 | 需 Worker mock |
| 性能基准 | 待实施 | 6 | Vitest timer mock |

### 阻塞项

| # | 阻塞项 | 影响 | 解除条件 |
|---|--------|------|---------|
| 1 | Worker 环境 mock | Worker 相关测试无法执行 | `vitest-webworker` 或 pool: 'threads' |
| 2 | Canvas API mock | 格式转换/水印需 Canvas context | `vitest-canvas-mock` |
| 3 | AVIF 编码 polyfill 未集成 | AVIF 测试需 Chrome 85+ 原生支持 | CI 使用 Chrome 85+ |

---