---
title: Reading Notes Template
aliases:
- reading-notes-template
tags:
- template
- reading-notes
- executiver
category: executiver/reading-list
created: '2026-08-18'
updated: '2026-08-18'
last_verified: '2026-08-18'
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: monthly
roles:
- executiver
benefit: "Executives use this template to capture actionable insights from readings with consistent structure"
acceptance_criteria:
- template covers core viewpoint, key arguments, action implications, and sedimentation destination
- structure matches the recommended 5-section format
related:
- ./reading-list.md
- ./reading-note-high-output-management.md
- ../../curator/templates/knowledge-leaf.md
---

# Reading Notes Template

> **As an** executiver, **I want to** capture reading notes with a consistent structure, **so that** actionable insights are systematically distilled into the knowledge base.

## Template body

```markdown
# [Book/Article Title]

- **Author**: [Author Name]
- **Source**: [URL / Publisher / ISBN]
- **Date Read**: YYYY-MM-DD
- **Rating**: ★★★★☆ (1-5)
- **Tags**: [tag1, tag2, tag3]

## 1. One-sentence core viewpoint

[One sentence summarizing the author's central thesis]

## 2. Key chapter summary

| Chapter | Core Argument | Key Evidence | Quoted Highlights |
|---|---|---|---|
| [Ch.1 Title] | [Main argument] | [Supporting data/example] | "[Key quote]" |
| [Ch.2 Title] | [Main argument] | [Supporting data/example] | "[Key quote]" |

## 3. Action implications

### What this team's work can borrow

- [Specific actionable insight]
- [Specific actionable insight]

### Immediately actionable items

- [ ] [Concrete action item]
- [ ] [Concrete action item]

## 4. Quoted highlights

> "[Notable quote 1]"

> "[Notable quote 2]"

## 5. Sedimentation destination

| Viewpoint | Distilled into | Status |
|---|---|---|
| [Key insight] | [Path to YiKnowledge file] | ✅ / 🔄 |
```

## Field explanation

| Field | Required | Guidance |
|---|---|---|
| Author | Yes | Full name, linked to author page if notable |
| Source | Yes | URL for articles, ISBN for books |
| Date Read | Yes | When notes were completed |
| Rating | Yes | 1-5 scale, subjective assessment of value |
| Core viewpoint | Yes | One sentence, no more |
| Key chapter summary | Yes | Table format for scannability |
| Action implications | Yes | Must be concrete and specific to current team context |
| Quoted highlights | No | Only quotes that are truly memorable or provocative |
| Sedimentation destination | Yes | Tracks where each insight was distilled into the KB |

## Usage advice

- Fill in the sedimentation destination as soon as you identify where an insight belongs — do not defer
- Use the action implications section to drive weekly priorities
- Review reading notes quarterly to identify patterns across multiple readings
- If a book generates no actionable items, reconsider whether it belongs in the reading list

## Anti-patterns

- **Book report**: Summarizing the entire book without filtering for relevance
- **No sedimentation**: Writing notes but never linking insights to specific KB files
- **Vague actions**: "Think about this more" instead of concrete next steps
- **Over-summarizing**: Copying chapter-by-chapter instead of extracting the core argument