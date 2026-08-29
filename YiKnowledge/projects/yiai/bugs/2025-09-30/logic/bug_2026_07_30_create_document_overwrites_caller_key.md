---
title: "create_document silently overwrote the caller-supplied key with a UUID, so bug.key never matched the contentPath filename"
key: "bug_2026_07_30_create_document_overwrites_caller_key"
tags: ['backend', 'data-layer', 'mongodb', 'rpc', 'regression']
category: projects/yiai/bugs/2025-09-30/logic/bug_2026_07_30_create_document_overwrites_caller_key
created: 2025-09-30
updated: 2025-09-30
source: "internal"
type: "bug"
status: "resolved"
severity: "major"
priority: "p1"
project: "YiAi"
project_key: "yiai"
module: "data/repository.py:create_document"
assignee: "claude"
reporter: "claude"
environment: "dev"
affectedVersion: "1.0.0"
fixedVersion: "1.0.0"
frequency: "always"
---

## Description
create_document silently overwrote the caller-supplied key with a UUID, so bug.key never matched the contentPath filename

## Steps to Reproduce
_No steps recorded._

## Expected Result
_Not specified._

## Actual Result
_Not specified._

## Cause
_Root cause not yet recorded._

## Solution
_Solution not yet recorded._
