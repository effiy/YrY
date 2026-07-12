---
name: github-security-scan
description: >
  Scan files and diffs for leaked credentials, keys, passwords, and tokens.
  Proactively check code before committing or merging.
---

# GitHub Security Scan

Scan file contents for credentials, API keys, passwords, and tokens
using the GitHub MCP server's `run_secret_scanning` tool.

## When to Use

- Before pushing new code
- Reviewing a PR for credential leaks
- Auditing repository contents
- Checking code snippets or diffs

## Workflow

### Scan a PR Diff

```
pull_request_read(method=get_diff) → run_secret_scanning(files=[diff_content])
```

### Scan a File

```
get_file_contents(path) → run_secret_scanning(files=[file_content])
```

### Scan Multiple Files

```
run_secret_scanning(files=[content1, content2, content3])
```

## Tool Reference

`run_secret_scanning` — Accepts a file content string or array of strings.
Detects common secret patterns: API keys, passwords, tokens, private keys,
connection strings, and more.

## Best Practices

- Scan proactively before committing sensitive content
- Run as part of the PR review workflow
- Combine with `request_copilot_review` for comprehensive security review
- Treat all findings as critical — secrets in code are a P0 issue
