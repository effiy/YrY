---
title: ADR — YiPet Biome 2.5 unified lint + format
lifecycle: active
key: brd_brd-tech-lead_msfev729rh54ab
tags:
- adr
- yi-pet
- biome
- lint
- format
adr_id: ADR-Biome-Lint-Format
project: yipet
domain: Lint & Format
decision_type: process
team_size: 3
status: accepted
owner: YiPet lead owner + architecture group
review_cycle: quarterly
kb_path: tech-lead/decisions/yipet/biome-lint-format.md
context: "YiPet stack migration: React 15 + Bootstrap → React 18.3 + Ant Design 5.21. ESLint"
  + Prettier are complex to configure and slow. Need a unified lint + format tool.
decision: Use Biome 2.5 to unify lint + format, remove ESLint + Prettier. Biome is a single
  binary + zero config + 10x performance. Rules align with ESLint recommended + Prettier default.
alternatives: B. Keep ESLint + Prettier — complex config + slow; C. dprint — small ecosystem
  + weak lint. A selected (Biome 2.5).
risks: 1. Biome rule coverage gaps — some ESLint plugin rules migrated manually; 2. Team learning
  curve — workshop + documentation; 3. IDE integration — Biome LSP is now stable.
rollback: Biome exception → revert to ESLint + Prettier config + fix + re-migrate (2 working days).
stakeholders: YiPet lead owner + architecture group (decision); CTO (approval); frontend lead (execution)
tacit: false
related: []
type: reference
---

# ADR — YiPet Biome 2.5 unified lint + format

**ADR ID**: ADR-Biome-Lint-Format  |  **Project**: yipet  |  **Domain**: Lint & Format
**Decision Type**: process  |  **Team Size**: 3  |  **Status**: accepted  |  **Owner**: YiPet lead owner + architecture group
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yipet/biome-lint-format.md

## Context
YiPet stack migration: React 15 + Bootstrap → React 18.3 + Ant Design 5.21. ESLint + Prettier are complex to configure and slow. Need a unified lint + format tool.

## Decision
Use Biome 2.5 to unify lint + format, remove ESLint + Prettier. Biome is a single binary + zero config + 10x performance. Rules align with ESLint recommended + Prettier default.

## Alternatives
B. Keep ESLint + Prettier — complex config + slow; C. dprint — small ecosystem + weak lint. A selected (Biome 2.5).

## Risks & Mitigations
1. Biome rule coverage gaps — some ESLint plugin rules migrated manually; 2. Team learning curve — workshop + documentation; 3. IDE integration — Biome LSP is now stable.

## Rollback Plan
Biome exception → revert to ESLint + Prettier config + fix + re-migrate (2 working days).

## Stakeholders
YiPet lead owner + architecture group (decision); CTO (approval); frontend lead (execution)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yipet/biome-lint-format.md`
