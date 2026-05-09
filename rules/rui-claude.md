---
paths:
  - ".claude/**"
---

# rui-claude Rules

1. 操作范围仅限当前项目 `.claude/` 目录，不得触及根目录的 `.claude/`，不得触及 `.claude/` 以外文件
2. sync 为覆盖式更新（rm -rf → rsync），执行前须确认用户意图
3. retro 复盘文档写入根项目 `docs/自改进故事面板/`，格式为 `<project>-<date>.md`
4. retro 仅分析本地 `.claude/` 结构，不连接远端
5. 空输入不得自动执行管线，仅推荐任务
6. SSH 凭据由系统管理员管理，本 skill 不配置、不存储、不传递
