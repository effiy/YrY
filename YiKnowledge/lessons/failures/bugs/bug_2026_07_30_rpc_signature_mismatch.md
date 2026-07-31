---
title: RPC executor passes single dict, but write_entry_markdown expected 3 positional
  args
key: bug_2026_07_30_rpc_signature_mismatch
tags:
- rpc
- knowledge
- signature-mismatch
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiAi
module: domain/knowledge
assignee: claude
reporter: claude
environment: dev (localhost:10086)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
The generic RPC executor invokes `target_function(parameters_dict)` with a single positional dict (see `domain/execution/executor.py` `_run_function`). However, `domain/knowledge/writer.py::write_entry_markdown(rel_path, content, meta)` takes three positional args. When the frontend `createBug` flow called `callService('domain.knowledge.writer', 'write_entry_markdown', {rel_path, content, meta})`, the executor would pass the whole dict as `rel_path`, leaving `content` and `meta` without defaults → TypeError at runtime. Every bug creation from the YiVad `/bug` page would 500.

## Steps to Reproduce
1. Open http://localhost:8848/#/bug/list in YiVad.
2. Click Add Bug, fill in title + description, save.
3. Frontend calls createBug → callService('domain.knowledge.writer', 'write_entry_markdown', {rel_path, content, meta}).
4. Executor dispatches write_entry_markdown(parameters_dict) → TypeError: missing 2 required positional args.

## Expected Result
Bug metadata and markdown body persist; no server error.

## Actual Result
TypeError raised inside the executor; createBug fails; the entire /bug create flow was broken.

## Cause
The generic RPC executor in `domain/execution/executor.py::_run_function` calls `target_function(parameters_dict)` — a single positional dict. But `domain/knowledge/writer.py::write_entry_markdown(rel_path, content, meta)` expects three positional args. When the frontend createBug flow called `callService('domain.knowledge.writer', 'write_entry_markdown', {rel_path, content, meta})`, the executor passed the whole dict as `rel_path` and left `content` / `meta` without values, raising TypeError. Every create-from-/bug request 500'd.

## Solution
Added a service-layer wrapper `services.knowledge.knowledge_service.write_entry_markdown` that accepts a single `{rel_path, content, meta}` dict and forwards to the domain function with proper positional args. The frontend callService target was switched from `domain.knowledge.writer` to `services.knowledge.knowledge_service`, so the executor dispatches into the wrapper instead of the raw domain function. A parallel `delete_entry_markdown` wrapper covers the delete path.
