---
doc_type: prd
title: 外部调用与 HTTP 服务 — 需求规格
tags:
- 需求文档
- HTTP服务
- 外部调用
- API
- 本地服务
category: 项目/桌面应用/需求
created: '2026-09-23'
updated: '2026-09-23'
source: 内部
type: 需求
status: 已完成
priority: 中
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: '202609'
prd_task_id: YP-09-M12
estimate_frontend: 2
review_status: 已发布
issue_type: 功能
roles: [engineer, qa]
---

# 外部调用与 HTTP 服务 — 需求规格

> 需求编号：YP-09-M12 · 优先级：P2 · 人天：~2d

---

## 一、本地 HTTP 服务

### 1.1 服务概述

YiPot 内置轻量 HTTP 服务（基于 `tiny_http`），允许其他应用通过 HTTP 调用 Pot 的翻译/OCR 功能。

- **默认端口**: `60828`
- **绑定地址**: `127.0.0.1`（仅本地访问）
- **启动时机**: 应用启动时自动开启

### 1.2 API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/translate` | POST | 翻译文本 |
| `/selection_translate` | POST | 划词翻译（先取选中文本） |
| `/input_translate` | POST | 输入翻译（打开翻译窗口） |
| `/ocr_recognize` | POST | 截图 OCR 识别 |
| `/ocr_translate` | POST | 截图翻译 |
| `/config` | POST | 打开配置窗口 |

### 1.3 请求/响应格式

**翻译请求**:
```
POST /translate
Body: {"text": "hello world", "from": "en", "to": "zh"}
Response: {"text": "你好世界", "from": "en", "to": "zh"}
```

**OCR 请求**:
```
POST /ocr_recognize?screenshot=true
→ 触发截图 → OCR 识别 → 返回文字
```

---

## 二、命令行调用

### 2.1 命令行参数 (`cmd.rs`)

支持通过 CLI 参数调用 Pot 功能，用于脚本/工作流集成。

### 2.2 使用场景

- Alfred / Raycast 工作流集成
- Shell 脚本批量翻译
- 自动化文本处理流水线

---

## 三、插件安装

### 3.1 插件安装命令

```rust
#[tauri::command]
fn install_plugin(...) // 安装第三方服务插件
```

### 3.2 插件格式

- 插件文件: JSON 描述 + JS 实现
- 安装方式: 拖拽到设置页 / 命令行安装

---

## 四、验收标准

- [ ] HTTP 服务启动后端口可用
- [ ] `/translate` 端点返回正确翻译
- [ ] 端口冲突时提示更换
- [ ] 外部调用不阻塞 UI
- [ ] 命令行参数无歧义

---

## 用户画像与使用场景

### 典型用户

| 画像 | 角色 | 核心诉求 | 使用频率 |
|------|------|---------|---------|
| 自动化脚本开发者 | 编写 Shell/Python 脚本批量翻译文本 | 通过 HTTP API 或 CLI 调用 Pot 翻译能力 | 批量任务时高频 |
| Alfred/Raycast 用户 | 使用 macOS 效率启动器的专业用户 | 通过 workflow 快速调用 Pot 翻译 | 日均 5+ 次 |

### 使用场景

1. **批量文档翻译脚本**: 开发者有 100 个英文 Markdown 文件需要翻译标题 → CLI 调用: `pot translate "Hello World" --from en --to zh` → 期望: 返回翻译结果字符串，可用管道串联
2. **Alfred Workflow**: 用户输入 `tr Hello World` → Alfred workflow → HTTP POST `localhost:60828/translate` → 期望: 翻译结果显示在 Alfred 列表中
3. **VSCode 插件集成**: 开发者在 VSCode 中选中代码注释 → 插件调用 HTTP `/selection_translate` → 期望: Pot 弹出翻译窗口，不影响 VSCode 焦点
4. **本地服务端口绑定**: 用户 60828 端口被占用 → 提示更换端口 (如 60829) → 期望: 所有 HTTP 调用自动使用新端口

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | HTTP 服务启动时间 | ≤ 200ms（应用启动后） | 启动到端口监听计时 | P2 |
| AC-02 | `/translate` 端点响应 | ≤ 1s（含翻译） | curl 计时 50 次取 P95 | P2 |
| AC-03 | HTTP 服务并发能力 | ≥ 10 QPS（并发请求） | ab/wrk 压测 | P2 |
| AC-04 | CLI 命令响应时间 | ≤ 2s（冷启动，含翻译） | time 命令计时 | P2 |
| AC-05 | 端口冲突检测 | ≤ 1s 提示端口不可用 | 端口占用测试 | P2 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| HTTP 请求 body 为空 | 边界 | 返回 400 `{"error": "empty body"}` | — |
| HTTP 请求参数缺失 text | 边界 | 返回 400 `{"error": "missing 'text' field"}` | — |
| 端口被占用 | 异常 | 提示"端口 60828 已被占用，请更换端口" | 允许自定义端口 |
| HTTP 请求超时 | 异常 | 返回 408 `{"error": "request timeout"}` | — |
| 翻译请求时翻译服务均不可用 | 异常 | 返回 503 `{"error": "all services unavailable"}` | — |
| CLI 参数缺少必填项 | 边界 | 打印 usage 帮助信息 | — |
| CLI 未知参数 | 边界 | 打印"未知参数: xxx"，打印 usage | — |
| 外部调用 while 窗口已打开 | 边界 | 复用已有窗口，不创建新窗口 | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 安全 | HTTP 绑定地址 | 仅 127.0.0.1（禁止 0.0.0.0） | 代码审查 + netstat 检查 |
| 安全 | 无认证端点风险 | 仅暴露翻译/OCR，不暴露配置/Key | API 端点审查 |
| 性能 | HTTP 请求队列 | 最多 10 个并发，超出返回 429 | 压力测试 |
| 可用性 | HTTP 服务不影响 UI | 非阻塞异步处理 | 主线程监测 |
| 兼容性 | CLI 输出格式 | 纯文本 stdout，错误到 stderr | 脚本集成测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | Rust tiny_http server | Rust spawn | HTTP request/response |
| 依赖 | Rust cmd 模块 | CLI args parse | argv → action |
| 依赖 | 翻译/OCR 核心模块 | 内部 API | 文本/图片 → 翻译/识别结果 |
| 被依赖 | 外部应用 (Alfred/Raycast/VSCode) | HTTP / CLI | JSON / 纯文本 |

---

## API 速率限制与安全策略

### 请求速率限制 (Rate Limiting)

| 端点 | 限制策略 | 限制值 | 超出后行为 |
|------|---------|--------|-----------|
| `/translate` | Token Bucket | 30 req/min | 返回 429 + Retry-After 头 |
| `/selection_translate` | Token Bucket | 20 req/min | 返回 429 |
| `/input_translate` | Token Bucket | 10 req/min | 返回 429 |
| `/ocr_recognize` | Token Bucket | 10 req/min（含截图） | 返回 429 |
| `/ocr_translate` | Token Bucket | 10 req/min（含截图+翻译） | 返回 429 |
| `/config` | Token Bucket | 5 req/min | 返回 429 |
| 全局限制 | 并发连接数 | 最多 5 并发 | 返回 429 |

### 安全端点清单

| 安全措施 | 现状 | 风险等级 | 建议 |
|---------|------|---------|------|
| 仅绑定 127.0.0.1 | 已实现 | 低 | 维持现状 |
| 无认证端点 | 所有端点无需认证 | 中 | 本地服务场景可接受，不对外暴露 |
| 请求体大小限制 | 未明确限制 | 中 | 建议限制最大 10MB (OCR 图片场景) |
| CORS 配置 | 不适用 (非浏览器调用) | 无 | — |
| 请求日志 | 不记录请求内容 | 低 | 维持现状 |

### CLI 命令行参数矩阵

| 参数 | 简写 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| `--text` | `-t` | string | 翻译时是 | — | 待翻译文本 |
| `--from` | `-f` | string | 否 | auto | 源语言 (auto 自动检测) |
| `--to` | `-d` | string | 否 | zh | 目标语言 |
| `--service` | `-s` | string | 否 | 默认服务 | 指定翻译服务名 |
| `--ocr` | — | flag | 否 | — | 触发 OCR 识别模式 |
| `--screenshot` | — | flag | 否 | — | 先截图再 OCR |
| `--input` | — | flag | 否 | — | 打开翻译输入窗口 |
| `--config` | — | flag | 否 | — | 打开设置窗口 |
| `--port` | `-p` | number | 否 | 60828 | 指定 HTTP 服务端口 |
| `--help` | `-h` | flag | 否 | — | 显示帮助信息 |
| `--version` | `-v` | flag | 否 | — | 显示版本号 |

---

## 相关文档

- 开发方案: [10-prd-task-外部调用与HTTP服务](../../devs/2026-09/10-prd-task-外部调用与HTTP服务.md)
- 测试方案: [10-prd-test-外部调用与HTTP服务](../../tests/2026-09/10-prd-test-外部调用与HTTP服务.md)
- CLI 命令行: [38-prd-CLI命令行](./38-prd-CLI命令行.md)
- 构建发布与安全: [11-prd-构建发布与安全](./11-prd-构建发布与安全.md)