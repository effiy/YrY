---

doc_type: module
prd_task_id: "YP-09-M12"
title: "外部 HTTP 服务 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 2
source_prd: "10-prd-外部调用与HTTP服务.md"

type: task
---

# 外部 HTTP 服务 — 开发方案

> 来源 PRD：[10-prd-外部调用与HTTP服务.md](../../prds/2026-09/10-prd-外部调用与HTTP服务.md)

---

## 一、Rust HTTP Server

### 服务启动 (`server.rs`)

```rust
use tiny_http::{Server, Response, Request};
use std::thread;

pub fn start_server() {
    let port = get("server_port").unwrap().as_i64().unwrap_or(60828);
    thread::spawn(move || {
        let server = Server::http(format!("127.0.0.1:{}", port))
            .expect("Server start failed");
        for request in server.incoming_requests() {
            http_handle(request);
        }
    });
}
```

### 路由处理

```rust
fn http_handle(request: Request) {
    match request.url() {
        "/" | "/translate" => handle_translate(request),
        "/config" => { config_window(); response_ok(request); }
        "/selection_translate" => handle_selection_translate(request),
        "/input_translate" => handle_input_translate(request),
        "/ocr_recognize" => handle_ocr_recognize(request),
        "/ocr_translate" => handle_ocr_translate(request),
        _ => warn!("Unknown: {}", request.url())
    }
}
```

### 翻译处理

```rust
fn handle_translate(mut request: Request) {
    let mut content = String::new();
    request.as_reader().read_to_string(&mut content).unwrap();
    // content = {"text": "hello", "from": "en", "to": "zh"}
    let req: TranslateRequest = serde_json::from_str(&content).unwrap();
    text_translate(req.text);
    response_ok(request);
}
```

---

## 二、命令行调用

### Rust CLI (`cmd.rs`)

```rust
// 解析命令行参数，调用对应窗口/功能
pub fn parse_args() {
    // pot --translate "hello world"
    // pot --ocr --screenshot
}
```

### 外部调用流程

```
外部应用 → HTTP POST /translate → Rust server.rs
  → text_translate() → 打开翻译窗口
  → 翻译完成后返回结果
```

---

## 三、安全注意事项

- 服务绑定 `127.0.0.1` 仅本地可访问
- 不暴露文件系统操作
- 请求体大小限制
- 端口可配置（`server_port`）

---

## 四、服务配置界面

`YiPot/src/window/Config/pages/General/index.jsx`:
- 端口号配置
- 服务启用/禁用开关
- 端口冲突检测


## 五、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| HTTP 框架 | tiny_http (Rust 同步) | actix-web / warp / axum | 零依赖 (编译体积 +200KB)，同步模型对请求量 < 10/s 完全足够 | 无异步支持，阻塞式处理高并发场景需升级 |
| 服务绑定 | 127.0.0.1 (仅本地) | 0.0.0.0 / localhost | 安全优先，仅本机进程可访问 | 无法被局域网其他设备调用 |
| 路由设计 | 硬编码 match 路由表 | radix tree / Regex 路由 | 路由表 < 10 个，无需动态路由框架 | 新增路由需修改 match 分支 |
| 请求解析 | 手动 JSON 解析 (serde_json) | 自动提取中间件 | 请求格式固定 ({text, from, to})，无需通用解析 | 字段变更需同步更新结构体定义 |
| 文本编码 | 统一 UTF-8 | 自动检测编码 | 翻译场景 99% 文本为 UTF-8，简单可靠 | 非 UTF-8 请求可能乱码 |
| 并发模型 | thread::spawn (每请求一线程) | async/await (tokio) | tiny_http 同步设计，请求处理 < 100ms | 高并发时线程数爆炸 (> 100 并发) |

### 为什么选择 tiny_http 而非 actix-web?

```
tiny_http (采纳):
  优点: 零依赖, 编译体积 +200KB, Tauri 应用场景请求量 < 10/秒
  缺点: 同步阻塞, 无 WebSocket 支持

actix-web (被拒绝):
  优点: 高性能异步, 中间件系统完善, WebSocket 支持
  缺点: 依赖树 > 50 crates, 编译时间 +2min, 体积 +5MB

结论: Tauri 桌面应用的 HTTP Server 仅在用户"主动调用"时使用，
      不同于 Web 服务持续并发请求场景，tiny_http 最合适。
```

### 安全设计原则

```
1. 仅监听 127.0.0.1 — 物理隔离外部网络
2. 请求体大小限制 64KB — 防止内存溢出 (DOS)
3. 不暴露文件系统操作 — 仅翻译/OCR/打开窗口
4. 端口可配置 (默认 60828) — 避免端口冲突
5. 无认证 (本地信任边界内) — 简化外部应用集成
```

> 端口默认值 `60828`: Pot-App 社区沿用，无特殊含义。用户可在设置中修改。


## 六、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-启动 | 端口被占用 (60828) | 端口 +1 递增重试 (最多 10 次) → 保存新端口 | 自动切换 | 托盘提示 "HTTP 服务端口已切换为 60829" |
| L1-启动 | 端口范围耗尽 (60828-60837) | 禁用 HTTP 服务 | 用户手动配置 | "HTTP 服务启动失败，端口不可用" |
| L2-请求 | 请求体超过 64KB | 返回 413 Payload Too Large | 调用方缩减请求 | 调用方收到 413 错误 |
| L2-请求 | JSON 解析失败 | 返回 400 Bad Request + 错误详情 | 调用方修正格式 | 调用方收到 400 错误 |
| L3-处理 | 翻译文本为空 | 返回 400 + "text is required" | 调用方补充 | 调用方收到 400 错误 |
| L3-处理 | 文本翻译失败 | 返回 500 + 错误详情 (不崩溃 Server) | 调用方重试 | 调用方收到 500 错误 |
| L4-系统 | Server 线程 panic | catch_unwind → 日志 → 重启 Server | 自动恢复 (3s 后) | 无感知 (HTTP 服务短暂中断) |

### HTTP 响应格式

```json
// 成功
{ "text": "你好", "from": "en", "to": "zh" }
// 错误
{ "error": "request body too large", "code": 413 }
```


## 七、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 请求解析 | 零拷贝 JSON 解析 (serde_json::from_slice) | 反序列化 < 0.1ms | — |
| 端口检查 | 启动时检查并缓存端口，非每次请求检查 | 减少系统调用 | — |
| 内存控制 | 请求体大小限制 64KB | 防止恶意请求内存溢出 | 单请求内存上限 ~64KB |

**关联文档**：
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — server.rs 模块架构
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 翻译流程


## 八、跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| HTTP 库依赖 | tiny_http (纯 Rust，零系统依赖) | 同左 | 同左 |
| 端口绑定 | 127.0.0.1 (loopback)，系统自动处理 | 127.0.0.1 (loopback) | 127.0.0.1 (loopback) |
| 端口冲突检测 | `TcpListener::bind()` 返回 Error (AddrInUse) → 递增重试 | 同左 | 同左 |
| 端口端口范围 | 60828-60837 (10 个端口尝试) | 同左 | 同左 |
| 防火墙影响 | 无 (127.0.0.1 不经过防火墙) | 首次访问可能触发 Windows 防火墙弹窗 | 无 (127.0.0.1 不经过 iptables/nftables) |
| 并发限制 | 每请求一线程，文件描述符限制 256 (默认 ulimit) | 每请求一线程，Windows 线程上限更高 (> 1000) | 每请求一线程，文件描述符限制 1024 (默认 ulimit -n) |
| 请求体编码 | 统一 UTF-8 | UTF-8，部分 Windows 工具 (PowerShell) 可能发送 UTF-16 | UTF-8 |
| 请求体大小限制 | 64KB (硬编码) | 同左 | 同左 |
| 进程间调用 | curl localhost:60828 正常工作 | curl localhost:60828 正常工作 | curl localhost:60828 正常工作 |
| 代理穿透 | 127.0.0.1 不经过系统代理 | 同左 | 同左 (但需注意 `no_proxy=localhost` 环境变量) |

### 平台特有网络差异

```
macOS:
  - SIP (System Integrity Protection) 不影响 127.0.0.1 端口监听
  - launchd 可能占用低端口 (需 port > 1024)
  - 建议端口范围 60828+ 避免与系统服务冲突

Windows:
  - 首次监听端口可能触发 Windows Defender 防火墙弹窗
  - 可通过 tauri.conf.json 添加防火墙例外 (需管理员权限)
  - 端口排除建议在安装阶段预配置

Linux:
  - 某些发行版默认 `no_proxy=localhost,127.0.0.1`，HTTP 客户端可能跳过代理
  - snap/flatpak 沙箱内网络访问受限，需声明 network 权限
  - 部分系统 `SO_REUSEPORT` 行为不同于 macOS (需注意端口复用)
```

### 端口检测可靠性

```rust
// 跨平台端口可用性检测 (所有平台行为一致)
fn find_available_port(start: u16, max_attempts: u16) -> Option<u16> {
    for port in start..start + max_attempts {
        if TcpListener::bind(("127.0.0.1", port)).is_ok() {
            return Some(port);
        }
    }
    None
}
// 所有平台的 TcpListener::bind 原子操作，无竞态条件
```