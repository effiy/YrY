---
name: import-docs
description: 将本地 Markdown 等文档批量同步/发布/上传到远端文档 API（文档库/知识库），调用随 skill 分发的 import-docs.js 脚本。用户提到“把 docs 同步到远端/云端/文档库”“发布文档”“导入 Markdown”“运行 import-docs/import-docs.js”“配置 API_X_TOKEN”时使用。
---

# import-docs

## 定位

`import-docs` 是文档导入技能。它把原 `.claude/import-docs.js` 脚本纳入 skill 体系，负责：

1. 自动检测导入源：项目根目录（md 文件）或 .claude 目录（所有文件）
2. 支持 `list` 列举待选文档，便于用户多选后再执行导入
3. 调用 `scripts/import-docs.js`
4. 汇总创建、覆盖和失败结果，供 `wework-bot` 完成通知填写真实同步数字

## 何时使用

### 强触发（用户常见说法）

- 用户要求把本地文档**同步/上传/发布/导入**到远端：如“把 `docs/` 同步到文档库/知识库/云端”“把 Markdown 导入到远端”“把文档发布上去”
- 用户说“**同步 docs**”“**上传 docs**”“**导入 docs**”“**发布文档**”“**更新远端文档**”“**把项目文档推上去**”
- 用户提到 `import-docs`、`import-docs.js`、`API_X_TOKEN`、`--prefix`、`--api-url`、`X-Token`
- 作为链路收尾：`generate-document` / `implement-code` 完成阶段需要把 `docs` 目录的真实变更同步到远端

### 弱触发（建议但不强制）

- 用户在对话中强调“需要远端可查看/可分享的文档链接/文档库里要更新”，但未点名脚本或参数

### 不应触发（避免误用）

- 只是在本地**生成/修改** Markdown（例如写 `docs/`、改 README）但用户明确说“**不需要同步到远端**”
- 用户只想“列出 docs 文件/帮我选文件/做目录规划”且未要求实际导入（此时可用 `list`，但不要误当作已同步完成）
- 用户的目标是“发送群通知/推送消息到企业微信”（应走 `wework-bot`；本技能只负责文档同步）

## 输入

| 参数      | 默认值                 | 说明                                             |
| --------- | ---------------------- | ------------------------------------------------ |
| `dir`     | 自动检测               | 要遍历导入的目录                                 |
| `exts`    | 自动检测               | 逗号分隔的扩展名                                 |
| `token`   | 仅 `API_X_TOKEN`       | 远端 API 的 `X-Token`，**只**从系统环境变量读取  |
| `apiUrl`  | `https://api.effiy.cn` | API 基础地址                                     |
| `prefix`  | 空                     | 远端路径前缀，逗号分隔                           |
| `command` | `import`               | `import` 导入文件；`list` 仅列举文件，不写入远端 |

## 自动检测规则

- 当前在项目根目录的 `.claude` 下 → 导入 `.claude` 目录，所有文件
- 其他情况 → 导入项目根目录，仅 `.md` 文件
- 项目根目录通过查找 `.git` 目录确定

## 工作流程

1. **参数解析**：从用户请求中提取目录、扩展名、前缀、API 地址；`X-Token` 仅由执行环境的 `API_X_TOKEN` 提供。
2. **列举候选（可选）**：先用 `list` 输出 docs 文件名，给用户做多选。
3. **安全检查**：不得在回复中展示 token；执行 `import` 时默认直接使用当前系统环境变量 `API_X_TOKEN`，仅在变量缺失时提示用户补充（不可用 `--token`）。
4. **执行导入**：运行：

```bash
node .claude/skills/import-docs/scripts/import-docs.js --dir <目录> --exts <扩展名> --prefix <前缀>
```

5. **结果汇总**：向用户说明发现文件数、created / overwritten / failed 数量；若失败，列出失败文件和错误摘要。
6. **回传通知摘要**：当由 `generate-document` / `implement-code` 调用时，把结果整理为 `☁️ 文档同步：docs → 远端（创建 N，覆盖 N，失败 N）`；`failed = 0` 时可省略失败字段。

## 运行示例

```bash
# 自动检测模式（推荐；默认读取系统环境变量 API_X_TOKEN）
node .claude/skills/import-docs/scripts/import-docs.js

# 指定目录
node .claude/skills/import-docs/scripts/import-docs.js --dir docs --exts md --prefix Projects,YourNamespace
```

## 列举 docs 文件（用于多选）

在导入前可先列出 `docs/` 下文件名，便于用户做多选任务：

```bash
node .claude/skills/import-docs/scripts/import-docs.js list
```

也可指定目录和扩展名：

```bash
node .claude/skills/import-docs/scripts/import-docs.js list --dir docs --exts md
```

`list` 命令只输出文件清单，不需要 `API_X_TOKEN`，不会写入远端。

## docs 标准导入（被 generate-document / implement-code 调用）

`generate-document` 和 `implement-code` 在每次执行结束时必须**先调用本技能**，对 `docs` 目录执行文档同步；随后再把真实结果交给 `wework-bot` 发送完成通知。标准命令为：

```bash
node .claude/skills/import-docs/scripts/import-docs.js --dir docs --exts md
```

执行规则：

1. **目录存在**：执行导入，把结果（创建 N、覆盖 N、失败 N）写入 wework-bot 完成通知的 `☁️ 文档同步` 行。
2. **目录不存在**：跳过导入，wework-bot 通知改为：`☁️ 文档同步：docs 不存在，跳过导入`。
3. **导入失败**：不阻断主流程交付；在 wework-bot 通知中注明失败文件数和错误摘要。
4. **环境变量缺失**：记录“未检测到系统环境变量 `API_X_TOKEN`，本轮未执行同步”，允许后续手动执行同步；不要在每次通知中重复固定提示语。

## 约束

- 默认自动检测导入源和扩展名，除非用户明确指定 `--dir` / `--exts`
- 当 `--dir` 指向 `.claude` 或 `.cursor` 时，`exts` 默认为空（导入所有文件）
- 不要把 token 写入仓库文件、日志摘要或文档。
- 远端路径由 `prefix + 当前仓库目录名 + dir 名 + 相对路径` 组成，空格会替换为 `_`。
- 脚本会覆盖远端同路径文件；若 session 已存在，仅覆盖文件内容，不重复创建 session。
- 始终忽略 `.git` 目录，不跟随符号链接。

## 支持文件

- `README.md`：快速使用说明
- `rules/import-contract.md`：导入路径、覆盖、去重和安全约束
- `scripts/import-docs.js`：CLI 实现
