> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | ⏱️ — | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [→ YrY-实施报告](./YrY-实施报告.md)

# YrY-测试设计 · rui-bot-send

## §0 基线溯源

| AC# | 测试覆盖 |
|-----|---------|
| AC1 | §2.1 完成通知 |
| AC2 | §2.2 阻断通知 |
| AC3 | §2.3 仅记录 |

### 主要价值

- 🎯 验证三种状态消息模板正确
- 🔄 重试机制验证
- 📝 日志追加完整性

---

## §2 测试用例

### §2.1 完成通知

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-C01 | story/status=complete/content 完整 | 执行 send | 企微收到 ✅ 消息，日志追加成功 | 正常 |
| UC-C02 | content 超 2000 字符 | 执行 send | 消息截断至 2000 字符，标注已截断 | 边界 |
| UC-C03 | 无 API_X_TOKEN | 执行 send | 降级跳过，不阻断 | 降级 |

### §2.2 阻断通知

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-B01 | status=blocked, reason/recovery 完整 | 执行 send | 消息含 🚫 + 阻断原因 + 恢复指引 | 正常 |

### §2.3 仅记录

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-N01 | `--no-send` 参数 | 执行 send | 仅追加日志，无网络请求 | 正常 |

### §2.4 重试

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-R01 | 第 1-2 次发送失败 | 自动重试 | 第 N 次成功，日志记录 | 异常 |
| UC-R02 | 3 次全部失败 | 重试耗尽 | 记录失败，不阻断 | 异常 |

---

## §3 Gate A 交接信号

| 信号 | 值 |
|------|-----|
| P0 用例 | UC-C01, UC-B01, UC-C03, UC-R02 |
| 验证命令 | `node skills/rui-bot/send.mjs --no-send --story=test --status=complete --content=test` |
| 阻塞条件 | 消息模板字段缺失或日志写入失败 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | /rui doc --from-code rui-bot-send-doc | skills/rui-bot/send.mjs |
