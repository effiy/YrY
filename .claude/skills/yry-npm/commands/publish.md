# rui-npm 发布子命令

> 本地文件/目录发布。对应 `lib/publish.mjs`。

## publish — 本地发布

> 将本地文件或目录发布为 npm 包。支持单文件和目录两种模式。

```
步骤 1: 验证路径存在（文件或目录）
步骤 2: 验证 npm 登录状态（npm whoami）
步骤 3a（文件）: 创建临时目录 → 复制文件为 index.js → 交互式生成 package.json
步骤 3b（目录）: 验证 package.json 存在，缺失时交互式生成
步骤 4: 检查 npm registry 是否存在同名包（冲突检测）
步骤 5: npm publish [--access public]
步骤 6: 输出包名 + 版本 + 发布确认
步骤 7: 清理临时目录（文件模式）
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `<path>` | 是 | 本地文件路径或目录路径 |
| `--name <name>` | 否 | 指定包名（默认从目录名/文件名推导） |
| `--version <ver>` | 否 | 指定版本号（默认 1.0.0） |
| `--description <desc>` | 否 | 包描述 |
| `--access public` | 否 | 发布为公开包（scope 包默认 private） |
| `--dry-run` | 否 | 模拟发布，不实际上传 |

**前置条件**：`npm whoami` 成功（已登录 npm）。

**自动生成 package.json（文件模式）**：

```json
{
  "name": "<derived-or-specified>",
  "version": "1.0.0",
  "description": "<user-provided-or-auto>",
  "main": "index.js",
  "bin": { "<name>": "./index.js" },
  "license": "MIT"
}
```
