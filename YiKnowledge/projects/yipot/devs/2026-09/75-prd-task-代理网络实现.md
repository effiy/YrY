---

doc_type: module
prd_task_id: "YP-09-S08"
title: "代理与网络配置 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "19-prd-代理与网络.md"

type: task
---

# 代理与网络配置 — 开发方案

> 来源 PRD：[19-prd-代理与网络.md](../../prds/2026-09/19-prd-代理与网络.md)

## 架构概览

```
用户配置代理 (设置面板)
      │
      ├── proxy_enable: boolean
      └── proxy_host: string ("http://127.0.0.1:7890")
                │
                ▼
┌───────────────────────────────────────────────────┐
│              Rust 代理管理层                       │
│                                                    │
│  set_proxy(host)                                   │
│    │  std::env::set_var("HTTP_PROXY", host)        │
│    │  std::env::set_var("HTTPS_PROXY", host)       │
│    │  std::env::set_var("ALL_PROXY", host)         │
│    ▼                                               │
│  unset_proxy()                                     │
│    │  std::env::remove_var("HTTP_PROXY")           │
│    │  std::env::remove_var("HTTPS_PROXY")          │
│    │  std::env::remove_var("ALL_PROXY")            │
│    ▼                                               │
│  进程级环境变量 (影响所有 reqwest/tokio 请求)      │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│      网络请求层 (reqwest / fetch)                  │
│    │                                                │
│    │  reqwest::Client 自动读取 *_PROXY 环境变量    │
│    │  前端 fetch 不感知代理 (仅影响 Rust 端请求)   │
│    ▼                                                │
│  翻译/OCR API 请求通过代理发出                      │
└───────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│  启动恢复 (setup 阶段)                             │
│    │  read get("proxy_enable")                     │
│    │  read get("proxy_host")                       │
│    │  if proxy_enable && !proxy_host.is_empty():   │
│    │      set_proxy(proxy_host)                     │
│    ▼                                                │
│  代理在应用启动时自动恢复                           │
└───────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src-tauri/src/main.rs` (Tauri command + setup hook)

### 设置/取消代理

```rust
// main.rs
use std::env;

#[tauri::command]
fn set_proxy_handler(host: String) -> Result<(), String> {
    env::set_var("HTTP_PROXY", &host);
    env::set_var("HTTPS_PROXY", &host);
    env::set_var("ALL_PROXY", &host);
    env::set_var("http_proxy", &host);   // 小写兼容
    env::set_var("https_proxy", &host);
    Ok(())
}

#[tauri::command]
fn unset_proxy_handler() -> Result<(), String> {
    env::remove_var("HTTP_PROXY");
    env::remove_var("HTTPS_PROXY");
    env::remove_var("ALL_PROXY");
    env::remove_var("http_proxy");
    env::remove_var("https_proxy");
    Ok(())
}

#[tauri::command]
fn get_proxy_status() -> Result<ProxyStatus, String> {
    let enable = get_config("proxy_enable").unwrap_or(false);
    let host = get_config("proxy_host").unwrap_or_default();
    Ok(ProxyStatus { enable, host })
}
```

### 启动时恢复代理

```rust
// setup hook
fn setup_proxy(app: &mut App) -> Result<(), Box<dyn Error>> {
    let proxy_enable: bool = get_config("proxy_enable").unwrap_or(false);
    let proxy_host: String = get_config("proxy_host").unwrap_or_default();
    
    if proxy_enable && !proxy_host.is_empty() {
        env::set_var("HTTP_PROXY", &proxy_host);
        env::set_var("HTTPS_PROXY", &proxy_host);
        env::set_var("ALL_PROXY", &proxy_host);
        env::set_var("http_proxy", &proxy_host);
        env::set_var("https_proxy", &proxy_host);
    }
    Ok(())
}
```

### 前端配置界面

```javascript
// Config/pages/Proxy/index.jsx
import { invoke } from "@tauri-apps/api/tauri";

async function handleToggle(enabled, host) {
  if (enabled && host) {
    await invoke("set_proxy_handler", { host });
  } else {
    await invoke("unset_proxy_handler");
  }
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 代理实现方式 | 进程环境变量 (HTTP_PROXY) | Tauri HTTP 拦截器 | reqwest 原生读取 env var，零代码侵入网络层 | 仅影响 Rust 端请求，前端 fetch 不经过代理 |
| 代理作用域 | 全局进程级 | 单请求级 Client 配置 | 翻译/OCR 等所有网络调用统一代理 | 无法按域名/请求粒度配置代理规则 |
| 认证方式 | 不支持代理认证 | Basic Auth in URL | 绝大多数用户使用本地代理 (Clash/V2Ray)，无需认证 | 无法连接需认证的企业代理 |
| 重启行为 | 启动时自动恢复代理设置 | 要求用户每次手动开启 | 用户配置一次即可，重启无需重新设置 | — |
| 大写兼容 | 同时设置 HTTP_PROXY 和 http_proxy | 仅设置大写形式 | 不同 HTTP client 库使用不同大小写约定 | 冗余但无害 |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 代理状态读取 | O(1) | 内存中缓存 proxy_enable/proxy_host 值 | 不重复读取磁盘配置 |
| 网络回退 | 代理不通时自动直连 | reqwest Client 原生支持 (connect_timeout + 无代理回退) | 无额外代码 |
| 配置变更 | 无需重启 | Tauri command 即时修改 env var | 代理切换即时生效 |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | 代理地址无法连接 | 翻译/OCR 请求超时 → 显示网络错误 | 提示用户检查代理设置 | Toast "代理连接失败" |
| L1-网络 | 代理返回 407 (Auth Required) | 请求失败 → 提示不支持认证代理 | 引导使用本地无认证代理 | Toast "不支持需要认证的代理" |
| L2-配置 | proxy_host 格式错误 (缺少 http://) | 自动补全协议前缀 | 静默修正 | 无感知 |
| L2-配置 | proxy_enable=true 但 proxy_host 为空 | 忽略启用状态，等价于直连 | 自动跳过 | 无感知 |
| L3-启动 | 启动时代理已失效 | 首次翻译请求超时后提示 | 用户手动更新代理地址 | Toast 提示 |

---

**关联文档**：
- 翻译服务插件：[04-prd-task-翻译服务插件实现.md](./04-prd-task-翻译服务插件实现.md)
- 测试方案：[19-prd-test-代理与网络](../../tests/2026-09/19-prd-test-代理与网络.md)