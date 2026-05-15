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

## 工作流全景

```mermaid
flowchart TB
    SCAN["① 扫描文件<br/>.claude/ 全部 + 其余 .md"]:::step --> FILTER["② 过滤<br/>排除 .git / node_modules"]:::step
    FILTER --> RESOLVE["③ 解析远端路径<br/>故事任务面板 / workspace"]:::step
    RESOLVE --> UPLOAD["④ 逐文件上传<br/>POST /write-file"]:::step
    UPLOAD --> REPORT["⑤ 汇总结果<br/>成功 / 跳过 / 失败"]:::step

    UPLOAD -.->|"失败"| RETRY["记录错误<br/>继续处理"]:::warn

    classDef step fill:#e3f2fd,stroke:#1565c0;
    classDef warn fill:#fff3e0,stroke:#e65100;
```

| 阶段 | 动作 | 说明 |
|------|------|------|
| ① 扫描 | 遍历 workspace 文件树 | 不受 .gitignore 限制 |
| ② 过滤 | 排除 .git / node_modules | 可追加 --exclude |
| ③ 解析 | 生成本地→远端路径映射 | 空格替换为 `_` |
| ④ 上传 | 逐文件 POST | 存在覆盖，不存在新建 |
| ⑤ 汇总 | 统计成功/跳过/失败 | 单文件失败不阻断 |

## 扫描规则

```mermaid
flowchart TD
    FILE["文件"] --> Q1{"所在目录?"}
    Q1 -->|".claude/"| ALL["全部文件<br/>不限扩展名<br/>递归所有子目录"]:::rule
    Q1 -->|"其他目录"| MD["仅 .md 文件"]:::rule
    ALL & MD --> Q2{"命中排除?"}
    Q2 -->|".git / node_modules"| SKIP["跳过 ❌"]:::skip
    Q2 -->|"否"| Q3{"远端路径?"}
    Q3 -->|"docs/故事任务面板/ 下"| PATH1["&lt;prefix&gt;/故事任务面板/&lt;相对路径&gt;<br/>以「故事任务面板」为一级标签"]:::path
    Q3 -->|"其他"| PATH2["&lt;prefix&gt;/&lt;workspace名&gt;/&lt;相对路径&gt;"]:::path

    classDef rule fill:#e3f2fd,stroke:#1565c0;
    classDef skip fill:#ffebee,stroke:#c62828;
    classDef path fill:#f3e5f5,stroke:#6a1b9a;
```

```
扫描范围:
  .claude/     → 全部文件（不限扩展名），递归子目录
  其余目录     → 仅 .md 文件
  排除        → .git · node_modules · --exclude 指定目录
  空格        → 替换为 _

远端路径:
  docs/故事任务面板/**  → <prefix>/故事任务面板/<相对路径>
  其他                  → <prefix>/<workspace名>/<相对路径>
```

## rui 强制触发

> 每次使用 rui 技能都必须触发 import-docs，这是管线完整性的硬性要求。

```mermaid
flowchart LR
    subgraph 检查点["三检查点强制同步"]
        CP1["① 文档生成后<br/>全文档基线产出"]:::cp
        CP2["② 验证后<br/>实施与测试报告产出"]:::cp
        CP3["③ 交付时<br/>最终全量"]:::cp
    end

    CP1 --> SCOPE1["当前故事 .md<br/>+ .claude/ 全部"]:::scope
    CP2 --> SCOPE2["当前故事 .md<br/>+ .claude/ 全部"]:::scope
    CP3 --> SCOPE3["全项目 .md<br/>+ .claude/ 全部"]:::scope

    classDef cp fill:#e3f2fd,stroke:#1565c0;
    classDef scope fill:#f3e5f5,stroke:#6a1b9a;
```

| 检查点 | 时机 | 范围 |
|--------|------|------|
| 文档生成后 | 全文档基线产出 | 当前故事目录 .md + .claude/ 全部 |
| 验证后 | 实施与测试报告产出 | 同上 |
| 交付时 | 最终全量 | 全项目 .md + .claude/ 全部 |

## 命令

```bash
# workspace 模式（rui 默认调用）
node ~/.claude/plugins/marketplaces/yry/skills/import-docs/scripts/import-docs.js --workspace

# 单目录 + 自定义扩展名
node ~/.claude/plugins/marketplaces/yry/skills/import-docs/scripts/import-docs.js --dir <path> --exts md,json,yaml

# 排除子目录
node ~/.claude/plugins/marketplaces/yry/skills/import-docs/scripts/import-docs.js --workspace --exclude tmp,build

# 仅枚举不导入
node ~/.claude/plugins/marketplaces/yry/skills/import-docs/scripts/import-docs.js list --workspace
```

| 参数 | 默认值 | 描述 |
|------|--------|------|
| `--workspace, -w` | — | workspace 扫描规则 |
| `--dir, -d <path>` | 自动检测 | 单目录导入 |
| `--exts, -e <csv>` | `md` | 扩展名过滤（逗号分隔） |
| `--exclude, -x <csv>` | — | 排除子目录 |
| `--prefix, -p <path>` | 空 | 远端路径前缀 |
| `--api-url, -a <url>` | `https://api.effiy.cn` | API 地址 |

## API 契约

```mermaid
flowchart LR
    LOCAL["本地文件"]:::src --> POST["POST /write-file"]:::api
    POST --> Q{"远端存在?"}
    Q -->|"是"| OVERWRITE["覆盖"]:::op
    Q -->|"否"| CREATE["新建 + create_document session"]:::op

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef api fill:#e3f2fd,stroke:#1565c0;
    classDef op fill:#f3e5f5,stroke:#6a1b9a;
```

逐文件 `POST /write-file`。远端已存在则覆盖，不存在则新建 + `create_document` session。

## 约束与错误处理

```mermaid
flowchart TD
    START["开始同步"] --> Q1{"目录存在?"}
    Q1 -->|"否"| SKIP["跳过"]:::warn
    Q1 -->|"是"| Q2{"API_X_TOKEN?"}
    Q2 -->|"缺失"| NOOP["no-token 降级<br/>停止上传"]:::block
    Q2 -->|"存在"| UPLOAD["逐文件上传"]:::ok
    UPLOAD --> Q3{"单文件结果?"}
    Q3 -->|"成功"| NEXT["继续下一个"]:::ok
    Q3 -->|"失败"| ERR["记录错误<br/>继续处理"]:::warn
    ERR --> NEXT

    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef warn fill:#fff3e0,stroke:#e65100;
    classDef block fill:#ffebee,stroke:#c62828;
```

| 场景 | 处置 | 阻断? |
|------|------|-------|
| 目录不存在 | 跳过 | 否 |
| 单文件失败 | 记录错误，继续处理后续文件 | 否 |
| `API_X_TOKEN` 缺失 | 停止上传（`no-token` 降级） | ⚠️ 降级 |
| 网络超时 / 远端不可达 | 记录告警，不阻断管线 | 否 |
| Token 写入仓库/日志/文档 | 禁止 🚫 | P0 |
| 文件遍历 | 不受 `.gitignore` 限制 | — |

## 空输入

```mermaid
flowchart TD
    EMPTY["无参数调用"]:::src --> LIST["list --workspace<br/>枚举文件列表"]:::op
    LIST --> CHECK["检测 API_X_TOKEN<br/>检测远端可达性"]:::op
    CHECK --> RECOMMEND["推荐任务"]:::out

    subgraph 推荐["推荐场景"]
        R1["凭据缺失 → 配置 token"]:::rec
        R2["首次同步 → 全量导入"]:::rec
        R3["增量同步 → 仅变更文件"]:::rec
        R4["全量补齐 → 覆盖远端"]:::rec
        R5["定期巡检 → 检查差异"]:::rec
    end

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
    classDef rec fill:#fff3e0,stroke:#e65100;
```

无参数时调用 `list --workspace` + 检测 `API_X_TOKEN` / 远端可达性 → 推荐任务，不执行导入。

## 生效标志

```mermaid
flowchart LR
    S1["扫描完整<br/>.claude/ 全部 + 其余 .md"]:::sig --> S2["排除正确<br/>.git / node_modules 已过滤"]:::sig
    S2 --> S3["路径映射<br/>故事任务面板一级标签"]:::sig
    S3 --> S4["上传完成<br/>逐文件 POST 无遗漏"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| 扫描完整：.claude/ 全部 + 其余 .md | 补扫遗漏目录，重新执行 |
| 排除正确：.git / node_modules 已过滤 | 调整 --exclude 参数 |
| 路径映射：故事任务面板一级标签正确 | 检查远端路径前缀，修正重传 |
| 上传完成：逐文件 POST 无遗漏 | 查看错误日志，补传失败文件 |
