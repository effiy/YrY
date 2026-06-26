# rui-npm 写入子命令（包管理）

> 包安装、更新、卸载。对应 `lib/write.mjs`。

<a id="install"></a>
## install — 包安装

> 安装 npm 包到当前项目的 dependencies。

```
步骤 1: 验证当前目录有 package.json
步骤 2: 解析包名和可选版本号
步骤 3: npm install <pkg>[@version] --save
步骤 4: 输出安装结果和版本信息
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `<pkg>[@version]` | 是 | 包名，可选版本号（如 `lodash@4.17.21`） |
| `--dev` / `-D` | 否 | 安装为 devDependency |
| `--global` / `-g` | 否 | 全局安装 |

**前置条件**：当前目录存在 `package.json`。

<a id="update"></a>
## update — 包更新

> 更新指定包到兼容最新版本。

```
步骤 1: 验证包已在 package.json 中声明
步骤 2: 记录更新前版本
步骤 3: npm update <pkg>
步骤 4: 对比更新前后版本，输出变更
```

<a id="uninstall"></a>
## uninstall — 包卸载

> 从当前项目移除指定包。

```
步骤 1: 验证包已在 package.json 中声明
步骤 2: npm uninstall <pkg>
步骤 3: 输出卸载确认
```
