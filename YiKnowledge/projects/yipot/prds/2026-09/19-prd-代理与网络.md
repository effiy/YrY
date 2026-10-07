---
doc_type: prd
title: "YP-09-S08: 代理与网络配置"
tags: [需求文档, 代理, 网络, 配置]
category: 项目/桌面应用/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S08
estimate_frontend: 0.5
review_status: 已发布
issue_type: 功能
roles: [engineer]
---

# YP-09-S08: 代理与网络配置

> 需求编号：YP-09-S08 · 优先级：P2 · 人天：0.5d · 状态：已完成

## 背景

用户可能需要通过代理访问翻译/OCR API，特别是 Google 翻译等服务在某些地区不可直接访问。

## 需求

### 配置项

| 配置 | 键 | 默认值 |
|------|-----|-------|
| 代理启用 | `proxy_enable` | false |
| 代理地址 | `proxy_host` | "" |

### Rust 实现

```rust
// main.rs
#[tauri::command]
fn set_proxy() -> Result<(), String> {
    let host = get("proxy_host").unwrap();
    std::env::set_var("HTTP_PROXY", host);
    std::env::set_var("HTTPS_PROXY", host);
}

#[tauri::command]
fn unset_proxy() {
    std::env::remove_var("HTTP_PROXY");
    std::env::remove_var("HTTPS_PROXY");
}
```

### 启动时恢复

```rust
// setup 中检查 proxy_enable
if proxy_enable && !proxy_host.is_empty() {
    set_proxy();
}
```

## 验收标准

- [ ] 代理启用后翻译通过代理
- [ ] 代理禁用后恢复直连
- [ ] 重启后代理设置保持
- [ ] 代理地址错误时给出提示

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | 代理切换生效时间 | ≤ 500ms（启用/禁用代理后首次请求） | 环境变量修改后首次翻译请求验证 | P2 |
| AC-02 | 代理启用后 HTTP 请求通过率 | ≥ 95%（代理服务正常时） | 100 次翻译请求统计 | P2 |
| AC-03 | 代理禁用后直连恢复 | 100%（所有请求不再走代理） | 抓包验证 | P2 |
| AC-04 | 启动时代理恢复可靠性 | 100%（重启后代理设置保持） | 5 次重启验证 | P2 |
| AC-05 | 代理地址格式校验准确率 | 100%（非法格式正确拒绝） | 10 种非法格式逐一测试 | P2 |
| AC-06 | 代理连接超时检测 | ≤ 5s（不可达代理快速失败） | 超时配置验证 | P2 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 代理地址格式错误 | 异常 | 提示"代理地址格式无效（应为 http://host:port）" | — |
| 代理服务器不可达 | 异常 | 提示"代理服务器连接失败" | — |
| 代理需要认证 | 边界 | 支持 `http://user:pass@host:port` 格式 | — |
| 代理启动时不可用 | 边界 | 每次请求前检测代理状态 | — |
| 切换代理需重启 | 边界 | 无需重启，实时生效 | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 代理设置生效延迟 | ≤ 1s（环境变量设置） | 设置后第一个请求计时 |
| 安全 | 代理密码存储 | 加密存储于配置文件 | 磁盘检查 |
| 兼容性 | HTTP/HTTPS 代理 | HTTP_PROXY + HTTPS_PROXY 同时设置 | 抓包验证 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | Rust env var | std::env::set_var | HTTP_PROXY / HTTPS_PROXY |
| 依赖 | Rust config store | Tauri invoke | proxy_enable / proxy_host |
| 被依赖 | 所有翻译/OCR 服务 | HTTP 请求层 | 自动走代理 |

---

## 相关文档

- 开发方案: [19-prd-task-代理与网络](../../devs/2026-09/19-prd-task-代理与网络.md)
- 测试方案: [19-prd-test-代理与网络](../../tests/2026-09/19-prd-test-代理与网络.md)
- 配置管理与备份: [09-prd-配置管理与备份](./09-prd-配置管理与备份.md)