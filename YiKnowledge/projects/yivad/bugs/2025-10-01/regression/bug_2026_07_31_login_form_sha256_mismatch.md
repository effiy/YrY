---
title: "YiVad LoginForm pre-hashed password with SHA-256 but backend stores bcrypt(plaintext) — login always rejected for API-created users"
key: "bug_2026_07_31_login_form_sha256_mismatch"
tags: ['frontend', 'backend', 'yivad', 'yiai', 'auth', 'bcrypt', 'regression']
category: projects/yivad/bugs/2025-10-01/regression/bug_2026_07_31_login_form_sha256_mismatch
created: 2025-10-01
updated: 2025-10-01
source: "internal"
type: "bug"
status: "resolved"
severity: "critical"
priority: "p0"
project: "YiVad"
project_key: "yivad"
module: "views/login/components/LoginForm.vue:login + YiAi src/domain/auth/core.py"
assignee: "claude"
reporter: "claude"
environment: "dev (YiVad Vue 3.5 + Rsbuild 1, YiAi FastAPI + bcrypt + PyJWT)"
affectedVersion: "1.0.0"
fixedVersion: "1.0.0"
frequency: "always"
---

## Description
YiVad LoginForm pre-hashed password with SHA-256 but backend stores bcrypt(plaintext) — login always rejected for API-created users

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
