---

doc_type: test
title: "Rust 配置/备份/错误处理 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["43-prd-Rust配置备份错误处理"]
source_modules: ["43-prd-Rust配置备份错误处理"]

type: test
---

# Rust 配置/备份/错误处理 — 测试方案

> 覆盖 YP-09-R04：`config.rs` 配置管理、`backup.rs` 三种备份方式、`error.rs` 统一错误类型

---

## 一、核心功能测试

### 1.1 配置管理 (config.rs)

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CFGR-001 | 配置持久化 | set("theme","dark") → 重启 → get("theme") | 返回 "dark" |
| TC-CFGR-002 | 默认值创建 | 删除 .pot.dat → 启动 | 创建包含默认值的配置文件 |
| TC-CFGR-003 | 配置项读取 | get("fontSize") | 返回当前字号（有默认值） |
| TC-CFGR-004 | 配置项设置 | set("fontSize", 18) | 写入成功 |
| TC-CFGR-005 | 配置 reload | 外部修改 .pot.dat → reload_store() | 前端重新读取到最新值 |
| TC-CFGR-006 | 首次运行检测 | 删除配置文件 → 调用 is_first_run() | 返回 true，打开设置窗口 |
| TC-CFGR-007 | 非首次运行 | 配置文件存在 → is_first_run() | 返回 false |

### 1.2 备份功能 (backup.rs)

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-BKR-001 | 本地备份导出 | 调用 local_backup() | JSON 文件导出到指定路径 |
| TC-BKR-002 | 本地备份恢复 | 调用 local_restore(path) | 配置从 JSON 导入 |
| TC-BKR-003 | WebDAV 上传 | 调用 webdav("put", url, user, pass) | 配置上传到 WebDAV |
| TC-BKR-004 | WebDAV 下载 | 调用 webdav("get", url, user, pass) | 从 WebDAV 下载配置 |
| TC-BKR-005 | 阿里云 OSS 上传 | 调用 aliyun("put", bucket, region, ak, sk) | 配置上传到 OSS |
| TC-BKR-006 | 阿里云 OSS 下载 | 调用 aliyun("get", bucket, region, ak, sk) | 从 OSS 下载配置 |

### 1.3 错误处理 (error.rs)

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-ERRR-001 | 配置错误 | Config("parse error") → 返回前端 | 前端显示配置错误提示 |
| TC-ERRR-002 | 剪贴板错误 | Clipboard("permission denied") → 返回 | 前端提示权限问题 |
| TC-ERRR-003 | 截图错误 | Screenshot("display not found") → 返回 | 前端提示截图失败 |
| TC-ERRR-004 | OCR 错误 | Ocr("language not supported") → 返回 | 前端提示 OCR 失败 |
| TC-ERRR-005 | 服务端错误 | Server("http 500") → 返回 | 前端提示服务端错误 |
| TC-ERRR-006 | 所有错误类型定义 | 枚举 AppError 所有变体 | 覆盖 Config/Clipboard/Hotkey/Screenshot/Ocr/Server |

---

## 二、边界与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|------|----------|----------|----------|
| TC-CFGR-EDGE-01 | 配置文件损坏 | JSON 格式非法 | 自动备份旧文件 + 创建默认配置 | 弹窗提示用户 |
| TC-CFGR-EDGE-02 | 配置键不存在 | get("nonexistent_key") | 返回 None (Option) | 前端使用默认值 |
| TC-CFGR-EDGE-03 | 配置值类型不匹配 | set("fontSize", "abc") | 类型校验失败？(与前端约定) | 不写入或前端校验 |
| TC-CFGR-EDGE-04 | reload_store 并发 | 导入中 → 同时 reload_store | 最后一次操作生效 | 不损坏文件 |
| TC-CFGR-EDGE-05 | 备份路径不存在 | local_backup() 目录不存在 | 自动创建目录或报错 | — |
| TC-CFGR-EDGE-06 | 备份文件被占用 | local_restore() 文件被其他进程锁 | 返回错误，不崩溃 | 提示关闭其他程序 |
| TC-CFGR-EDGE-07 | WebDAV 超时 | reqwest 请求超时 | 返回 AppError::Server("timeout") | 前端重试 |
| TC-CFGR-EDGE-08 | 阿里云 SDK 错误 | OSS SDK 返回错误 | 包装为 AppError::Server | 前端展示 |

---

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-CFGR-PERF-01 | 配置读取 (单键) | get() 延迟 | < 1ms | > 5ms | Store 内存读取 |
| TC-CFGR-PERF-02 | 配置写入 (单键) | set() 延迟 | < 10ms | > 50ms | 含文件写入 |
| TC-CFGR-PERF-03 | 配置批量写入 | 10 键连续 set() | < 100ms | > 300ms | 含防抖 |
| TC-CFGR-PERF-04 | 完整配置导出 | get_all() + 序列化 | < 200ms | > 500ms | 100 个服务配置 |
| TC-CFGR-PERF-05 | 完整配置导入 | 文件读 + 反序列化 + set_all() | < 300ms | > 800ms | — |
| TC-CFGR-PERF-06 | reload_store | 重新加载配置文件 | < 100ms | > 300ms | 含文件读+解析 |
| TC-CFGR-PERF-07 | is_first_run | 首次运行检查 | < 10ms | > 50ms | 磁盘检查 |

---

## 四、可靠性测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-CFGR-REL-01 | 配置文件并发安全 | 两个 set() 操作并发 | 最后一次写入生效，不损坏 | P1 |
| TC-CFGR-REL-02 | 配置文件原子写入 | 写入过程中进程被 kill | 不产生损坏文件 | P1 |
| TC-CFGR-REL-03 | 配置 schema 校验 | 设置非法类型的值 | Rust 层类型校验拒绝 | P2 |
| TC-CFGR-REL-04 | 错误类型完整覆盖 | 所有代码路径抛出对应 AppError | 枚举变体覆盖所有模块 | P1 |
| TC-CFGR-REL-05 | 错误信息有用性 | 每个 AppError 的 Display | 含模块名 + 具体原因 | P1 |

---

## 五、安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-CFGR-SEC-01 | 配置文件权限 | 检查 .pot.dat 文件权限 | 仅当前用户可读写 (chmod 600) | P1 |
| TC-CFGR-SEC-02 | API Key 不在内存明文 | set("api_key", value) → 检查内存 | 加密存储 | P0 |
| TC-CFGR-SEC-03 | 导入文件 schema 校验 | 导入含恶意字段的 JSON | 拒绝非预期字段 | P1 |
| TC-CFGR-SEC-04 | 错误信息不泄露路径 | AppError::Display | 不输出内部文件路径 | P1 |
| TC-CFGR-SEC-05 | 备份文件含 API Key 加密 | 导出 JSON → 检查内容 | Key/Secret 加密后写入 | P0 |

---

## 六、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-CFGR-01 | 配置读写持久化 | config.rs | 否 | P0 |
| REG-CFGR-02 | 默认配置创建 | config.rs | 否 | P0 |
| REG-CFGR-03 | 配置文件损坏恢复 | config.rs | 否 | P1 |
| REG-CFGR-04 | 本地备份导出/导入 | backup.rs | 否 | P0 |
| REG-CFGR-05 | WebDAV 上传/下载 | backup.rs | 否 | P1 |
| REG-CFGR-06 | 阿里云 OSS 上传/下载 | backup.rs | 否 | P1 |
| REG-CFGR-07 | 首次运行检测 | config.rs | 否 | P0 |
| REG-CFGR-08 | AppError 所有变体转发 | error.rs | 否 | P1 |
| REG-CFGR-09 | reload_store 正确重载 | config.rs | 否 | P1 |

---

## 七、参考文档

- [43-prd-Rust配置备份错误处理](../prds/2026-09/43-prd-Rust配置备份错误处理.md) — 源 PRD
- [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) — 设置页面中的 Backup/Config 子页面
- [39-prd-WebDAV阿里云备份](../prds/2026-09/39-prd-WebDAV阿里云备份.md) — WebDAV/OSS 备份细节
- [38-prd-CLI命令行](../prds/2026-09/38-prd-CLI命令行.md) — CLI 命令注册模式（在 main.rs 中）