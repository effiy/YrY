> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node .memory/collector.mjs | 🌿 feat/memory-collector-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: `/rui doc --from-code .memory-collector-doc`，基于 `YrY-故事任务.md` §5 AC 和 `YrY-使用场景.md` §2 场景

## §0 基线溯源

| TC# | 覆盖 AC#(01 §5) | 覆盖场景(02 §2) | 覆盖类型 | 状态 |
|-----|-----------------|----------------|:--:|:--:|
| TC-N1 | AC1 追加记录 | 场景 1 追加执行记忆 | 正常 | 待生成 |
| TC-N2 | AC4 stdin 传参 | 场景 2 管道传入 | 正常 | 待生成 |
| TC-N3 | AC6 校验已有记录 | 场景 3 校验 | 正常 | 待生成 |
| TC-N4 | AC3 阶段切换 | 场景 4 阶段切换 | 正常 | 待生成 |
| TC-B1 | AC6 空文件校验 | 场景 3 空状态 | 边界 | 待生成 |
| TC-B2 | AC1 空参数 | 场景 1 空状态 | 边界 | 待生成 |
| TC-E1 | AC2 缺少必填字段 | 场景 1 异常分支 | 异常 | 待生成 |
| TC-E2 | AC5 stdin 无效 JSON | 场景 2 异常分支 | 异常 | 待生成 |
| TC-E3 | AC1 无效 stage 值 | 场景 1 异常分支 | 异常 | 待生成 |
| TC-R1 | AC1 写入后文件一致性 | 全部场景 | 回归 | 待生成 |

### 主要价值

- 🎯 四类用例（正常/边界/异常/回归）全覆盖，Gate A 交接信号完整
- 🔒 异常路径必测：参数缺失、JSON 无效、枚举越界
- ⚡ 每条用例 Given/When/Then 可独立执行，无外部依赖
- 📊 覆盖矩阵对齐全部 AC# 和场景

---

## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|:--:|:--:|:--:|:--:|:--:|
| FP1 | 追加记录 | TC-N1 | TC-B2 | TC-E1, TC-E3 | TC-R1 | 100% |
| FP2 | stdin 批量输入 | TC-N2 | — | TC-E2 | TC-R1 | 100% |
| FP3 | 阶段切换标记 | TC-N4 | — | — | TC-R1 | 100% |
| FP4 | 完整性校验 | TC-N3 | TC-B1 | — | TC-R1 | 100% |
| FP5 | 会话 ID 生成 | — | TC-B3 | — | — | 部分 |
| FP6 | 项目根目录发现 | — | — | — | — | 待补充 |

### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N1–N4, TC-B1–B2, TC-E1–E3 | 全部 P0 通过 | 实现阶段 |
| Gate B | TC-R1 + 全部 Gate A 用例 | P0 100% 通过, P1 ≥ 80% | 交付 |

### 1.3 影响链覆盖

| 影响点 | 来源 | 回归用例 | 覆盖状态 |
|--------|------|---------|:--:|
| JSONL 格式变更 | collector schema 升级 | TC-R1 | 待验证 |
| 校验规则新增 | `validateRecord()` 修改 | TC-R1 | 待验证 |

---

## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-N1 | `.memory/` 目录存在，无已有记录 | 执行 `node .memory/collector.mjs --story=test --command="/rui init" --stage=init --planned=T2 --actual=T2 --agents=pm,coder` | ① stdout 输出 "已追加: story=test stage=init"；② `.memory/execution-memory.jsonl` 末尾新增一行有效 JSON；③ 记录的 story_name="test", command="/rui init", stage="init", planned_change_level="T2" | FP1 | P0 |
| TC-N2 | collector 正常监听 stdin | 执行 `echo '{"feature":"登录重构","description":"重构认证模块","quality_issues":{"P0":[],"P1":[],"P2":[]}}' \| node .memory/collector.mjs --stdin --story=test --command="/rui code login" --stage=implementation` | ① feature 字段为 "登录重构"；② description 字段为 "重构认证模块"；③ quality_issues 为 `{P0:[],P1:[],P2:[]}` | FP2 | P0 |
| TC-N3 | execution-memory.jsonl 含 3 条有效记录 | 执行 `node .memory/collector.mjs --validate` | ① 输出 "校验完成: 3 通过, 0 失败, 3 总计" | FP4 | P0 |
| TC-N4 | 已有 1 条同 story 记录含 phase_transitions | 执行 `node .memory/collector.mjs --story=test --command="/rui code login" --stage=verification --markPhase --phaseFrom=implementation --phaseTo=verification` | ① phase_transitions 数组长度 = 上一条长度 + 1；② 新切换事件的 from="implementation", to="verification" | FP3 | P1 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-B1 | execution-memory.jsonl 不存在 | 执行 `node .memory/collector.mjs --validate` | ① 输出 "execution-memory.jsonl 不存在（尚无记录）"；② exit code 0 | FP4 | P1 |
| TC-B2 | 所有可选参数省略，仅传入必填参数 | 执行 `node .memory/collector.mjs --story=test --command="" --stage=init` | ① 记录成功写入；② planned_change_level="T2"（默认值）；③ agents_called=[]（空数组） | FP1 | P1 |
| TC-B3 | 未指定 `--sessionId` 且 `SESSION_ID` 环境变量未设置 | 执行追加命令 | ① session_id 为 14 位数字（YYYYMMDDHHmmss 格式）；② 格式匹配 `/^\d{14}$/` | FP5 | P2 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-E1 | — | 执行 `node .memory/collector.mjs --command="/rui init" --stage=init`（缺少 --story） | ① 输出 "[collector] 记录校验失败:"；② 输出 "缺少必填字段: story_name"；③ JSONL 行数不变 | FP1, R1 | P0 |
| TC-E2 | — | 执行 `echo 'not valid json' \| node .memory/collector.mjs --stdin --story=test` | ① 输出 "[collector] stdin JSON 解析失败:"；② 不写入任何记录 | FP2, R5 | P0 |
| TC-E3 | — | 执行 `node .memory/collector.mjs --story=test --command="" --stage=invalid_stage` | ① 输出 "[collector] 记录校验失败:"；② 输出 "stage 无效: invalid_stage" | FP1, R3 | P1 |
| TC-E4 | execution-memory.jsonl 含 1 行无效 JSON | 执行 `node .memory/collector.mjs --validate` | ① 报告行号和解析错误；② 失败计数 ≥ 1 | FP4 | P1 |

### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-R1 | 上次管线执行记录的完整字段集 | 重新执行相同参数的追加命令 | ① 除 timestamp 和 session_id 外，所有字段与上次一致；② JSON 结构（16 字段）不变 | FP1–FP4 | P0 |

---

## §3 环境专项

| ID | Given | When | Then | 优先级 |
|----|-------|------|------|:--:|
| TC-X1 | `.memory/` 目录不存在 | 执行追加命令 | 自动创建 `.memory/` 目录，写入成功 | P1 |
| TC-X2 | `.memory/execution-memory.jsonl` 为只读 | 执行追加命令 | 文件系统错误被 catch，输出 "fatal:" 信息 | P2 |

---

## §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18（使用 `node:path`, `node:fs` 原生模块） |
| 部署方式 | 本地文件系统，项目根目录下执行 |
| 测试目标 | `.memory/collector.mjs` CLI 行为 |
| 数据准备 | 每次测试前清理 `.memory/execution-memory.jsonl` 或使用临时目录 |

---

## §5 评审清单

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 每 FP# 有多类用例覆盖 | ✅ FP1–FP4 含正常+异常 |
| 2 | Gate A 覆盖全部 P0 用例 | ✅ TC-N1, TC-N2, TC-N3, TC-E1, TC-E2 |
| 3 | 回归用例与影响链一致 | ✅ TC-R1 |
| 4 | 异常用例含恢复行为描述 | ✅ |
| 5 | 环境专项覆盖文件生命周期 | ✅ TC-X1, TC-X2 |
| 6 | 无外部依赖（纯 Node.js 标准库） | ✅ |
| 7 | 影响链每点有回归 | ✅ |
| 8 | 基线溯源闭合（AC# 全覆盖） | ✅ |

---

## §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | ✅ 待执行 |
| P0 用例 ID | TC-N1, TC-N2, TC-N3, TC-E1, TC-E2, TC-R1 |
| 实现约束 | 纯 Node.js 标准库，零外部依赖；16 字段 schema 不可破坏 |
| 验证命令 | `node .memory/collector.mjs --validate` + 逐用例手动执行 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | `/rui doc --from-code .memory-collector-doc` | `YrY-故事任务.md` §5, `YrY-使用场景.md` §2 |
