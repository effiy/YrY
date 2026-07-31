---
title: 多语言翻译 Prompt（含术语表）
tags: [Prompt, 翻译, 多语言]
category: resources/prompts
created: 2026-07-31
updated: 2026-07-31
source: internal
type: prompt
status: stable
---

# 多语言翻译 Prompt（含术语表）

## 1. 适用场景

YiAi BRD 智能体需要支持多语言输出。直接让 LLM 翻译会导致术语漂移、专有名词错译。本 prompt 配合术语表锁定关键术语。

## 2. 输入变量

| 变量 | 含义 |
|---|---|
| `{source_text}` | 原文 |
| `{source_lang}` | 原文语言 |
| `{target_lang}` | 目标语言 |
| `{terminology}` | 术语表（JSON） |
| `{style_guide}` | 风格指南 |

## 3. System Prompt

```
You are a professional translator for after-sales business documents.

Task: translate {source_lang} text to {target_lang}.

Rules:
1. Use the terminology table strictly. Terms in the table must be translated as specified; never paraphrase them.
2. Preserve sentence structure where natural; adjust for target language grammar.
3. Preserve all numbers, dates, proper nouns (unless in terminology table).
4. Do not add explanation, commentary, or footnote.
5. If a term is not in the table and you are unsure, output it in the original language in [brackets] for human review.
6. Follow the style guide: {style_guide}
7. Output ONLY the translation. No header, no notes, no original text.

Terminology table (JSON, key=source term, value=translation):
{terminology}

Source text ({source_lang}):
<source>
{source_text}
</source>

Translation ({target_lang}):
```

## 4. 术语表格式

```json
{
  "异响": {
    "en": "abnormal noise",
    "de": "Geräusch",
    "fr": "bruit anormal",
    "ja": "異音"
  },
  "召回": {
    "en": "recall",
    "de": "Rückruf",
    "fr": "rappel",
    "ja": "リコール"
  },
  "BRD": {
    "en": "BRD",
    "de": "BRD",
    "fr": "BRD",
    "ja": "BRD"
  }
}
```

## 5. 风格指南示例

```
- 用主动语态，避免被动
- 句子 ≤ 30 词
- 不用感叹号
- 金额用千分位 + 原币种
- 日期用 ISO 格式或目标语言习惯
```

## 6. 调试笔记

- **temperature**：0.2（低随机，求稳）
- **top_p**：0.9
- **max_tokens**：与原文长度 × 1.5
- **batch 翻译**：同段多语言并行调用，互不依赖
- **术语表锁定**：术语用 `<term>...</term>` 标记也可，但 JSON 表更通用
- **未识别术语**：保留原文 + 标注 `[需翻译]`，定期扩充术语表
- **反向校验**：翻译后再翻回原文，对比相似度（< 80% 警告）
- **术语漂移检测**：同术语在多版本翻译中是否一致

## 7. 失败模式

| 失败 | 现象 | 防御 |
|---|---|---|
| 术语没锁 | 同术语在不同章节译法不同 | 强制术语表 + 后处理校验 |
| 添加解释 | 译文中夹带译者注释 | system prompt 禁止 + 后处理过滤 |
| 句法生硬 | 直译不通顺 | 风格指南 + few-shot 示例 |
| 文化冲突 | 例子或隐喻不合适 | 风格指南 + 本地化审 |
| 数字错误 | 金额单位、日期格式错 | 后处理正则校验 |

## 8. 与 YiAi 集成

- 术语表存 MongoDB，按业务域分类
- BRD 章节先生成中文版，再调用本 prompt 翻译到目标语言
- 后处理：术语一致性校验 + 反向翻译校验
- 月度审核：术语表覆盖率、漂移率

## 9. 与"先原文后翻译"对比

| 方式 | 优点 | 缺点 |
|---|---|---|
| 原文生成 + 翻译 | 事实一致性高、术语锁定 | 翻译步骤多一次 LLM call |
| 直接多语言生成 | 步骤少、快 | 事实易漂移、术语难锁定 |

YiAi 选前者：先生成中文锚定事实，再翻译，确保多语言一致性。
