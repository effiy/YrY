# rui-npm 工具子命令

> npx 执行、安全审计、CDN 引用。对应 `lib/tools.mjs`。

<a id="npx"></a>
## npx — npx 执行

> 通过 npx 直接运行 npm 包，无需安装。

```
步骤 1: 验证包名非空
步骤 2: npx <pkg>[@version] [-- args...]
步骤 3: 流式输出 stdout/stderr
步骤 4: 返回执行结果的退出码
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `<pkg>[@version]` | 是 | 要执行的 npm 包名，可选版本 |
| `-- args...` | 否 | 传递给包的命令行参数（`--` 之后） |

<a id="audit"></a>
## audit — 安全审计

> 审计当前项目已安装依赖的已知安全漏洞。

```
步骤 1: npm audit --json
步骤 2: 解析漏洞数据
步骤 3: 按严重级别分组（critical/high/moderate/low）
步骤 4: 格式化摘要表格 + 修复建议
```

输出格式：

```markdown
## 安全审计结果 — YYYY-MM-DD HH:MM

| 严重级别 | 数量 |
|---------|------|
| 💀 Critical | 0 |
| 🔴 High | 2 |
| 🟡 Moderate | 5 |
| 🟢 Low | 3 |

### 修复建议
- `npm audit fix` — 自动修复兼容的漏洞
- `npm audit fix --force` — 强制修复（可能包含破坏性变更）
```

<a id="cdn"></a>
## cdn — CDN 引用

> 查看 npm 包在主流 CDN 的引用地址。

```
步骤 1: 验证包名非空
步骤 2: 解析包名和可选版本号（无版本则使用 latest）
步骤 3: npm view <pkg> version 验证包存在
步骤 4: 生成 unpkg / jsDelivr / esm.sh 三条 CDN 地址
步骤 5: 格式化为表格输出
```

| 参数 | 必需 | 说明 |
|------|------|------|
| `<pkg>[@version]` | 是 | 包名，可选版本号（如 `react@18.2.0`） |
| `--json` | 否 | 输出 JSON 格式 |

**CDN 选用指南**：

| CDN | 特点 | 适用场景 |
|-----|------|---------|
| unpkg | 原始 npm 文件直出 | 查看包内文件、调试 |
| jsDelivr | 全球 CDN 加速，支持多文件合并 | 生产环境 `<script>` 引用 |
| esm.sh | 自动转 ESM 格式，支持 TypeScript/JSX | `<script type="module">` 或 `import` |
