---

doc_type: test
title: "CLI 命令行 — 测试方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["38-prd-CLI命令行"]
source_modules: ["38-prd-CLI命令行"]

type: test
---

# CLI 命令行 — 测试方案

> 覆盖 YP-09-S27：`pot translate`、`pot ocr`、`pot config`、`--version`、`--help` 命令及参数解析

---

## 一、核心功能测试

### 1.1 translate 命令

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CLI-001 | 英文→中文 | `pot translate "hello" --to zh` | 输出"你好"（含所有启用服务结果），< 2s |
| TC-CLI-002 | 中文→英文 | `pot translate "你好" --from zh --to en` | 输出 "Hello"，< 2s |
| TC-CLI-003 | 带 --json flag | `pot translate "hello" --to zh --json` | 输出 `{"services":[{"name":"...","result":"..."}],"text":"..."}` |
| TC-CLI-004 | 缺少必填参数 | `pot translate` 无参数 | 错误提示"请提供要翻译的文本"，< 100ms |
| TC-CLI-005 | stdin 管道输入 | `echo "hello" \| pot translate --to zh` | 从 stdin 读取文本翻译 |

### 1.2 ocr 命令

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CLI-010 | 截图 OCR | `pot ocr --screenshot` | 触发截图 → OCR 文字输出到 stdout，< 3s |
| TC-CLI-011 | 指定文件 | `pot ocr --file screenshot.png` | 识别 PNG 文字输出到 stdout，< 2s |
| TC-CLI-012 | 文件不存在 | `pot ocr --file missing.png` | 错误提示"文件不存在" |
| TC-CLI-013 | 截图取消 | `pot ocr --screenshot` 用户按 Esc | 返回 exit code 1，无输出 |

### 1.3 元命令

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CLI-020 | 版本号 | `pot --version` | 输出 `pot 1.0.0`，< 100ms |
| TC-CLI-021 | 帮助信息 | `pot --help` | 输出完整帮助文本含所有子命令，< 100ms |
| TC-CLI-022 | 打开设置 | `pot config` | 打开图形化设置窗口，< 1s |
| TC-CLI-023 | 无效命令 | `pot unknown-command` | 错误提示 + 建议类似命令，< 100ms |

---

## 二、边界与异常测试

| 编号 | 场景 | 输入 | 预期行为 | 恢复策略 |
|------|------|------|----------|----------|
| TC-CLI-EDGE-01 | 文本含换行 | `pot translate "line1\nline2"` | 整体翻译，换行保留 | — |
| TC-CLI-EDGE-02 | Shell 特殊字符 | `"hello $USER world"` | 正确转义，不展开变量 | 建议单引号包裹 |
| TC-CLI-EDGE-03 | 无效语言代码 | `pot translate "hello" --to xyz` | 错误提示"不支持的语言代码" | 显示可用语言列表 |
| TC-CLI-EDGE-04 | 截图取消 | `pot ocr --screenshot` 用户取消 | exit code 1，无输出 | — |
| TC-CLI-EDGE-05 | 指定文件不存在 | `pot ocr --file missing.png` | 错误提示"文件不存在" | — |
| TC-CLI-EDGE-06 | 无网络 | `pot translate "hello" --to zh` | 使用本地/缓存服务 | 标注"离线模式" |
| TC-CLI-EDGE-07 | stdin 与 --text 互斥 | stdin + `--text` 同时使用 | 报错"互斥参数" | — |
| TC-CLI-EDGE-08 | 应用已在运行 | 再次执行 `pot` | 参数转发到已有实例 | Tauri single-instance |

---

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-CLI-PERF-01 | --version | 响应时间 | < 100ms | > 200ms | 直接输出，不初始化完整应用 |
| TC-CLI-PERF-02 | --help | 响应时间 | < 100ms | > 200ms | 同上 |
| TC-CLI-PERF-03 | 命令解析 | 解析延迟 | < 50ms | > 100ms | 不含实际翻译/OCR |
| TC-CLI-PERF-04 | translate 短文本 | 端到端延迟 | < 2s | > 5s | 含网络请求 |
| TC-CLI-PERF-05 | ocr --file png | 端到端延迟 | < 2s | > 4s | 含 API 调用 |
| TC-CLI-PERF-06 | ocr --screenshot | 端到端延迟 | < 3s | > 6s | 含截图+OCR |
| TC-CLI-PERF-07 | config 窗口打开 | 启动延迟 | < 1s | > 2s | 打开图形窗口 |

---

## 四、兼容性测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-CLI-COM-01 | macOS Terminal | 在 Terminal.app 执行所有命令 | 全部正常 | P0 |
| TC-CLI-COM-02 | Windows CMD | 在 cmd.exe 中执行 | pot.exe 在 PATH 中可用 | P0 |
| TC-CLI-COM-03 | Windows PowerShell | 在 PowerShell 中执行 | 支持 UTF-8 输出 | P1 |
| TC-CLI-COM-04 | Linux bash/zsh | 在 bash/zsh 中执行 | 全部正常 | P0 |
| TC-CLI-COM-05 | 参数转发单实例 | 多开 pot 进程 | 参数转发到已有实例 | P1 |
| TC-CLI-COM-06 | --json 输出解析 | `pot ... --json \| jq .` | 输出合法 JSON | P1 |

---

## 五、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-CLI-01 | pot translate 英文→中文 | translate | 是 | P0 |
| REG-CLI-02 | pot ocr --screenshot | ocr | 否 | P0 |
| REG-CLI-03 | pot --version | meta | 是 | P0 |
| REG-CLI-04 | pot --help | meta | 是 | P1 |
| REG-CLI-05 | pot config 打开设置 | config | 否 | P1 |
| REG-CLI-06 | 无效命令帮助提示 | 错误处理 | 是 | P1 |
| REG-CLI-07 | stdin 管道输入 | 输入 | 是 | P1 |
| REG-CLI-08 | --json 输出格式 | 输出 | 否 | P1 |
| REG-CLI-09 | 单实例参数转发 | 重入 | 否 | P2 |

---

## 六、参考文档

- [38-prd-CLI命令行](../prds/2026-09/38-prd-CLI命令行.md) — 源 PRD
- [43-prd-Rust配置备份错误处理](../prds/2026-09/43-prd-Rust配置备份错误处理.md) — Rust 层命令注册
- [34-prd-并行调度策略](../prds/2026-09/34-prd-并行调度策略.md) — 翻译/OCR 并行调度