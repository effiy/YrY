# Knowledge Graph Schema

This document defines the schema for `knowledge-graph.json` used by the codebase understanding system.

---

## Top-Level Structure

```json
{
  "project": { ... },
  "nodes": [ ... ],
  "edges": [ ... ],
  "layers": [ ... ],
  "tour": [ ... ]
}
```

### `project`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Project name |
| `description` | string | Project description |
| `languages` | string[] | Programming languages used |
| `frameworks` | string[] | Frameworks detected |
| `analyzedAt` | string (ISO 8601) | When the analysis was run |
| `gitCommitHash` | string | Git commit hash at time of analysis |

### `nodes[]`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (see ID conventions below) |
| `type` | string | yes | One of 13 node types |
| `name` | string | yes | Human-readable name |
| `filePath` | string | no | Source file path (relative to project root) |
| `summary` | string | no | Brief description of the node |
| `tags` | string[] | no | Categorization tags |
| `complexity` | number | no | Complexity score |
| `languageNotes` | string | no | Language-specific observations |

### `edges[]`

| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Source node ID |
| `target` | string | Target node ID |
| `type` | string | One of 26 edge types |
| `direction` | string | `"forward"` or `"bidirectional"` |
| `weight` | number | Edge weight (0.0–1.0) |

### `layers[]`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Layer identifier |
| `name` | string | Layer display name |
| `description` | string | Layer description |
| `nodeIds` | string[] | Node IDs belonging to this layer |

### `tour[]`

| Field | Type | Description |
|-------|------|-------------|
| `order` | number | Display order in the tour |
| `title` | string | Tour step title |
| `description` | string | Tour step description |
| `nodeIds` | string[] | Nodes highlighted in this step |

---

## Node Types (13 total)

| Type | Description | ID Convention |
|------|-------------|---------------|
| `file` | Source code file | `file:<relative-path>` |
| `function` | Function or method | `function:<relative-path>:<name>` |
| `class` | Class, interface, or type | `class:<relative-path>:<name>` |
| `module` | Logical module or package | `module:<name>` |
| `concept` | Abstract concept or pattern | `concept:<name>` |
| `config` | Configuration file | `config:<relative-path>` |
| `document` | Documentation file | `document:<relative-path>` |
| `service` | Deployable service definition | `service:<relative-path>` |
| `table` | Database table or migration | `table:<relative-path>:<table-name>` |
| `endpoint` | API endpoint or route definition | `endpoint:<relative-path>:<endpoint-name>` |
| `pipeline` | CI/CD pipeline configuration | `pipeline:<relative-path>` |
| `schema` | Schema definition | `schema:<relative-path>` |
| `resource` | Infrastructure resource | `resource:<relative-path>` |

---

## Edge Types (26 total)

### Structural (5)
| Type | Description |
|------|-------------|
| `imports` | File or module imports another |
| `exports` | Module exports a symbol |
| `contains` | Parent contains child (e.g., file contains function) |
| `inherits` | Class inherits from another |
| `implements` | Class implements an interface |

### Behavioral (4)
| Type | Description |
|------|-------------|
| `calls` | Function calls another |
| `subscribes` | Component subscribes to a message/event |
| `publishes` | Component publishes a message/event |
| `middleware` | Middleware intercepts a request chain |

### Data Flow (4)
| Type | Description |
|------|-------------|
| `reads_from` | Component reads from a data source |
| `writes_to` | Component writes to a data sink |
| `transforms` | Component transforms data from source to target |
| `validates` | Component validates data |

### Dependencies (3)
| Type | Description |
|------|-------------|
| `depends_on` | Component depends on another |
| `tested_by` | Component has a corresponding test |
| `configures` | Component configures another |

### Semantic (2)
| Type | Description |
|------|-------------|
| `related` | General semantic relationship |
| `similar_to` | Components serve similar purposes |

### Infrastructure (4)
| Type | Description |
|------|-------------|
| `deploys` | Configuration deploys a service |
| `serves` | Service serves an endpoint |
| `provisions` | Pipeline provisions a resource |
| `triggers` | Pipeline triggers a deployment |

### Schema/Data (4)
| Type | Description |
|------|-------------|
| `migrates` | Migration transforms a table schema |
| `documents` | Document describes a concept |
| `routes` | Route maps to an endpoint |
| `defines_schema` | Schema defines a data structure |

---

## ID Conventions

All node IDs must follow a consistent namespace pattern to enable reliable edge linking:

| Pattern | Example |
|---------|---------|
| `file:<path>` | `file:src/auth/login.ts` |
| `function:<path>:<name>` | `function:src/auth/login.ts:authenticateUser` |
| `class:<path>:<name>` | `class:src/models/user.ts:User` |
| `module:<name>` | `module:authentication` |
| `concept:<name>` | `concept:JWT-based-auth` |
| `config:<path>` | `config:docker-compose.yml` |
| `document:<path>` | `document:README.md` |
| `service:<path>` | `service:docker-compose.yml:api` |
| `table:<path>:<name>` | `table:migrations/001.sql:users` |
| `endpoint:<path>:<name>` | `endpoint:src/api/users.ts:GET /api/users` |
| `pipeline:<path>` | `pipeline:.github/workflows/ci.yml` |
| `schema:<path>` | `schema:src/types/user.ts` |
| `resource:<path>` | `resource:terraform/main.tf:aws_db_instance` |

---

## Example

```json
{
  "project": {
    "name": "my-api",
    "description": "A REST API for user management",
    "languages": ["typescript"],
    "frameworks": ["express"],
    "analyzedAt": "2026-07-12T10:00:00Z",
    "gitCommitHash": "abc123def"
  },
  "nodes": [
    {
      "id": "file:src/routes/users.ts",
      "type": "file",
      "name": "users.ts",
      "filePath": "src/routes/users.ts",
      "summary": "User CRUD route handlers",
      "tags": ["api", "users"],
      "complexity": 12
    },
    {
      "id": "endpoint:src/routes/users.ts:GET /api/users",
      "type": "endpoint",
      "name": "GET /api/users",
      "filePath": "src/routes/users.ts",
      "summary": "List all users with pagination",
      "tags": ["api", "users", "read"]
    }
  ],
  "edges": [
    {
      "source": "endpoint:src/routes/users.ts:GET /api/users",
      "target": "file:src/models/user.ts",
      "type": "imports",
      "direction": "forward",
      "weight": 1.0
    }
  ],
  "layers": [
    {
      "id": "api",
      "name": "API Layer",
      "description": "HTTP route handlers and middleware",
      "nodeIds": ["file:src/routes/users.ts", "file:src/middleware/auth.ts"]
    }
  ],
  "tour": [
    {
      "order": 1,
      "title": "Entry Point",
      "description": "The application starts at index.ts which sets up Express middleware and mounts route handlers.",
      "nodeIds": ["file:src/index.ts"]
    }
  ]
}
```

---

## Domain Graph Extension

In addition to structural code graphs, the schema supports **domain graphs** — high-level business-domain models that capture conceptual architecture independent of code structure. Domain graphs power `--full` mode analysis and cross-domain impact analysis.

### Domain Node Types (+3)

| Type | Description | ID Convention |
|------|-------------|---------------|
| `domain` | A bounded context or business domain | `domain:<name>` |
| `flow` | An end-to-end business process or data flow | `flow:<name>` |
| `step` | A single ordered step within a flow | `step:<flow-name>:<order>` |

### Domain Edge Types (+3)

| Type | Description |
|------|-------------|
| `contains_flow` | Domain contains a business flow |
| `flow_step` | Flow consists of an ordered step |
| `cross_domain` | Step or domain crosses into another domain |

### Domain Graph Example

```json
{
  "nodes": [
    {"id": "domain:order-management", "type": "domain", "name": "Order Management",
     "summary": "Full order lifecycle — creation, modification, cancellation, status tracking. Core revenue domain.",
     "tags": ["core-domain", "transactional", "event-sourced"]},
    {"id": "domain:payment-processing", "type": "domain", "name": "Payment Processing",
     "summary": "Payment authorization, capture, refund, reconciliation across Stripe and PayPal.",
     "tags": ["supporting-domain", "integration", "pci-scope"]},
    {"id": "domain:notification", "type": "domain", "name": "Notification",
     "summary": "Generic notification domain — email, SMS, push — triggered by events from other domains.",
     "tags": ["generic-domain", "event-consumer", "multi-channel"]},
    {"id": "flow:order-checkout", "type": "flow", "name": "Order Checkout Flow",
     "summary": "End-to-end checkout: cart validation → payment auth → order creation → inventory reserve → confirmation.",
     "tags": ["critical-path", "synchronous", "multi-domain"]},
    {"id": "step:order-checkout:1", "type": "step", "name": "Validate Cart",
     "summary": "Verify stock, prices, promotions. Return validated cart with totals.",
     "tags": ["validation", "synchronous"]},
    {"id": "step:order-checkout:2", "type": "step", "name": "Authorize Payment",
     "summary": "Call payment provider with idempotency-key gate.",
     "tags": ["payment", "external-call", "idempotent"]},
    {"id": "step:order-checkout:3", "type": "step", "name": "Create Order",
     "summary": "Persist order with PENDING status. Emit OrderCreated event to Kafka.",
     "tags": ["transactional", "event-publisher"]},
    {"id": "step:order-checkout:4", "type": "step", "name": "Reserve Inventory",
     "summary": "Decrement stock. On shortfall, trigger backorder workflow.",
     "tags": ["inventory", "compensating-transaction"]},
    {"id": "step:order-checkout:5", "type": "step", "name": "Send Confirmation",
     "summary": "Dispatch confirmation email via notification domain with order summary and ETA.",
     "tags": ["notification", "async", "fire-and-forget"]}
  ],
  "edges": [
    {"source": "domain:order-management", "target": "flow:order-checkout", "type": "contains_flow", "direction": "forward", "weight": 1.0},
    {"source": "flow:order-checkout", "target": "step:order-checkout:1", "type": "flow_step", "direction": "forward", "weight": 1.0},
    {"source": "flow:order-checkout", "target": "step:order-checkout:2", "type": "flow_step", "direction": "forward", "weight": 1.0},
    {"source": "flow:order-checkout", "target": "step:order-checkout:3", "type": "flow_step", "direction": "forward", "weight": 1.0},
    {"source": "flow:order-checkout", "target": "step:order-checkout:4", "type": "flow_step", "direction": "forward", "weight": 1.0},
    {"source": "flow:order-checkout", "target": "step:order-checkout:5", "type": "flow_step", "direction": "forward", "weight": 1.0},
    {"source": "step:order-checkout:2", "target": "domain:payment-processing", "type": "cross_domain", "direction": "forward", "weight": 0.9},
    {"source": "step:order-checkout:5", "target": "domain:notification", "type": "cross_domain", "direction": "forward", "weight": 0.8},
    {"source": "domain:order-management", "target": "domain:payment-processing", "type": "cross_domain", "direction": "forward", "weight": 0.7},
    {"source": "domain:order-management", "target": "domain:notification", "type": "cross_domain", "direction": "forward", "weight": 0.5}
  ]
}
```

### Domain Graph Validation Rules

| # | Rule | Severity |
|---|------|----------|
| 1 | Every `flow` node must have ≥ 1 `contains_flow` edge from a `domain` node | Critical |
| 2 | Every `step` node must have ≥ 1 `flow_step` edge from a `flow` node | Critical |
| 3 | `cross_domain` edges must connect different domains (source ≠ target) | Critical |
| 4 | `cross_domain` edges should only originate from `step` or `domain` nodes | Warning |
| 5 | Domain graphs MAY have empty `layers` — layers are optional for domain models | Info |
| 6 | Domain graphs MAY have empty `tour` — tours generated separately per domain | Info |
| 7 | Step `order` is encoded in the ID (`step:<flow>:<order>`), not a separate field | Convention |
| 8 | `flow_step` edges carry implicit ordering — steps sequenced by their ID order numbers | Convention |
