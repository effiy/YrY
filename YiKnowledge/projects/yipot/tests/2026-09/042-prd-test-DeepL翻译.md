---

doc_type: test
title: "DeepL 翻译 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["20-prd-DeepL翻译"]
source_modules: ["15-prd-task-DeepL翻译"]

type: test
---

# DeepL 翻译 — 测试方案

## 核心功能测试

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-DL-01 | Free API 基本翻译 | 配置 Free API Key → "Hello" en→de | 返回德语翻译 "Hallo" |
| TC-DL-02 | Pro API 翻译 | 配置 Pro API Key → "Hello" en→fr | 使用 Pro endpoint，返回法语翻译 |
| TC-DL-03 | 中译英 | "你好世界" zh→en | 返回 "Hello World" |
| TC-DL-04 | 英译中 | "Good morning" en→zh | 返回 "早上好" |
| TC-DL-05 | 日译英 | "こんにちは" ja→en | 返回英文翻译 |
| TC-DL-06 | formality=prefer_more | 翻译 en→de (正式语体) | 使用 "Sie" 而非 "du" |
| TC-DL-07 | formality=prefer_less | 翻译 en→de (非正式语体) | 使用 "du" 而非 "Sie" |
| TC-DL-08 | formality=default | 翻译 en→de | 使用默认语体 |
| TC-DL-09 | HTML 标签保留 | 翻译 "<p>Hello</p>" en→de | 返回 "<p>Hallo</p>"，标签完整 |
| TC-DL-10 | XML 标签保留 | 翻译 "<title>Welcome</title>" | XML 标签保留在译文中 |
| TC-DL-11 | 30+ 语言支持 | 遍历支持的语言列表 | 每种语言对均返回翻译 |
| TC-DL-12 | 空 API Key | 未配置 API Key → 翻译 | 提示"请配置 DeepL API Key" |
| TC-DL-13 | 错误 API Key | 配置无效 Key | 显示 "DeepL API Key 无效" |
| TC-DL-14 | 配额耗尽 | 达到 Free 配额上限 | 显示"翻译额度已用完" |

## 增强边界与异常测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-DL-E01 | 空文本 | "" | 不发起请求 | P1 |
| TC-DL-E02 | 超长文本 | 5000+ 字符 | 正常翻译或返回截断提示 | P1 |
| TC-DL-E03 | 不支持的语言对 | zh→冰岛语 | 显示"不支持的语言方向" | P2 |
| TC-DL-E04 | 仅 HTML 标签 | "<div></div>" | 保留标签，翻译空内容 | P3 |
| TC-DL-E05 | 嵌套 HTML 标签 | "<div><p>Hello</p></div>" | 嵌套结构完整保留 | P2 |
| TC-DL-E06 | DeepL 服务不可用 | 模拟 503 响应 | 显示"DeepL 服务暂时不可用" | P1 |
| TC-DL-E07 | 网络超时 | 模拟超时无响应 | 显示超时提示，不阻塞 UI | P1 |
| TC-DL-E08 | Free/Pro endpoint 切换 | Free API 失败 → 切换 Pro | 自动检测 endpoint 类型 | P2 |
| TC-DL-E09 | formality 对不支持语言 | 对 en→zh 使用 formality | 忽略参数，正常翻译 | P2 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-DL-P01 | 短文本翻译 | P50/P95 | ≤ 200/500ms | > 400/1000ms | 50 次采样 |
| TC-DL-P02 | 长文本翻译 (1000 字符) | P50/P95 | ≤ 500/1000ms | > 1000/2000ms | 20 次采样 |
| TC-DL-P03 | HTML 文本翻译 | P50 | ≤ 400ms | > 800ms | 20 次采样 |
| TC-DL-P04 | Pro endpoint 响应 | P50 | ≤ 150ms | > 300ms | 50 次采样 |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-DL-S01 | API Key 加密存储 | 检查配置文件 | Key 为非明文 AES 加密存储 | P0 |
| TC-DL-S02 | API Key 不写日志 | 检查日志文件 | 日志中不含 API Key | P1 |
| TC-DL-S03 | HTTPS 强制 | 配置 HTTP endpoint | 拒绝连接或自动升级 HTTPS | P1 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-DL-01 | Free API 基本翻译 | 核心翻译 | 否 | P0 |
| REG-DL-02 | Pro API 翻译 | Pro endpoint | 否 | P1 |
| REG-DL-03 | formality 参数生效 | 高级参数 | 否 | P1 |
| REG-DL-04 | HTML 标签保留 | 标签处理 | 否 | P1 |
| REG-DL-05 | API Key 错误提示 | 错误处理 | 否 | P1 |
| REG-DL-06 | 多接口并行含 DeepL | 集成调度 | 否 | P0 |

## 参考文档

- [DeepL 翻译 PRD](../../prds/2026-09/20-prd-DeepL翻译.md)
- [翻译服务接口测试](004-prd-test-翻译服务接口.md)
- [Google 翻译测试](043-prd-test-Google翻译.md)