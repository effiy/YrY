---

doc_type: module
prd_task_id: "YP-09-M12"
title: "外部调用与 HTTP 服务 — 开发方案"
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

# 外部调用与 HTTP 服务 — 开发方案

> 来源 PRD：[10-prd-外部调用与HTTP服务.md](../../prds/2026-09/10-prd-外部调用与HTTP服务.md)
> 需求编号：YP-09-M12 · 优先级：P2 · 人天：2d

> **文档职责**：本文档定义内置 HTTP 服务（tiny_http）、命令行接口（CLI）、插件安装的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、内置 HTTP 服务

### 1.1 架构总览

```
外部应用 (Alfred/Raycast/VSCode) 
    │
    │ HTTP POST localhost:60828
    ▼
┌────────────────────────────┐
│  Rust tiny_http Server     │  ← 独立线程, 不阻塞 UI
│  ┌──────────────────────┐  │
│  │ POST /translate      │──┼→ translate(text, from, to) → JSON response
│  │ POST /ocr_recognize  │──┼→ 触发截图 → OCR → JSON response
│  │ POST /ocr_translate  │──┼→ 触发截图 → OCR → 翻译 → JSON response
│  │ POST /input_translate│──┼→ 打开翻译窗口 → 返回窗口状态
│  │ POST /config         │──┼→ 打开设置窗口 → 返回窗口状态
│  └──────────────────────┘  │
└────────────────────────────┘
    │
    │ Tauri event / invoke
    ▼
React 前端 ←→ 翻译/OCR 核心模块
```

### 1.2 Rust HTTP Server 实现

```rust
// http_server.rs — 基于 tiny_http
use tiny_http::{Server, Response, Method, StatusCode};
use std::thread;

pub fn start_http_server(app: tauri::AppHandle, port: u16) -> thread::JoinHandle<()> {
    thread::spawn(move || {
        let server = Server::http(format!("127.0.0.1:{port}")).unwrap();
        
        for mut request in server.incoming_requests() {
            let response = match (request.method(), request.url()) {
                (&Method::Post, "/translate") => handle_translate(&mut request, &app),
                (&Method::Post, "/ocr_recognize") => handle_ocr_recognize(&app),
                (&Method::Post, "/ocr_translate") => handle_ocr_translate(&app),
                (&Method::Post, "/input_translate") => handle_input_translate(&app),
                (&Method::Post, "/config") => handle_open_config(&app),
                _ => Response::from_string("Not Found").with_status_code(404),
            };
            
            request.respond(response).ok();
        }
    })
}
```

### 1.3 路由处理器

```rust
// 翻译端点
fn handle_translate(
    request: &mut tiny_http::Request,
    app: &tauri::AppHandle
) -> Response<std::io::Cursor<Vec<u8>>> {
    let mut body = String::new();
    request.as_reader().read_to_string(&mut body).ok();
    
    // 解析 JSON body
    let params: TranslateRequest = match serde_json::from_str(&body) {
        Ok(p) => p,
        Err(e) => return json_response(400, &format!("invalid json: {e}")),
    };
    
    if params.text.is_empty() {
        return json_response(400, r#"{"error": "missing 'text' field"}"#);
    }
    
    // 调用翻译核心 (通过 Tauri event)
    let result = app.emit_all("http_translate", params).ok();
    
    json_response(200, &result.unwrap_or_default())
}

// OCR 端点 — 触发截图流水线
fn handle_ocr_recognize(app: &tauri::AppHandle) -> Response<std::io::Cursor<Vec<u8>>> {
    app.emit_all("http_ocr_recognize", ()).ok();
    json_response(200, r#"{"status": "started"}"#)
}
```

### 1.4 请求/响应格式

```typescript
// 翻译请求
POST /translate
Content-Type: application/json
{"text": "hello world", "from": "en", "to": "zh"}

// 翻译响应
HTTP 200
{"text": "你好世界", "from": "en", "to": "zh"}

// 错误响应
HTTP 400
{"error": "missing 'text' field"}

HTTP 408
{"error": "request timeout"}

HTTP 429
{"error": "too many requests", "retry_after": 5}

HTTP 503
{"error": "all services unavailable"}
```

---

## 二、命令行接口

### 2.1 CLI 参数设计

```rust
// cmd.rs — 命令行参数解析
#[derive(Parser)]
#[command(name = "pot", about = "YiPot 命令行工具")]
enum Cli {
    /// 翻译文本
    Translate {
        text: String,
        #[arg(short, long, default_value = "auto")]
        from: String,
        #[arg(short, long, default_value = "zh")]
        to: String,
    },
    /// 读剪贴板并翻译
    SelectionTranslate,
    /// 打开输入翻译窗口
    InputTranslate,
    /// 截图 OCR 识别
    OcrRecognize,
    /// 截图翻译
    OcrTranslate,
    /// 打开设置窗口
    Config,
}

fn main() {
    let cli = Cli::parse();
    match cli {
        Cli::Translate { text, from, to } => {
            // 1. 连接到已有实例的 HTTP 服务
            // 2. POST /translate
            // 3. 输出结果到 stdout
        }
        Cli::SelectionTranslate => {
            // 发送指令到已有实例
        }
        // ...
    }
}
```

### 2.2 单实例转发机制

CLI 命令通过 HTTP 本地服务转发到已运行的 Pot 实例：

```
pot translate "Hello" --to zh
    │
    ▼
检查是否已有 Pot 实例运行
    ├─ 是 → HTTP POST localhost:60828/translate
    │        返回结果 → stdout
    └─ 否 → 启动 Pot → 等待 HTTP 服务就绪 → POST → 返回结果
```

---

## 三、插件安装

### 3.1 安装入口

```typescript
// 安装方式
// 1. 拖拽插件目录/zip 到设置页
// 2. CLI: pot install-plugin <path>
// 3. HTTP: POST /install-plugin body: {"path": "/path/to/plugin"}

async function installPlugin(source: string): Promise<void> {
  // 1. 如果是 zip 文件, 解压到临时目录
  const pluginDir = source.endsWith('.zip') 
    ? await unzipToTemp(source) 
    : source;
  
  // 2. 验证插件格式
  const info = JSON.parse(await readFile(`${pluginDir}/info.ts`));
  if (!validatePluginInfo(info)) {
    throw new Error('插件格式不正确');
  }
  
  // 3. 复制到应用插件目录
  const targetDir = `${APP_PLUGIN_DIR}/${info.id}`;
  await copyDir(pluginDir, targetDir);
  
  // 4. 注册到插件加载器
  await pluginLoader.registerExternal(info.id, targetDir);
  
  notification.success(`插件 "${info.name}" 安装成功`);
}
```

---

## 四、设计决策

| 决策 | 理由 |
|------|------|
| 绑定 127.0.0.1, 禁止 0.0.0.0 | 仅本地应用可访问, 防止局域网内 API Key 泄露 |
| 不暴露配置/API Key 端点 | 安全底线: 外部调用只能翻译/OCR, 不能读取或修改配置 |
| tiny_http (非 actix-web/warp) | tiny_http 是无依赖的轻量库, 编译快; 仅 6 个端点无需重量框架 |
| 并发限制 10 QPS | tiny_http 单线程事件循环, 翻译本身有 API 调用延迟 |
| CLI 输出纯文本到 stdout | 脚本友好: 可管道串联, 可 grep, 可重定向 |
| 错误输出到 stderr | Unix 惯例: 脚本可区分正常输出和错误信息 |

---

## 五、安全措施

| 措施 | 实现 |
|------|------|
| 仅监听 127.0.0.1 | 绑定地址硬编码 |
| 无认证端点 | 明确只暴露翻译/OCR, 无配置/Key 端点 |
| 请求体大小限制 | ≤ 1MB (发送超大图片会被拒绝) |
| 并发限流 | 最多 10 个并发请求, 超出返回 429 |
| 不记录翻译内容 | 日志仅记录请求元数据 (来源/耗时/状态码) |

---

## 六、错误处理

| 错误 | 处理 |
|------|------|
| HTTP body 为空 | 400 `{"error": "empty body"}` |
| 参数缺失 text | 400 `{"error": "missing 'text' field"}` |
| 端口被占用 | 提示用户更换端口, 支持自定义 `server_port` 配置 |
| 翻译服务全部不可用 | 503 `{"error": "all services unavailable"}` |
| 请求超时 (30s 无响应) | 408 `{"error": "request timeout"}` |
| CLI 参数缺少必填项 | 打印 usage 帮助信息到 stderr |
| 外部调用时窗口已打开 | 复用已有窗口, focus 到前台 |

---

## 七、交叉引用

- 开发方案: [01-prd-task-翻译核心架构](./01-prd-task-翻译核心架构.md)
- 开发方案: [29-prd-task-OCR截图实现](./29-prd-task-OCR截图实现.md)
- PRD: [38-prd-CLI命令行](../../prds/2026-09/38-prd-CLI命令行.md)
- PRD: [11-prd-构建发布与安全](../../prds/2026-09/11-prd-构建发布与安全.md)