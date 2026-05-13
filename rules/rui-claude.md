---
paths:
  - ".claude/**"
---

# rui-claude Rules

## 操作范围

1. 仅限 `.claude/` 目录，不得触及外部文件
2. sync 为覆盖式更新（rm -rf → rsync），执行前须确认用户意图
3. retro 复盘写入 `docs/自改进故事面板/`，格式 `<project>-<date>.md`
4. retro 仅分析本地 `.claude/` 结构，不连接远端

## 安全

5. SSH 凭据由系统管理员管理，本 skill 不配置/存储/传递
6. 禁止自动提交和推送，所有 git 操作由开发者手动执行
7. history 自动记录到 `.claude/.history/rui-claude-history.jsonl`（仅本地，不入库）

## 分支隔离

8. `/rui-claude <requirement>` 修改 `.claude/` 必须通过 rui code 管线，分支隔离规则同 [code-pipeline.md](code-pipeline.md)

## 空输入

9. 空输入不执行管线，仅推荐任务
