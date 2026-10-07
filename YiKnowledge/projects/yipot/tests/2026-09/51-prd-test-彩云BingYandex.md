---

doc_type: test
title: "彩云小译/Bing/Yandex 翻译 — 测试方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["29-prd-彩云BingYandex翻译"]
source_modules: ["23-prd-task-彩云BingYandex翻译"]

type: test
---

# 彩云小译/Bing/Yandex 翻译 — 测试方案

## 核心功能测试

### 彩云小译

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CY-01 | 中译英 | "你好世界" zh→en | 返回英文翻译 |
| TC-CY-02 | 英译中 | "Hello" en→zh | 返回中文翻译 |
| TC-CY-03 | 日译中 | "こんにちは" ja→zh | 返回日译中翻译 |
| TC-CY-04 | Token 认证 | 配置有效 Token | 翻译正常 |
| TC-CY-05 | Token 错误 | 配置无效 Token | 显示 "Token 无效" |
| TC-CY-06 | 实时翻译 API | 翻译中等长度文本 | 流式或快速返回 |

### Bing 翻译

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-BY-10 | 中译英 | "你好世界" zh→en | 返回英文翻译 |
| TC-BY-11 | 英译中 | "Hello" en→zh | 返回中文翻译 |
| TC-BY-12 | 小语种翻译 | 翻译冰岛语/泰语 | 小语种翻译正常 |
| TC-BY-13 | Azure API Key 认证 | 配置有效 Azure Key + Region | 翻译正常 |
| TC-BY-14 | Region 错误 | 配置错误 Region | 提示 "Region 无效" |
| TC-BY-15 | 100+ 语言 | 遍历支持列表 | 每种可用语言正确翻译 |

### Yandex 翻译

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-YX-20 | 英译俄 | "Hello" en→ru | 返回俄语翻译 (俄语质量最佳) |
| TC-YX-21 | 俄译英 | "Привет" ru→en | 返回英文翻译 |
| TC-YX-22 | 中译俄 | "你好" zh→ru | 返回俄语翻译 |
| TC-YX-23 | API Key 认证 | 配置有效 Yandex Key + Folder ID | 翻译正常 |
| TC-YX-24 | API Key 错误 | 配置无效 Key | 提示 "API Key 无效" |
| TC-YX-25 | 90+ 语言 | 遍历支持列表 | 每种可用语言正确翻译 |

### 独立控制

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-MX-30 | 彩云启用/禁用 | 切换彩云 enable=false | 彩云不参与翻译请求 |
| TC-MX-31 | Bing 启用/禁用 | 切换 Bing enable=false | Bing 不参与翻译请求 |
| TC-MX-32 | Yandex 启用/禁用 | 切换 Yandex enable=false | Yandex 不参与翻译请求 |
| TC-MX-33 | 仅启用一个 | 两个禁用，一个启用 | 仅启用的服务参与翻译 |

## 增强边界与异常测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-MX-E01 | 三个服务全禁用 | 彩云/Bing/Yandex enable=false | 翻译列表不显示这三个 | P1 |
| TC-MX-E02 | 三个服务全错误 Key | 三个都配错误 Key | 各自提示错误，降级到正常服务 | P1 |
| TC-MX-E03 | 彩云 Token 过期 | 过期 Token | 提示 Token 过期 | P1 |
| TC-MX-E04 | Azure 免费层配额 | 月 200 万字符用完 | 提示配额耗尽 | P1 |
| TC-MX-E05 | Yandex Folder ID 缺失 | 仅配 Key 无 Folder ID | 提示需要 Folder ID | P1 |
| TC-MX-E06 | 彩云单次请求过长 | 5000 字符 | 按 API 限制处理 | P1 |
| TC-MX-E07 | Bing HTML 实体处理 | 翻译含 `&amp;` 文本 | 正确转义/反转义 | P2 |
| TC-MX-E08 | 服务响应超时 | 任一服务 5s 无响应 | 该服务超时提示，其他正常 | P1 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-MX-P01 | 彩云短文本 | P50/P95 | ≤ 300/600ms | > 600/1200ms | 30 次 |
| TC-MX-P02 | Bing 短文本 | P50/P95 | ≤ 200/500ms | > 400/1000ms | 30 次 |
| TC-MX-P03 | Yandex 短文本 | P50/P95 | ≤ 300/600ms | > 600/1200ms | 30 次 |
| TC-MX-P04 | 三服务并行 | P50/P95 | ≤ 500/1000ms | > 1000/2000ms | 20 次 |
| TC-MX-P05 | 启用/禁用切换 | 切换延迟 | ≤ 10ms | > 50ms | 20 次 |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-MX-S01 | 三服务 Key 加密存储 | 检查配置文件 | 所有 Key 为密文 | P0 |
| TC-MX-S02 | Key 不写日志 | 检查日志 | 日志不含任何 Key 明文 | P0 |
| TC-MX-S03 | Azure Key 不泄露 | 请求抓包 | Key 在请求头中通过 HTTPS | P1 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-MX-01 | 彩云中英互译 | 彩云翻译 | 否 | P1 |
| REG-MX-02 | Bing 翻译 | Bing 翻译 | 否 | P1 |
| REG-MX-03 | Yandex 英俄互译 | Yandex 翻译 | 否 | P1 |
| REG-MX-04 | 独立启用/禁用控制 | 服务管理 | 否 | P1 |
| REG-MX-05 | API Key 错误独立提示 | 错误处理 | 否 | P1 |
| REG-MX-06 | 三服务并行翻译 | 集成调度 | 否 | P1 |
| REG-MX-07 | 配置持久化重启验证 | 配置持久化 | 否 | P1 |

## 参考文档

- [彩云BingYandex翻译 PRD](../../prds/2026-09/29-prd-彩云BingYandex翻译.md)
- [翻译服务接口测试](04-prd-test-翻译服务接口.md)
- [阿里腾讯火山翻译测试](52-prd-test-阿里腾讯火山.md)