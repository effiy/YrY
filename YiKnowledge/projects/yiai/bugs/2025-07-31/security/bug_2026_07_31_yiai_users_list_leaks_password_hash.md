---
title: "YiAi /users/list endpoint leaked bcrypt password hashes — the export_users fix in a2d8196 missed the list_users route, and query_documents had no per-collection default to exclude password for the users collection"
key: "bug_2026_07_31_yiai_users_list_leaks_password_hash"
tags: ['yiai', 'security', 'password', 'bcrypt', 'users', 'list', 'regression', 'repository']
category: projects/yiai/bugs/2025-07-31/security/bug_2026_07_31_yiai_users_list_leaks_password_hash
created: 2025-07-31
updated: 2025-07-31
source: "internal"
type: "bug"
status: "resolved"
severity: "critical"
priority: "p0"
project: "YiAi"
project_key: "yiai"
module: "src/server/routes/users.py:list_users"
assignee: "claude"
reporter: "claude"
environment: "dev (YiAi FastAPI + Motor + bcrypt, auth disabled by default)"
affectedVersion: "1.0.0"
fixedVersion: "1.0.0"
frequency: "always"
---

## Description
YiAi /users/list endpoint leaked bcrypt password hashes — the export_users fix in a2d8196 missed the list_users route, and query_documents had no per-collection default to exclude password for the users collection

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
