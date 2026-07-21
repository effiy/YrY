# English Output Guidelines

This file provides language-specific guidance for generating architecture diagram content in English.

## Tag Conventions

Use lowercase, hyphenated tags in English:

| Pattern | Recommended Tags |
|---------|-----------------|
| Entry point file | `entry-point`, `barrel`, `exports` |
| Utility functions | `utility`, `helpers`, `common` |
| API handlers | `api-handler`, `controller`, `endpoint` |
| Data models | `data-model`, `entity`, `schema` |
| Test files | `test`, `spec`, `unit-test` |
| Configuration | `configuration`, `build-system`, `settings` |
| Infrastructure | `infrastructure`, `deployment`, `containerization` |
| Documentation | `documentation`, `guide`, `reference` |

## Summary Style

Write 1-2 sentence summaries that:
- Describe **purpose** and **role** in the project
- Use active voice ("Provides...", "Handles...", "Manages...")
- Avoid restating the filename

**Examples:**
- Good: "Provides date formatting and string sanitization helpers used across the API layer."
- Bad: "The utils file contains utility functions."

## Technical Terms

Keep these terms in English (no translation needed):
- `middleware`, `hook`, `barrel`, `entry-point`
- `ORM`, `REST API`, `CI/CD`, `CRUD`
- `singleton`, `factory`, `observer`
- `middleware`, `interceptor`, `guard`

## Layer Names

Use standard English layer names:
- `API Layer`, `Service Layer`, `Data Layer`, `UI Layer`
- `Infrastructure`, `Configuration`, `Documentation`
- `Utility Layer`, `Middleware Layer`, `Test Layer`

## Diagram Content Style

### Header & Titles
- Use **descriptive, specific titles**: prefer "Microservices Platform — Cloud-Native Architecture" over "System Architecture"
- Subtitles should be one sentence summarizing the system's scope, stack, and deployment
- Include platform/cloud provider when relevant (AWS, GCP, Azure)

### Component Labels
- **Primary label**: concise name (2-4 words), Title Case, 11-12px bold
- **Secondary label**: technology or port info, 9px, e.g. "Go :8080", "FastAPI :8000"
- **Bullet details**: 8px, `•` prefix, one capability per line
- **Footer annotation**: 7px in the stroke color, e.g. "Multi-AZ", "OAI Protected"

### Arrow Labels
- **Protocol**: REST, gRPC, GraphQL, WSS, SMTP
- **Auth**: JWT, OAuth2, OIDC, PKCE, mTLS, TLS
- **Direction**: R/W (read/write), publish, consume, deploy, push, provision
- **Format**: short acronyms, 8-9px, placed adjacent to the arrow line

### Summary Cards
- Each card addresses one dimension: Architecture, Data Flow, Infrastructure/Ops
- Use full sentences with technical precision
- 3-5 items per card; each item 1-2 lines
- Include specific technologies, protocols, and configurations

### Footer
- Format: `<Project Name> • <Region/Platform> • <Primary Stack> • <Date>`
- Date format: YYYY-MM-DD (ISO 8601 date only, no time needed)

## Tone

- Professional and precise
- Technical but accessible to senior engineers
- Avoid marketing language or superlatives
- Prefer specific metrics and configurations over vague descriptions
