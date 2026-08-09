---
title: Single source of truth — YiDoc template consolidation + leaf 7 sections + dual-copy archive
tags:
- docs
- ssot
- template
- yidoc
- knowledge-leaf
- dual-copy
category: engineer/engineering
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
- knowledge-curator
benefit: When creating or maintaining documentation, find the SSOT strategy, leaf 7-section structure, and dual-copy archive boundary in one place; no more three-way drift.
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ../../knowledge-curator/templates/knowledge-leaf.md
- ../../knowledge-curator/templates/adr.md
- ../../knowledge-curator/templates/brd.md
- ../../knowledge-curator/templates/prd.md
- ../../../YiVad/src/views/brd/meta-schemas.ts
- ../README.md
tacit: false
---

# Single source of truth — YiDoc template consolidation + leaf 7 sections + dual-copy archive

> **As an** engineer, **I want to** a record of one YiDoc template consolidating SSOT strategy, leaf 7-section structure, and dual-copy archive boundary, **so that** when creating or maintaining documentation there is no more three-way drift; template and field definitions have only one authoritative source.

> Starting 2026-08-05, YiDoc's three-way template drift is being converged into `YiDoc/templates/<leaf>/` as the single source of truth; YiKnowledge's leaf 7-section structure and dual-copy archive are the companion conventions. This article is the meta-documentation of the SSOT strategy.

## Summary

- **SSOT takes priority over multiple copies** — template / documentation / field definitions have only one authoritative source; copies reference, they do not copy content
- **leaf 7 sections in fixed order** — summary / core ideas / key information / anti-patterns / action recommendations / related; do not add or remove sections; `knowledge-leaf.md` is the SSOT
- **Dual-copy archive applies only to external knowledge** — external original + summary (`*-original.md` + `*-summary.md`); internal project documentation is not dual-copied
- **frontmatter is the AI recall signal** — `roles` / `benefit` / `acceptance_criteria` / `lifecycle` / `related` / `tacit` / `tags` / `category` — the more structured, the more accurate cross-role recall becomes
- **descriptive verb-phrase file names** — hyphen only, underscores and digits forbidden; `set-up-ci-cd.md` / `harden-supply-chain.md` are the canonical form

## Core viewpoints

- **SSOT is not about avoiding duplication — it is about making the cost of divergence visible** — When three copies of a template exist (BRD system / YiKnowledge / YiDoc), the cost of maintaining them is invisible until someone creates a document using the wrong template. Consolidating into one SSOT makes the cost of divergence a build failure: if someone adds a field to one copy, the CI diff check catches it. The SSOT strategy is a signal mechanism, not a storage optimization.

- **The 7-section leaf structure is not a template — it is a retrieval contract** — Every leaf file has 7 sections in fixed order (summary / core ideas / key information / anti-patterns / action recommendations / related) because AI recall depends on fixed section positions. If one leaf adds an 8th section or reorders the sections, cross-leaf recall fails because the AI cannot find the same section in the same position across files.

- **frontmatter is the most important text in the file — it is the AI's only structured signal** — The `roles` array determines which roles can recall the file; `benefit` is the matching signal for role-based queries; `acceptance_criteria` is the verification standard; `lifecycle` / `tacit` / `related` form the related network. The more structured the frontmatter, the more accurate RAG recall becomes. A file with perfect body text but incomplete frontmatter is invisible to AI.

- **Dual-copy archive is only for external knowledge — internal documentation is single-copy** — External original (`*-original.md`) preserves the full picture, and `*-summary.md` is the digest + reference. This dual-copy pattern only applies to knowledge imported from external sources. Internal project documentation (architecture summaries, dev standards, ADRs) uses a single file as the SSOT. Applying dual-copy to internal docs doubles the maintenance burden without benefit.

- **File naming is the first signal of recall, and the naming convention is a hard constraint** — A descriptive verb-phrase (`set-up-ci-cd.md`) recalls better than a noun (`ci-cd.md`) because the verb phrase matches the natural language query "I want to set up CI/CD." The no-underscore, no-digit rule is not aesthetic; it is a constraint that prevents naming inconsistency across 44+ files.


- **Three-way template drift is the cost of missing SSOT** — YiDoc originally had three versions of templates for BRD / ADR / PRD / meeting-notes (BRD system template / YiKnowledge template / YiDoc template); field definitions were inconsistent, so when creating documentation it was unclear which to reference → consolidate into `YiDoc/templates/<leaf>/` as the single source of truth; other locations only reference
- **knowledge-leaf.md is the meta-template for leaf 7 sections** — every leaf file (including the 6 new role READMEs in this round) is written with 7 sections; do not add or remove sections; adding sections causes cross-leaf recall failure (fixed section positions cannot be found)
- **Dual-copy archive is the pattern for "external knowledge entering the knowledge base"** — external original `*-original.md` preserves the full picture, `*-summary.md` is the summary + reference; internal project documentation is not dual-copied (a single file is the SSOT, avoiding dual-copy sync drift)
- **frontmatter fields are AI cross-role recall signals** — the `roles` array determines which roles can recall; `benefit` is the matching signal; `acceptance_criteria` is the verification standard; `lifecycle` / `tacit` / `related` form the related network; the more structured the fields, the more accurate RAG recall becomes
- **The file name is the first signal of recall** — a descriptive verb-phrase (`set-up-ci-cd.md`) recalls better than a noun (`ci-cd.md`); hyphen-only + no underscores + no digits is a project hard constraint

## Key information

### YiDoc template consolidation (3 ways → 1 way)

**Current state** (`project_yidoc_template_consolidation.md` memory, in progress 2026-08-05):

| template type | original three-way drift sources | consolidation goal |
|---|---|---|
| BRD | YiVad meta-schemas `templateContent` / YiKnowledge brd.md / YiDoc templates/brd | `YiDoc/templates/brd/` SSOT; YiVad `templateContent` references fields; YiKnowledge brd.md references structure |
| ADR | YiKnowledge adr.md + adr-template.md / YiDoc templates/adr | `YiDoc/templates/adr/` SSOT; YiKnowledge adr.md + adr-template.md consolidated (avoid dual-copy drift) |
| PRD | YiKnowledge prd.md / YiDoc templates/prd | `YiDoc/templates/prd/` SSOT |
| meeting-notes / retrospective / tech-design | YiKnowledge same-name template / YiDoc templates | `YiDoc/templates/<leaf>/` SSOT |

**Consolidation principles**:
1. `YiDoc/templates/<leaf>/` is the SSOT, containing field definitions + section structure + frontmatter spec
2. YiVad `templateContent` / YiKnowledge `templates/<leaf>.md` only reference, they do not copy content
3. Dual-copy archive `*-original.md` + `*-summary.md` is only for external knowledge; project templates are not dual-copied

### leaf 7 sections fixed order (knowledge-leaf.md SSOT)

```markdown
# <title>

> **As a** <role>,**I want to** <goal>,**so that** <benefit>.

> <one-sentence scope statement>

## Summary
- 3-5 bullet points, directly greppable


- 5-7 main arguments, each with a "— explanation"

## Key information
### Subsection 1
### Subsection 2
...


- 5-7 forbidden items

## Action recommendations
1. Step 1
2. Step 2

## Related
- [related leaf 1]\(path\)
- [related leaf 2]\(path\)
```

**Sections must not be added or removed**: the 7 sections are fixed anchors for cross-leaf recall; adding sections makes RAG unable to find fixed section positions. New content goes into "Key information" subsections; do not open new sections.

### frontmatter fields (AI recall signals)

```yaml
---
title: <title>
aliases: [<alias1>, <alias2>]
tags: [tag1, tag2]
category: <role>/<subdir>
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal | external-<source>
type: summary | gotcha | template | adr | brd | prd | pattern
status: stable  # valid values: stable | draft | deprecated
lifecycle: active | reference | archive
review_cycle: monthly | quarterly | half_yearly | yearly
last_verified: YYYY-MM-DD  # required for external content
tacit: true | false  # tacit knowledge marker
roles: [role1, role2]  # cross-role recall
benefit: "<one-sentence benefit>"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphen only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - <path1>
  - <path2>
---
```

**Recall mechanism**:
- The `roles` array determines which roles can recall; multi-role applicable files tag all
- `benefit` is the matching signal; write clearly "what you can do after reading"
- `tags` are keyword recall
- `category` is path recall
- `related` is the related network

### Dual-copy archive (external knowledge only)

```markdown
# *-original.md (original)
---
title: <external original title>
source: external-<url-or-book>
type: original
status: stable
lifecycle: archive
review_cycle: yearly
last_verified: YYYY-MM-DD
tacit: false
---
<full original markdown text>
```

```markdown
# *-summary.md (summary)
---
title: <summary title>
source: external-<url-or-book>
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: YYYY-MM-DD
tacit: false
related:
  - ./<name>-original.md
---
# Summary
## Summary
...

...
## Related
- [original](./<name>-original.md)
```

**Boundary**:
- External knowledge (books / blog posts / documentation) → dual-copy
- Internal project documentation (CLAUDE.md / README.md / onboarding.md / BRD templateContent) → single file, not dual-copied
- Avoid dual-copy sync drift: original changes but summary is unaware, or summary changes but original is not synced

### File name conventions (hard constraint)

✅ Canonical:
- `set-up-ci-cd.md`
- `harden-supply-chain.md`
- `respond-to-an-incident.md`
- `bug-logging-protocol.md`
- `dev-environment-hmr.md`
- `whitelist-bypass-class.md`
- `iterative-self-check.md`
- `yry-skill-family.md`

❌ Anti-canonical:
- `ci_cd.md` (underscore)
- `phase1.md` (digit)
- `setup.md` (noun, not verb-phrase)
- `bugLogging.md` (camelCase)



- **Do not maintain template copies outside YiDoc** — YiVad `templateContent` / YiKnowledge `templates/<leaf>.md` all reference `YiDoc/templates/<leaf>/`, they do not copy content
- **Do not add or remove leaf 7 sections** — the 7 sections are fixed anchors for cross-leaf recall; new content goes into "Key information" subsections
- **Do not dual-copy internal project documentation** — dual-copy is only for external knowledge; internal project documentation is a single file as SSOT; dual-copy causes sync drift
- **Do not use underscores or digits in file names** — hard constraint; `set_up_ci_cd.md` / `phase1.md` are rejected by project rules
- **Do not strip frontmatter fields** — the more structured, the more accurate AI recall; omitting fields causes cross-role recall failure
- **Do not write a feature description in the benefit field** — benefit is "what you can do after reading", not "what this file does"; `"find the RPC shape in one place"` is canonical, `"manage RPC calls"` is anti-canonical

## Action recommendations

When creating new documentation:

1. Decide the type: leaf (7 sections) / template (SSOT in YiDoc/templates/) / external knowledge dual-copy
2. Reference `YiDoc/templates/<leaf>/` as SSOT; do not copy content
3. File name: verb-phrase + hyphen + no underscores + no digits
4. Fill in all 11 frontmatter fields (`title` / `aliases` / `tags` / `category` / `created` / `updated` / `source` / `type` / `status` / `lifecycle` / `roles` + `benefit` + `acceptance_criteria` + `related`)
5. Write the body per leaf 7 sections; do not add or remove sections
6. External knowledge: dual-copy `*-original.md` + `*-summary.md`; internal project: single file

When upgrading existing documentation:

1. Modify the SSOT (YiDoc/templates/<leaf>/); other locations auto-sync via reference
2. Do not modify copies; modifying them causes async, leading to three-way drift regression
3. After modifying, run frontmatter validation + file name convention lint
4. External knowledge dual-copy: if the original changes, sync the summary; if the summary changes, do not touch the original (the summary perspective changes)

## Anti-patterns

- **Three-way template drift as a silent regression** — When three copies of a template exist (BRD system / YiKnowledge / YiDoc), each copy diverges independently. A field added to one copy is missing from the others. The person creating a new document picks the wrong copy and the document is missing critical fields. The fix is not to synchronize the copies; it is to eliminate the copies and reference the SSOT.

- **Adding or removing leaf sections** — The 7 sections are fixed anchors for cross-leaf recall. If one leaf adds an 8th section or removes one, the AI cannot find the same section in the same position across files. Cross-leaf recall fails silently. New content goes into "Key information" subsections; do not open new top-level sections.

- **Dual-copying internal project documentation** — External knowledge (books, blog posts, documentation) needs dual-copy (`*-original.md` + `*-summary.md`) to preserve the original while providing a digest. Internal project documentation (architecture summaries, dev standards, ADRs) is a single file as SSOT. Dual-copying internal docs doubles the maintenance burden and creates sync drift.

- **Stripping frontmatter fields to save time** — The `roles` array, `benefit`, `acceptance_criteria`, `lifecycle`, `tacit`, and `related` fields are the AI's only structured signals. A file with perfect body text but incomplete frontmatter is invisible to AI recall. The 5 minutes saved by skipping frontmatter fields are paid back in every failed recall.

- **Using underscores or digits in file names** — `ci_cd.md` (underscore) and `phase1.md` (digit) are rejected by project rules. The no-underscore, no-digit rule is a hard constraint that prevents naming inconsistency across 44+ files. A file with a non-conforming name is unfindable by convention-based search.

## Related

- [engineer/README.md](../README.md) — Engineer working directory
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf 7-section SSOT
- [knowledge-curator/templates/adr.md](../../knowledge-curator/templates/adr.md) — ADR template (dual-copy canonical sample)
- [knowledge-curator/templates/brd.md](../../knowledge-curator/templates/brd.md) — BRD template
- [knowledge-curator/templates/prd.md](../../knowledge-curator/templates/prd.md) — PRD template
- [YiVad/src/views/brd/meta-schemas.ts](../../../YiVad/src/views/brd/meta-schemas.ts) — BRD templateContent 8 roles (2026-08-05 aligned with YiKnowledge README role subdirs)
- **YiDoc template consolidation memory** (Claude memory: `project_yidoc_template_consolidation.md`) — source of truth for consolidation progress
