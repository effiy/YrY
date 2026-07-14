# YAML Language Prompt Snippet

## Key Concepts

- **Indentation-Based Nesting**: Whitespace-sensitive structure (spaces only, no tabs) defining hierarchy
- **Anchors and Aliases**: `&anchor` defines a reusable block, `*anchor` references it to avoid duplication
- **Merge Keys**: `<<: *anchor` merges anchor contents into the current mapping
- **Multi-Line Strings**: Literal block (`|`) preserves newlines, folded block (`>`) joins lines
- **Document Separators**: `---` starts a new document, `...` ends one (multi-document streams)
- **Tags and Types**: `!!str`, `!!int`, `!!bool` for explicit typing; custom tags for application-specific types
- **Flow Style**: Inline JSON-like syntax `{key: value}` and `[item1, item2]` for compact notation
- **Environment Variable Substitution**: `${VAR}` patterns used in docker-compose and CI configs

## Notable File Patterns

- `docker-compose.yml` / `docker-compose.yaml` — Multi-container Docker application definition
- `.github/workflows/*.yml` — GitHub Actions CI/CD workflow definitions
- `.gitlab-ci.yml` — GitLab CI/CD pipeline configuration
- `kubernetes/*.yaml` / `k8s/*.yaml` — Kubernetes resource manifests
- `*.config.yaml` — Application configuration files
- `mkdocs.yml` — MkDocs documentation site configuration
- `serverless.yml` — Serverless Framework configuration

## Edge Detection Heuristics

**CI/CD workflow triggers** — `on: push` / `on: pull_request` / `on: schedule` in GitHub Actions → the workflow `triggers` on the referenced events. `workflow_run` and `workflow_call` create cross-workflow dependencies.

**CI/CD job dependencies** — `needs: [build, test]` in GitHub Actions or `needs: ["build-job"]` in GitLab CI → `depends_on` edges from the dependent job to each `needs` job. Jobs without `needs` run in parallel.

**CI/CD deployment targets** — `deploy: prod: { environment: production }` → `deploys` edges from the CI config to the deployment target. Environment protection rules and approval gates add governance metadata.

**K8s Service → Pod routing** — `spec.selector: { app: myapp }` in a Service → `serves` edges from the Service to matching Deployments/Pods. The selector defines the routing rule.

**K8s ConfigMap/Secret injection** — `envFrom: - configMapRef: { name: app-config }` → `configures` edges from the ConfigMap/Secret to the consuming Deployment/Pod. Changes to ConfigMaps don't auto-restart Pods (unless using reloader).

**K8s Ingress routing** — `spec.rules: - host: api.example.com http: paths: - backend: service: { name: api-svc, port: 80 }` → `routes` edges from the Ingress to each backend Service.

**Helm value propagation** — `values.yaml` → `{{ .Values.replicaCount }}` in templates → `configures` edges from values to each template that references them. `requirements.yaml`/`Chart.yaml` dependencies create `depends_on` between charts.

**Ansible playbook structure** — `roles: - common - webserver` → `depends_on` edges from the playbook to each role. `include_tasks`/`import_tasks` create sub-playbook dependencies.

## Summary Style

> "Docker Compose configuration defining N services with networking, volumes, and health checks."
> "GitHub Actions workflow running tests on push and deploying to production on merge to main."
> "Kubernetes deployment manifest with N replicas, resource limits, and liveness probes."
