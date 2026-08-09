---
title: Multilingual translation prompt (with terminology table)
aliases:
- multilingual-translation-prompt
- translation-prompt
tags:
- prompt
- translation
- multilingual
- terminology
category: ai-engineer/methodology/prompts
created: 2026-07-31
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: prompt
status: stable
lifecycle: active
review_cycle: yearly
roles:
- ai-engineer
- product-manager
benefit: ai methodology sound
acceptance_criteria:
  - "prompt intent and expected output format are stated"
  - "input variables are documented with types and examples"
  - "edge cases and failure modes are addressed"
related:
- ./brd-generation.md
- ./rag-system.md
- ../../../knowledge-curator/templates/brd.md
- ../../../engineer/projects/yiai/README.md
tacit: false
---

# Multilingual translation prompt (with terminology table)

> **As an** ai engineer, **I want to** multilingual translation, **so that** ai methodology sound.

> YiAi BRD agent multilingual output translation prompt. Letting the LLM translate directly causes terminology drift and mistranslation of proper nouns. This prompt pairs with a terminology table to lock key terms; unrecognized terms are kept in the original language + flagged for human review.

## Summary

- Translate strictly per the terminology table; terms must not be rewritten or paraphrased
- Preserve all numbers, dates, proper nouns (except those covered by the terminology table)
- Unrecognized terms are kept in the original language + flagged with `[brackets]`; periodically extend the terminology table
- Output is translation only: no explanation, no commentary, no original text
- YiAi chooses the "generate original first + translate later" mode: Chinese anchors facts, then translate to ensure multilingual consistency

## Prompt body

### System Prompt

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

### Terminology table style

```json
{
  "abnormal noise": {
    "en": "abnormal noise",
    "de": "Geräusch",
    "fr": "bruit anormal",
    "ja": "異音"
  },
  "recall": {
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

### Style guide example

```
- Use active voice; avoid passive
- Sentences <= 30 words
- No exclamation marks
- Amounts use thousands separators + original currency
- Dates use ISO format or target-language convention
```

## Variable explanation

| variable | Meaning |
|---|---|
| `{source_text}` | Source text |
| `{source_lang}` | Source language |
| `{target_lang}` | Target language |
| `{terminology}` | Terminology table (JSON) |
| `{style_guide}` | Style guide |

## Usage suggestions

- **temperature**: 0.2 (low randomness, prioritize stability)
- **top_p**: 0.9
- **max_tokens**: original length x 1.5
- **Batch translation**: parallel calls for multiple languages of the same segment; no inter-dependencies
- **Terminology lock**: marking terms with `<term>...</term>` works too, but JSON table is more universal
- **Unrecognized terms**: keep original + flag `[needs translation]`; periodically extend the terminology table
- **Reverse verification**: translate back to the source, compare similarity (< 80% warning)
- **Terminology drift detection**: whether the same term is consistent across multiple translation versions
- **Integration**: store terminology table in MongoDB by business domain; BRD sections generate the Chinese version first, then call this prompt to translate to the target language; monthly audit of terminology table coverage + drift rate

## Anti-patterns

| Anti-patterns | Symptom | Defense |
|---|---|---|
| Terms not locked | Same term translated differently across sections | Enforce terminology table + post-processing validation |
| Adds explanation | Translator commentary mixed into output | System prompt forbids + post-processing filter |
| Stiff syntax | Literal translation not fluent | Style guide + few-shot example |
| Cultural conflict | Examples or metaphors inappropriate | Style guide + localization review |
| Number errors | Wrong currency unit or date format | Post-processing regex validation |

## "Original first then translate" vs "Direct multilingual generation"

| Approach | Pros | Cons |
|---|---|---|
| Generate original + translate | High factual consistency, terms locked | Translation step adds one extra LLM call |
| Direct multilingual generation | Fewer steps, faster | Facts drift easily, terms hard to lock |

YiAi chooses the former: generate Chinese first to anchor facts, then translate, ensuring multilingual consistency.

## Related

- BRD generation: [brd-generation-prompt.md](./brd-generation.md)
- RAG reference: [rag-system-prompt.md](./rag-system.md)
- BRD template: [../../../knowledge-curator/templates/brd.md](../../../knowledge-curator/templates/brd.md)
- landing: [../../../engineer/projects/yiai](../../../engineer/projects/yiai)
