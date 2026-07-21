---
description: "Ecosystem manifest reference — supported manifest files per ecosystem, extracted fields, and version detection."
---

# Ecosystem Manifest Reference

## Node (package.json)

| Field | Extracted as |
|-------|-------------|
| `name` | `identity.name` |
| `dependencies` | `inventory.dependencies` |
| `devDependencies` | `inventory.devDependencies` |
| `scripts.build` | `inventory.buildCommands` |
| `scripts.test` | `inventory.testCommands` |
| Framework packages (react, vue, next, etc.) | `inventory.frameworkVersions` |

## Python (pyproject.toml)

| Field | Extracted as |
|-------|-------------|
| `project.name` | `identity.name` |
| `project.dependencies` | `inventory.dependencies` |
| `tool.poetry.dependencies` | `inventory.dependencies` (poetry) |
| `project.scripts` | `inventory.buildCommands` |
| `tool.pytest` presence | `testFramework: 'pytest'` |

## Go (go.mod)

| Field | Extracted as |
|-------|-------------|
| `module` directive | `identity.name` |
| `require` directives | `inventory.dependencies` |
| `go` directive | Go version |

## Rust (Cargo.toml)

| Field | Extracted as |
|-------|-------------|
| `package.name` | `identity.name` |
| `dependencies` | `inventory.dependencies` |
| `dev-dependencies` | `inventory.devDependencies` |
| `[[test]]` presence | `testFramework: 'cargo-test'` |
