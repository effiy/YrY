# rui-npm 账号级子命令

> 登录认证、包列表、废弃、删除。对应 `lib/auth.mjs` + `lib/account.mjs`。

<a id="login"></a>
## login — npm 认证

> 通过 Access Token 配置 npm registry 认证，无需交互式登录。

```
步骤 1: 获取 token — --token 标志或 NPM_TOKEN 环境变量
步骤 2: 验证 token 非空且长度 ≥ 20
步骤 3: npm config set //registry.npmjs.org/:_authToken <token>
步骤 4: npm whoami 验证 token 有效性
步骤 5: 输出认证成功信息（含 masked token 和用户名）
步骤 6: token 无效时自动清除配置
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `--token <token>` | 否* | npm Access Token（Automation 类型推荐）。未提供时从 `NPM_TOKEN` 环境变量读取 |

> \* `--token` 和 `NPM_TOKEN` 必须至少提供一个。

**Token 格式期望**：npm Access Token 通常以 `npm_` 开头，长度 > 30 字符。建议使用 Automation 类型 token。

**安全特性**：
- token 在所有输出中仅显示前 4 + 后 4 字符
- token 通过 npm config 存储，由 .npmrc 权限保护
- 验证失败时自动清除已配置的无效 token

<a id="my-packages"></a>
## my-packages — 我的包列表

> 列出当前登录用户拥有的所有 npm 包。

```
步骤 1: 验证 npm 登录状态（npm whoami）
步骤 2: 调用 registry search API（maintainer:<username>）获取包列表
步骤 3: 按周下载量降序排列
步骤 4: 格式化为表格输出
步骤 5: registry API 不可达时降级使用 npm access ls-packages
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `--json` | 否 | 输出 JSON 格式 |
| `--limit N` | 否 | 结果数量限制，默认 100 |

**前置条件**：`npm whoami` 成功。

<a id="deprecate"></a>
## deprecate — 废弃版本

> 标记指定包或版本为 deprecated。

```
步骤 1: 验证 npm 登录状态
步骤 2: 解析包名和可选版本号
步骤 3: 验证当前用户是包的所有者（npm view <pkg> maintainers）
步骤 4: 非所有者拒绝操作
步骤 5: npm deprecate <pkg>[@version] "<message>"
步骤 6: 输出废弃确认 + npm 页面链接
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `<pkg>[@version]` | 是 | 包名，可选版本号 |
| `"<message>"` | 是 | 废弃消息，1-256 字符 |

**前置条件**：`npm whoami` 成功 + 当前用户是包所有者。

<a id="unpublish"></a>
## unpublish — 删除包/版本

> 从 npm registry 删除指定包或版本。执行前展示安全警告。

```
步骤 1: 验证 npm 登录状态
步骤 2: 解析包名和可选版本号
步骤 3: 验证当前用户是包所有者
步骤 4: 展示安全警告（删除不可逆 · 72h 恢复窗口 · 包名可能被他人注册 · 建议优先 deprecate）
步骤 5: npm unpublish <pkg>[@version] [--force]
步骤 6: 输出删除确认 + npm support 链接
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `<pkg>[@version]` | 是 | 包名，可选版本号。无版本号时删除整个包 |
| `--force` / `-f` | 否 | 强制删除（绕过 72 小时限制） |

**前置条件**：`npm whoami` 成功 + 当前用户是包所有者。

**安全警告输出**：

```markdown
⚠️  ═══════════════════════════════════════
⚠️  即将从 npm registry 删除: my-util@1.0.0
⚠️  包现有版本数: 3
⚠️
⚠️  注意事项:
⚠️  - 删除后 72 小时内可联系 npm support 恢复
⚠️  - 超过 72 小时的版本删除可能被拒绝（需 --force）
⚠️  - 删除后该包名可能被他人注册
⚠️  - npm 官方建议优先使用 deprecate 而非 unpublish
⚠️  ═══════════════════════════════════════
```
