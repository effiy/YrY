---
doc_type: prd
title: "YP-09-S17: 有道翻译服务集成"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S17
estimate_frontend: 0.3
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 有道, 翻译]
category: 项目/桌面应用/需求
---

# YP-09-S17: 有道翻译服务集成

> 需求编号：YP-09-S17 · 优先级：P1 · 人天：0.3d · 状态：已完成

## 背景

有道翻译是国内老牌翻译服务，中英翻译质量稳定，提供词典释义和网络释义。

## 需求

- App Key + Secret 认证
- 支持中英日韩法德西等语言
- 返回译文 + 基本词典释义 + 网络释义

## 验收标准

- [ ] 中英互译正确
- [ ] 单词查询返回词典释义
- [ ] API Key 错误提示明确

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| App Key 格式无效 | 异常 | 提示"App Key 格式无效" | — |
| Secret 错误 | 异常 | 提示"Secret 验证失败" | — |
| 不支持的语言对 | 边界 | 提示"有道翻译不支持该语言对" | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | API 响应时间 | P95 ≤ 500ms | 100 次计时 |
| 安全 | App Key/Secret 存储 | AES-256 加密 | 磁盘检查 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | 有道翻译 API | HTTPS POST | `{q, from, to, appKey, sign}` |
| 依赖 | 插件配置存储 | Tauri config | App Key + 加密 Secret |
| 被依赖 | 划词翻译核心 | 插件接口 | `translate(text, from, to) → {text, explains}` |

---

## 相关文档

- 开发方案: [28-prd-task-有道翻译](../../devs/2026-09/28-prd-task-有道翻译.md)
- 测试方案: [28-prd-test-有道翻译](../../tests/2026-09/28-prd-test-有道翻译.md)
- 翻译服务接口全景: [05-prd-翻译服务接口全景](./05-prd-翻译服务接口全景.md)

---

## 量化验收标准

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 翻译响应时间 (P50) | < 500ms | fetch 计时，排除网络延迟 |
| 翻译响应时间 (P95) | < 1,200ms | fetch 计时，含网络 |
| 翻译准确率 (中→英) | BLEU > 0.40 | WMT 中英标准测试集 (100 条) |
| 翻译准确率 (英→中) | BLEU > 0.40 | WMT 英中标准测试集 (100 条) |
| 单词词典释义覆盖率 | >= 90% | CET-4/6 高频词表 (500 个) |
| 网络释义返回率 | >= 70% | 近期流行语/新词测试集 (50 个) |
| 签名算法正确率 | 100% | MD5(appKey+text+salt+secret)，连续 100 次 |
| AppKey 认证成功率 | 100% (有效 Key 对) | 冒烟测试 10 次 |
| 支持语言对数量 | >= 15 种 (中英日韩法德西葡俄阿泰越意) | 对照[有道翻译 API 文档](https://ai.youdao.com/docs/doc-trans-api.s) |
| salt 参数唯一性 | 每次请求 salt 不同 | 连续 1,000 次请求验证 |
| 音标返回 (单词查询) | 英文单词返回 IPA 音标 | 常用 100 个英文单词测试 |

## 有道错误码完整映射

| 错误码 | 含义 | 通用分类 | 用户提示 |
|--------|------|---------|---------|
| 0 | 成功 | — | — |
| 101 | 缺少必填参数 (q/from/to/appKey/salt/sign) | bad_request | "请求参数不完整" |
| 102 | 不支持的语言类型 | bad_request | "有道不支持该语言组合" |
| 103 | 翻译文本过长 | text_too_long | "文本过长，请分段翻译" |
| 104 | 不支持的 API 类型 | bad_request | "API 类型不支持" |
| 108 | appKey 无效 | unauthorized | "AppKey 无效，请检查" |
| 110 | 无相关服务的有效实例 | unauthorized | "未开通有道翻译服务" |
| 111 | 开发者账号无效 | unauthorized | "开发者账号无效" |
| 113 | q 不能为空 | bad_request | "翻译文本不能为空" |
| 202 | 签名检验失败 (sign 不匹配) | unauthorized | "签名验证失败，请检查 Secret" |
| 203 | 访问 IP 不在白名单 | unauthorized | "IP 不在白名单" |
| 301 | 词典查询失败 | dict_error | "词典查询失败" (仅日志，不阻断翻译) |
| 302 | 小语种翻译失败 | translation_error | "小语种翻译失败" (降级使用其他源) |
| 303 | 服务端断流 | server_error | "有道服务器异常" (自动重试) |
| 401 | 账户欠费 | quota_exhausted | "有道账户欠费，请充值" |
| 411 | 访问频率受限 | rate_limited | "请求过于频繁，请稍后重试" |
| 412 | 长文本翻译频率超限 | rate_limited | "长文本请求过于频繁" |

### 有道语言代码映射

```
有道支持的翻译方向 (按 API 文档):
  源语言 (from):  zh-CHS, zh-CHT, en, ja, ko, fr, de, es, pt, ru, ar, th, vi, it
  目标语言 (to): 同上

内部 → 有道映射:
  zh → zh-CHS (简体中文), zh-TW → zh-CHT (繁体中文)
  en → en, ja → ja, ko → ko
  fr → fr, de → de, es → es, pt → pt, ru → ru
  ar → ar, th → th, vi → vi, it → it

不支持的语言 (如: nl, pl, sv, cs, hu, bg, ...):
  → 翻译时不包含在有道语言列表中
```