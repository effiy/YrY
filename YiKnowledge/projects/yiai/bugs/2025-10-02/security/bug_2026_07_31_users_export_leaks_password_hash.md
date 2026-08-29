---
title: "YiAi users_export endpoint leaked bcrypt password hashes in the CSV"
key: "bug_2026_07_31_users_export_leaks_password_hash"
tags: ['backend', 'yiai', 'security', 'users', 'export', 'bcrypt', 'regression']
category: projects/yiai/bugs/2025-10-02/security/bug_2026_07_31_users_export_leaks_password_hash
created: 2025-10-02
updated: 2025-10-02
source: "internal"
type: "bug"
status: "resolved"
severity: "critical"
priority: "p0"
project: "YiAi"
project_key: "yiai"
module: "server/routes/users.py:export_users"
assignee: "claude"
reporter: "claude"
environment: "dev (YiAi FastAPI + Motor + bcrypt)"
affectedVersion: "1.0.0"
fixedVersion: "1.0.0"
frequency: "always"
---

## Description
YiAi users_export endpoint leaked bcrypt password hashes in the CSV

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
