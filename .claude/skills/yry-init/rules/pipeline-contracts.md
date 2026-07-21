---
paths:
  - ".claude/yry-init/SKILL.md"
  - ".claude/yry-init-detect/SKILL.md"
  - ".claude/yry-init-explore/SKILL.md"
  - ".claude/yry-init-generate/SKILL.md"
  - ".claude/yry-init-arch/SKILL.md"
  - ".claude/yry-init-verify/SKILL.md"
description: "Pipeline contracts for yry-init: step ordering, sub-skill communication protocol, pipelineState shape, output ownership, and degradation countermeasures."
---

# Pipeline Orchestration Contracts

`yry-init` is the sole user-invocable entry point for the project initialization pipeline. It orchestrates five sub-skills in strict order, communicating only through a shared `pipelineState` object.

## Pipeline Order (Immutable)

```
detect → explore → generate → arch → verify
```

## PipelineState Contract

```typescript
interface PipelineState {
  steps: string[];
  profile: Profile;
  exploration: Exploration;
  verify: VerifyResult;
}

interface Profile {
  identity: {
    projectName: string;
    branchPrefix: string;
  };
  projectType: string;          // 'node' | 'python' | 'go' | 'rust' | 'unknown' | ...
  inventory: {
    topLevelFiles: string[];
    topLevelDirs: string[];
    manifests: Record<string, string>;
  };
  securitySurface: {
    authFiles: string[];
    secretFiles: string[];
    envFiles: string[];
  };
  testFramework: string | null;
  architecturePattern: string | null;
}

interface Exploration {
  moduleMap: Record<string, string[]>;
  architecture: {
    pattern: string;
    notes: string;
  };
  securitySurface: {
    authFiles: string[];
    secretFiles: string[];
    envFiles: string[];
  };
  conventions: Record<string, string>;
}

interface VerifyResult {
  result: 'pass' | 'fail';
  failures: Failure[];
}

interface Failure {
  check: string;
  detail: string;
  fix: string;
}
```

## Sub-Skill Communication Protocol

| Rule | Description |
|------|-------------|
| No direct calls | Sub-skills never invoke each other |
| Single writer per field | Each sub-skill writes its designated pipelineState field |
| Upstream is read-only | step N may read fields from steps < N only |
| No cross-sub-skill imports | Skills must not import from sibling skill directories |

## Output Ownership Matrix

| Artifact | Owner | Other skills may |
|----------|-------|-----------------|
| `CLAUDE.md` | yry-init-generate | Read (all) |
| `README.md` (main sections) | yry-init-generate | Read (all) |
| `README.md` (Domain Language) | User (append-once, preserved) | Read (all) |
| `docs/index.html`, `index.css`, `index.js` | yry-init/templates/ (source of truth) | Copied by yry-init-generate |
| `docs/data.js` | yry-init-generate (regenerated) | Read by docs dashboard |
| `docs/arch/` | yry-init-arch | Read (all) |
| `docs/test/` | yry-init-arch | Read (all) |

## Degradation Countermeasures

| Condition | Action |
|-----------|--------|
| `verify.result === 'fail'` | Halt pipeline; surface failure list to user; no retry |
| Sub-skill crash mid-run | Abort entire pipeline; surface stack trace; no partial recovery |
| `projectType === 'unknown'` | Continue with warning; emit `# TODO: project type unknown` in generated artifacts |
| Missing `profile` fields | yry-init-explore must fill gaps before generate runs |
