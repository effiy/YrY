# OpenSpec 状态规范

## Change 生命周期

```
proposed → designing → applying → verifying → landed → archived
```

| 状态 | 含义 | 触发时机 |
|------|------|----------|
| `proposed` | proposal 已创建，待 design | `/opsx:new` 或 `/opsx:propose` 后 |
| `designing` | design 编写中 | 开始写 design.md 时 |
| `applying` | 按 tasks 实现代码中 | `/opsx:apply` 后 |
| `verifying` | 实现完成，验证中 | `/opsx:verify` 后 |
| `landed` | 已落地，待归档 | `/opsx:land` 后 |
| `archived` | 已归档 | `/opsx:archive` 后 |

## .openspec.yaml 格式

```yaml
schema: spec-driven
created: YYYY-MM-DD
status: <当前状态>
depends_on:                    # 可选：依赖的其他 change
  - change: <change-name>
    status: <期望状态>         # 通常为 landed
```

### 状态推进规则

- `/opsx:continue` 读取 status 决定从哪个阶段继续
- 状态只能单向推进，不可回退（如需回退需手动修改）
- `depends_on` 中的 change 未达到期望状态时，`/opsx:apply` 应提醒用户

### 状态与 artifacts 的对应关系

| 状态 | 必须存在的 artifacts |
|------|---------------------|
| `proposed` | proposal.md |
| `designing` | proposal.md + design.md（进行中） |
| `applying` | proposal.md + design.md + tasks.md |
| `verifying` | proposal.md + design.md + tasks.md + 代码实现 |
| `landed` | 以上 + spec/tasks 已回写 |
| `archived` | 已移至 archive/ 目录 |