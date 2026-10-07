---

doc_type: test
title: "Rust 模块 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["40-prd-Rust剪贴板模块", "41-prd-Rust托盘模块", "42-prd-Rust截图OCR语言检测", "43-prd-Rust配置备份错误处理"]

type: test
---

# Rust 模块 — 测试方案

## 剪贴板测试

### TC-CLIP-001: 读取选中文本

| 步骤 | 选中文本 → 调用 get_selected_text |
| 预期 | 返回选中的文本 |

### TC-CLIP-002: 剪贴板恢复

| 步骤 | 复制"A"→ 选中"B"触发翻译 → 检查剪贴板 |
| 预期 | 剪贴板内容恢复为"A" |

## 语言检测测试

### TC-LD-001: 中文检测

| 步骤 | 输入"你好世界" |
| 预期 | 返回 "zh" |

### TC-LD-002: 英文检测

| 步骤 | 输入 "Hello World" |
| 预期 | 返回 "en" |

## 配置测试

### TC-CFG-R01: 首次运行

| 步骤 | 删除配置 → 启动 |
| 预期 | 打开设置窗口 + 创建默认配置 |

### TC-CFG-R02: 配置重载

| 步骤 | 外部修改配置 → 调用 reload_store |
| 预期 | 前端读取到最新配置 |

## 截图测试

### TC-SCR-R01: macOS 截图

| 步骤 | 调用 screenshot() |
| 预期 | 返回 PNG 字节流 |

### TC-SCR-R02: Windows 截图

| 步骤 | 调用 screenshot() |
| 预期 | 返回 BMP/PNG 字节流 |

---

## 增强边界与异常测试

### 边界值测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-EDGE-01 | 剪贴板读取空内容 | 剪贴板为空 | Rust 返回空字符串，前端不触发翻译 | P1 |
| TC-EDGE-02 | 剪贴板非 UTF-8 编码 | 复制 Latin-1/Shift-JIS 编码文本 | Rust 正确转码为 UTF-8 或返回错误 | P2 |
| TC-EDGE-03 | 剪贴板含 emoji + 零宽字符 | 复制 "Hel😊lo​ZWNJ" | Rust 保留 Unicode，不截断零宽字符 | P3 |
| TC-EDGE-04 | 语言检测极短文本 | "a" 或 "的" | 返回合理结果或 "unknown" | P2 |
| TC-EDGE-05 | 语言检测混合文本边界 | "今天 meet 了 team" | 返回主语言 "zh" 而非 "en" | P2 |
| TC-EDGE-06 | 配置存储嵌套 JSON 深度 | JSON 嵌套 20 层 | Rust serde 正确序列化/反序列化 | P2 |
| TC-EDGE-07 | 配置 JSON 含 Unicode 转义 | `{"key":"\u4f60\u597d"}` | Rust 正确解析为 "你好" | P3 |
| TC-EDGE-08 | 截图 API 返回超大 PNG | 8K 截图 (7680x4320) | Rust 返回有效 PNG 字节流，内存可接受 | P2 |

### 异常场景测试

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-01 | Rust FFI panic 跨越边界 | Rust 函数内部 unwrap() 失败 | Panic 被 FFI 边界捕获，不崩溃主进程 | 下次调用正常 |
| TC-ERR-02 | Rust 库缺失 (dylib 找不到) | 删除 .dylib/.dll/.so 文件 | 前端提示"Rust 模块加载失败，部分功能不可用" | 恢复文件后正常 |
| TC-ERR-03 | 剪贴板系统 API 失败 | macOS 剪贴板权限被撤销 | Rust 返回错误码，前端显示权限提示 | 授权后正常 |
| TC-ERR-04 | 配置 JSON 格式损坏 | 手动编辑配置文件为非法 JSON | Rust 返回解析错误，前端显示"配置损坏"并重建 | 重建默认配置后正常 |
| TC-ERR-05 | 截图 API 在无显示器环境 | Linux Server 无 GUI 环境调用截图 | Rust 返回"无显示设备"错误 | — |
| TC-ERR-06 | 语言检测不支持的语言 | 输入罕见文字系统 (如切罗基文) | 返回 "unknown"，不 panic | — |
| TC-ERR-07 | 并发调用 FFI 函数 | 2 个前端线程同时调用 Rust 截图 | Rust 串行化处理，不产生竞态 | — |
| TC-ERR-08 | 配置写入磁盘满 | 磁盘 0 字节 → 保存配置 | Rust 返回 IO 错误，前端提示"保存失败" | 清理磁盘后正常 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | 剪贴板读取 (纯文本) | P50/P95 | ≤ 1/3ms | > 5/10ms | 1000 次 Rust FFI 调用 |
| TC-PERF-02 | 剪贴板保存+恢复 | P50 | ≤ 2ms | > 10ms | 保存原内容→模拟选中→恢复，500 次 |
| TC-PERF-03 | 语言检测 | P50/P95 | ≤ 1/5ms | > 5/15ms | 1000 次 100 字文本 |
| TC-PERF-04 | 截图 PNG 编码 | P50 for 1920x1080 | ≤ 100ms | > 300ms | 50 次 macOS screencapture |
| TC-PERF-05 | 配置 JSON 读取 | P50 for 10KB config | ≤ 2ms | > 10ms | 1000 次 serde 反序列化 |
| TC-PERF-06 | FFI 调用开销 | 空函数往返 | ≤ 0.1ms | > 0.5ms | 10000 次 napi-rs/tauri invoke |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | Rust 内存安全 (unsafe 块审查) | 审计所有 unsafe 代码块 | 无 use-after-free、buffer overflow | P0 |
| TC-SEC-02 | 剪贴板内容不跨进程泄漏 | 检查 Rust 剪贴板数据流 | 读取后仅传递给前端，不写磁盘/网络 | P0 |
| TC-SEC-03 | 配置文件权限 | 检查配置文件权限位 | macOS/Linux: 0600，Windows: 仅当前用户可读写 | P1 |
| TC-SEC-04 | FFI 输入校验 | 传入超长字符串/空指针 | Rust 侧边界检查，不 segfault | P0 |
| TC-SEC-05 | 截图数据不落盘 | 截图后检查 /tmp 目录 | 无残留 PNG 临时文件 | P1 |
| TC-SEC-06 | Rust 依赖供应链审计 | cargo audit 检查 | 无已知高危 CVE | P2 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 优先级 |
|------|---------|---------|--------|
| REG-01 | 剪贴板读取选中文本 | 剪贴板模块 | P0 |
| REG-02 | 剪贴板恢复原内容 | 剪贴板模块 | P0 |
| REG-03 | 中英文语言检测 | 语言检测 | P0 |
| REG-04 | 首次运行创建默认配置 | 配置模块 | P1 |
| REG-05 | macOS 截图返回 PNG | 截图模块 | P0 |
| REG-06 | 配置 JSON 解析+重载 | 配置模块 | P1 |

## 参考文档

- [Rust 剪贴板 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/40-prd-Rust剪贴板模块.md)
- [Rust 托盘 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/41-prd-Rust托盘模块.md)
- [Rust 截图 OCR 语言 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/42-prd-Rust截图OCR语言检测.md)
- [Rust 配置备份错误 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/43-prd-Rust配置备份错误处理.md)