---
title: Reading Notes Template
aliases:
- reading-notes-template
- book-notes-template
tags:
- template
- reading
- notes
category: executive/reading-list
created: 2026-08-03
updated: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
last_verified: 2026-08-07
review_cycle: yearly
roles:
- executive
benefit: Executives can maintain a curated reading list for continuous learning and industry awareness
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./reading-list.md
- ../../knowledge-curator/governance/tacit-knowledge-backlog.md
tacit: false
---

# Reading Notes Template

> **As an** executive, **I want to** reading notes, **so that** reading list curated. 

> General template for book / long-form / paper notes. Copy and adapt. Once read and with accumulated value, distill into the corresponding semantic leaf (`methodology/` `tech/`); the notes `related` field points to the final landing. 

## Summary

- Five sections: one-sentence core viewpoint → key section summary → action insights → reference golden quotes → accumulation destination
- key section must contain core argument + key evidence + reference golden quote
- action insights split into "what the team can learn from" and "what can be implemented immediately" two layers
- accumulation destination: which items have been distilled into which YiKnowledge files, which are not yet accumulated but worth while (enter tacit backlog) 

## Core viewpoints

**The one-sentence core viewpoint is the hardest and most valuable field.** If you cannot distill a 300-page book into one sentence that captures its central argument, you have not understood it. This constraint forces you to identify what the author is actually saying versus what they are illustrating. A vague one-sentence summary ("this book is about strategy") means you read the words but missed the argument. Write the one-sentence viewpoint immediately after finishing the book, before your memory blurs the thesis into a collection of anecdotes.

**Action insights without accumulation destination are intellectual entertainment.** A reading note that says "the team should do X" but never distills that insight into a specific YiKnowledge leaf, ADR, or process change is a book report, not a learning system. The accumulation destination is the forcing function that turns reading into organizational capability. Every action insight must answer: which file does this update, or which tacit backlog entry does this create?

**Reading notes taken after the fact lose 70% of their value.** Memory reconstructs, it does not record. The argument you remember three weeks after finishing a book is not the argument the author made -- it is the argument your existing mental models found comfortable. Marginal notes, chapter-by-chapter summaries written during reading, and golden quotes copied verbatim are the only reliable inputs. The "take notes while reading" rule is not a productivity tip; it is an epistemic necessity.

**The distinction between "learnable" and "immediately implementable" separates insight from action.** Most reading notes stop at "this is interesting." The template forces a second layer: what can we do differently on Monday? If an insight cannot be translated into a specific change in how the team writes code, runs meetings, makes decisions, or designs systems, it is not yet actionable. The "immediately implementable" layer is the test of whether the reading was worth the time.

## Template body

```markdown
---
title: {book/article} notes
aliases: [{english-alias}]
tags: [book, {topic}]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <Douban / Goodreads / original link>
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: YYYY-MM-DD
related: [<path of file distilled into method/tech>]
---

# {book/article} notes

## 1. One-sentence core viewpoint

_Summarize the entire book/article in one sentence_

## 2. Key section summary

### Chapter X: {title}

- Core argument
- Key evidence
- Reference golden quote

## 3. Action insights

- What can be learned for this team's work
- What can be landed immediately

## 4. Reference golden quotes

> _{golden quote}_

## 5. Accumulation destination

- Which viewpoints have been distilled into which YiKnowledge file (`related` field) 
- Which are not yet accumulated but worth while (enter [tacit backlog](../../knowledge-curator/governance/tacit-knowledge-backlog.md)) 
```

## Field notes

| field | required | standard |
|---|---|---|
| title | yes | book name / article title + "notes" |
| source | yes | Douban / Goodreads / original link |
| one-sentence core viewpoints | yes | one sentence, not exceeding 30 chars |
| key section summary | yes | at least 1 section, containing argument + evidence + golden quote |
| action insights | yes | learnable + implementable two layers |
| reference golden quote | recommended | enhances persuasiveness |
| accumulation destination | yes | already accumulated + to-accumulate two layers |

## Usage suggestions

- Take notes while reading throughout, do not rely on after-the-fact memory
- Write the one-sentence core viewpoint immediately after reading, avoid getting blurrier as you read
- Organize key section summary by section, not by time
- Split action insights into "learnable" and "implementable immediately" layers, the former is cognitive the latter is execution
- Accumulation destination is mandatory: use `related` field for items already distilled into YiKnowledge files; enter tacit backlog for items not yet accumulated but worth while
- Immediately classify after reading: items with accumulation value distill into `methodology/` or `tech/` corresponding leaf, this note's `related` points to the landing

## Action recommendations

1. **Adopt the template as the team's shared reading standard.** Every executive and tech lead who reads a business or technical book produces a reading note using this template. Shared notes compound — one person's reading becomes the team's knowledge base.
2. **Schedule a monthly "reading distillation" session.** 30 minutes where the team reviews the month's reading notes, identifies patterns across multiple books, and decides which insights warrant an ADR, a process change, or a new knowledge leaf. This prevents the "accumulation destination" field from becoming a checkbox.
3. **Start with the one-sentence viewpoint, not the template.** When someone finishes a book, the first ask is not "fill out the template" but "give me the one-sentence core argument." If they can't produce it, the template won't help. The one-sentence test is the gate.
4. **Pair reading assignments with business problems.** Don't assign reading for its own sake. "We're struggling with scaling decisions — read this book on distributed systems and produce a note focused on what applies to our architecture." Contextual reading produces better notes and faster organizational impact.
5. **Review the reading list quarterly for accumulation debt.** Count how many reading notes have empty `related` fields or no tacit backlog entries. If more than 30% of notes have no accumulation destination, pause new reading until the backlog is distilled. Un-accumulated reading is a liability, not an asset.

## Anti-patterns

**Large-paragraph transcription instead of distillation.** Copying entire paragraphs from the book into notes creates the illusion of thoroughness but produces notes that are unreadable and unsearchable. The note should contain the argument, the evidence, and the golden quote -- not the 15 pages of buildup the author used to get there. If your notes are longer than 10% of the source material, you are transcribing, not distilling.

**Reading without writing.** The most common failure mode is treating reading as a consumption activity rather than a production activity. A book finished without a single written note is entertainment, not learning. The minimum viable output is the one-sentence core viewpoint. If you cannot produce that, you did not read the book -- you scanned it.

**Accumulating notes that point nowhere.** A growing collection of reading notes with empty `related` fields and no tacit backlog entries is a graveyard of good intentions. Each note must either update an existing knowledge leaf or create a new tacit backlog entry within one week of completion. Notes older than a month with no accumulation destination should be archived or deleted.

**Treating all books as equally distillable.** Not every book deserves the full template. A beach-read business biography yields one or two golden quotes at most. A dense academic text may require chapter-by-chapter analysis. The template is a maximum structure, not a minimum requirement. Adjust depth to the book's information density, not the template's completeness.


| Anti-pattern | symptom | fix |
|---|---|---|
| large-paragraph transcription | recounting original text | distill argument + evidence + golden quote |
| no action insights | notes cost nothing after reading | mandatory learnable + implementable |
| no accumulation destination | no distillation after reading | already accumulated enter related, not accumulated enter tacit backlog |
| rely on after-the-fact memory | notes lag behind | take notes while reading |
| no golden quote | weak persuasiveness | recommended to quote |

## Related

- [README.md](./) — this leaf navigation
- [reading-list.md](./reading-list.md) — monthly rolling list
- [../../knowledge-curator/governance/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) — backlog of items not accumulated but worth entering
- [../../knowledge-curator/templates](../../knowledge-curator/templates) — methodology distillation destination
- [../../ai-engineer](../../ai-engineer) — technology distillation destination
