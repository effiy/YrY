---
doc_type: test
title: "YiPot 服务层与构建修复（第九轮）— 测试方案"
tags: [测试方案, 服务层, tts, collection, 构建修复]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-118
prd_ref: YP-09-72
dev_ref: YP-09-113
roles: [engineer]
---

# YiPot 服务层与构建修复（第九轮）— 测试方案

> 测试编号：YP-09-118 · 关联 PRD：YP-09-72 · 关联开发：YP-09-113

---

## 一、核心：构建验证

### TC-01: `pnpm build` 通过

| 项 | 内容 |
|-----|------|
| **步骤** | `cd YiPot && pnpm build` |
| **预期** | ✓ built successfully，无 TypeScript 语法错误 |

---

## 二、功能测试

### TC-02: TTS 语音播放

| 项 | 内容 |
|-----|------|
| **前置条件** | Lingva TTS 服务已配置 |
| **步骤** | 翻译结果窗口点击 TTS 播放 |
| **预期** | 音频正常播放，无 TypeError |

### TC-03: TTS config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 未配置 Lingva → 触发 TTS |
| **预期** | `requestPath` 使用默认值 `lingva.pot-app.com` |

### TC-04: TTS HTTP 错误

| 项 | 内容 |
|-----|------|
| **步骤** | 配置不可达的 TTS 服务器 |
| **预期** | throw `"TTS failed: ..."`，UI 显示错误提示 |

### TC-05: Anki 生词本导出

| 项 | 内容 |
|-----|------|
| **前置条件** | Anki Connect 运行中 |
| **步骤** | 翻译结果 → 添加到 Anki |
| **预期** | 生词本卡片创建成功，无 TypeError |

### TC-06: Eudic 生词本导出

| 项 | 内容 |
|-----|------|
| **步骤** | 翻译结果 → 添加到 Eudic |
| **预期** | 单词添加到 Eudic 生词本 |

### TC-07: History 数据统计面板

| 项 | 内容 |
|-----|------|
| **前置条件** | YiAi 后端运行 |
| **步骤** | 设置 → 历史 → 查看 Provider 健康状态 |
| **预期** | healthy/degraded/down 计数正确显示 |

---

## 三、回归测试

- 21 个翻译引擎各一次
- Tesseract/System OCR 各一次
- Anki/Eudic 生词本导出各一次

## 四、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/72-prd-服务层构建修复第九轮.md` |
| 开发方案 | `../devs/2026-09/113-prd-task-服务层构建修复第九轮.md` |