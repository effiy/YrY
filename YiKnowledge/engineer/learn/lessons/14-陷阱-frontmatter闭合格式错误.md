---
title: "Gotcha: YAML Frontmatter Closing Delimiter Missing Newline"
tags: [gotcha, frontmatter, YiKnowledge, yaml, RAG]
category: engineer/learn/lessons
created: 2026-09-24
updated: 2026-09-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, curator]
benefit: "识别并修复 frontmatter 中 `updated: 2026-09-10---` 缺少换行符的 YAML 格式错误"
related:
  - ../12-陷阱-静默吞错误.md
---

# YAML Frontmatter 闭合分隔符缺少换行符

> 在第二轮代码质量扫描中发现 15 个 YiKnowledge markdown 文件的 frontmatter 存在格式错误：`updated: 2026-09-10---`——闭合 `---` 缺少换行符，直接附加在字段值之后。

## 影响

- YAML 解析器将 `---` 视为 `updated` 字段值的一部分（或完全拒绝解析）
- YiAi 知识监视器扫描 frontmatter 时可能丢失元数据
- RAG 向量索引中的元数据不完整

## 发现位置

13 个 OKR 文件 + 2 个技能 README，分布在：
- `aier/okr/2026-Q3/aier-001-orchestration/`（2 文件）
- `aier/okr/2026-Q3/aier-002-agent-reliability/`（3 文件）
- `engineer/okr/2026-Q3/eng-001-build-debug-loop/`（3 文件）
- `engineer/okr/2026-Q3/eng-005-build-health-zero/`（2 文件）
- `leader/okr/2026-Q3/lead-001-technical-review-loop/`（3 文件）
- `skills/`（2 文件）

## 修复

```bash
# 批量修复：在闭合 --- 前插入换行符
sed -i '' 's/^updated: 2026-09-10---$/updated: 2026-09-10\n---/' *.md
```

## 额外发现

6 个 OKR 文件缺少 `tags` 字段（`engineer/okr/` 3 个 + `curator/okr/` 3 个），已补充。

## 预防

在就绪检查清单中添加 frontmatter 格式验证步骤，确保 `updated:` 和 `---` 之间有换行符。