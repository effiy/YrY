---
doc_type: test
title: "YK-09-02: 文件同步可靠性 — 测试用例"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-02"
source_prds: ["05-稳定性修复-文件同步"]
source_modules: ["05-prd-task-文件同步"]
source_okr: [yiknowledge-001]
---

# YK-09-02: 文件同步可靠性 — 测试用例

> 来源 PRD：[05-稳定性修复-文件同步.md](../../prds/2026-09/05-稳定性修复-文件同步.md)
> 开发方案：[05-prd-task-文件同步.md](../../devs/2026-09/05-prd-task-文件同步.md)
> 需求编号：YK-09-02 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。覆盖 mtime 稳定等待、内容哈希校验、重试退避、`.tmp` 过滤、日志升级 5 个修复策略。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、单元测试](#sec-3)
- [四、集成测试 — 竞态复现](#sec-4)
- [五、集成测试 — 日志行为](#sec-5)
- [六、性能测试](#sec-6)
- [七、缺陷分级](#sec-7)

---

<a id="sec-1"></a>
## 一、测试范围与目标

| 修复策略 | 测试重点 |
|---------|---------|
| mtime 稳定等待 | 200ms 等待后 mtime 不变 → 通过；持续变化 → DEFERRED |
| 内容哈希校验 | 前后哈希一致 → 通过；不一致 → 重试 |
| 指数退避重试 | 3 次上限，间隔 100/200/400ms |
| `.tmp` 过滤 | `.tmp` 和 `.` 开头文件被跳过 |
| 日志升级 | 解析失败 WARNING（非 DEBUG），含文件路径 |

---

<a id="sec-2"></a>
## 二、测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest + pytest-asyncio | mtime 稳定判定、哈希校验、`.tmp` 过滤 | 45% |
| 集成测试 | pytest + 临时目录 | 竞态复现（并发写入+扫描）、退避重试 | 40% |
| 性能测试 | pytest-benchmark | SHA256 计算耗时、mtime 等待对扫描延迟影响 | 15% |

---

<a id="sec-3"></a>
## 三、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-MT-01 | mtime 稳定（不变） | 文件 mtime 在 200ms 内不变 | `_wait_mtime_stable()` 返回 True |
| UT-MT-02 | mtime 持续变化 | 文件在 200ms 内被持续修改 | 返回 False，日志 WARNING |
| UT-MT-03 | mtime 仅变化一次 | 文件在 0ms 被 touch，之后稳定 | 返回 True（仅检测首尾 mtime 差） |
| UT-HS-01 | 内容哈希一致 | 同一文件连续 2 次 SHA256 | `_verify_content_stable()` 返回 True |
| UT-HS-02 | 内容哈希不一致 | 两次哈希之间文件被修改（追加 1 字节） | 返回 False |
| UT-HS-03 | 空文件哈希 | 空文件（0 字节） | SHA256 计算正确（`e3b0c44...`） |
| UT-RT-01 | 第 1 次重试成功 | 哈希第 1 次不一致，第 2 次一致 | 重试 1 次后返回 INDEXED |
| UT-RT-02 | 3 次重试全部失败 | 哈希 3 次均不一致 | 返回 DEFERRED，日志 WARNING |
| UT-RT-03 | 退避间隔递增 | 3 次重试 | sleep 依次为 100/200/400ms |
| UT-TM-01 | `.tmp` 文件被跳过 | 文件 `doc.md.tmp` | 返回 SKIPPED_TEMP |
| UT-TM-02 | 隐藏文件被跳过 | 文件 `.gitignore` | 返回 SKIPPED_TEMP |
| UT-TM-03 | 正常 `.md` 文件不被过滤 | 文件 `doc.md` | 正常进入 process_file 流程 |

---

<a id="sec-4"></a>
## 四、集成测试 — 竞态复现

| 编号 | 场景 | 操作 | 预期 |
|------|------|------|------|
| IT-RC-01 | 写入中扫描（修复前复现） | 主线程写入 200KB 文件 → 子线程在 50ms 时触发扫描 | 修复后：返回 DEFERRED（非不完整索引） |
| IT-RC-02 | 正常写入后扫描 | 文件写入完成 → 等待 300ms → 触发扫描 | 返回 INDEXED，内容完整 |
| IT-RC-03 | 100 次并发写入+扫描 | 100 轮：写入大文件 → 随机延迟 0-100ms → 触发扫描 | 0 次不完整索引（DEFERRED 不计入失败） |
| IT-RC-04 | `.tmp` → `.md` 原子重命名 | 写入 `doc.tmp` → `os.rename(doc.tmp, doc.md)` → 扫描 | `.tmp` 被跳过，`.md` 正常索引 |
| IT-RC-05 | 3 次哈希失败 → 下轮轮询恢复 | 持续写入 2s 的大文件 → 第 1 轮 DEFERRED → 第 2 轮正常索引 | 第 1 轮返回 DEFERRED，第 2 轮返回 INDEXED |

---

<a id="sec-5"></a>
## 五、集成测试 — 日志行为

| 编号 | 场景 | 条件 | 预期日志 |
|------|------|------|---------|
| IT-LG-01 | 解析失败 → WARNING | Frontmatter 格式错误 | `logger.warning`，含文件路径和错误原因 |
| IT-LG-02 | mtime 持续变化 → WARNING | 文件被持续写入 | `logger.warning`，含 mtime 持续变化提示 |
| IT-LG-03 | 哈希 3 次失败 → WARNING | 文件内容持续变化 | `logger.warning`，含 3 次失败和文件路径 |
| IT-LG-04 | 正常索引无 WARNING | 文件正常写入 → 扫描 | 无 WARNING 日志（或不含文件同步相关） |

---

<a id="sec-6"></a>
## 六、性能测试

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|------|
| PT-01 | SHA256 计算（200KB 文件） | < 2ms | `pytest-benchmark` |
| PT-02 | SHA256 计算（1MB 文件） | < 10ms | `pytest-benchmark` |
| PT-03 | mtime 稳定等待（文件不变更） | 恰好 200ms（无额外延迟） | asyncio 计时 |
| PT-04 | 全库扫描额外延迟（无变更文件） | < 1%（不受影响） | 变更前/后扫描耗时对比 |
| PT-05 | 单文件处理最坏情况（3 次重试失败） | < 1s（200+100+200+400=900ms） | 计时 |

---

<a id="sec-7"></a>
## 七、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | Watcher 扫描崩溃 | `process_file` 未捕获异常导致 `apscheduler` 任务终止 |
| S1 — 严重 | 竞态未被修复 | 修复后仍能在 100 次测试中复现不完整索引 |
| S2 — 一般 | 性能退化 | 全库扫描延迟增加 > 20% |
| S3 — 轻微 | 日志级别不当 | `.tmp` 跳过输出 WARNING（应为 INFO） |

---

## 自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| mtime 稳定等待 | ✅ 已完成 | `test_watcher_race.py` |
| 内容哈希校验 | ✅ 已完成 | 同上 |
| 重试退避 | ✅ 已完成 | 同上 |
| `.tmp` 过滤 | ✅ 已完成 | 同上 |
| 日志升级 | ✅ 已完成 | `caplog` 断言 |
| 竞态复现 | ✅ 已完成 | 100 轮并发测试 |
| 回归 | ✅ 已完成 | 现有 76 个 pytest 全部通过 |

---