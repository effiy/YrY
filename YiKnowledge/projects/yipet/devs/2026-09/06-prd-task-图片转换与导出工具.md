---
doc_type: module
prd_task_id: "YP-M06"
title: "YP-M06: 图片转换与导出工具 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 1.4
source_prd: "06-功能实现-图片转换与导出工具.md"
source_okr: [yipet-004]
related_tests: ["06-prd-test-图片转换与导出工具"]
---

# YP-M06: 图片转换与导出工具 — 开发方案

> 来源 PRD：[06-功能实现-图片转换与导出工具.md](../../prds/2026-09/06-功能实现-图片转换与导出工具.md)
> 需求编号：M06 · 人天：1.4d · 状态：已完成
> 测试方案：[06-prd-test-图片转换与导出工具.md](../../tests/2026-09/06-prd-test-图片转换与导出工具.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

图片转换与导出管线：源图片 → Canvas 渲染 → 格式/尺寸/质量参数 → toBlob → 下载/复制。支持 6 种输出格式、多级导出尺寸、EXIF 元数据控制、色彩空间选择。

### 文件清单

```
YiPet/src/imageEditor/
├── export/
│   ├── formatConverter.ts     # 格式转换引擎（PNG/JPEG/WebP/AVIF/BMP/SVG）
│   ├── sizeSelector.ts        # 导出尺寸（原始/1-3x/百分比/预设）
│   ├── qualityController.ts   # 质量控制（滑块 + 预览大小）
│   ├── metadataHandler.ts     # EXIF/IPTC 保留/移除/编辑
│   └── colorProfile.ts        # 色彩空间（sRGB/AdobeRGB/灰度）
├── components/
│   └── ExportDialog.vue       # 导出对话框
```

## 二、关键技术决策

### D-01：SVG 导出通过 Canvas→toDataURL 封装

浏览器不支持 SVG 的 `toBlob`。通过 `Canvas.toDataURL("image/svg+xml")` → Blob 转换实现，限制：仅支持矢量图形的 SVG（非位图嵌入）。

### D-02：AVIF 编码仅在 Chrome 85+ 支持

AVIF `toBlob("image/avif")` 在 Chrome 85+ 可用。Firefox/Safari 通过功能检测自动隐藏 AVIF 选项：`canvas.toBlob(()=>{}, "image/avif")` 检测回调是否触发。

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 6 格式转换引擎 | 0.3 |
| 2 | 多级导出尺寸 + 质量控制 | 0.3 |
| 3 | EXIF 元数据处理 | 0.2 |
| 4 | 色彩空间选择 + SVG 支持 | 0.2 |
| 5 | ExportDialog 组件 | 0.2 |
| 6 | 集成测试 | 0.2 |

**总计：1.4d**

## 四、实现完成记录

> **完成日期**：2026-09-10 · **状态**：已完成

### 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 导出引擎 | 5 | formatConverter/sizeSelector/qualityController/metadataHandler/colorProfile |
| 组件 | 1 | ExportDialog |
| **合计** | **6** | |

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | SVG 导出仅支持矢量 | P3 | 位图嵌入 SVG 导出为空白 | 待实施 |
| 2 | CMYK 色彩空间 | P3 | Canvas 仅支持 RGB，CMYK 需客户端转换 | 待评估 |

---