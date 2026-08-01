---
title: 'BRD-2026-005: YiVad Development Standards'
key: brd_brd-documents_claude002
tags:
- yivad
- vue3
- standards
- code-quality
- development
---

# BRD-2026-005: YiVad Development Standards & Component Library

## Executive Summary

YiVad's .claude/ directory defines the development standards, reusable agents, build commands, and framework-specific skills that govern all YiVad (Vue 3 admin dashboard) development. This includes rules for API request patterns, ProTable conventions, Vue 3 component patterns, and two specialized agents for component extraction and page building.

## Architecture Overview

### Agents (2)

| Agent | Purpose |
|-------|---------|
| component-extractor | Extracts reusable Vue 3 components, composables, and directives from existing code into correct directories (src/components/, src/hooks/, src/directives/) |
| page-builder | Builds new YiVad pages following conventions: ProTable + SearchForm + API integration + route registration |

### Commands (4)

| Command | Action |
|---------|--------|
| build | Rsbuild production/dev build with mode selection |
| dev | Start Rsbuild dev server on port 8848 |
| lint | ESLint + Prettier + Stylelint with auto-fix |
| typecheck | vue-tsc --noEmit --skipLibCheck |

### Rules (3)

| Rule File | Scope | Key Directives |
|-----------|-------|---------------|
| api-request-layer.md | src/api/**, src/utils/** | Axios RequestHttp class, interceptor chain, error handling, cancellation |
| protable-patterns.md | All table pages | ProTable as canonical table, column SearchForm integration, requestApi contract |
| vue-component-patterns.md | All Vue SFCs | script setup + TypeScript, defineProps/Emits generics, scoped SCSS, Pinia setup stores |

### Skills (2)

| Skill | Domain |
|-------|--------|
| vite | Vite.js ecosystem navigator — starters, plugins, integrations, SSR, showcases |
| vue | Vue 3 best practices — Composition API, TypeScript, Pinia, Vue Router, Element Plus, directives, composables |