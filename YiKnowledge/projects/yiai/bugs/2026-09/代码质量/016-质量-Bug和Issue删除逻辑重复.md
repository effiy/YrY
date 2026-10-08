---
title: "delete_document 中 bug 和 issue 的 markdown 删除逻辑高度重复"
tags: [yiai, code-quality, code-smell, duplication]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# delete_document 中 bug 和 issue 的 markdown 删除逻辑高度重复

## 现象

`src/data/repository.py` 的 `delete_document` 函数中，删除 `bugs` 集合和 `issues` 集合文档时，对关联的 markdown 文件的处理逻辑几乎完全相同（行 654-675 和 677-709），仅字段名和目录结构略有差异：

**bug 分支**（~20 行）：
```python
if collection_name == "bugs":
    try:
        content_path = existing_doc.get("contentPath") or existing_doc.get("content_path") or ""
        if not content_path:
            project_key = (existing_doc.get("project_key") or ...).lower()
            bug_type = existing_doc.get("type") or "other"
            type_dir = _BUG_TYPE_DIR.get(bug_type, "other")
            created_at_ms = existing_doc.get("createdAt") or ...
            if created_at_ms:
                try:
                    date_str = datetime.fromtimestamp(...)
                except (ValueError, OSError):
                    date_str = datetime.now().strftime("%Y-%m-%d")
            else:
                date_str = datetime.now().strftime("%Y-%m-%d")
            content_path = f"projects/{project_key}/bugs/{date_str}/{type_dir}/{doc_id}.md"
        deleted_file = delete_entry_markdown(content_path)
        if deleted_file:
            logger.info(f"Deleted bug markdown file: {content_path}")
        else:
            logger.warning(f"Bug markdown file not found or failed to delete: {content_path}")
    except Exception as e:
        logger.warning(f"Failed to delete bug markdown for key={doc_id}: {e}")
```

**issue 分支**（~30 行）：
```python
elif collection_name == "issues":
    try:
        content_path = existing_doc.get("contentPath") or existing_doc.get("content_path") or existing_doc.get("file_path") or ""
        if not content_path:
            project_key = (existing_doc.get("project_key") or ...).lower()
            issue_type = existing_doc.get("issue_type") or "other"
            type_dir = _ISSUE_TYPE_DIR.get(issue_type, "other")
            date_source = (existing_doc.get("created") or ...)
            date_str = None
            if date_source:
                ds_str = str(date_source)[:10]
                if len(ds_str) == 10 and ds_str[4] == "-" and ds_str[7] == "-":
                    date_str = ds_str
                elif isinstance(date_source, (int, float)) or ...:
                    try:
                        date_str = datetime.fromtimestamp(...)
                    except (ValueError, OSError):
                        pass
            if not date_str:
                date_str = datetime.now().strftime("%Y-%m-%d")
            content_path = f"projects/{project_key}/issues/{date_str}/{type_dir}/{doc_id}.md"
        deleted_file = delete_entry_markdown(content_path)
        if deleted_file:
            logger.info(f"Deleted issue markdown file: {content_path}")
        else:
            logger.warning(f"Issue markdown file not found or failed to delete: {content_path}")
    except Exception as e:
        logger.warning(f"Failed to delete issue markdown for key={doc_id}: {e}")
```

## 根因分析

两个分支共享相同的核心逻辑：
1. 从文档中提取 `content_path`，回退到构造路径
2. 确定项目 key、类型目录、日期字符串
3. 调用 `delete_entry_markdown`
4. 记录成功/失败日志
5. 异常处理

差异仅在于：
- 字段名：`type` vs `issue_type`
- 日期字段优先级：`createdAt/created_time/createdTime` vs `created/start_date/created_at/createdAt`
- 类型目录映射：`_BUG_TYPE_DIR` vs `_ISSUE_TYPE_DIR`
- 路径模板：`bugs/` vs `issues/`

这违反了 DRY（Don't Repeat Yourself）原则，修改删除逻辑时需要同时更新两个地方。

## 涉及文件

- `src/data/repository.py:654-709` — `delete_document` 中的 bug 和 issue 分支

## 修复方案

提取公共逻辑为私有辅助函数：

```python
async def _delete_entity_markdown(
    existing_doc: dict,
    doc_id: str,
    entity_name: str,  # "bug" or "issue"
    type_field: str,    # "type" or "issue_type"
    type_dir_map: dict,
    date_fields: list[str],
    path_subdir: str,  # "bugs" or "issues"
) -> None:
    """Delete the markdown file associated with a bug/issue document."""
    try:
        content_path = existing_doc.get("contentPath") or existing_doc.get("content_path")
        if not content_path:
            project_key = (existing_doc.get("project_key") or existing_doc.get("project") or "unknown").lower()
            entity_type = existing_doc.get(type_field) or "other"
            type_dir = type_dir_map.get(entity_type, "other")
            date_str = _resolve_date_str(existing_doc, date_fields)
            content_path = f"projects/{project_key}/{path_subdir}/{date_str}/{type_dir}/{doc_id}.md"
        deleted_file = delete_entry_markdown(content_path)
        if deleted_file:
            logger.info(f"Deleted {entity_name} markdown file: {content_path}")
        else:
            logger.warning(f"{entity_name.capitalize()} markdown file not found or failed to delete: {content_path}")
    except Exception as e:
        logger.warning(f"Failed to delete {entity_name} markdown for key={doc_id}: {e}")
```

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 超过 10 行的重复逻辑应提取为公共函数 |
| 审查 | 代码审查时标记高度相似的代码块 |
| 测试 | 为提取的公共函数编写独立测试 |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/data/repository.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
