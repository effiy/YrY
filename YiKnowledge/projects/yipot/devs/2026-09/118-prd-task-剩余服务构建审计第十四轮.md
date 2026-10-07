---
doc_type: dev
title: "YiPot 剩余服务审计与构建审计（第十四轮）— 开发方案"
tags: [开发方案, 翻译引擎, 构建, config]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-118
prd_ref: YP-09-77
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot 剩余服务审计与构建审计（第十四轮）— 开发方案

> 开发编号：YP-09-118 · 关联 PRD：YP-09-77 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/translate/caiyun/index.jsx` | 修改 | config 默认值 `{}` |
| `src/services/translate/niutrans/index.jsx` | 修改 | config 默认值 `{}` |

---

## 二、基础设施审计（无代码修改）

| 文件 | 发现 |
|------|------|
| `patches/hyprland.patch` | Hyprland move listener 修复，已应用 |
| `updater/updater.mjs:37-39` | Linux ARM 平台 URL → darwin_aarch64（无运行时影响） |
| `.github/workflows/package.yml` | 标准 CI 流程 |

---

## 三、翻译引擎审计最终覆盖

| 深度审计 (15/21) | 浅审计/未审计 (6/21) |
|-----------------|---------------------|
| Google, Baidu, DeepL, OpenAI, YouDao, Ollama, Bing, ChatGLM, Gemini, Volcengine, Caiyun, Niutrans, TTS, Anki, Eudic | transmart, alibaba, tencent, bing_dict, cambridge_dict, lingva |

---

## 四、验证

```bash
cd YiPot && pnpm build
```

## 五、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/77-prd-剩余服务构建审计第十四轮.md` |
| 测试 | `../tests/2026-09/124-prd-test-剩余服务构建审计第十四轮.md` |