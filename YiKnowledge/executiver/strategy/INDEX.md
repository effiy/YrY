---
title: strategy/ MOC
aliases: [strategy-moc, strategy-index]
tags: [index, strategy, frameworks, compliance]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, producter]
benefit: "Navigate the strategy frameworks and compliance journeys directory — find the right tool for any strategic question"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category with descriptions"
  - "cross-references to parent INDEX and related leaves are present"
  - "common navigation paths are documented"
  - "all 12 framework/journey files exist and are linked"
related:
  - ./README.md
  - ../INDEX.md
  - ../industry/README.md
  - ../../producter/discovery/metrics/README.md
---

# strategy/ — Strategy Frameworks & Compliance

> **As an** executiver, **I want to** navigate the strategy directory, **so that** I can quickly find the right framework or journey for the strategic question at hand.

## Start here

New to this directory? Two entry points depending on what you need:

| You want to... | Go to |
|---|---|
| Understand which framework fits my question | [README.md → Quick start](./README.md#quick-start-which-framework-when) |
| See which frameworks combine well together | [README.md → Strategy stacks](./README.md#strategy-stacks-which-frameworks-combine-well) |
| See the full decision flow diagram | [README.md → Decision flow](./README.md#strategy-framework-decision-flow) |
| Browse all frameworks by category | Scroll down to [Strategy frameworks](#strategy-frameworks) |
| Follow a compliance process | Jump to [Compliance journeys](#compliance--regulatory-journeys) |
| See how frameworks relate to each other | [README.md → Strategy lifecycle](./README.md#strategy-lifecycle) |
| Check what data I need before starting | [README.md → Prerequisites](./README.md#prerequisites) |
| Know how often to revisit each framework | [README.md → Strategy cadence](./README.md#strategy-cadence) |
| See who owns which framework | [README.md → Roles & who uses what](./README.md#roles--who-uses-what) |
| Find key term definitions | [README.md → Glossary](./README.md#glossary) |

## Directory map

```
strategy/
├── INDEX.md                              ← you are here
├── README.md                             ← full overview, decision flow, quick-start
├── product-strategy-framework.md         ← meta-framework (synthesis)
├── business-model-canvas.md              ← framework
├── blue-ocean.md                         ← framework
├── porter-five-forces.md                 ← framework
├── swot-analysis.md                      ← framework
├── vrio-framework.md                     ← framework
├── value-proposition-canvas.md           ← framework
├── second-curve.md                       ← framework
├── now-next-later-roadmap.md             ← planning
├── handle-data-compliance.md             ← compliance journey
├── do-a-data-retention-review.md         ← compliance journey
└── handle-a-regulatory-change.md         ← compliance journey
```

## Strategy frameworks

Frameworks for analyzing strategic position, market opportunities, and competitive advantage. Start with the [decision flow](./README.md#strategy-framework-decision-flow) to pick the right one.

| File | Key question | Type | Time horizon |
|---|---|---|---|
| [product-strategy-framework.md](./product-strategy-framework.md) | How to synthesize multiple inputs into one strategy? | meta-framework | — |
| [swot-analysis.md](./swot-analysis.md) | What's our internal/external situation? | analysis | Now (snapshot) |
| [vrio-framework.md](./vrio-framework.md) | What gives us sustainable advantage? | analysis | Now |
| [porter-five-forces.md](./porter-five-forces.md) | How attractive is this industry? | analysis | Now → 3yr |
| [value-proposition-canvas.md](./value-proposition-canvas.md) | What do customers really need? | canvas | Now → 1yr |
| [business-model-canvas.md](./business-model-canvas.md) | Does the business model hold together? | canvas | Now → 3yr |
| [blue-ocean.md](./blue-ocean.md) | Where is the uncontested market space? | positioning | 3–5yr |
| [second-curve.md](./second-curve.md) | When do we jump to the next growth engine? | portfolio | 5–10yr |

## Roadmap & planning

Execution-oriented artifacts that translate strategy into action.

| File | Key question | Type | Time horizon |
|---|---|---|---|
| [now-next-later-roadmap.md](./now-next-later-roadmap.md) | What do we build and in what order? | roadmap | Now → 2yr |

## Compliance & regulatory journeys

Operational step-by-step journeys for navigating regulatory requirements. These run in parallel with strategy work, informing and constraining strategic choices.

| File | Key question | Trigger |
|---|---|---|
| [handle-data-compliance.md](./handle-data-compliance.md) | How do we stay compliant with data regulations? | Ongoing — quarterly review |
| [do-a-data-retention-review.md](./do-a-data-retention-review.md) | What data should we keep, and for how long? | New data type introduced, or scheduled audit |
| [handle-a-regulatory-change.md](./handle-a-regulatory-change.md) | How do we respond to new regulations? | New regulation announced |

## Common navigation paths

Typical sequences through the directory for common strategy tasks:

### Path A: Annual strategy refresh

```
swot-analysis.md → vrio-framework.md → porter-five-forces.md
    → blue-ocean.md → business-model-canvas.md
    → product-strategy-framework.md → now-next-later-roadmap.md
```

### Path B: New product / market entry

```
blue-ocean.md → value-proposition-canvas.md
    → business-model-canvas.md → product-strategy-framework.md
    → now-next-later-roadmap.md
```

### Path C: Compliance-driven strategy review

```
handle-a-regulatory-change.md → handle-data-compliance.md
    → business-model-canvas.md → product-strategy-framework.md
    → now-next-later-roadmap.md
```

### Path D: Portfolio rebalancing

```
second-curve.md → porter-five-forces.md
    → business-model-canvas.md → product-strategy-framework.md
```

## Cross-references

### Within executiver

| Target | Relevance |
|---|---|
| [../INDEX.md](../INDEX.md) | Parent role index — all executiver subdirectories |
| [../README.md](../README.md) | Executiver role overview |
| [../industry/competitors](../industry/competitors) | Competitive intelligence to feed Porter's Five Forces and Blue Ocean |
| [../industry/reports](../industry/reports) | Industry reports for market context in SWOT and P5F |
| [../roadmap](../roadmap) | Organizational roadmap — downstream from strategy |

### Cross-role

| Target | Relevance |
|---|---|
| [../../producter/discovery/metrics](../../producter/discovery/metrics) | Strategy-aligned metrics and OKR tracking |
| [../../producter/discovery/ux](../../producter/discovery/ux) | User research to feed Value Proposition Canvas |
| [../../producter/strategy](../../producter/strategy) | Product strategy alignment |
| [../../leader/roadmap](../../leader/roadmap) | Technical roadmap alignment |
| [../../curator/templates/thinking](../../curator/templates/thinking) | Mental models for strategic reasoning |
| [../../engineer/learn/lessons/learn-pm-frameworks.md](../../engineer/learn/lessons/learn-pm-frameworks.md) | Scenario entry: learning PM frameworks |
| [../../engineer/run/understand-competitors.md](../../engineer/run/understand-competitors.md) | Scenario entry: competitor analysis |

## File conventions

| Pattern | Purpose | Example |
|---|---|---|
| `{name}.md` | Strategy framework summary | [blue-ocean.md](./blue-ocean.md) |
| `{name}-roadmap.md` | Roadmap / planning artifact | [now-next-later-roadmap.md](./now-next-later-roadmap.md) |
| `{name}-canvas.md` | Canvas-based tool | [business-model-canvas.md](./business-model-canvas.md) |
| `{name}-analysis.md` | Situational analysis framework | [swot-analysis.md](./swot-analysis.md) |
| `do-{task}.md` | Step-by-step operational journey | [do-a-data-retention-review.md](./do-a-data-retention-review.md) |
| `handle-{event}.md` | Event-driven response journey | [handle-a-regulatory-change.md](./handle-a-regulatory-change.md) |

All files use English kebab-case. Each file carries frontmatter with `title`, `tags`, `created`, `updated`, `last_verified`, `source`, `type`, `lifecycle`, `review_cycle`, and `related` fields. See [README.md](./README.md#frontmatter-template) for the full template.