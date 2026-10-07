---

doc_type: module
prd_task_id: "YP-09-S08"
title: "代理与网络 — 开发方案"
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

# 代理与网络 — 开发方案

## Rust 实现

```rust
#[tauri::command]
fn set_proxy() -> Result<(), String> {
    let host = get("proxy_host").unwrap();
    std::env::set_var("HTTP_PROXY", host.as_str().unwrap());
    std::env::set_var("HTTPS_PROXY", host.as_str().unwrap());
    Ok(())
}

#[tauri::command]
fn unset_proxy() {
    std::env::remove_var("HTTP_PROXY");
    std::env::remove_var("HTTPS_PROXY");
}
```

## 启动时恢复

```rust
// setup 中检查 proxy_enable 配置
if get("proxy_enable").map_or(false, |v| v.as_bool().unwrap())
   && get("proxy_host").map_or(false, |h| !h.as_str().unwrap().is_empty()) {
    set_proxy().ok();
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 代理方式 | 环境变量 HTTP_PROXY | Rust reqwest + 前端 fetch 均自动读取 |
| 生效时机 | 即时（环境变量设置） | 无需重启 |


## 性能优化

| 优化点 | 优化手段 | 预期收益 | 实测数据 |
|--------|---------|---------|---------|
| 代理检测 | 启动时 HEAD 请求快速检测代理可用性 (< 3s 超时) | 避免翻译等待代理超时 | — |
| 连接复用 | Rust reqwest 内置连接池 (HTTP/1.1 Keep-Alive) | 重复请求零握手延迟 | 代理额外延迟 < 5ms (本地代理) |
| 配置检查 | 代理配置缓存在内存 (非每次读磁盘) | 检查开销 < 0.01ms | — |
| 代理跳过本地 | `NO_PROXY=localhost,127.0.0.1` (本地 HTTP Server 不走代理) | 本地 Server 通信零影响 | — |

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-配置 | 代理地址为空时启用代理 | 拒绝启用 + Toast 提示 | 用户填写地址后重试 | "请先填写代理地址" |
| L1-配置 | 代理地址格式不含协议前缀 | 自动补全 `http://` | 自动修正 | 无感知 |
| L2-连接 | 代理服务不可达 (connection refused) | 翻译请求超时 → 回退到非翻译服务 | 自动回退 | 无感知 (翻译可能变慢) |
| L2-连接 | 代理返回 5xx 错误 | 请求失败 → 标记服务失败 → 回退 | 自动回退 | 无感知 |
| L2-鉴权 | 代理返回 407 Proxy Auth Required | 提示检查代理认证配置 | 用户配置认证凭据 | "代理认证失败，请检查代理用户名/密码" |
| L3-环境 | 环境变量被其他程序覆盖 | 不作处理 (无法防御外部修改) | 重启应用恢复 | 无感知 |
| L3-环境 | set_var 后已有连接未生效 | 已建立连接不受影响 (HTTP/1.1 Keep-Alive 特性) | 连接重建后自动生效 | 延迟生效 (最多 60s) |

## 跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 环境变量设置方式 | `std::env::set_var()` (进程级) | 同左 | 同左 |
| 环境变量作用域 | 仅当前进程 + 子进程 | 同左 | 同左 |
| 系统代理检测 | WebView 自动读取系统代理设置 | 同左 | 需手动配置 (GNOME: gsettings, KDE: 系统设置) |
| 代理变量大小写 | `HTTP_PROXY` (大写) + `http_proxy` (小写兼容) | 同左 | 部分工具仅识别小写 (`http_proxy`) |
| NO_PROXY 默认值 | 无 (需手动设置) | 无 | 部分发行版默认 `no_proxy=localhost,127.0.0.1` |
| 本地代理软件 | ClashX (7890), Surge (6152), V2RayU | Clash Verge (7890), V2RayN, Netch | Clash (7890), V2Ray, Shadowsocks (1080) |
| SOCKS5 支持 | reqwest socks feature | 同左 | 同左 |
| reqwest 代理自动读取 | 自动读取 `HTTP_PROXY` 环境变量 | 同左 | 同左，需启用 `native-tls` feature |

### 常见代理端口速查

```
HTTP 代理:
  Clash 系列:     7890
  Surge (macOS):  6152
  V2Ray 默认:    10809

SOCKS5 代理:
  Clash 系列:     7891
  V2Ray 默认:    10808
  Shadowsocks:    1080
```

**关联文档**：
- [配置存储与备份](./07-prd-task-配置存储与备份实现.md) — 代理配置持久化
- [外部 HTTP 服务](./08-prd-task-外部HTTP服务实现.md) — 本地 Server 排除代理
- 源 PRD：[19-prd-代理与网络.md](../../prds/2026-09/19-prd-代理与网络.md)