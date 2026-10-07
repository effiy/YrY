---
doc_type: prd
title: 配置管理与数据备份 — 需求规格
tags:
- 需求文档
- 配置管理
- 数据备份
- WebDAV
- 阿里云
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
prd_task_id: YP-09-M11
estimate_frontend: 3
review_status: 已发布
issue_type: 功能
roles: [engineer, qa]
---

# 配置管理与数据备份 — 需求规格

> 需求编号：YP-09-M11 · 优先级：P2 · 人天：~3d

---

## 一、配置存储系统

### 1.1 存储架构

- **前端**: `tauri-plugin-store` (Rust → JSON 文件持久化)
- **配置项**: 所有设置通过 `useConfig` hook 读写
- **存储位置**: 系统应用数据目录

### 1.2 配置分类

| 类别 | 配置项 | 默认值 |
|------|--------|--------|
| 通用 | `app_language` | `en` |
| 通用 | `app_theme` | `system` |
| 通用 | `app_font` / `app_fallback_font` | `default` |
| 通用 | `app_font_size` | `16` |
| 通用 | `dev_mode` | `false` |
| 翻译 | `translate_window_width` | `350` |
| 翻译 | `translate_window_height` | `420` |
| 翻译 | `translate_window_position` | `mouse` |
| 翻译 | `translate_detect_engine` | `local` |
| OCR | `recognize_window_width` | `800` |
| OCR | `recognize_window_height` | `400` |
| 网络 | `proxy_enable` / `proxy_host` | `false` / `""` |
| 剪切板 | `clipboard_monitor` | `false` |
| 服务 | `server_port` | `60828` |
| 快捷键 | `hotkey_selection_translate` | `""` |
| 快捷键 | `hotkey_input_translate` | `""` |
| 快捷键 | `hotkey_ocr_recognize` | `""` |
| 快捷键 | `hotkey_ocr_translate` | `""` |

### 1.3 服务配置

每类服务（翻译/OCR/TTS/生词本）的实例配置独立存储：
- API Key / Secret（加密）
- 自定义 Base URL
- 启用/禁用状态
- 优先级排序

---

## 二、备份与恢复

### 2.1 本地备份 (`backup.rs` → `local`)

- 导出全部配置为 JSON 文件
- 导入 JSON 文件合并配置
- 支持选择性备份（仅服务配置 / 仅快捷键 / 完整备份）

### 2.2 WebDAV 同步 (`backup.rs` → `webdav`)

| 属性 | 值 |
|------|-----|
| 协议 | WebDAV |
| 配置 | URL + 用户名 + 密码 |
| 方向 | 双向同步 |

### 2.3 阿里云 OSS 同步 (`backup.rs` → `aliyun`)

| 属性 | 值 |
|------|-----|
| 配置 | Bucket + Region + AccessKey |
| 方向 | 上传/下载 |

---

## 三、代理设置

- **配置项**: `proxy_enable` + `proxy_host`
- **Rust 命令**: `set_proxy` / `unset_proxy`
- 所有 HTTP 请求走代理

---

## 四、验收标准

- [ ] 配置修改即时持久化，重启不丢失
- [ ] API Key 存储加密
- [ ] 备份 JSON 包含完整配置
- [ ] WebDAV 同步支持自建服务器
- [ ] 代理设置对翻译/OCR 服务生效
- [ ] 配置导入失败时有错误提示

---

## 用户画像与使用场景

### 典型用户

| 画像 | 角色 | 核心诉求 | 使用频率 |
|------|------|---------|---------|
| 多设备用户 | 在公司和家里两台电脑使用 Pot | 配置一键同步，API Key 在不同设备间安全迁移 | 低频（换设备时） |
| 重装系统用户 | 定期重装或换电脑 | 完整备份配置，重装后一键恢复 | 极低频（重装时） |

### 使用场景

1. **配置迁移**: 用户买了新电脑 → 旧电脑导出 JSON 备份 → WebDAV 上传 → 新电脑从 WebDAV 下载导入 → 期望: 所有配置（快捷键/服务/主题/语言）完全恢复
2. **多设备同步**: 用户办公室和家用电脑 → 设置 WebDAV 自动同步 → 期望: 在家修改的快捷键自动同步到公司电脑
3. **选择性备份**: 用户仅想备份快捷键配置 → 备份选项选择"仅快捷键" → 期望: JSON 仅包含 4 个快捷键配置，不含 API Key
4. **阿里云 OSS 备份**: 用户有阿里云 OSS 存储桶 → 配置 Bucket/Region/AccessKey → 期望: 一键上传/下载配置文件

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | 配置持久化延迟 | ≤ 50ms（修改到写盘） | 修改配置→检查磁盘文件 | P1 |
| AC-02 | JSON 导出完整性 | 100% 配置项无遗漏 | 对比导出前后配置项数 | P1 |
| AC-03 | JSON 导入成功率 | ≥ 99%（合法 JSON） | 100 次导入测试 | P1 |
| AC-04 | API Key 密文存储 | 100% 磁盘无明文 | 磁盘搜索 API Key 值 | P0 |
| AC-05 | WebDAV 同步成功率 | ≥ 95%（稳定网络） | 50 次同步测试 | P2 |
| AC-06 | 阿里云 OSS 上传速度 | ≤ 5s（典型配置文件 < 50KB） | 计时测试 | P2 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 导入 JSON 格式错误 | 异常 | 提示"配置文件格式错误: line X, col Y" | 拒绝导入，不影响现有配置 |
| 导入 JSON 缺少必要字段 | 边界 | 使用默认值填充缺失字段 | 列出缺失项供用户确认 |
| 导入版本不兼容 | 边界 | 提示"配置来自 v3.1, 当前 v3.0 可能不兼容" | 允许强制导入，但标注风险 |
| WebDAV 连接失败 | 异常 | 提示"无法连接到 WebDAV 服务器" | 重试 3 次，间隔 2s/5s/10s |
| WebDAV 认证失败 | 异常 | 提示"WebDAV 用户名或密码错误" | — |
| 阿里云 OSS AccessKey 无效 | 异常 | 提示"OSS 认证失败，请检查 AccessKey" | — |
| 配置文件过大 (> 10MB) | 边界 | 提示"配置文件过大" | 建议清理历史数据 |
| 并发同步冲突 | 边界 | 以时间戳较新的为准 | 本地 + 远程时间戳对比 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 安全 | API Key 加密算法 | AES-256-CBC | 安全审计 |
| 安全 | 加密密钥推导 | PBKDF2 (hostname+OS+username) | 跨机解密测试（应失败） |
| 安全 | WebDAV 传输加密 | HTTPS 强制 | URL scheme 检查 |
| 性能 | 配置文件读写 | ≤ 50ms（单次） | 磁盘 I/O 计时 |
| 数据 | 配置文件大小 | ≤ 1MB（典型使用） | 100 天模拟使用 |
| 兼容性 | JSON 向后兼容 | 旧版本 JSON 可被新版本 Pot 导入 | 回归测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | tauri-plugin-store | Tauri invoke | `{key: value}` JSON |
| 依赖 | Rust backup 模块 (local) | Tauri invoke | JSON 文件读写 |
| 依赖 | Rust backup 模块 (webdav) | HTTP WebDAV | JSON 文件上传/下载 |
| 依赖 | Rust backup 模块 (aliyun) | 阿里云 OSS SDK | JSON 文件上传/下载 |
| 依赖 | Rust proxy 模块 | 环境变量 | HTTP_PROXY / HTTPS_PROXY |
| 被依赖 | 所有服务插件 | 配置项读写 | API Key / URL / enabled |
| 被依赖 | 设置页面 | 配置 UI | 所有可配置项 |

---

## 相关文档

- 开发方案: [09-prd-task-配置管理与备份](../../devs/2026-09/09-prd-task-配置管理与备份.md)
- 测试方案: [09-prd-test-配置管理与备份](../../tests/2026-09/09-prd-test-配置管理与备份.md)
- 安全加密存储: [27-prd-安全加密存储](./27-prd-安全加密存储.md)
- WebDAV 阿里云备份: [39-prd-WebDAV阿里云备份](./39-prd-WebDAV阿里云备份.md)
- 代理与网络: [19-prd-代理与网络](./19-prd-代理与网络.md)

---

## 配置版本迁移策略

### 配置文件版本号

所有导出 JSON 包含 `version` 字段：

```json
{
  "version": "3.1.0",
  "exported_at": "2026-09-23T10:00:00Z",
  "config": { ... }
}
```

### 迁移规则表

| 旧版本 | → 新版本 | 迁移操作 | 风险 |
|--------|----------|---------|------|
| 2.x | 3.0 | `proxy_host` 拆分为 `proxy_host` + `proxy_port` | 低: 自动拆分 |
| 3.0 | 3.1 | 新增 `app_fallback_font` 字段 | 低: 使用默认值 |
| 3.1 | 3.2 (未来) | `translate_detect_engine` 更名为 `translate_engine` | 中: 需确认旧值映射 |
| 跨大版本 | — | 不支持直接导入，需经过中间版本 | 高: 提示用户先升级到中间版本 |

### 迁移执行流程

```
导入 JSON
    ↓
解析 version 字段
    ↓
version === 当前版本?
    ├─ 是 → 直接合并配置
    └─ 否 → 查找迁移路径
        ├─ 存在迁移路径 → 执行逐步迁移 → 合并
        └─ 不存在迁移路径 → 拒绝导入，提示"请先升级到 vX.Y"
```

---

## 数据安全分级

### 配置敏感度分级

| 分级 | 配置项 | 存储方式 | 导出行为 |
|------|--------|---------|---------|
| L0 - 公开 | `app_language`, `app_theme`, `app_font_size` | 明文 JSON | 始终导出 |
| L1 - 内部 | `translate_window_width`, `server_port`, `hotkey_*` | 明文 JSON | 始终导出 |
| L2 - 敏感 | `proxy_host`, `webdav_url`, `webdav_username` | 明文 JSON | 选择性导出 |
| L3 - 机密 | 所有 API Key, `webdav_password`, OSS AccessKey | AES-256-CBC 加密 | 仅完整备份导出 (需密码确认) |

### 加密密钥派生机制

```
raw_key = PBKDF2(
    password = hostname + OS + username,
    salt = 固定盐值 (编译期嵌入),
    iterations = 100000,
    key_length = 256
)
```

### 安全威胁模型

| 威胁 | 风险等级 | 缓解措施 |
|------|---------|---------|
| 磁盘被盗/丢失 | 中 | API Key AES-256 加密，密钥与机器绑定 |
| 恶意软件读取配置文件 | 高 | 无法防御 (同机可获取派生密钥) |
| 备份文件泄露 (WebDAV/OSS) | 中 | HTTPS 传输加密 + 建议用户设置备份密码 |
| 导入恶意 JSON | 低 | JSON schema 校验 + 类型检查 |
| 内存中的 API Key | 低 | 使用后不缓存到全局变量 |

> 实现方案见: [开发方案](../../devs/2026-09/09-prd-task-配置管理与备份.md)