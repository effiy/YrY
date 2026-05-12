---
name: import-docs
description: |
  Batch synchronize local documents to remote document API. Auto-invoked by rui
  via Skill tool at the end of every pipeline — mandatory step, not user-facing
  unless called directly.
user_invocable: true
lifecycle: default-pipeline
---

# import-docs

将 workspace 内文档批量同步到远端 API。

## 扫描规则

- `.claude/` 目录：全部文件（不限扩展名），递归包含所有子目录
- 其余目录：仅 `.md` 文件
- 排除：`.git`、`node_modules`
- 远端路径：
  - `docs/故事任务面板/` 下文件：`<prefix>/故事任务面板/<相对路径>`，以 `故事任务面板` 为一级目录标签，不嵌套在项目目录下
  - 其他文件：`<prefix>/<workspace名>/<相对路径>`
- 空格替换为 `_`

## rui 多检查点强制同步

| 检查点 | 时机 | 范围 |
|--------|------|------|
| 文档生成后 | 全文档基线产出 | 当前故事目录.md + .claude/ 全部 |
| 验证后 | 实施与测试报告产出 | 同上 |
| 交付时 | 最终全量 | 全项目.md + .claude/ 全部 |

`no-token` 降级：仅 `API_X_TOKEN` 缺失时跳过。网络超时、远端不可达记录告警但不阻断管线。

## 命令

```bash
# workspace 模式（rui 默认调用）
node skills/import-docs/scripts/import-docs.js --workspace

# 单目录 + 自定义扩展名
node skills/import-docs/scripts/import-docs.js --dir <path> --exts md,json,yaml

# 排除子目录
node skills/import-docs/scripts/import-docs.js --workspace --exclude tmp,build

# 仅枚举不导入
node skills/import-docs/scripts/import-docs.js list --workspace
```

| 参数 | 默认值 | 描述 |
|------|--------|------|
| `--workspace, -w` | — | workspace 扫描规则 |
| `--dir, -d <path>` | 自动检测 | 单目录导入 |
| `--exts, -e <csv>` | `md` | 扩展名过滤（逗号分隔） |
| `--exclude, -x <csv>` | — | 排除子目录 |
| `--prefix, -p <path>` | 空 | 远端路径前缀 |
| `--api-url, -a <url>` | `https://api.effiy.cn` | API 地址 |

凭据 `API_X_TOKEN` 仅从环境变量读取，不接受 CLI 参数或配置文件。

## API 契约

逐文件 `POST /write-file`。远端已存在则覆盖，不存在则新建 + `create_document` session。

## 约束

- 目录不存在 → 跳过
- 单文件失败 → 记录错误，继续处理
- `API_X_TOKEN` 缺失 → 停止（`no-token` 降级）
- 禁止 token 写入仓库、日志或文档
- 文件遍历不受 `.gitignore` 限制

## 空输入

无参数时调用 `node skills/import-docs/scripts/import-docs.js list --workspace` + 检测 `API_X_TOKEN` / 远端可达性 → 推荐任务（凭据缺失/首次同步/增量同步/全量补齐/定期巡检），不执行导入。
