---
doc_type: test
title: "M06: 图片转换与导出 — 测试用例"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-M06"
source_prds: ["06-功能实现-图片转换与导出工具"]
source_modules: ["06-prd-task-图片转换与导出工具"]
source_okr: [yipet-004]
---

# M06: 图片转换与导出 — 测试用例

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CV-01 | PNG→JPEG | MIME=image/jpeg, 无透明通道 |
| UT-CV-02 | PNG→WebP | MIME=image/webp, 文件 < 原 PNG |
| UT-CV-03 | PNG→AVIF（Chrome 85+） | MIME=image/avif |
| UT-CV-04 | AVIF 不支持降级 | Firefox → 选项隐藏 |
| UT-CV-05 | 1x 导出 | 尺寸 = 原始尺寸 |
| UT-CV-06 | 2x 导出 | 尺寸 = 原始 ×2 |
| UT-CV-07 | 质量 50 vs 100 | size(50) < size(100) |
| UT-CV-08 | EXIF 保留 | JPEG→JPEG preserve EXIF |
| UT-CV-09 | EXIF 移除 | stripMetadata → 无 EXIF 数据 |
| UT-CV-10 | 灰度导出 | RGB→灰度，R=G=B |

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 格式转换后图片损坏/无法打开 |
| S2 — 一般 | EXIF 保留模式丢失 GPS 数据 |

---