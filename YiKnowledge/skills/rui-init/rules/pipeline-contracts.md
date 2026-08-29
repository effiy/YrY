---
paths:
  - ".claude/rui-init/SKILL.md"
  - ".claude/rui-init/steps/01-detect/STEP.md"
  - ".claude/rui-init/steps/02-explore/STEP.md"
  - ".claude/rui-init/steps/03-generate/STEP.md"
  - ".claude/rui-init/steps/04-verify/STEP.md"
description: "Pipeline contracts for rui-init: step ordering, sub-skill communication protocol, pipelineState shape, output ownership, and degradation countermeasures."
---

# Pipeline Orchestration Contracts

`rui-init` is the sole user-invocable entry point for the project initialization pipeline. It orchestrates four steps in strict order, communicating only through a shared `pipelineState` object.

## Pipeline Order (Immutable)

```
detect → explore → generate → verify
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
  projectType: string;          // 'node' | 'python' | 'go' | 'rust' | 'java' | 'dotnet' | 'unknown' | ...
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

## Communication Protocol

| Rule | Description |
|------|-------------|
| No direct calls | Steps never invoke each other |
| Single writer per field | Each step writes its designated pipelineState field |
| Upstream is read-only | step N may read fields from steps < N only |
| No cross-step imports | Steps must not import from sibling step directories |

## Output Ownership Matrix

| Artifact | Owner | Other steps may |
|----------|-------|-----------------|
| `CLAUDE.md` | 03-generate | Read (all) |
| `README.md` (main sections) | 03-generate | Read (all) |
| `README.md` (Domain Language) | User (append-once, preserved) | Read (all) |

## Degradation Countermeasures

| Condition | Action |
|-----------|--------|
| `verify.result === 'fail'` | Halt pipeline; surface failure list to user; no retry |
| Step crash mid-run | Abort entire pipeline; surface stack trace; no partial recovery |
| `projectType === 'unknown'` | Continue with warning; emit `# TODO: project type unknown` in generated artifacts |
| Missing `profile` fields | 02-explore must fill gaps before generate runs |