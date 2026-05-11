---
paths:
  - ".claude/**"
---

# rui-claude Rules

1. 操作范围仅限 `.claude/` 目录，不得触及 `.claude/` 以外文件
2. sync 为覆盖式更新（rm -rf → rsync），执行前须确认用户意图
3. retro 复盘文档写入当前项目 `docs/自改进故事面板/`，格式为 `<project>-<date>.md`
4. retro 仅分析本地 `.claude/` 结构，不连接远端
5. 空输入不得自动执行管线，仅推荐任务
6. 禁止自动合并功能分支到 main，合并操作一律由开发者手动执行
7. SSH 凭据由系统管理员管理，本 skill 不配置、不存储、不传递
8. 禁止自动提交和推送：技能执行完毕后不得自动执行 git commit 或 git push，所有 git 操作一律由开发者手动执行
9. history 自动记录：sync / retro / \<requirement\> 执行完成后自动调用 `node skills/rui-claude/scripts/history.js record` 写入操作历史到 `.claude/.history/rui-claude-history.jsonl`。历史文件仅本地存储，不入库、不同步
10. **分支隔离强制**：`/rui-claude <requirement>` 对 `.claude/` 目录的任何代码修改必须通过 rui code 管线（预检→测试先行→实现→验证→自改进）进行，预检阶段必须从 main 创建 `feat/<name>` 分支并 checkout，禁止在非故事分支上直接修改 `.claude/` 文件，禁止跳过管线直接编辑文件（H13）
11. **禁止自动合并**：管线任何阶段不得将功能分支自动合并到 main，合并操作一律由开发者手动执行（H12）
