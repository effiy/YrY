---

doc_type: test
title: "生词本导出 — 测试方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["24-prd-生词本导出"]
source_modules: ["24-prd-task-生词本导出"]

type: test
---

# 生词本导出 — 测试方案

| 编号 | 用例 | 预期 |
|------|------|------|
| TC-COL-01 | 收藏词汇 | 本地保存成功 |
| TC-COL-02 | Anki 导出 | AnkiConnect 创建卡片 |
| TC-COL-03 | Anki 字段映射 | 自定义映射生效 |
| TC-COL-04 | 欧路词典 | URL Scheme 跳转 |
| TC-COL-05 | 删除收藏 | 列表更新 |
| TC-COL-06 | Anki 不可用 | 友好提示 |

## 边界测试

| 场景 | 预期 |
|------|------|
| AnkiConnect 未启动 | 提示启动 Anki |
| 重复收藏 | 去重提示 |
| 空收藏列表 | 显示空状态 |
| 超大量词汇 (1000+) | 逐条添加 | 性能不劣化，< 10条/s |
| AnkiConnect 返回异常 JSON | 优雅降级 | 提示"Anki 响应异常" |
| 欧路词典未安装 | 提示安装 | "未检测到欧路词典" |
| 单条词汇最大长度 (5000 字符) | 正常添加 | 不截断 |
| 快速连续导出（10 次/秒） | 排队处理 | 不丢数据、不重复 |
| 网络端口 8765 被占用（非 Anki） | 检测响应格式 | 提示"端口 8765 非 Anki 服务" |

## 性能基准测试

| 场景 | 测试方法 | 基准 |
|------|----------|------|
| 单条词汇 Anki 导出 | `addNote` API 调用完成 | < 200ms |
| 100 条词汇 Anki 批量导出 | `addNotes` API 调用完成 | < 2s |
| 欧路 Scheme 跳转 | `window.open` 调用到应用响应 | < 500ms |
| 收藏列表渲染（500 条） | React 虚拟列表渲染 | < 50ms |
| 去重检测（1000 条已有词汇） | `findNotes` 批量查询 | < 1s |

## 回归测试清单

- [ ] 收藏词汇本地存储持久化正常
- [ ] Anki 导出字段映射（Front/Back）正确
- [ ] 欧路词典 URL Scheme 正确编码中文
- [ ] 重复收藏无重复卡片
- [ ] AnkiConnect 未启动时友好提示
- [ ] 删除收藏后列表即时更新