---

doc_type: test
title: "外部调用与 HTTP 服务 — 测试方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["10-prd-外部调用与HTTP服务"]
source_modules: ["10-prd-task-外部调用与HTTP服务"]

type: test
---

# 外部调用与 HTTP 服务 — 测试方案

> **文档职责**：本文档定义本地 HTTP 服务 (tiny_http port 60828)、CLI 命令行调用、外部脚本集成、Alfred/Raycast/VSCode 工作流的完整验证方案。

---

## 测试分层

| 层级 | 工具 | 覆盖 |
|------|------|------|
| L1 单元 | Rust cargo test | tiny_http server 启动/停止、CLI 参数解析 |
| L2 集成 | Vitest + Tauri mock | HTTP API 端点请求/响应、并发处理 |
| L3 E2E | 手动测试 (curl + shell scripts) | 完整 HTTP 调用链路、CLI 批量翻译 |
| L4 工作流集成 | 手动测试 | Alfred/Raycast workflow、VSCode 插件 |

---

## 一、HTTP 服务核心用例

### TC-HTTP-01: 服务启动与端口绑定

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 启动 Pot | ≤ 200ms HTTP 服务监听 127.0.0.1:60828 |
| 2 | 执行 `curl http://127.0.0.1:60828/translate` | 服务正常响应 |
| 3 | 执行 `netstat -an | grep 60828` | 仅绑定 127.0.0.1，不绑定 0.0.0.0 |
| 4 | 从其他设备访问 | 外部设备无法连接 |

### TC-HTTP-02: /translate 端点

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `curl -X POST localhost:60828/translate -H "Content-Type: application/json" -d '{"text":"hello","from":"en","to":"zh"}'` | 返回 `{"text":"你好","from":"en","to":"zh"}` |
| 2 | 测量 50 次 P95 响应时延 | ≤ 1s |
| 3 | 发空 body 的 POST | 返回 400 `{"error": "empty body"}` |
| 4 | 发送缺少 text 字段 | 返回 400 `{"error": "missing 'text' field"}` |

### TC-HTTP-03: /selection_translate 端点

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 在浏览器选中文本 "Hello World" | — |
| 2 | `curl -X POST localhost:60828/selection_translate` | Pot 弹出翻译窗口，显示当前选中文本翻译 |
| 3 | 无选中文本时调用 | 提示"未检测到选中文本" |

### TC-HTTP-04: /ocr_recognize 端点

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `curl -X POST "localhost:60828/ocr_recognize?screenshot=true"` | 进入截图模式 |
| 2 | 框选文字区域确认 | OCR 识别结果通过 HTTP 返回 |

---

## 二、并发与限流用例

### TC-CONCUR-01: 并发请求处理

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `ab -n 100 -c 10 http://127.0.0.1:60828/translate` | 所有请求正常排队处理，≥ 10 QPS |
| 2 | 超出 10 并发限制时 | 返回 429 `{"error": "too many requests"}` |

### TC-CONCUR-02: HTTP 请求不阻塞 UI

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 发送一个耗时翻译请求 (微奥 timeout) | — |
| 2 | 同时操作 Pot GUI (打开设置页) | UI 响应流畅，无卡顿 |

---

## 三、端口冲突与错误处理

### TC-PORT-01: 端口被占用

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 使用另一个进程占用 60828 端口 | — |
| 2 | 启动 Pot | ≤ 1s 提示"端口已被占用，请更换端口" |
| 3 | 设置页修改端口为 60829 | — |
| 4 | 重启 Pot 或重新绑定 | 新端口正常监听 |
| 5 | `curl localhost:60829/translate` | 正常响应 |

### TC-ERR-01: 翻译服务均不可用

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 禁用所有翻译服务 (无 API Key) | — |
| 2 | `curl -X POST localhost:60828/translate -d '...'` | 返回 503 `{"error": "all services unavailable"}` |

---

## 四、CLI 命令行调用用例

### TC-CLI-01: 基本 CLI 翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `pot translate "Hello World" --from en --to zh` | 返回 "你好世界" (stdout) |
| 2 | 测量冷启动+P95 响应 | ≤ 2s |

### TC-CLI-02: CLI 参数校验

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `pot translate` (缺少 text) | 打印 usage 帮助信息到 stderr |
| 2 | `pot translate "text" --unknown-flag` | 打印"未知参数: --unknown-flag" + usage |
| 3 | `pot --help` | 打印完整帮助信息 |

### TC-CLI-03: CLI Shell 管道

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `echo "hello" | xargs pot translate --from en --to zh` | 返回 "你好" |
| 2 | `pot translate "hello" --from en --to zh | tee result.txt` | result.txt 内容为 "你好" |

---

## 五、外部工作流集成用例

### TC-WF-01: Alfred Workflow 集成

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | Alfred 输入 `tr Hello World` | — |
| 2 | workflow 调用 `POST localhost:60828/translate` | 翻译结果显示在 Alfred 列表 |
| 3 | 点击结果 | 复制翻译结果到剪切板 |

### TC-WF-02: VSCode 插件集成

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | VSCode 中选中代码注释 | — |
| 2 | 插件调用 `/selection_translate` | Pot 翻译窗口弹出，不影响 VSCode 焦点 |
| 3 | 翻译窗口关闭 | 焦点回到 VSCode |

---

## 六、边界与异常测试

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-02 | HTTP 请求 body 为空 | `curl -X POST ...` 无 body | 返回 400 `{"error": "empty body"}` | — |
| TC-ERR-03 | 请求参数缺失 text | body 仅含 `{"from":"en","to":"zh"}` | 返回 400 `{"error": "missing 'text' field"}` | — |
| TC-ERR-04 | HTTP 请求超时 | 设置极短超时 | 返回 408 `{"error": "request timeout"}` | — |
| TC-ERR-05 | CLI 未知参数 | `pot translate --unknown` | 打印"未知参数: --unknown" + usage | — |
| TC-ERR-06 | 窗口已打开时外部调用 | HTTP 调用 input_translate 时窗口已存在 | 复用已有窗口，不创建新窗口 | — |

---

## 七、安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | HTTP 仅回环绑定 | netstat 检查 | 仅 127.0.0.1:60828，无 0.0.0.0 | P0 |
| TC-SEC-02 | 外部设备无法连接 | 从同一局域网其他设备访问 | 连接被拒绝 | P0 |
| TC-SEC-03 | 不暴露配置/Key API | 扫描所有 HTTP 端点 | 仅翻译/OCR 端点，无配置管理端点 | P0 |
| TC-SEC-04 | CLI 输出不泄漏 Key | CLI 翻译输出 stdout | 仅返回翻译文本，无 API Key 信息 | P1 |

---

## 八、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | HTTP 服务启动时间 | 启动到端口监听 | ≤ 200ms | > 500ms | 启动计时 |
| TC-PERF-02 | /translate 端点响应 | P95 时延 | ≤ 1s | > 2s | curl 50 次 |
| TC-PERF-03 | HTTP 并发处理能力 | 吞吐量 | ≥ 10 QPS | < 5 QPS | ab/wrk 压测 |
| TC-PERF-04 | CLI 冷启动翻译 | 命令执行到结果 | ≤ 2s | > 4s | time 命令 |
| TC-PERF-05 | 端口冲突检测 | 占用检测 | ≤ 1s | > 2s | 端口占用测试 |

---

## 九、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-01 | HTTP 服务启动 + /translate 端点 | HTTP 服务 | 否 | P2 |
| REG-02 | 端口冲突检测 + 自定义端口 | 端口管理 | 否 | P2 |
| REG-03 | CLI translate 命令 | CLI 调用 | 否 | P2 |
| REG-04 | 并发请求处理 (10 QPS) | 并发能力 | 否 | P2 |
| REG-05 | HTTP 仅回环绑定安全检查 | 安全 | 否 | P0 |

---

## 参考文档

- [外部调用与 HTTP 服务 PRD](../../prds/2026-09/10-prd-外部调用与HTTP服务.md)
- [CLI 命令行 PRD](../../prds/2026-09/38-prd-CLI命令行.md)
- [构建发布与安全 PRD](../../prds/2026-09/11-prd-构建发布与安全.md)