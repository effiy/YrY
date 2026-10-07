---
doc_type: test
title: "YiPot 代码质量与健壮性修复 — 测试方案"
tags:
- 测试方案
- 代码质量
- 回归测试
- 异常测试
- 编译验证
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: '202609'
test_id: YP-09-100
prd_ref: YP-09-60
dev_ref: YP-09-100
estimate: 0.25
review_status: 已评审
roles:
- engineer
- qa
---

# YiPot 代码质量与健壮性修复 — 测试方案

> 测试编号：YP-09-100 · 关联 PRD：YP-09-60 · 关联 Dev：YP-09-100

---

## 一、测试策略

本次变更为纯代码质量修复，不涉及功能变更。测试策略分为三层：

1. **编译验证**：Rust `cargo check` + 前端 `pnpm build`
2. **异常场景测试**：模拟配置损坏，验证降级行为
3. **回归测试**：验证核心功能无退化

---

## 二、编译验证

### TC-001: Rust 编译检查

```bash
cd YiPot/src-tauri && cargo check
```

**预期**：编译通过，无 error，无新增 warning。

### TC-002: 前端构建

```bash
cd YiPot && pnpm build
```

**预期**：构建成功，Vite 无 error。

---

## 三、异常场景测试

### TC-003: 配置类型不匹配 — proxy_enable

**前置**：修改 `~/.config/com.pot-app.desktop/store.json`，将 `proxy_enable` 设为字符串 `"true"`

**步骤**：启动 YiPot

**预期**：应用正常启动，不 panic。代理功能使用默认值 (false)。

### TC-004: 配置类型不匹配 — translate_window_width

**前置**：修改 `store.json`，将 `translate_window_width` 设为字符串 `"abc"`

**步骤**：触发划词翻译

**预期**：翻译窗口正常显示，宽度使用默认值 350px。

### TC-005: 配置缺失 — server_port

**前置**：删除 `store.json` 中 `server_port` 字段

**步骤**：启动 YiPot

**预期**：HTTP 服务在默认端口 60828 启动。

### TC-006: 配置类型不匹配 — translate_window_position

**前置**：修改 `store.json`，将 `translate_window_position` 设为数值 `123`

**步骤**：触发划词翻译

**预期**：翻译窗口正常显示，位置使用 "mouse" 默认策略。

---

## 四、HTTP 路由测试

### TC-007: GET / 根路径

```bash
curl http://127.0.0.1:60828/
```

**预期**：返回 "ok"，不阻塞，不 panic。

### TC-008: OCR 路由 — 标准参数

```bash
curl http://127.0.0.1:60828/ocr_recognize?screenshot=false
```

**预期**：返回 "ok"，打开 OCR 识别窗口（无截图模式）。

### TC-009: OCR 路由 — 额外参数

```bash
curl "http://127.0.0.1:60828/ocr_recognize?screenshot=true&lang=en&extra=1"
```

**预期**：返回 "ok"，正确解析 `screenshot=true`，触发截图 OCR。

### TC-010: OCR 翻译路由 — 不同参数顺序

```bash
curl "http://127.0.0.1:60828/ocr_translate?lang=ja&screenshot=true"
```

**预期**：返回 "ok"，正确解析 `screenshot=true`。

### TC-011: 未知路由

```bash
curl http://127.0.0.1:60828/unknown_path
```

**预期**：不 panic，日志输出 WARN `Unknown request url`。

### TC-012: 配置路由

```bash
curl http://127.0.0.1:60828/config
```

**预期**：返回 "ok"，打开设置窗口。

---

## 五、剪切板监听测试

### TC-013: 剪切板监听启用

**前置**：设置中开启剪切板监听 (`clipboard_monitor: true`)

**步骤**：在任意应用中复制文本

**预期**：翻译窗口弹出，显示复制的文本。

### TC-014: 剪切板监听禁用

**前置**：设置中关闭剪切板监听 (`clipboard_monitor: false`)

**步骤**：在任意应用中复制文本

**预期**：翻译窗口不弹出。

---

## 六、前端回归测试

### TC-015: 翻译窗口快捷键

**步骤**：
1. 启动 YiPot
2. 选中文本，按下划词翻译快捷键

**预期**：翻译窗口正常弹出，显示翻译结果。

### TC-016: OCR 截图识别

**步骤**：
1. 按下 OCR 截图识别快捷键
2. 框选屏幕区域

**预期**：OCR 识别窗口正常弹出。

### TC-017: 设置窗口

**步骤**：通过托盘菜单打开设置窗口

**预期**：设置窗口正常显示，各配置项可正常读写。

### TC-018: YiAi 集成 — AI 翻译

**前置**：YiAi 后端运行在 `localhost:10086`

**步骤**：
1. 配置 OpenAI 翻译服务
2. 进行翻译

**预期**：通过 YiAi RPC 翻译成功，无 error。

### TC-019: 降级翻译

**前置**：YiAi 后端不可用

**步骤**：使用 AI 引擎翻译

**预期**：自动降级到前端直接调用第三方 API，翻译仍成功。

---

## 七、测试结果

| 测试编号 | 描述 | 结果 | 备注 |
|----------|------|------|------|
| TC-001 | Rust 编译检查 | ✅ | `cargo check` 通过 |
| TC-002 | 前端构建 | ✅ | `pnpm build` 通过 |
| TC-003 | proxy_enable 类型不匹配 | ✅ | 不 panic，使用默认值 |
| TC-004 | translate_window_width 类型不匹配 | ✅ | 不 panic，使用 350px 默认 |
| TC-005 | server_port 缺失 | ✅ | 默认 60828 端口 |
| TC-006 | translate_window_position 类型不匹配 | ✅ | 使用 "mouse" 默认 |
| TC-007 | GET / 根路径 | ✅ | 返回 "ok" |
| TC-008 | OCR 路由标准参数 | ✅ | 正常触发 |
| TC-009 | OCR 路由额外参数 | ✅ | 正确解析 screenshot=true |
| TC-010 | OCR 翻译路由不同参数顺序 | ✅ | 正确解析 |
| TC-011 | 未知路由 | ✅ | WARN 日志，不 panic |
| TC-012 | 配置路由 | ✅ | 正常 |
| TC-013 | 剪切板监听启用 | ✅ | 正常 |
| TC-014 | 剪切板监听禁用 | ✅ | 正常 |
| TC-015 | 翻译窗口快捷键 | ✅ | 正常 |
| TC-016 | OCR 截图识别 | ✅ | 正常 |
| TC-017 | 设置窗口 | ✅ | 正常 |
| TC-018 | YiAi AI 翻译 | — | 需 YiAi 环境 |
| TC-019 | 降级翻译 | — | 需模拟网络断开 |

---

## 八、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/60-prd-代码质量与健壮性修复.md` |
| Dev | `../devs/2026-09/100-prd-task-代码质量与健壮性修复.md` |
| Bug × 4 | `../bugs/功能缺陷/005~008-*.md` |