---
doc_type: prd
title: "YP-09-S16: API Key 加密与安全存储"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S16
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 安全, 加密, API Key]
category: 项目/桌面应用/需求
---

# YP-09-S16: API Key 加密与安全存储

> 需求编号：YP-09-S16 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 背景

用户配置的翻译/OCR API Key 是敏感凭据。明文存储意味着任何能访问配置文件的程序都可以窃取这些凭据。需要本地加密存储。

## 需求

### 加密方案

- 使用 `crypto-js` AES 加密
- 加密密钥：基于机器指纹生成（hostname + OS + username hash）
- 仅加密 `apiKey`/`secret` 等敏感字段

### 存储格式

```json
{
  "translate_baidu_appId": "20230101000000001",
  "translate_baidu_secret": "U2FsdGVkX1...",  // 加密后的 secret
  "translate_baidu_enable": true
}
```

### 安全边界

- 配置文件不在网络上传输（除非用户主动使用 WebDAV 同步）
- HTTP 服务仅绑定 127.0.0.1
- 日志中不输出 API Key 明文

## 验收标准

- [ ] 磁盘上 API Key 不以明文存储
- [ ] 加密密钥基于机器指纹
- [ ] 配置文件复制到其他机器无法解密
- [ ] 日志不含 API Key 明文

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 无法获取机器指纹（hostname/os/user） | 异常 | 使用固定 salt 作为 fallback | 安全性降低，记录警告 |
| 加密数据损坏 | 异常 | 提示"配置数据损坏，请重新配置 API Key" | 该服务 API Key 重置为空 |
| 配置文件迁移到其他机器 | 边界 | 加密 Key 无法解密，需重新配置 | 提示"配置文件包含本机绑定数据" |
| crypto-js 模块不可用 | 异常 | 降级为明文存储 | 记录严重警告 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 安全 | 加密算法 | AES-256-CBC | 安全审计 |
| 安全 | 加密密钥推导 | PBKDF2 (hostname+OS+username), 100000 iterations | 代码审查 |
| 安全 | 跨机解密防护 | 不同机器无法解密 | 跨机测试 |
| 安全 | 日志安全检查 | 0 条 API Key 明文泄露 | 日志全文搜索 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | crypto-js | AES encrypt/decrypt API | `CryptoJS.AES.encrypt(plaintext, key)` |
| 依赖 | 机器指纹 (hostname + OS + username) | Node.js/Rust API | 派生密钥字符串 |
| 依赖 | tauri-plugin-store | Tauri invoke | 加密后的配置 JSON |
| 被依赖 | 所有服务插件 | 配置读写 | 解密后的 API Key |

---

## 相关文档

- 开发方案: [27-prd-task-安全加密存储](../../devs/2026-09/27-prd-task-安全加密存储.md)
- 测试方案: [27-prd-test-安全加密存储](../../tests/2026-09/27-prd-test-安全加密存储.md)
- 构建发布与安全: [11-prd-构建发布与安全](./11-prd-构建发布与安全.md)
- 配置管理与备份: [09-prd-配置管理与备份](./09-prd-配置管理与备份.md)