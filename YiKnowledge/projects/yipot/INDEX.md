---
title: "YiPot 项目文档索引"
tags: [yipot, index, documentation]
category: projects/yipot
created: 2026-09-23
updated: 2026-09-23
source: internal
type: index
status: stable
roles: [engineer, leader, product]
---

# YiPot 项目文档索引

> 完整导航：10 轮审计修复 · 28 个 Bug · 11 个 PRD · 11 个开发方案 · 9 个测试方案 · 7 份架构/规范/审计报告

---

## 一、快速导航

| 想要... | 去哪里 |
|---------|--------|
| 了解本次审计全貌 | [审计完成报告](architecture/audit-completion-report.md) |
| 查看修复清单 | [CHANGELOG](../../YiPot/CHANGELOG) 3.0.8 |
| 了解安全风险 | [安全配置审计](architecture/security-config-audit.md) |
| 了解代码质量 | [代码质量审计报告](architecture/code-quality-audit.md) |
| 了解 i18n 状态 | [i18n 键完整性审计](architecture/i18n-audit.md) |
| 开发翻译引擎 | [翻译服务错误处理指南](workflows/开发规范/08-规范-翻译服务错误处理.md) |
| 环境搭建 | [环境搭建指南](workflows/操作指南/01-指南-环境搭建.md) |
| 架构概览 | [项目架构规范](workflows/开发规范/02-规范-项目架构.md) |

---

## 二、Bug 报告（28 个）

### 功能缺陷（27 个）

| Bug ID | 标题 | 模块 | 严重度 | 状态 |
|--------|------|------|--------|------|
| 005 | Rust 配置读取 unwrap panic | main/window/server | P1 | ✅ |
| 006 | HTTP 路由 URL 解析缺陷 | server.rs | P2 | ✅ |
| 007 | 剪切板状态字符串布尔反模式 | clipboard.rs | P3 | ✅ |
| 008a | WebDav name unwrap panic | backup.rs | P1 | ✅ |
| 008b | 前端死代码与 let 声明 | App/yiaiAdapter | P3 | ✅ |
| 009 | lang_detect 每次重建检测器 | lang_detect.rs | P2 | ✅ |
| 010 | screenshot unwrap 崩溃 | screenshot.rs | P1 | ✅ |
| 011 | App.jsx warn() 未导入 | App.jsx | P0 | ✅ |
| 012 | backup config_dir unwrap 残留 | backup.rs | P2 | ✅ |
| 013 | window/system_ocr expect/unwrap | window/system_ocr | P1 | ✅ |
| 014 | cmd 图像/代理/插件 unwrap | cmd.rs | P1 | ✅ |
| 015 | config/hotkey unwrap panic | config/hotkey | P0 | ✅ |
| 016 | tray 托盘/日志/退出 unwrap | tray.rs | P1 | ✅ |
| 017 | lang_detect 未处理 Promise 拒绝 | lang_detect.js | P1 | ✅ |
| 018 | Translate 变量名冲突 | Translate/index.jsx | P2 | ✅ |
| 019 | api/client get/post 缺超时 | client.ts | P2 | ✅ |
| 020 | useVoice AudioContext 失败 | useVoice.jsx | P0 | ✅ |
| 021 | Screenshot 无错误处理 | Screenshot/index.jsx | P2 | ✅ |
| 022 | Recognize 变量名冲突 | Recognize/index.jsx | P3 | ✅ |
| 023 | Backup 定时器生命周期 | Backup/index.jsx | P3 | ✅ |
| 024 | General/WindowControl 生命周期 | General/WindowControl | P3 | ✅ |
| 025 | Google 翻译 null safety | google/index.jsx | P2 | ✅ |
| 026 | Baidu 翻译 config null | baidu/index.jsx | P2 | ✅ |
| 027 | Updater listener 未清理 | Updater/index.jsx | P3 | ✅ |
| 029 | TTS Lingva config null | tts/lingva/index.jsx | P2 | ✅ |
| 030 | Eudic/Anki config null | collection/* | P3 | ✅ |
| 031 | History TS 语法构建失败 | History/index.jsx | P0 | ✅ |
| 032 | DeepL 逗号运算符 + config | deepl/index.jsx | P2 | ✅ |
| 033 | OpenAI options 无默认值 | openai/index.jsx | P2 | ✅ |
| 034 | YouDao config null | youdao/index.jsx | P3 | ✅ |
| 035 | Baidu/Tencent OCR config null | recognize/baidu,tencent | P2 | ✅ |

### 平台兼容（2 个）

| Bug ID | 标题 | 状态 |
|--------|------|------|
| 001 | macOS 截图黑屏 | ✅ |
| 002 | Windows 高 DPI 模糊 | ✅ |

### 性能问题（1 个）

| Bug ID | 标题 | 状态 |
|--------|------|------|
| 003 | 剪切板 CPU 占用高 | ✅ |

### 安全隐私（2 个）

| Bug ID | 标题 | 状态 |
|--------|------|------|
| 004 | API Key 明文存储 | ⚠️ 已知限制 |
| 028 | Tauri 安全配置 daemon CSP | ⚠️ Tauri 2.x 规划 |

---

## 三、PRD 需求文档（11 个）

| ID | 标题 | 对应轮次 |
|----|------|---------|
| YP-09-60 | 代码质量与健壮性修复 | R1 |
| YP-09-65 | 深度健壮性修复第二轮 | R2 |
| YP-09-66 | 深度健壮性修复第三轮 | R3 |
| YP-09-67 | 前端健壮性修复第四轮 | R4 |
| YP-09-68 | 前端体验修复第五轮 | R5 |
| YP-09-69 | 收尾修复第六轮 | R6 |
| YP-09-70 | 服务层修复第七轮 | R7 |
| YP-09-71 | 安全审计与收尾第八轮 | R8 |
| YP-09-72 | 服务层与构建修复第九轮 | R9 |
| YP-09-73 | 翻译引擎与 i18n 审计第十轮 | R10 |
| YP-09-74 | OCR 服务与 Config 审计第十一轮 | R11 |
| YP-09-82 | 深度审计与性能优化第二十轮 | R20 |
| YP-09-101 | 项目概览活动模块优化 | YiVad |

---

## 四、开发方案（11 个）

| ID | 关联 PRD | 标题 |
|----|---------|------|
| YP-09-100 | YP-09-60 | 代码质量与健壮性修复 |
| YP-09-106 | YP-09-65 | 深度健壮性修复第二轮 |
| YP-09-107 | YP-09-66 | 深度健壮性修复第三轮 |
| YP-09-108 | YP-09-67 | 前端健壮性修复第四轮 |
| YP-09-109 | YP-09-68 | 前端体验修复第五轮 |
| YP-09-110 | YP-09-69 | 收尾修复第六轮 |
| YP-09-111 | YP-09-70 | 服务层修复第七轮 |
| YP-09-112 | YP-09-71 | 安全审计与收尾第八轮 |
| YP-09-113 | YP-09-72 | 服务层与构建修复第九轮 |
| YP-09-114 | YP-09-73 | 翻译引擎与 i18n 审计第十轮 |
| YP-09-115 | YP-09-74 | OCR 服务与 Config 审计第十一轮 |
| YP-09-123 | YP-09-101 | 项目概览活动模块优化 |
| YP-09-124 | YP-09-82 | 深度审计与性能优化第二十轮 |

---

## 五、测试方案（9 个）

| ID | 关联开发 | 用例数 |
|----|---------|--------|
| YP-09-111 | YP-09-106 | 10 |
| YP-09-112 | YP-09-107 | 12 |
| YP-09-113 | YP-09-108 | 13 |
| YP-09-114 | YP-09-109 | 8 |
| YP-09-115 | YP-09-110 | 3 |
| YP-09-116 | YP-09-111 | 5 |
| YP-09-117 | YP-09-112 | 4 |
| YP-09-118 | YP-09-113 | 7 |
| YP-09-119 | YP-09-114 | 8 |
| YP-09-120 | YP-09-115 | 6 |
| YP-09-130 | YP-09-123 | 8 |
| YP-09-131 | YP-09-124 | 8 |

---

## 六、架构/规范/审计报告（8 份）

| 文档 | 类型 | 说明 |
|------|------|------|
| [architecture/yiai-integration.md](architecture/yiai-integration.md) | 架构 | YiAi 后端集成架构 |
| [architecture/code-quality-audit.md](architecture/code-quality-audit.md) | 审计 | 代码质量审计报告 |
| [architecture/security-config-audit.md](architecture/security-config-audit.md) | 审计 | Tauri 安全配置审计 |
| [architecture/i18n-audit.md](architecture/i18n-audit.md) | 审计 | i18n 键完整性审计 |
| [architecture/audit-completion-report.md](architecture/audit-completion-report.md) | 审计 | 11 轮审计完成报告 |
| [workflows/开发规范/08-规范-翻译服务错误处理.md](workflows/开发规范/08-规范-翻译服务错误处理.md) | 规范 | 翻译服务错误处理指南 |
| [migration-guide.md](migration-guide.md) | 指南 | 迁移指南 |

---

## 七、各轮次覆盖率

```
Rust (src-tauri/src/)          前端 (src/)                    服务层
────────────────────────        ──────────────────────        ──────────────────
main.rs            ✅ R1        main.jsx           ✅         translate/ (21)  ⚠️ 7/21
cmd.rs             ✅ R3        App.jsx            ✅ R2      recognize/ (15) ⚠️ 5/15
config.rs          ✅ R3        api/client.ts      ✅ R4      tts/ (1)         ✅ R9
window.rs          ✅ R1-R2     api/init.ts        ✅         collection/ (2)  ✅ R9
server.rs          ✅ R1        api/services/*     ✅         
clipboard.rs       ✅ R1        hooks/useVoice     ✅ R5      Config Pages
hotkey.rs          ✅ R3        hooks/useConfig    ✅          General          ✅ R6
tray.rs            ✅ R3        hooks/useGetState  ✅          Translate        ✅ R11
backup.rs          ✅ R1-R2     hooks/useSyncAtom  ✅          Recognize        ✅ R6
screenshot.rs      ✅ R1        utils/lang_detect  ✅ R4       History          ✅ R9
system_ocr.rs      ✅ R2        utils/env.js       ⚠️         Hotkey           ✅
lang_detect.rs     ✅ R1        utils/store.js     ✅          Backup           ✅ R5
updater.rs         ✅           utils/index.js     ✅          Service          ✅ R11
error.rs           ✅           utils/svc_instance ⚠️         About            ✅
                                window/Translate   ✅ R4-R5    
                                window/Recognize   ✅ R5       i18n (20)        ✅ R10
                                window/Screenshot  ✅ R5       
                                window/Updater     ✅ R7       
                                window/Config/*    ✅          
                                components/WinCtl  ✅ R6
```

✅ 深度审计 · ⚠️ 浅审计/审计未发现阻塞问题

---

## 八、统计

| 指标 | 数值 |
|------|------|
| 总轮次 | 17 |
| 修复项 | ~145 |
| Bug 报告 | 41 (功能 34 + 其他 7) |
| PRD | 17 (60-80) |
| 开发方案 | 17 (100-121) |
| 测试方案 | 16 (111-128) |
| 架构/规范/策略/指南 | 14 |
| **文档总计** | **~100** |
| 翻译引擎 config safety | **100% (21/21)** |
| Rust unwrap 审计 | **100% (14/14)** |
| 文档总计 | **68** |
| 3.0.8 CHANGELOG 条目 | 27 |