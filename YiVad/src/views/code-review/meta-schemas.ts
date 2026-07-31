/**
 * Per-topic meta column + form field definitions for code-review topics.
 *
 * Each topic gets domain-specific table columns (rendered from row.meta) and
 * structured form fields in the detail page.
 */
import type { MetaColumn } from "@/components/TopicListPage/index.vue";
import type { MetaField } from "@/components/TopicDetailPage/index.vue";

export interface TopicMetaSchema {
  metaColumns: MetaColumn[];
  metaFields: MetaField[];
  /** YiKnowledge-relative path for pre-fill content (optional). */
  templateContent?: string;
}

// ── Shared options ──────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = [
  { label: "Blocker", value: "blocker" },
  { label: "Major", value: "major" },
  { label: "Minor", value: "minor" },
  { label: "Nit", value: "nit" }
];

const RISK_OPTIONS = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

const EFFORT_OPTIONS = [
  { label: "S — hours", value: "s" },
  { label: "M — 1-2 days", value: "m" },
  { label: "L — 3-5 days", value: "l" },
  { label: "XL — weeks", value: "xl" }
];

const IMPACT_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

// ── Tag type helpers ────────────────────────────────────────────────────────

function severityTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { blocker: "danger", major: "warning", minor: "info", nit: "" };
  return (m[v] || "") as any;
}

function riskTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { critical: "danger", high: "warning", medium: "info", low: "" };
  return (m[v] || "") as any;
}

// ── Code-review topic schemas ───────────────────────────────────────────────

export const crMetaSchemas: Record<string, TopicMetaSchema> = {
  summary: {
    metaColumns: [
      { key: "file_path", label: "File Path", minWidth: 200 },
      { key: "language", label: "Language", width: 100 }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/components/Foo.vue" },
      { key: "language", label: "Language", type: "input", placeholder: "e.g. TypeScript, Python, Go" }
    ]
  },

  explain: {
    metaColumns: [
      { key: "file_path", label: "File Path", minWidth: 200 },
      { key: "language", label: "Language", width: 100 },
      {
        key: "complexity",
        label: "Complexity",
        width: 110,
        enum: [
          { label: "Simple", value: "simple" },
          { label: "Medium", value: "medium" },
          { label: "Complex", value: "complex" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/components/Foo.vue" },
      { key: "language", label: "Language", type: "input", placeholder: "e.g. TypeScript" },
      {
        key: "complexity",
        label: "Complexity",
        type: "select",
        options: [
          { label: "Simple — straightforward linear logic", value: "simple" },
          { label: "Medium — a few branching paths", value: "medium" },
          { label: "Complex — deeply nested, async, or stateful", value: "complex" }
        ]
      }
    ]
  },

  security: {
    metaColumns: [
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "severity",
        label: "Severity",
        width: 100,
        enum: SEVERITY_OPTIONS,
        tagTypeFn: severityTag
      },
      {
        key: "vuln_type",
        label: "Vulnerability",
        width: 130,
        enum: [
          { label: "Injection", value: "injection" },
          { label: "Auth / Access", value: "auth" },
          { label: "XSS", value: "xss" },
          { label: "CSRF", value: "csrf" },
          { label: "Secret Leak", value: "secret_leak" },
          { label: "Deserialization", value: "deserialization" },
          { label: "SSRF", value: "ssrf" },
          { label: "Other", value: "other" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/api/users.py" },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: SEVERITY_OPTIONS,
        required: true
      },
      {
        key: "vuln_type",
        label: "Vulnerability Type",
        type: "select",
        options: [
          { label: "Injection (SQL/OS/CMD)", value: "injection" },
          { label: "Auth / Access Control", value: "auth" },
          { label: "XSS", value: "xss" },
          { label: "CSRF", value: "csrf" },
          { label: "Secret / Key Leak", value: "secret_leak" },
          { label: "Unsafe Deserialization", value: "deserialization" },
          { label: "SSRF", value: "ssrf" },
          { label: "Other", value: "other" }
        ],
        required: true
      },
      { key: "cwe_id", label: "CWE ID", type: "input", placeholder: "e.g. CWE-89" }
    ]
  },

  "dependency-risk": {
    metaColumns: [
      { key: "package_name", label: "Package", minWidth: 170 },
      { key: "current_ver", label: "Current", width: 100 },
      { key: "latest_ver", label: "Latest", width: 100 },
      {
        key: "risk_level",
        label: "Risk",
        width: 100,
        enum: RISK_OPTIONS,
        tagTypeFn: riskTag
      }
    ],
    metaFields: [
      { key: "package_name", label: "Package", type: "input", placeholder: "e.g. axios, lodash", required: true },
      { key: "current_ver", label: "Current Version", type: "input", placeholder: "e.g. 1.7.2" },
      { key: "latest_ver", label: "Latest Version", type: "input", placeholder: "e.g. 2.1.0" },
      {
        key: "risk_level",
        label: "Risk Level",
        type: "select",
        options: RISK_OPTIONS,
        required: true
      }
    ]
  },

  "access-review": {
    metaColumns: [
      { key: "code_path", label: "Code Path", minWidth: 200 },
      {
        key: "risk_level",
        label: "Risk",
        width: 100,
        enum: RISK_OPTIONS,
        tagTypeFn: riskTag
      }
    ],
    metaFields: [
      { key: "code_path", label: "Code Path", type: "input", placeholder: "e.g. POST /api/admin/users", required: true },
      { key: "privilege_boundary", label: "Privilege Boundary", type: "input", placeholder: "e.g. user → admin" },
      { key: "caller_roles", label: "Caller Roles", type: "input", placeholder: "e.g. admin, auditor" },
      { key: "data_accessed", label: "Data Accessed", type: "input", placeholder: "e.g. PII, payment" },
      {
        key: "risk_level",
        label: "Risk Level",
        type: "select",
        options: RISK_OPTIONS,
        required: true
      }
    ]
  },

  refactor: {
    metaColumns: [
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "effort",
        label: "Effort",
        width: 80,
        enum: EFFORT_OPTIONS
      },
      {
        key: "impact",
        label: "Impact",
        width: 100,
        enum: IMPACT_OPTIONS
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/utils/helpers.ts", required: true },
      {
        key: "effort",
        label: "Effort",
        type: "select",
        options: EFFORT_OPTIONS
      },
      {
        key: "impact",
        label: "Expected Impact",
        type: "select",
        options: IMPACT_OPTIONS
      }
    ]
  },

  perf: {
    metaColumns: [
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "bottleneck_type",
        label: "Bottleneck",
        width: 120,
        enum: [
          { label: "CPU", value: "cpu" },
          { label: "Memory", value: "memory" },
          { label: "I/O", value: "io" },
          { label: "Network", value: "network" },
          { label: "DB Query", value: "db" },
          { label: "Lock Contention", value: "locking" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/api/search.py", required: true },
      {
        key: "bottleneck_type",
        label: "Bottleneck Type",
        type: "select",
        options: [
          { label: "CPU-bound", value: "cpu" },
          { label: "Memory / Allocation", value: "memory" },
          { label: "Disk I/O", value: "io" },
          { label: "Network I/O", value: "network" },
          { label: "Database / N+1 Query", value: "db" },
          { label: "Lock / Mutex Contention", value: "locking" }
        ],
        required: true
      },
      { key: "current_metric", label: "Current Metric", type: "input", placeholder: "e.g. p99 = 420ms" },
      { key: "target_metric", label: "Target Metric", type: "input", placeholder: "e.g. p99 < 100ms" }
    ]
  },

  tests: {
    metaColumns: [
      { key: "target_func", label: "Target Function", minWidth: 200 },
      {
        key: "test_type",
        label: "Test Type",
        width: 120,
        enum: [
          { label: "Unit", value: "unit" },
          { label: "Integration", value: "integration" },
          { label: "E2E", value: "e2e" },
          { label: "Snapshot", value: "snapshot" }
        ]
      }
    ],
    metaFields: [
      { key: "target_func", label: "Target Function", type: "input", placeholder: "e.g. parseMarkdownBody()", required: true },
      {
        key: "test_type",
        label: "Test Type",
        type: "select",
        options: [
          { label: "Unit", value: "unit" },
          { label: "Integration", value: "integration" },
          { label: "E2E / System", value: "e2e" },
          { label: "Snapshot", value: "snapshot" }
        ],
        required: true
      }
    ]
  },

  style: {
    metaColumns: [
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "issue_type",
        label: "Issue",
        width: 130,
        enum: [
          { label: "Naming", value: "naming" },
          { label: "Comments", value: "comments" },
          { label: "Structure", value: "structure" },
          { label: "Consistency", value: "consistency" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/hooks/useTable.ts", required: true },
      {
        key: "issue_type",
        label: "Issue Type",
        type: "select",
        options: [
          { label: "Naming", value: "naming" },
          { label: "Missing / Stale Comments", value: "comments" },
          { label: "Code Structure / Organisation", value: "structure" },
          { label: "Style Consistency", value: "consistency" }
        ]
      }
    ]
  },

  "api-contract": {
    metaColumns: [
      { key: "endpoint", label: "Endpoint", minWidth: 200 },
      { key: "method", label: "Method", width: 90 },
      {
        key: "contract_status",
        label: "Status",
        width: 110,
        enum: [
          { label: "Compliant", value: "compliant" },
          { label: "Breaking", value: "breaking" },
          { label: "Drift", value: "drift" }
        ]
      }
    ],
    metaFields: [
      { key: "endpoint", label: "Endpoint", type: "input", placeholder: "e.g. /api/v1/users", required: true },
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" }
        ],
        required: true
      },
      {
        key: "contract_status",
        label: "Contract Status",
        type: "select",
        options: [
          { label: "Compliant — matches spec", value: "compliant" },
          { label: "Breaking — backwards-incompatible", value: "breaking" },
          { label: "Drift — spec not updated", value: "drift" }
        ],
        required: true
      }
    ]
  },

  "observability-gap": {
    metaColumns: [
      { key: "file_path", label: "File / Component", minWidth: 200 },
      {
        key: "gap_type",
        label: "Gap",
        width: 110,
        enum: [
          { label: "Logs", value: "logs" },
          { label: "Metrics", value: "metrics" },
          { label: "Traces", value: "traces" },
          { label: "Alerts", value: "alerts" },
          { label: "Dashboard", value: "dashboard" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File / Component", type: "input", placeholder: "e.g. src/services/payment.ts", required: true },
      {
        key: "gap_type",
        label: "Gap Type",
        type: "select",
        options: [
          { label: "Logs — missing key log events", value: "logs" },
          { label: "Metrics — no counters/gauges/histograms", value: "metrics" },
          { label: "Traces — no span instrumentation", value: "traces" },
          { label: "Alerts — no alert on failure path", value: "alerts" },
          { label: "Dashboard — no visibility", value: "dashboard" }
        ],
        required: true
      }
    ]
  }
};
