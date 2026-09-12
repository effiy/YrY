---
title: YAML Frontmatter 模式
tags: [yiknowledge, patterns, frontmatter, yaml, metadata, rag, validation]
category: projects/yiknowledge/specs
created: 2026-09-07
updated: 2026-09-10
source: YiKnowledge
type: pattern
status: active
---

# Pattern: YAML Frontmatter

> YAML Frontmatter 完整规范：字段定义、类型约束、RAG 检索信号映射、验证规则、自动修复、迁移指南、常见错误、反模式。Frontmatter 是知识文件的结构化元数据，直接影响 RAG 检索引擎的检索精度。

## 一、概述

YiKnowledge 中的每个 Markdown 文件必须以 YAML frontmatter 开头（`---` 分隔符）。Frontmatter 是文件的结构化元数据，直接映射为 RAG 检索引擎的检索信号。字段规范和类型约束直接影响检索质量。

**设计原则**：
- **Schema 一致性**：所有文件使用相同的字段名和类型，确保 Knowledge Watcher 解析不出错
- **检索优先**：字段设计以 RAG 检索精度为目标，每个字段有明确的检索信号映射
- **最小必要**：8 个必填字段覆盖核心场景，7 个可选字段按需使用

**相关规范**：
- [知识条目模式](./开发规范/04-知识条目模式.md)
- [知识管理规范](../workflows/knowledge-standards.md)
- [RAG 检索引擎集成](./架构设计/05-RAG检索引擎集成.md)

---

## 二、完整字段定义

```yaml
---
# ═══════════════════════════════════════════
# 必填字段（8 个）— 所有文件必须包含
# ═══════════════════════════════════════════

title: string          # 文件标题（中文），RAG 标题向量匹配
tags: [string]         # 3-5 个标签，BM25 关键词精确匹配
category: string       # 分类路径 role/domain，Scope 过滤
created: date          # 创建日期 YYYY-MM-DD，无引号
updated: date          # 最后更新日期 YYYY-MM-DD，无引号
source: string         # 来源 internal | external
type: string           # 内容类型 analysis | howto | reference | summary
status: string         # 内容状态 draft | review | stable | deprecated | archived

# ═══════════════════════════════════════════
# 可选字段（7 个）— 按需使用
# ═══════════════════════════════════════════

lifecycle: string      # 生命周期 inbox | triage | active | reference | archive
review_cycle: string   # 审查周期 weekly | monthly | quarterly | yearly
last_verified: date    # 最后验证日期 YYYY-MM-DD
roles: [string]        # 适用角色 executiver | producter | leader | engineer | srer | aier | curator
benefit: string        # 知识价值描述，RAG 相关性评估
acceptance_criteria: [string]  # 验收标准（可验证的条款）
related: [string]      # 关联文件路径（相对路径）
---
```

---

## 三、字段类型约束

### 必填字段详细约束

| 字段 | YAML 类型 | 格式要求 | 有效值/正则 | 示例 |
|------|----------|----------|------------|------|
| `title` | string | 中文，不用引号 | 非空，5-50 字符 | `title: 实现 API 接口` |
| `tags` | array | 3-5 个，全小写英文 | `^[a-z][a-z0-9-]*$` | `tags: [api, fastapi, auth]` |
| `category` | string | 斜杠分隔，无前后空格 | `^[a-z]+/[a-z-]+$` | `category: engineer/build` |
| `created` | date | 无引号 YYYY-MM-DD | `^\d{4}-\d{2}-\d{2}$` | `created: 2026-09-07` |
| `updated` | date | 无引号 YYYY-MM-DD | `^\d{4}-\d{2}-\d{2}$` | `updated: 2026-09-07` |
| `source` | string | 枚举值 | `internal` / `external` | `source: internal` |
| `type` | string | 枚举值 | `analysis` / `howto` / `reference` / `summary` | `type: analysis` |
| `status` | string | 枚举值 | `draft` / `review` / `stable` / `deprecated` / `archived` | `status: stable` |

### 可选字段详细约束

| 字段 | YAML 类型 | 格式要求 | 有效值/正则 | 示例 |
|------|----------|----------|------------|------|
| `lifecycle` | string | 枚举值 | `inbox` / `triage` / `active` / `reference` / `archive` | `lifecycle: active` |
| `review_cycle` | string | 枚举值 | `weekly` / `monthly` / `quarterly` / `yearly` | `review_cycle: quarterly` |
| `last_verified` | date | 无引号 YYYY-MM-DD | `^\d{4}-\d{2}-\d{2}$` | `last_verified: 2026-09-07` |
| `roles` | array | 角色名，全小写 | `executiver` / `producter` / `leader` / `engineer` / `srer` / `aier` / `curator` | `roles: [leader, engineer]` |
| `benefit` | string | 双引号，中文 | 10-200 字符 | `benefit: "为微服务技术选型提供决策参考"` |
| `acceptance_criteria` | array | 每个条目可验证 | 非空字符串 | `- "可通过 curl 调用"` |
| `related` | array | 相对路径 | 以 `./` 或 `../` 开头 | `- ./related-file.md` |

### YAML 类型陷阱

```yaml
# ❌ 日期加引号 — YAML 解析为字符串
created: "2026-09-07"

# ✅ 日期不加引号 — YAML 解析为日期
created: 2026-09-07

# ❌ benefit 不加引号 — YAML 可能解析失败（含特殊字符时）
benefit: 为微服务选型提供决策参考

# ✅ benefit 加双引号 — 安全解析
benefit: "为微服务选型提供决策参考"

# ❌ tags 使用中文 — BM25 匹配精度低
tags: [API, 认证, 微服务]

# ✅ tags 使用英文 — BM25 精确匹配
tags: [api, auth, microservices]

# ❌ 布尔值加引号 — YAML 解析为字符串
enabled: "true"

# ✅ 布尔值不加引号
enabled: true
```

---

## 四、枚举值完整定义

### type（内容类型）

| 值 | 说明 | 适用场景 | 正文要求 | 典型文件名 |
|----|------|----------|----------|-----------|
| `analysis` | 分析 | 技术调研、方案对比、决策分析 | 必须包含对比数据和结论 | `choose-microservices-framework.md` |
| `howto` | 操作指南 | 步骤说明、配置指南、操作手册 | 必须包含可执行步骤 | `implement-an-api.md` |
| `reference` | 参考 | API 文档、配置参数、速查表 | 必须包含完整参数说明 | `fastapi-middleware-reference.md` |
| `summary` | 摘要 | 会议纪要、学习笔记、阅读摘要 | 必须标注来源 | `weekly-tech-sharing-summary.md` |

### status（内容状态）

| 值 | 说明 | RAG 检索 | 对应 lifecycle | 自动转换条件 |
|----|------|----------|---------------|-------------|
| `draft` | 草稿，未完成 | 不检索 | `inbox` | 初始状态 |
| `review` | 审核中 | 不检索 | `triage` | 提交 curator 审核 |
| `stable` | 稳定，可检索 | 正常检索 | `active` | curator 审核通过 |
| `deprecated` | 已弃用 | 降低权重 | `reference` | 6 个月未验证 |
| `archived` | 已归档 | 不检索 | `archive` | curator 移入 archive/ |

### source（来源）

| 值 | 说明 | 使用场景 | 文件命名要求 |
|----|------|----------|-------------|
| `internal` | 内部创作 | 团队原创内容 | 无特殊要求 |
| `external` | 外部引用 | 转载、翻译、引用外部内容 | 必须使用双文件模式（`*-original.md` + `*-summary.md`） |

### review_cycle（审查周期）

| 值 | 适用内容 | 过期阈值 | 典型文件 |
|----|----------|----------|----------|
| `weekly` | 快速变化的 API 文档、配置参数 | 2 周 | `api-endpoints.md`, `env-variables.md` |
| `monthly` | 开发实践、工具链、依赖版本 | 2 月 | `build-config.md`, `lint-rules.md` |
| `quarterly` | 架构决策、方法论、设计模式 | 6 月 | `adr-*.md`, `architecture-patterns.md` |
| `yearly` | 基础理论、行业分析、语言特性 | 18 月 | `design-principles.md`, `security-basics.md` |

### roles（适用角色）

| 值 | 角色 | 目录 | 说明 |
|----|------|------|------|
| `executiver` | 业务策略 | `executiver/` | 市场分析、竞争策略、组织目标 |
| `producter` | 产品需求 | `producter/` | PRD、用户故事、优先级排序 |
| `leader` | 技术决策 | `leader/` | ADR、技术选型、容量规划 |
| `engineer` | 设计构建 | `engineer/` | 架构模式、开发实践、质量安全 |
| `srer` | 运营发布 | `srer/` | 发布流程、事件响应、可观测性 |
| `aier` | AI 赋能 | `aier/` | AI 基础、RAG/Agent 方法论 |
| `curator` | 知识治理 | `curator/` | 生命周期管理、模板、分类标准 |

---

## 五、验证规则

### 完整验证函数

```python
import re
import yaml
from datetime import datetime, timedelta

REQUIRED_FIELDS = ["title", "tags", "category", "created", "updated", "source", "type", "status"]
VALID_TYPES = {"analysis", "howto", "reference", "summary"}
VALID_STATUSES = {"draft", "review", "stable", "deprecated", "archived"}
VALID_SOURCES = {"internal", "external"}
VALID_LIFECYCLES = {"inbox", "triage", "active", "reference", "archive"}
VALID_REVIEW_CYCLES = {"weekly", "monthly", "quarterly", "yearly"}
VALID_ROLES = {"executiver", "producter", "leader", "engineer", "srer", "aier", "curator"}

def validate_frontmatter(frontmatter: dict, filepath: str = "") -> list[str]:
    """完整验证 frontmatter，返回错误列表"""
    errors = []

    # 1. 必填字段检查
    for field in REQUIRED_FIELDS:
        if field not in frontmatter or frontmatter[field] is None:
            errors.append(f"缺少必填字段: {field}")
        elif field == "title" and (not isinstance(frontmatter[field], str) or len(str(frontmatter[field]).strip()) < 2):
            errors.append(f"title 不能为空或过短")
        elif field == "tags" and not isinstance(frontmatter[field], list):
            errors.append(f"tags 必须是数组")

    # 2. tags 数量和质量检查
    if "tags" in frontmatter and isinstance(frontmatter["tags"], list):
        tags = frontmatter["tags"]
        if len(tags) < 3:
            errors.append(f"tags 至少需要 3 个，当前 {len(tags)} 个")
        if len(tags) > 5:
            errors.append(f"tags 最多 5 个，当前 {len(tags)} 个")
        for tag in tags:
            if not isinstance(tag, str):
                errors.append(f"tag 必须是字符串: {tag}")
            elif not re.match(r'^[a-z][a-z0-9-]*$', tag):
                errors.append(f"tag 包含非法字符（中文/大写/特殊符号）: {tag}")
            elif len(tag) < 2:
                errors.append(f"tag 过短（至少 2 个字符）: {tag}")

    # 3. 日期格式检查
    for date_field in ["created", "updated", "last_verified"]:
        if date_field in frontmatter and frontmatter[date_field] is not None:
            val = str(frontmatter[date_field])
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', val):
                errors.append(f"{date_field} 格式错误: {val}，应为 YYYY-MM-DD（无引号）")
            else:
                # 检查日期合理性
                try:
                    dt = datetime.strptime(val, "%Y-%m-%d")
                    if dt > datetime.now() + timedelta(days=1):
                        errors.append(f"{date_field} 是未来日期: {val}")
                except ValueError:
                    errors.append(f"{date_field} 不是有效日期: {val}")

    # 4. 枚举值检查
    if "type" in frontmatter and frontmatter["type"] not in VALID_TYPES:
        errors.append(f"type 值无效: {frontmatter['type']}，有效值: {VALID_TYPES}")

    if "status" in frontmatter and frontmatter["status"] not in VALID_STATUSES:
        errors.append(f"status 值无效: {frontmatter['status']}，有效值: {VALID_STATUSES}")

    if "source" in frontmatter and frontmatter["source"] not in VALID_SOURCES:
        errors.append(f"source 值无效: {frontmatter['source']}，有效值: {VALID_SOURCES}")

    if "lifecycle" in frontmatter and frontmatter["lifecycle"] not in VALID_LIFECYCLES:
        errors.append(f"lifecycle 值无效: {frontmatter['lifecycle']}")

    if "review_cycle" in frontmatter and frontmatter["review_cycle"] not in VALID_REVIEW_CYCLES:
        errors.append(f"review_cycle 值无效: {frontmatter['review_cycle']}")

    # 5. roles 检查
    if "roles" in frontmatter and isinstance(frontmatter["roles"], list):
        for role in frontmatter["roles"]:
            if role not in VALID_ROLES:
                errors.append(f"roles 值无效: {role}，有效值: {VALID_ROLES}")

    # 6. category 格式检查
    if "category" in frontmatter and frontmatter["category"]:
        cat = frontmatter["category"]
        if not re.match(r'^[a-z]+/[a-z-]+$', cat):
            errors.append(f"category 格式错误: {cat}，应为 role/domain（如 engineer/build）")
        else:
            role_part = cat.split("/")[0]
            if role_part not in VALID_ROLES:
                errors.append(f"category 角色部分无效: {role_part}")

    # 7. status 与 last_verified 一致性检查
    if frontmatter.get("status") == "stable" and not frontmatter.get("last_verified"):
        errors.append("status=stable 时必须填写 last_verified")

    # 8. source=external 时检查双文件模式
    if frontmatter.get("source") == "external":
        if not filepath.endswith("-original.md") and not filepath.endswith("-summary.md"):
            errors.append("source=external 时文件名应以 -original 或 -summary 结尾")

    return errors
```

### 常见错误速查

| # | 错误现象 | 原因 | 修正 |
|---|---------|------|------|
| 1 | `created: "2026-09-07"` | 日期加引号 | `created: 2026-09-07` |
| 2 | `tags: [API, 认证]` | 中文标签 | `tags: [api, auth]` |
| 3 | `category: engineer` | 缺少 domain 层级 | `category: engineer/build` |
| 4 | `benefit: 为选型提供参考` | benefit 不加引号 | `benefit: "为选型提供参考"` |
| 5 | `status: stabel` | 拼写错误 | `status: stable` |
| 6 | `tags: [api]` | 不足 3 个标签 | 添加更多标签 |
| 7 | `created: 2026/09/07` | 日期格式错误 | `created: 2026-09-07` |
| 8 | `type: tutorial` | 非有效枚举值 | `type: howto` |
| 9 | `roles: [Leader, Engineer]` | 大写角色名 | `roles: [leader, engineer]` |
| 10 | `related: [related-file.md]` | 非相对路径 | `related: [./related-file.md]` |
| 11 | `status: active` | 非有效状态值 | `status: stable` |
| 12 | `source: Internal` | 大写 | `source: internal` |

---

## 六、自动修复脚本

```python
#!/usr/bin/env python3
"""auto_fix_frontmatter.py — 自动修复常见 frontmatter 错误"""

import os
import sys
import yaml
import re
from datetime import datetime
from pathlib import Path

AUTO_FIXES = {
    # 中文标签 → 英文标签映射
    "tags_cn_to_en": {
        "API": "api", "认证": "auth", "微服务": "microservices",
        "数据库": "database", "前端": "frontend", "后端": "backend",
        "部署": "deployment", "安全": "security", "测试": "testing",
        "架构": "architecture", "模式": "patterns", "指南": "guide",
    },
    # 常见拼写错误
    "status_typos": {
        "stabel": "stable", "stale": "stable", "draff": "draft",
        "depracated": "deprecated", "archivedd": "archived",
        "activ": "active", "inboxx": "inbox",
    },
    # 常见 type 错误
    "type_typos": {
        "tutorial": "howto", "guide": "howto", "doc": "reference",
        "note": "summary", "report": "analysis",
    },
}

def auto_fix_frontmatter(frontmatter: dict) -> tuple[dict, list[str]]:
    """自动修复 frontmatter，返回 (fixed_frontmatter, fix_log)"""
    fixes = []
    fm = frontmatter.copy()

    # 修复 1: 中文标签 → 英文
    if "tags" in fm and isinstance(fm["tags"], list):
        new_tags = []
        for tag in fm["tags"]:
            tag_str = str(tag)
            if tag_str in AUTO_FIXES["tags_cn_to_en"]:
                new_tags.append(AUTO_FIXES["tags_cn_to_en"][tag_str])
                fixes.append(f"tags: '{tag_str}' → '{AUTO_FIXES['tags_cn_to_en'][tag_str]}'")
            elif re.search(r'[\u4e00-\u9fff]', tag_str):
                fixes.append(f"tags: 无法自动翻译中文标签 '{tag_str}'，请手动修改")
                new_tags.append(tag_str)
            else:
                new_tags.append(tag_str.lower())
        fm["tags"] = new_tags

    # 修复 2: status 拼写错误
    if "status" in fm and fm["status"] in AUTO_FIXES["status_typos"]:
        old = fm["status"]
        fm["status"] = AUTO_FIXES["status_typos"][old]
        fixes.append(f"status: '{old}' → '{fm['status']}'")

    # 修复 3: type 错误
    if "type" in fm and fm["type"] in AUTO_FIXES["type_typos"]:
        old = fm["type"]
        fm["type"] = AUTO_FIXES["type_typos"][old]
        fixes.append(f"type: '{old}' → '{fm['type']}'")

    # 修复 4: status=stable 但缺少 last_verified
    if fm.get("status") == "stable" and not fm.get("last_verified"):
        fm["last_verified"] = datetime.now().strftime("%Y-%m-%d")
        fixes.append(f"添加 last_verified: {fm['last_verified']}")

    # 修复 5: 更新 updated 字段
    if fixes:
        fm["updated"] = datetime.now().strftime("%Y-%m-%d")
        fixes.append(f"更新 updated: {fm['updated']}")

    return fm, fixes

def fix_file(filepath: str, dry_run: bool = True) -> list[str]:
    """修复单个文件，dry_run=True 时不写入"""
    with open(filepath, 'r') as f:
        content = f.read()

    if not content.startswith("---"):
        return ["缺少 frontmatter"]

    parts = content.split("---", 2)
    if len(parts) < 3:
        return ["frontmatter 格式错误"]

    try:
        fm = yaml.safe_load(parts[1])
    except yaml.YAMLError as e:
        return [f"YAML 解析错误: {e}"]

    fixed_fm, fixes = auto_fix_frontmatter(fm)

    if not fixes:
        return []

    if not dry_run:
        new_fm = yaml.dump(fixed_fm, allow_unicode=True, default_flow_style=False, sort_keys=False).strip()
        new_content = f"---\n{new_fm}\n---{parts[2]}"
        with open(filepath, 'w') as f:
            f.write(new_content)

    return fixes

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    dry_run = "--write" not in sys.argv

    for md_file in Path(target).rglob("*.md"):
        fixes = fix_file(str(md_file), dry_run=dry_run)
        if fixes:
            action = "[DRY RUN]" if dry_run else "[FIXED]"
            print(f"{action} {md_file}:")
            for fix in fixes:
                print(f"  - {fix}")

    if dry_run:
        print("\n使用 --write 参数执行实际修复")
```

---

## 七、RAG 检索信号映射

### 字段 → 检索信号完整映射

| Frontmatter 字段 | 检索信号 | 权重 | 索引方式 | Knowledge Watcher 处理 |
|------------------|----------|------|----------|----------------------|
| `title` | 标题向量 | 高 | `VectorStoreIndex` 独立字段 | 解析后存入 `title` 字段 |
| `tags` | BM25 关键词 | 高 | BM25 索引，独立 terms 字段 | 解析后存入 `tags` 数组 |
| `category` | Scope 过滤 | 中 | MongoDB `$regex` 前缀匹配 | 解析后存入 `category` 字段 |
| `benefit` | 相关性评估 | 中 | LLM Rerank 评分输入 | 解析后存入 `benefit` 字段 |
| `status` | 内容过滤 | — | MongoDB `$nin: [draft, archived]` | 解析后过滤非 stable 内容 |
| `roles` | 角色过滤 | 低 | MongoDB `$in` 匹配 | 解析后存入 `roles` 数组 |
| 正文 `content` | 正文向量 + BM25 | 高 | `VectorStoreIndex` + BM25 全文 | 提取后存入 `content` 字段 |

### 检索权重调优示例

```yaml
# 高检索精度示例 — 所有信号字段都优化过
---
title: 微服务架构选型决策              # 标题包含关键词 "微服务" "架构" "选型"
tags: [microservices, architecture, decision, spring-cloud, kubernetes]  # 5 个精准标签
category: leader/decisions             # 明确分类，支持 scope 过滤
benefit: "为微服务框架选型提供完整决策依据，包含 Spring Cloud 与 Kubernetes 原生方案的性能对比、迁移成本评估和团队技能匹配分析"  # 高价值描述
status: stable                         # 可检索状态
roles: [leader, engineer]             # 跨角色覆盖
---

# 低检索精度示例 — 信号字段未优化
---
title: 架构选择                          # 标题太泛
tags: [tech, architecture]              # 只有 2 个标签，且 "tech" 无区分度
category: leader                        # 缺少 domain 层级
benefit: ""                             # 空值
status: stable
---
```

---

## 八、从旧格式迁移

### 迁移检查清单

当从旧格式（缺少字段、中文 key、错误格式）迁移到新格式时：

1. **添加缺少的必填字段**：`title, tags, category, created, updated, source, type, status`
2. **中文 key → 英文 key**：`标签: [...]` → `tags: [...]`
3. **中文标签 → 英文标签**：`[API, 认证]` → `[api, auth]`
4. **日期去引号**：`"2026-09-07"` → `2026-09-07`
5. **category 补全层级**：`engineer` → `engineer/build`
6. **status 标准化**：`active` → `stable`, `done` → `stable`
7. **添加 benefit**：填写知识价值描述
8. **添加 last_verified**：status=stable 时必填

### 批量迁移脚本

```python
#!/usr/bin/env python3
"""migrate_frontmatter.py — 批量迁移旧格式 frontmatter"""

import os
import yaml
from datetime import datetime
from pathlib import Path

# 旧字段名 → 新字段名映射
FIELD_RENAME_MAP = {
    "标签": "tags",
    "分类": "category",
    "创建日期": "created",
    "更新日期": "updated",
    "来源": "source",
    "类型": "type",
    "状态": "status",
    "标题": "title",
    "角色": "roles",
    "价值": "benefit",
}

# 旧 status 值 → 新 status 值
STATUS_MIGRATION_MAP = {
    "active": "stable",
    "done": "stable",
    "published": "stable",
    "wip": "draft",
    "obsolete": "deprecated",
    "deleted": "archived",
}

def migrate_frontmatter(fm: dict) -> tuple[dict, list[str]]:
    """迁移旧格式 frontmatter 到新格式"""
    changes = []
    new_fm = {}

    for key, value in fm.items():
        # 重命名中文 key
        new_key = FIELD_RENAME_MAP.get(key, key)
        if new_key != key:
            changes.append(f"重命名字段: '{key}' → '{new_key}'")

        # 迁移 status 值
        if new_key == "status" and isinstance(value, str) and value in STATUS_MIGRATION_MAP:
            old_val = value
            value = STATUS_MIGRATION_MAP[value]
            changes.append(f"status: '{old_val}' → '{value}'")

        # 日期去引号
        if new_key in ("created", "updated", "last_verified") and isinstance(value, str):
            value = value.strip('"').strip("'")

        new_fm[new_key] = value

    # 添加缺失的必填字段
    today = datetime.now().strftime("%Y-%m-%d")
    for field in ["source", "type", "status"]:
        if field not in new_fm:
            new_fm[field] = {"source": "internal", "type": "analysis", "status": "draft"}[field]
            changes.append(f"添加缺失字段: {field} = {new_fm[field]}")

    if "created" not in new_fm:
        new_fm["created"] = today
        changes.append(f"添加缺失字段: created = {today}")

    if "updated" not in new_fm:
        new_fm["updated"] = today
        changes.append(f"添加缺失字段: updated = {today}")

    return new_fm, changes

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    
    for md_file in Path(target).rglob("*.md"):
        with open(md_file, 'r') as f:
            content = f.read()
        
        if not content.startswith("---"):
            continue
        
        parts = content.split("---", 2)
        if len(parts) < 3:
            continue
        
        try:
            fm = yaml.safe_load(parts[1])
        except yaml.YAMLError:
            continue
        
        new_fm, changes = migrate_frontmatter(fm)
        if changes:
            new_fm_yaml = yaml.dump(new_fm, allow_unicode=True, default_flow_style=False, sort_keys=False).strip()
            new_content = f"---\n{new_fm_yaml}\n---{parts[2]}"
            with open(md_file, 'w') as f:
                f.write(new_content)
            print(f"Migrated: {md_file}")
            for c in changes:
                print(f"  - {c}")
```

---

## 九、反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 中文标签 | `tags: [API, 认证, 微服务]` | `tags: [api, auth, microservices]` | BM25 对英文关键词匹配更精准 |
| 标签过于宽泛 | `tags: [tech, code, dev]` | `tags: [fastapi, middleware, auth]` | 无区分度，检索噪音大 |
| 日期加引号 | `created: "2026-09-07"` | `created: 2026-09-07` | YAML 解析为字符串而非日期 |
| category 缺少层级 | `category: engineer` | `category: engineer/build` | scope 过滤粒度太粗，无法精确限定 |
| 忘记更新 updated | 修改内容后不更新日期 | 每次修改后更新 `updated` | Knowledge Watcher 依赖 mtime，但 frontmatter 不一致 |
| status 不更新 | 内容已过时，status 仍为 `stable` | 更新为 `deprecated` 并设置 `last_verified` | RAG 检索到过时内容 |
| 不写 benefit | 字段为空或缺失 | 填写具体的知识价值 | RAG 无法判断内容相关性 |
| status 用 active | `status: active` | `status: stable` | active 不是有效 status 枚举值 |
| source 用 Internal | `source: Internal` | `source: internal` | 枚举值区分大小写 |
| tags 用中文 key | `标签: [api, auth]` | `tags: [api, auth]` | Knowledge Watcher 只识别英文 key |
| benefit 不加引号 | `benefit: 为选型提供参考` | `benefit: "为选型提供参考"` | 含特殊字符时 YAML 解析失败 |
| related 用绝对路径 | `related: [/Users/xxx/file.md]` | `related: [./relative/file.md]` | 绝对路径不可移植 |

---

## 十、约束

### 必须遵守

- 所有知识文件以 YAML frontmatter 开头（`---` 分隔符）
- 必填字段完整：`title, tags, category, created, updated, source, type, status`
- Tags 使用 3-5 个英文小写标签，禁止中文
- 日期使用无引号 `YYYY-MM-DD` 格式
- Category 使用 `role/domain` 格式（至少两级，斜杠分隔）
- 修改内容后更新 `updated` 字段
- status=stable 时必须填写 `last_verified`
- benefit 使用双引号包裹
- 所有字段 key 使用英文小写

### 禁止

- 不使用中文标签
- 不使用中文 frontmatter key
- 日期不加引号（YAML 会自动解析为字符串）
- 不跳过必填字段
- 不修改已有字段的语义（如需变更，新增字段并废弃旧字段）
- 不引入未定义的字段（保持 schema 一致性）
- 不在 status 中使用非枚举值（如 `active`、`done`、`published`）
- 不在 related 中使用绝对路径