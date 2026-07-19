/**
 * @file: data.js
 * @purpose: Quickstart template data schema + default/empty values for
 *           the `rui-report-quickstart` skill. This is the single source
 *           of truth for what the rendered newcomer quickstart can render.
 *           The Vue app in index.js reads `window.QUICKSTART_DATA` and
 *           renders the seven canonical sections in fixed order.
 *
 * @four_file_layout:
 *   data.js    — schema, defaults, example fixture, mergeWithDefaults
 *   index.html — page shell (loads shared/loader.js, this file, index.css, index.js)
 *   index.css  — all styles, layered
 *   index.js   — Vue 3 app + quickstartToMarkdown() exporter (for the README mirror)
 *
 * @data_shape (window.QUICKSTART_DATA):
 *   {
 *     meta: {
 *       title:       string,         // page H1 + <title>
 *       scope:       string,         // absolute path analyzed
 *       scopeShort:  string,         // display path (last 2 segments)
 *       language:    'en' | 'zh',    // output language
 *       depth:       number,         // directory-map depth (default 3)
 *       generatedAt: ISO-8601,       // generation timestamp
 *       timestamp:   'YYYY-MM-DD',   // date stamp for the header
 *       version:     1               // schema version
 *     },
 *     labels: {
 *       // All user-visible UI strings. English by default; the
 *       // /rui-report-quickstart create command overwrites this block
 *       // when --language zh is requested.
 *     },
 *     score: {
 *       composite: number,           // 0..100
 *       grade:     'A'|'B'|'C'|'D'|'F',
 *       verdicts:  { [sectionSlug]: 'pass'|'partial'|'fail' }
 *     },
 *     sections: {
 *       overview:           { kind, coverage, verdict, ... },
 *       concepts:           { kind, coverage, verdict, items: [...] },
 *       'directory-map':    { kind, coverage, verdict, tree, depth, annotations },
 *       'onboarding-flow':  { kind, coverage, verdict, steps: [...] },
 *       commands:           { kind, coverage, verdict, items: [...] },
 *       faq:                { kind, coverage, verdict, items: [...] },
 *       'further-reading':  { kind, coverage, verdict, items: [...] }
 *     }
 *   }
 *
 * @section_kinds (the shape consumed by each section's Vue template):
 *   overview           → { summary, stack: {language, framework, runtime},
 *                          scope: {files, directories, lines, locLabel} }
 *   concepts           → items: [{ name, description, file?, line?, role? }]
 *   'directory-map'    → { tree: 'preformatted-tree-string',
 *                          depth: number, annotations: { 'path': 'note' } }
 *   'onboarding-flow'  → steps: [{ order, action, outcome, command?, file? }]
 *   commands           → items: [{ name, command, description, source? }]
 *   faq                → items: [{ question, answer, source? }]
 *   'further-reading'  → items: [{ title, href, description, kind? }]
 *
 * @todo_marker:
 *   When a section has no grounded evidence, the /rui-report-quickstart
 *   create command writes:
 *     { kind: <kind>, coverage: 0, verdict: 'fail',
 *       todo: { reason: 'human-readable reason evidence is missing' } }
 *   The Vue template renders a yellow "TODO" badge + the reason in
 *   place of the section body, so the page is still navigable but the
 *   gap is visible at a glance. Sections with content simply OMIT
 *   `todo` (the renderer also falls back to TODO when the section's
 *   expected content array / string is empty, even without `todo`).
 *
 * @empty_value:
 *   Render any missing scalar as '—'. Render any missing array as [].
 *   Missing sections render as TODO with reason 'section omitted'.
 *
 * @canonical_order:
 *   The seven section slugs MUST appear in this order. The Vue template
 *   iterates `CANONICAL_SECTIONS` and reads each section by slug.
 *   Reordering the slugs reorders the page.
 *
 * @merge_semantics:
 *   `merge(input)` is a deep override — input keys win, defaults fill
 *   in only for missing scalar/array values. Crucially, a section that
 *   has real content in `input` will NOT inherit `todo` from defaults,
 *   so a populated overview in the example renders its summary, not a
 *   TODO block. The merge function deliberately treats `todo` like any
 *   other field: present in input → use it; absent in input → omit it
 *   (not pulled from defaults).
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     CANONICAL SECTION ORDER — the seven slugs in fixed order.
     ─────────────────────────────────────────────────────────────────── */
  var CANONICAL_SECTIONS = [
    'overview',
    'concepts',
    'directory-map',
    'onboarding-flow',
    'commands',
    'faq',
    'further-reading'
  ];

  var SECTION_TITLES_EN = {
    'overview':          'Project Overview',
    'concepts':          'Key Concepts',
    'directory-map':     'Directory Map',
    'onboarding-flow':   'Onboarding Flow',
    'commands':          'Command Cheatsheet',
    'faq':               'FAQ',
    'further-reading':   'Further Reading'
  };

  /* ═══════════════════════════════════════════════════════════════════
     DEFAULT DATA — empty / placeholder values for "fresh template" mode.
     The /rui-report-quickstart create command overwrites this with
     scope-derived evidence before writing the final report file.
     ─────────────────────────────────────────────────────────────────── */

  var DEFAULT_LABELS = {
    // Header
    headerSubtitle:    'Newcomer Quickstart',
    headerMeta:        'Generated',

    // Toolbar
    toolbarDatasetLabel:  'Dataset',
    toolbarFilterLabel:   'Coverage filter',
    toolbarThemeLabel:    'Theme',
    toolbarCopyLabel:     'Copy markdown',
    toolbarCopyAllLabel:  'Copy full report as markdown',
    toolbarCopiedLabel:   'Copied!',
    filterAll:            'All sections',
    filterPassPartial:    'Pass + partial',
    filterPass:           'Pass only',
    themeAuto:            'Auto',
    themeLight:           'Light',
    themeDark:            'Dark',

    // Section copy
    sectionCopyLabel:  'Copy this section as markdown',
    sectionCopiedLabel: 'Section copied',

    // Score banner
    scoreLabel:        'Onboarding completeness',
    scoreCallout:      'Fill the TODO markers to improve your onboarding.',
    verdictPass:       'pass',
    verdictPartial:    'partial',
    verdictFail:       'fail',
    gradeA:            'A',
    gradeB:            'B',
    gradeC:            'C',
    gradeD:            'D',
    gradeF:            'F',

    // Section badges
    todoBadge:         'TODO',
    coverageLabel:     'coverage',
    verdictLabel:      'verdict',
    depthLabel:        'depth',

    // Overview
    overviewSummaryLabel:  'Summary',
    overviewStackLabel:    'Primary stack',
    overviewScopeLabel:    'Scope cues',
    stackLanguage:         'Language',
    stackFramework:        'Framework',
    stackRuntime:          'Runtime',
    scopeFiles:            'files',
    scopeDirectories:      'directories',
    scopeLines:            'lines',

    // Concepts
    conceptsRole:       'role',
    conceptsLocation:   'location',

    // Onboarding
    onboardingStepLabel:    'Step',
    onboardingAction:       'Action',
    onboardingOutcome:      'Expected outcome',
    onboardingCommand:      'Command',

    // Commands
    commandsName:      'name',
    commandsCmd:       'command',
    commandsDesc:      'description',
    commandsSource:    'source',

    // FAQ
    faqAnswer:          'Answer',

    // Further reading
    readingKind:        'kind',
    readingLink:        'link',

    // Footer
    footerNote:         'Generated by /rui-report-quickstart — read-only, static-analysis only.',

    // Language note
    languageNote:       'Output language'
  };

  var DEFAULT_DATA = {
    meta: {
      title:       'Quickstart — sample-project',
      scope:       '/path/to/sample-project',
      scopeShort:  'sample-project',
      language:    'en',
      depth:       3,
      generatedAt: 'YYYY-MM-DDTHH:MM:SS+00:00',
      timestamp:   'YYYY-MM-DD',
      version:     1
    },
    labels: DEFAULT_LABELS,
    score: {
      composite: 0,
      grade:     'F',
      verdicts: {
        'overview':         'fail',
        'concepts':         'fail',
        'directory-map':    'fail',
        'onboarding-flow':  'fail',
        'commands':         'fail',
        'faq':              'fail',
        'further-reading':  'fail'
      }
    },
    sections: {
      'overview': {
        kind:     'overview',
        coverage: 0,
        verdict:  'fail',
        todo:     { reason: 'project overview evidence is missing' },
        summary:  '',
        stack:    { language: '', framework: '', runtime: '' },
        scope:    { files: 0, directories: 0, lines: 0, locLabel: '' }
      },
      'concepts': {
        kind:     'concepts',
        coverage: 0,
        verdict:  'fail',
        todo:     { reason: 'no stable concepts detected' },
        items:    []
      },
      'directory-map': {
        kind:        'tree',
        coverage:    0,
        verdict:     'fail',
        todo:        { reason: 'scope is too sparse for a useful map' },
        tree:        '',
        depth:       3,
        annotations: {}
      },
      'onboarding-flow': {
        kind:     'steps',
        coverage: 0,
        verdict:  'fail',
        todo:     { reason: 'no grounded onboarding flow found' },
        steps:    []
      },
      'commands': {
        kind:     'commands',
        coverage: 0,
        verdict:  'fail',
        todo:     { reason: 'no commands or scripts detected' },
        items:    []
      },
      'faq': {
        kind:     'qa',
        coverage: 0,
        verdict:  'fail',
        todo:     { reason: 'no FAQ source material found' },
        items:    []
      },
      'further-reading': {
        kind:     'links',
        coverage: 0,
        verdict:  'fail',
        todo:     { reason: 'no further reading found' },
        items:    []
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     EXAMPLE DATASETS — three illustrative fixtures used when the
     template is opened directly in a browser (no /rui-report-quickstart
     invocation). The dataset switcher in the toolbar lets viewers
     cycle through the fixtures to see how the template renders
     different project shapes and score levels.

       · python  — small standalone Python CLI (composite ≈ B)
       · ts      — TypeScript monorepo with workspaces (composite ≈ C)
       · go      — Go HTTP service with handlers + ADRs (composite ≈ A)

     The first dataset (python) is also re-exported as `example` for
     backward compat with consumers that expect a single `EXAMPLE_DATA`
     reference.
     ─────────────────────────────────────────────────────────────────── */

  var DATASET_PYTHON = {
    meta: {
      title:       'Quickstart — sample-project',
      scope:       '/Users/me/projects/sample-project',
      scopeShort:  'sample-project',
      language:    'en',
      depth:       3,
      generatedAt: '2026-07-19T12:00:00+08:00',
      timestamp:   '2026-07-19',
      version:     1
    },
    labels: DEFAULT_LABELS,
    score: {
      composite: 82,
      grade:     'B',
      verdicts: {
        'overview':         'pass',
        'concepts':         'partial',
        'directory-map':    'pass',
        'onboarding-flow':  'partial',
        'commands':         'pass',
        'faq':              'fail',
        'further-reading':  'partial'
      }
    },
    sections: {
      'overview': {
        kind:     'overview',
        coverage: 0.95,
        verdict:  'pass',
        summary:  'sample-project is a small Python CLI that reads a CSV, normalizes its columns, and prints a summary table. It is intentionally tiny — the goal is to demo the quickstart template, not to ship a feature.',
        stack:    { language: 'Python 3.11', framework: 'Click 8.x', runtime: 'CPython' },
        scope:    { files: 14, directories: 4, lines: 612, locLabel: '612 LOC' }
      },
      'concepts': {
        kind:     'concepts',
        coverage: 0.85,
        verdict:  'partial',
        items: [
          { name: 'CSVReader',     role: 'module', description: 'Parses raw CSV into a normalized row dict.', file: 'src/sample_project/csv_reader.py', line: 12 },
          { name: 'ColumnPolicy',  role: 'class',  description: 'Per-column rename + type-coercion rules.',     file: 'src/sample_project/policy.py',     line: 24 },
          { name: 'SummaryTable',  role: 'class',  description: 'Aggregates rows into a printable summary.',     file: 'src/sample_project/table.py',     line: 8  },
          { name: 'cli',           role: 'module', description: 'Click entry point — wires CSVReader → SummaryTable.', file: 'src/sample_project/cli.py',  line: 5  }
        ]
      },
      'directory-map': {
        kind:        'tree',
        coverage:    0.95,
        verdict:     'pass',
        tree: [
          'sample-project/',
          '├── README.md            ← project readme',
          '├── pyproject.toml       ← project + dep manifest',
          '├── src/',
          '│   └── sample_project/',
          '│       ├── __init__.py',
          '│       ├── cli.py       ← Click entry point',
          '│       ├── csv_reader.py',
          '│       ├── policy.py',
          '│       └── table.py',
          '└── tests/',
          '    └── test_cli.py'
        ].join('\n'),
        depth: 3,
        annotations: {
          'src/sample_project/cli.py': 'Click entry point — start here',
          'pyproject.toml':            'project + dependency manifest'
        }
      },
      'onboarding-flow': {
        kind:     'steps',
        coverage: 0.80,
        verdict:  'partial',
        steps: [
          { order: 1, action: 'Clone the repo and cd into it.',         outcome: 'You have a local copy on disk.',         command: 'git clone <repo> && cd sample-project' },
          { order: 2, action: 'Create a virtualenv and install deps.',  outcome: 'Python deps are isolated and importable.', command: 'python -m venv .venv && source .venv/bin/activate && pip install -e .' },
          { order: 3, action: 'Run the test suite once to confirm green.', outcome: 'Baseline: 4 tests pass.',           command: 'pytest -q' },
          { order: 4, action: 'Open src/sample_project/cli.py and read the top-of-file docstring.', outcome: 'You know what the CLI promises.' },
          { order: 5, action: 'Run the CLI on the bundled sample.csv.', outcome: 'You see a real summary table.',        command: 'sample-project data/sample.csv' }
        ]
      },
      'commands': {
        kind:     'commands',
        coverage: 0.90,
        verdict:  'pass',
        items: [
          { name: 'install',     command: 'pip install -e .',              description: 'Editable install — picks up local source.', source: 'pyproject.toml' },
          { name: 'test',        command: 'pytest -q',                      description: 'Run the test suite once, quiet output.',    source: 'pyproject.toml' },
          { name: 'run',         command: 'sample-project <csv>',           description: 'Run the CLI on a CSV file.',               source: 'src/sample_project/cli.py' },
          { name: 'lint',        command: 'ruff check src tests',           description: 'Lint the source + tests.',                 source: 'pyproject.toml' }
        ]
      },
      'faq': {
        kind:     'qa',
        coverage: 0.30,
        verdict:  'fail',
        todo:     { reason: 'no FAQ source material found' },
        items:    []
      },
      'further-reading': {
        kind:     'links',
        coverage: 0.55,
        verdict:  'partial',
        items: [
          { title: 'README.md',                              href: 'README.md',     description: 'Project readme — first stop for newcomers.',     kind: 'doc' },
          { title: 'pyproject.toml',                         href: 'pyproject.toml',description: 'Project + dependency manifest.',                 kind: 'config' },
          { title: 'src/sample_project/',                    href: 'src/sample_project/', description: 'Source root — three modules and an entry point.', kind: 'directory' }
        ]
      }
    }
  };

  var DATASET_TS = {
    meta: {
      title:       'Quickstart — web-monorepo',
      scope:       '/Users/me/projects/web-monorepo',
      scopeShort:  'web-monorepo',
      language:    'en',
      depth:       3,
      generatedAt: '2026-07-19T12:00:00+08:00',
      timestamp:   '2026-07-19',
      version:     1
    },
    labels: DEFAULT_LABELS,
    score: {
      composite: 65,
      grade:     'C',
      verdicts: {
        'overview':         'pass',
        'concepts':         'partial',
        'directory-map':    'pass',
        'onboarding-flow':  'partial',
        'commands':         'partial',
        'faq':              'fail',
        'further-reading':  'fail'
      }
    },
    sections: {
      'overview': {
        kind:     'overview',
        coverage: 0.90,
        verdict:  'pass',
        summary:  'web-monorepo is a TypeScript + Next.js monorepo with three workspaces (web, api, shared) managed by pnpm. It is bigger than the Python example but still small enough for a newcomer to walk through in a day.',
        stack:    { language: 'TypeScript 5.4', framework: 'Next.js 14 + Hono', runtime: 'Node 20' },
        scope:    { files: 142, directories: 28, lines: 9180, locLabel: '9.2k LOC' }
      },
      'concepts': {
        kind:     'concepts',
        coverage: 0.65,
        verdict:  'partial',
        items: [
          { name: 'apps/web',          role: 'workspace', description: 'Next.js app router — the public-facing site.', file: 'apps/web/app/page.tsx' },
          { name: 'apps/api',          role: 'workspace', description: 'Hono-based HTTP service — JSON endpoints.',   file: 'apps/api/src/index.ts' },
          { name: 'packages/shared',   role: 'workspace', description: 'Cross-cutting types + Zod schemas.',          file: 'packages/shared/src/index.ts' },
          { name: 'pnpm-workspace',    role: 'config',    description: 'pnpm workspace declaration (3 packages).',    file: 'pnpm-workspace.yaml' },
          { name: 'turbo.json',        role: 'config',    description: 'Turborepo task graph (build, dev, lint, test).', file: 'turbo.json' }
        ]
      },
      'directory-map': {
        kind:        'tree',
        coverage:    0.95,
        verdict:     'pass',
        tree: [
          'web-monorepo/',
          '├── README.md                  ← sparse, mostly pointer to /docs',
          '├── package.json               ← root scripts (turbo run *)',
          '├── pnpm-workspace.yaml        ← workspace declaration',
          '├── turbo.json                 ← turborepo task graph',
          '├── apps/',
          '│   ├── web/                   ← Next.js app router site',
          '│   │   ├── app/',
          '│   │   ├── components/',
          '│   │   └── lib/',
          '│   └── api/                   ← Hono HTTP service',
          '│       ├── src/',
          '│       └── test/',
          '├── packages/',
          '│   └── shared/                ← cross-cutting types + Zod schemas',
          '│       └── src/',
          '└── docs/                      ← ad-hoc design notes (no index)'
        ].join('\n'),
        depth: 3,
        annotations: {
          'apps/web':                  'Start here for UI work',
          'apps/api':                  'Start here for endpoint work',
          'packages/shared':           'Edit Zod schemas here when contracts change',
          'docs/':                     'No index file — browse ad-hoc'
        }
      },
      'onboarding-flow': {
        kind:     'steps',
        coverage: 0.60,
        verdict:  'partial',
        steps: [
          { order: 1, action: 'Install pnpm 9.x if you do not already have it.', outcome: 'pnpm is the only supported package manager.',   command: 'npm i -g pnpm@9' },
          { order: 2, action: 'Install all workspace dependencies.',              outcome: 'node_modules + lockfile resolve cleanly.',       command: 'pnpm install' },
          { order: 3, action: 'Run the workspace test suite once.',              outcome: 'Baseline: all tests pass.',                     command: 'pnpm -r test' },
          { order: 4, action: 'Start the dev server for both apps in parallel.',  outcome: 'web on :3000, api on :8787 — both hot-reload.', command: 'pnpm dev' },
          { order: 5, action: 'Open apps/web and trace one fetch from button to API route.', outcome: 'You see how web → api → shared actually connects.' },
          { order: 6, action: 'Skim turbo.json to learn the task graph.',         outcome: 'You know which tasks are cacheable + remote.',  file: 'turbo.json' }
        ]
      },
      'commands': {
        kind:     'commands',
        coverage: 0.70,
        verdict:  'partial',
        items: [
          { name: 'install', command: 'pnpm install',                    description: 'Install all workspace dependencies.',                source: 'package.json' },
          { name: 'dev',     command: 'pnpm dev',                        description: 'Start web + api in parallel with hot reload.',       source: 'package.json' },
          { name: 'build',   command: 'pnpm -r build',                   description: 'Build every workspace (uses Turborepo cache).',     source: 'turbo.json' },
          { name: 'test',    command: 'pnpm -r test',                    description: 'Run every workspace test suite.',                    source: 'package.json' },
          { name: 'lint',    command: 'pnpm -r lint',                    description: 'Lint every workspace.',                              source: 'package.json' }
        ]
      },
      'faq': {
        kind:     'qa',
        coverage: 0.20,
        verdict:  'fail',
        todo:     { reason: 'no FAQ source material found — README is sparse, no CONTRIBUTING, no docs/index.md' },
        items:    []
      },
      'further-reading': {
        kind:     'links',
        coverage: 0.30,
        verdict:  'fail',
        todo:     { reason: 'no further reading found — docs/ has no index, no ADRs, no runbook' },
        items:    []
      }
    }
  };

  var DATASET_GO = {
    meta: {
      title:       'Quickstart — billing-svc',
      scope:       '/Users/me/projects/billing-svc',
      scopeShort:  'billing-svc',
      language:    'en',
      depth:       3,
      generatedAt: '2026-07-19T12:00:00+08:00',
      timestamp:   '2026-07-19',
      version:     1
    },
    labels: DEFAULT_LABELS,
    score: {
      composite: 91,
      grade:     'A',
      verdicts: {
        'overview':         'pass',
        'concepts':         'pass',
        'directory-map':    'pass',
        'onboarding-flow':  'pass',
        'commands':         'pass',
        'faq':              'partial',
        'further-reading':  'pass'
      }
    },
    sections: {
      'overview': {
        kind:     'overview',
        coverage: 0.98,
        verdict:  'pass',
        summary:  'billing-svc is a Go HTTP service that owns the invoicing pipeline: it reads events from Kafka, persists invoice lines to Postgres, and exposes a small REST surface for the web app. It is well documented (README + ADRs + runbook) and is a good model of "boring, well-kept production Go".',
        stack:    { language: 'Go 1.22', framework: 'chi + sqlx', runtime: 'Linux container' },
        scope:    { files: 86, directories: 12, lines: 12460, locLabel: '12.5k LOC' }
      },
      'concepts': {
        kind:     'concepts',
        coverage: 0.95,
        verdict:  'pass',
        items: [
          { name: 'cmd/billing-svc',  role: 'entry',    description: 'main package — wire config, logger, signal handling.', file: 'cmd/billing-svc/main.go' },
          { name: 'internal/server',  role: 'package',  description: 'HTTP server: chi router, middleware, handlers.',         file: 'internal/server/server.go' },
          { name: 'internal/invoice', role: 'package',  description: 'Domain layer — invoice entity + service.',              file: 'internal/invoice/service.go' },
          { name: 'internal/store',   role: 'package',  description: 'Postgres persistence via sqlx.',                        file: 'internal/store/postgres.go' },
          { name: 'internal/kafka',   role: 'package',  description: 'Kafka consumer that ingests invoice events.',           file: 'internal/kafka/consumer.go' },
          { name: 'migrations/',      role: 'directory', description: 'SQL migrations (one file per up + down).',            file: 'migrations/0001_init.up.sql' }
        ]
      },
      'directory-map': {
        kind:        'tree',
        coverage:    0.95,
        verdict:     'pass',
        tree: [
          'billing-svc/',
          '├── README.md              ← service overview + how to run',
          '├── RUNBOOK.md             ← on-call procedures (PagerDuty links)',
          '├── go.mod',
          '├── cmd/',
          '│   └── billing-svc/',
          '│       └── main.go        ← entry point',
          '├── internal/',
          '│   ├── server/            ← HTTP layer (chi)',
          '│   ├── invoice/           ← domain layer',
          '│   ├── store/             ← Postgres persistence',
          '│   ├── kafka/             ← event consumer',
          '│   └── config/            ← env + flag parsing',
          '├── migrations/            ← one .up.sql / .down.sql per migration',
          '├── docs/adr/              ← numbered ADRs',
          '└── test/integration/      ← docker-compose-driven tests'
        ].join('\n'),
        depth: 3,
        annotations: {
          'cmd/billing-svc/main.go':  'Entry point — start here for the request flow',
          'internal/server/server.go': 'HTTP layer — handlers + middleware',
          'docs/adr/':                 'ADRs explain the "why" behind non-obvious choices',
          'RUNBOOK.md':                'On-call runbook — read before your first shift'
        }
      },
      'onboarding-flow': {
        kind:     'steps',
        coverage: 0.95,
        verdict:  'pass',
        steps: [
          { order: 1, action: 'Read README.md end to end.',                          outcome: 'You know the service contract, ports, and dependencies.',         file: 'README.md' },
          { order: 2, action: 'Read RUNBOOK.md before your first on-call shift.',   outcome: 'You know what to do when paged.',                                file: 'RUNBOOK.md' },
          { order: 3, action: 'Read at least the first two ADRs.',                  outcome: 'You know why we picked Postgres + Kafka + chi.',                 file: 'docs/adr/0001-record-storage.md' },
          { order: 4, action: 'Bring up Postgres + Kafka via the docker-compose helper.', outcome: 'You can run the service against a real local DB + broker.', command: 'docker compose -f test/integration/compose.yaml up -d' },
          { order: 5, action: 'Run the integration test suite to confirm green.',  outcome: 'Baseline: 32 integration tests pass.',                           command: 'go test ./test/integration/...' },
          { order: 6, action: 'Start the service against the local DB.',            outcome: 'Service is up on :8080 with seed data.',                        command: 'go run ./cmd/billing-svc' },
          { order: 7, action: 'curl /healthz and /readyz, then POST a sample event.', outcome: 'You see the full request → DB → response flow end to end.', command: 'curl -sf localhost:8080/healthz' },
          { order: 8, action: 'Read internal/server/server.go top to bottom.',      outcome: 'You know how routes + middleware are wired.',                    file: 'internal/server/server.go' }
        ]
      },
      'commands': {
        kind:     'commands',
        coverage: 0.95,
        verdict:  'pass',
        items: [
          { name: 'run',         command: 'go run ./cmd/billing-svc',                  description: 'Run the service against the local DB.',                  source: 'cmd/billing-svc/main.go' },
          { name: 'build',       command: 'go build -o ./bin/billing-svc ./cmd/billing-svc', description: 'Build a static binary into ./bin.',              source: 'Makefile' },
          { name: 'test',        command: 'go test ./...',                              description: 'Run the unit test suite.',                             source: 'Makefile' },
          { name: 'integ',       command: 'go test ./test/integration/...',             description: 'Run the integration suite (needs docker-compose).',   source: 'Makefile' },
          { name: 'lint',        command: 'golangci-lint run',                          description: 'Lint (uses the repo config).',                         source: '.golangci.yml' },
          { name: 'migrate-up',  command: 'migrate -path migrations -database $DATABASE_URL up', description: 'Apply SQL migrations.',                      source: 'Makefile' },
          { name: 'migrate-down',command: 'migrate -path migrations -database $DATABASE_URL down 1', description: 'Roll back one migration.',                source: 'Makefile' }
        ]
      },
      'faq': {
        kind:     'qa',
        coverage: 0.55,
        verdict:  'partial',
        items: [
          { question: 'Why chi and not net/http alone?', answer: 'chi gives us composable middleware (request ID, recovery, metrics) without dragging in a full framework. See ADR-0003.' },
          { question: 'Why Kafka and not NATS or RabbitMQ?', answer: 'We already run Kafka for the orders service — adopting it here keeps the platform story single-vendor. See ADR-0005.' },
          { question: 'How do I add a new endpoint?', answer: 'Add a handler in internal/server/handlers/, register it in internal/server/server.go, and add a route in routes.go. Tests live next to the handler.' }
        ]
      },
      'further-reading': {
        kind:     'links',
        coverage: 0.90,
        verdict:  'pass',
        items: [
          { title: 'README.md',            href: 'README.md',                 description: 'Service overview + how to run.',                                kind: 'doc' },
          { title: 'RUNBOOK.md',           href: 'RUNBOOK.md',                description: 'On-call runbook — read before your first shift.',              kind: 'doc' },
          { title: 'docs/adr/0001-record-storage.md', href: 'docs/adr/0001-record-storage.md', description: 'ADR: why we store invoice lines in Postgres.',      kind: 'adr' },
          { title: 'docs/adr/0003-http-router.md',    href: 'docs/adr/0003-http-router.md',    description: 'ADR: why chi over net/http + gin + echo.',          kind: 'adr' },
          { title: 'migrations/',          href: 'migrations/',               description: 'SQL schema history — one .up/.down file per migration.',       kind: 'directory' },
          { title: 'test/integration/',    href: 'test/integration/',         description: 'docker-compose-driven integration tests.',                     kind: 'directory' }
        ]
      }
    }
  };

  /* Dataset registry: order matters — the dataset switcher renders
     them top-to-bottom in this order. Adding a new fixture is as
     simple as registering a new `DATASET_X` above and adding it here. */
  var DATASETS = [
    { key: 'python', label: 'Python CLI',        data: DATASET_PYTHON },
    { key: 'ts',     label: 'TypeScript monorepo', data: DATASET_TS     },
    { key: 'go',     label: 'Go HTTP service',   data: DATASET_GO     }
  ];

  /* Backward compat: callers expecting `example` get the first dataset. */
  var EXAMPLE_DATA = DATASET_PYTHON;

  /* ═══════════════════════════════════════════════════════════════════
     HELPERS
     ─────────────────────────────────────────────────────────────────── */

  /** Em-dash for missing scalar values. */
  function na() { return '—'; }

  /**
   * Deep-merge defaults with the active data. Semantics:
   *   - Input (`b`) keys always win for present keys.
   *   - Defaults (`a`) fill in for keys that are absent in input,
   *     but ONLY when the default value is a scalar or array.
   *   - Object defaults are NOT auto-merged in when input is missing
   *     them. This matters for per-section shapes: a populated
   *     overview in the input should not inherit a default
   *     `todo: { reason: '...' }` object just because input omitted
   *     the `todo` key. The renderer also falls back to a TODO block
   *     when the section's content is missing, so the contract is
   *     robust to absent `todo` fields.
   */
  function mergeWithDefaults(input) {
    function isObject(x) { return x && typeof x === 'object' && !Array.isArray(x); }
    function merge(a, b) {
      if (!isObject(a) || !isObject(b)) return b === undefined ? a : b;
      var out = {};
      // Pass 1 — input keys win.
      Object.keys(b).forEach(function (k) {
        out[k] = (k in a) ? merge(a[k], b[k]) : b[k];
      });
      // Pass 2 — fill in missing scalar/array defaults only.
      Object.keys(a).forEach(function (k) {
        if (k in out) return;
        var av = a[k];
        if (isObject(av)) return; // skip object defaults; input didn't opt in
        out[k] = av;
      });
      return out;
    }
    return merge(DEFAULT_DATA, input || {});
  }

  /**
   * Compute the composite score, grade, and per-section verdicts from
   * the sections' coverage. Mirrors the SCORING block in SKILL.md.
   */
  function computeScore(sections) {
    var verdicts = {};
    var sum = 0;
    var n = 0;
    CANONICAL_SECTIONS.forEach(function (slug) {
      var sec = sections[slug] || {};
      var cov = typeof sec.coverage === 'number' ? sec.coverage : 0;
      var v = cov >= 0.90 ? 'pass' : (cov >= 0.50 ? 'partial' : 'fail');
      verdicts[slug] = v;
      sum += cov;
      n += 1;
    });
    var composite = n > 0 ? Math.round((sum / n) * 100) : 0;
    var grade = composite >= 90 ? 'A' : composite >= 75 ? 'B' : composite >= 60 ? 'C' : composite >= 40 ? 'D' : 'F';
    return { composite: composite, grade: grade, verdicts: verdicts };
  }

  /* ═══════════════════════════════════════════════════════════════════
     PUBLIC EXPORTS
     ─────────────────────────────────────────────────────────────────── */

  window.QUICKSTART_DATA_SCHEMA = {
    defaults:            DEFAULT_DATA,
    example:             EXAMPLE_DATA,
    datasets:            DATASETS,
    merge:               mergeWithDefaults,
    computeScore:        computeScore,
    canonicalSections:   CANONICAL_SECTIONS,
    sectionTitlesEn:     SECTION_TITLES_EN,
    na:                  na,
    version:             1
  };

  // Active data: window.QUICKSTART_DATA → first dataset (last writer
  // wins so a host page can override without editing this file).
  var active = mergeWithDefaults(window.QUICKSTART_DATA || DATASET_PYTHON);

  // Recompute the score from the active sections so a hand-edited data.js
  // does not drift from the per-section coverage. The /rui-report-quickstart
  // create command is free to overwrite the score block; this only fills
  // the gap if the host page forgot to.
  if (!window.QUICKSTART_DATA || !window.QUICKSTART_DATA.score) {
    active.score = computeScore(active.sections);
  }
  window.QUICKSTART_DATA = active;
})();
