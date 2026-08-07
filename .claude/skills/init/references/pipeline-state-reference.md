---
description: "Single source of truth for yry-init pipelineState types (PipelineState, Profile, Exploration, VerifyResult, Failure, ReportsResult), the 7-point verify check catalog, and the filesystem output layout."
---

# Pipeline State Reference

This file is the **single source of truth** for the `pipelineState` object
that flows through the yry-init pipeline. All other documents (SKILL.md,
rules/, STEP.md `## Outputs` sections) must stay shape-consistent with
the TypeScript definitions below.

## PipelineState

```ts
type PipelineState = {
  steps: string[];                 // completed step names, in run order
  profile: Profile;                // written by step 01-detect
  exploration: Exploration;        // written by step 02-explore
  // step 03-generate writes files to disk (no pipelineState field)
  // step 04-arch writes files to disk (no pipelineState field)
  reports?: ReportsResult;         // written by the reports phase (optional)
  verify: VerifyResult;            // written by step 05-verify
};

type ReportsResult = {
  result: 'pass' | 'skipped' | 'fail';
  reason?: string;                 // e.g. 'yry-report-absent' when skipped
  stderr?: string;                 // captured when result === 'fail'
};
```

## Profile (written by step 01-detect)

```ts
type Profile = {
  identity: {
    name: string;                  // repo directory name
    branchPrefix: string;          // derived from identity.name (kebab-case)
  };
  projectType:
    | 'frontend' | 'backend' | 'fullstack'
    | 'meta' | 'unknown' | 'non-node';
  inventory: {
    dependencies: Record<string, string>;      // name → version range
    devDependencies: Record<string, string>;   // name → version range
    buildCommands: string[];
    testCommands: string[];
    frameworkVersions: Record<string, string>; // top-level frameworks only
  };
  securitySurface: {
    userInput: boolean;
    apiEndpoints: boolean;
    dataStorage: boolean;
    authentication: boolean;
    thirdParty: boolean;
  };
  testFramework:
    | 'vitest' | 'jest' | 'pytest'
    | 'go-test' | 'cargo-test' | 'none';
  architecturePattern:
    | 'single' | 'monorepo' | 'microservice' | 'plugin' | 'unknown';
};
```

| Field | Source | Example |
|-------|--------|---------|
| `identity.name` | Repo directory name | `yry-frontend` |
| `identity.branchPrefix` | Kebab-cased `identity.name` | `yry-frontend` |
| `projectType` | Decision tree over `package.json` deps | `frontend` |
| `inventory.dependencies` | `package.json` `dependencies` | `{ vue: "^3.4.0" }` |
| `inventory.devDependencies` | `package.json` `devDependencies` | `{ vitest: "^1.0.0" }` |
| `inventory.buildCommands` | `scripts.build` / `scripts.start` | `["npm run build"]` |
| `inventory.testCommands` | `scripts.test` | `["npm test"]` |
| `inventory.frameworkVersions` | Top-level framework packages | `{ vue: "^3.4.0" }` |
| `securitySurface.*` | Source keyword scan (5 booleans, never omitted) | `true` |
| `testFramework` | Config file or test command resolution | `vitest` |
| `architecturePattern` | Filesystem topology | `single` |

## Exploration (written by step 02-explore)

```ts
type Exploration = {
  moduleMap: Module[];             // top-level module list
  architecture: {
    pattern: Profile['architecturePattern'];  // corrected
    notes: string;
  };
  securitySurface: Profile['securitySurface']; // corrected
  conventions: {
    language: string;                           // e.g. 'ts', 'py'
    styleGuide: string | null;                  // eslint / prettier / .editorconfig
    commitStyle: string | null;                 // conventional / gitmoji / freeform
    fileNaming: 'kebab-case' | 'camelCase' | 'snake_case' | 'mixed';
  };
};

type Module = {
  name: string;                    // directory or logical name
  path: string;                    // physical path relative to project root
  coreDeps: string[];              // other module names it depends on
  responsibility: string;          // single-responsibility description
};
```

## VerifyResult (written by step 05-verify)

```ts
type VerifyResult = {
  result: 'pass' | 'fail';
  failures: Failure[];
};

type Failure = {
  checkId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  message: string;
  fix: string;                      // human-readable fix suggestion
};
```

## Verify Checks (7-point)

The canonical check list lives in
[`steps/05-verify/STEP.md` §1](../steps/05-verify/STEP.md#1-the-7-checks).
This table is the **ID map** only — any change to check semantics must be
made in 05-verify/STEP.md first, then mirrored here.

| # | Check ID | What it verifies |
|---|----------|------------------|
| 1 | `claude-md-name` | `CLAUDE.md` contains `profile.identity.name` |
| 2 | `readme-md-name` | `README.md` contains `profile.identity.name` |
| 3 | `domain-language` | `README.md` has `## Domain Language` + ≥ 3 term definitions |
| 4 | `docs-home-files` | All 4 docs home files exist (`index.html`, `index.css`, `index.js`, `data.js`) |
| 5 | `arch-scenes` | `docs/arch/` exists and every scene has `index.md` |
| 6 | `test-scenes` | `docs/test/` exists and every scene has `index.md` |
| 7 | `scene-counts` | `docs/arch/` ≥ 5 scenes AND `docs/test/` ≥ 6 scenes |

## Filesystem Output Layout

```
<project-root>/
├── CLAUDE.md                          # Generated from profile + exploration
├── README.md                          # Generated (domain language preserved)
└── docs/
    ├── index.html                     # Dashboard home (layout from yry-init/templates/)
    ├── index.css
    ├── index.js
    ├── data.js                        # window.HELP_CONFIG (regenerated each run)
    ├── arch/                          # ≥ 5 scene dirs, each with index.md
    │   ├── module-location/
    │   ├── data-flow-tracing/
    │   ├── newcomer-onboarding/
    │   ├── dependency-change-impact/
    │   └── trust-boundary-security-surface/
    └── test/                          # ≥ 6 scene dirs, each with index.md
        ├── post-init-full-self-check/
        ├── pre-commit-incremental-self-check/
        ├── doc-code-consistency/
        ├── security-surface-regression/
        ├── cross-story-integration-regression/
        └── third-party-framework-service/
```

The `yry-init/templates/` directory (at the skill root) contains the
**four** source-of-truth layout files: `index.html`, `index.css`,
`index.js`, `data.js`. There is no `theme.css` — theme tokens live
inside `index.css`.
