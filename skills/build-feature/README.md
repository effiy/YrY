# build-feature

> 行为真源：[SKILL.md](./SKILL.md)；本文件仅保留快速开始和阅读顺序。

## 快速开始

```bash
/generate-document init                                    # 项目初始化
/generate-document user-login-phone-otp                     # 功能文档
/generate-document weekly                                  # 本周周报
/generate-document weekly 2026-04-29                       # 指定日期的周报
/generate-document from-weekly docs/weekly/<week>/weekly.md # 从周报拆解为功能文档
/implement-code user-login                                 # 基于文档实现代码
/implement-code list                                       # 列出可用功能文档
/build-feature new-feature --full                          # 全流程（文档 + 代码）
```

所有命令幂等；已有文档增量更新。末尾强制 `import-docs` → `wework-bot`。

## 阅读顺序

1. [`SKILL.md`](./SKILL.md) — 模式选择、命令、增量规则、停止条件
2. [`../../shared/contracts.md`](../../shared/contracts.md) — 输出契约、证据标准、影响分析
3. [`../../agents/coder/AGENT.md`](../../agents/coder/AGENT.md) — 代码实现专家
4. [`../../agents/docer/AGENT.md`](../../agents/docer/AGENT.md) — 文档生成专家
5. [`../../agents/tester/AGENT.md`](../../agents/tester/AGENT.md) — 质量保证专家
6. [`../../agents/reporter/AGENT.md`](../../agents/reporter/AGENT.md) — 过程报告与知识策展
