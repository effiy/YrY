---
title: "17 个服务 Config.jsx 中敏感字段未使用 type='password' 掩码"
tags: [bug, security, config, password, privacy, hardening]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: partial
severity: minor
priority: p3
project: yipot
module: src/services/**/Config.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# 服务 Config.jsx 敏感字段未使用 type='password' 掩码

---

## 一、现象

> 17 个服务的 API Key/Secret/Token 字段在设置界面以明文显示，旁观者可看到完整凭据。

## 二、已修复 (1/17)

| 文件 | 修复 |
|------|------|
| `baidu/Config.jsx` | secret 字段添加 `type='password'` |

## 三、待修复 (16/17) — 安全加固清单

| 类别 | 文件 | 敏感字段 |
|------|------|---------|
| 翻译 | `alibaba/Config.jsx` | accesskey_secret |
| 翻译 | `caiyun/Config.jsx` | token |
| 翻译 | `niutrans/Config.jsx` | apikey |
| 翻译 | `tencent/Config.jsx` | secret_key |
| 翻译 | `transmart/Config.jsx` | token |
| 翻译 | `volcengine/Config.jsx` | secret |
| 翻译 | `baidu_field/Config.jsx` | secret |
| OCR | `recognize/baidu/Config.jsx` | client_secret |
| OCR | `recognize/baidu_accurate/Config.jsx` | client_secret |
| OCR | `recognize/baidu_img/Config.jsx` | client_secret |
| OCR | `recognize/tencent/Config.jsx` | secret_key |
| OCR | `recognize/tencent_accurate/Config.jsx` | secret_key |
| OCR | `recognize/tencent_img/Config.jsx` | secret_key |
| OCR | `recognize/volcengine/Config.jsx` | secret |
| OCR | `recognize/volcengine_multi_lang/Config.jsx` | secret |
| OCR | `recognize/iflytek/Config.jsx` | apisecret |
| OCR | `recognize/iflytek_intsig/Config.jsx` | apisecret |
| OCR | `recognize/iflytek_latex/Config.jsx` | apisecret |
| OCR | `recognize/simple_latex/Config.jsx` | token |
| 生词本 | `collection/eudic/Config.jsx` | token |

**修复方法**：对每个文件中的敏感 `<Input>` 组件添加 `type='password'` 属性。

## 四、验证

- [x] baidu secret 字段已掩码
- [ ] 其余 16 个服务待修复