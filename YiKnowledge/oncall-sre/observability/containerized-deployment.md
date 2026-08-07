---
title: Containerized deployment strategies
aliases:
- containerized-deployment
- docker-deployment
- container-deployment-strategies
- multi-stage-builds
tags:
- deployment
- docker
- container
- kubernetes
- devops
category: oncall-sre/observability
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- oncall-sre
- engineer
- tech-lead
benefit: "teams can deploy containerized applications reliably with optimized images, secure builds, and production-ready practices"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./docker-kubernetes.md
- ./cicd.md
- ./reverse-proxy.md
- ../../engineer/infrastructure/blue-green-deployment.md
- ../../engineer/infrastructure/canary-deployment.md
tacit: false
---

# Containerized deployment strategies

> **As an** oncall SRE, **I want to** deploy containerized applications with optimized, secure images and reliable rollout strategies, **so that** deployments are fast, reversible, and production-safe.

> Containerized deployment is not just about writing a Dockerfile. It requires image optimization, security scanning, deployment strategy selection, and runtime configuration. A poorly optimized image wastes bandwidth, slows deployments, and increases the attack surface.

## Summary

- Multi-stage builds separate build-time dependencies from runtime artifacts, producing minimal images.
- Image optimization targets: size (faster pull, less storage), layer count (fewer layers = faster builds), and security (fewer packages = smaller attack surface).
- Deployment strategies (rolling update, blue-green, canary) each have different risk profiles, rollback speeds, and infrastructure requirements.
- Image security scanning must cover: base image vulnerabilities, application dependencies, and misconfigurations (running as root, exposed secrets).
- Runtime configuration (resource limits, probes, security contexts) is as important as the image itself.

## Core viewpoints

### 1. Multi-stage builds are not optional for production

A single-stage Dockerfile includes build tools, dev dependencies, and source code in the final image. Multi-stage builds use one stage to compile/build and a second stage to copy only the runtime artifacts. This reduces image size by 50-90% and eliminates build tools from the attack surface. Every production Dockerfile should use multi-stage builds.

### 2. Image size directly impacts deployment reliability

Large images (> 1 GB) take longer to pull, increasing pod startup time and slowing rollouts. In a node failure scenario, pods compete for image pull bandwidth, extending recovery time. Target: application images < 200 MB. Use distroless or Alpine base images, remove package manager caches, and exclude development files through `.dockerignore`.

### 3. Deployment strategy selection is a risk decision

Rolling updates are the simplest but offer no pre-release validation. Blue-green deployments provide instant rollback but require double the infrastructure. Canary deployments provide gradual validation but require sophisticated traffic splitting and metric analysis. Choose based on failure cost: low-risk internal tools use rolling updates; customer-facing services with high failure cost use canary; critical infrastructure uses blue-green.

### 4. Security scanning is not a one-time gate

Image vulnerabilities are discovered continuously. A scan at build time is a snapshot. Vulnerability scanning must be continuous: at build time (block critical CVEs), at registry admission (block new critical CVEs in existing images), and at runtime (alert on newly discovered CVEs in running containers). Use Trivy, Grype, or Snyk for scanning.

## Key info

### Multi-stage build pattern

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Image optimization checklist

| Optimization | Impact | Effort |
|---|---|---|
| Multi-stage build | 50-90% size reduction | Low |
| Alpine/Distroless base | 100-500 MB savings | Low |
| .dockerignore file | Excludes node_modules, .git, build artifacts | Low |
| Layer ordering (least changing first) | Faster incremental builds | Low |
| Combine RUN commands | Fewer layers, smaller size | Low |
| Remove package manager cache | 50-200 MB savings | Low |
| Use specific base image tags (not `latest`) | Reproducible builds | Low |

### Deployment strategy comparison

| Strategy | Rollback speed | Infrastructure cost | Risk profile | Traffic splitting | Best for |
|---|---|---|---|---|---|
| Rolling update | Slow (roll back one by one) | 1x | Medium | None | Internal tools, low-risk services |
| Blue-green | Instant (switch traffic) | 2x | Low | None | Critical infrastructure, databases |
| Canary | Fast (shift traffic back) | 1.1x | Low | Gradual (5% -> 25% -> 100%) | Customer-facing services |
| Recreate | Slow (downtime) | 1x | High | None | Batch jobs, stateful sets |

### Runtime security context

- **Do not run as root**: Set `USER` in Dockerfile to a non-root user. Kubernetes: `securityContext.runAsNonRoot: true`.
- **Read-only root filesystem**: Set `readOnlyRootFilesystem: true` in Kubernetes security context. Use `emptyDir` or `volumes` for writable paths.
- **Drop all capabilities**: Set `capabilities.drop: ["ALL"]` and add only required capabilities.
- **Seccomp/AppArmor profiles**: Restrict system calls to the minimum required.
- **Resource limits**: Always set `resources.requests` and `resources.limits`. Without limits, a container can consume all node resources.

## Action recommendations

1. Adopt multi-stage builds for all production Dockerfiles; the build stage should be as complete as needed, the runtime stage as minimal as possible.
2. Use `.dockerignore` to exclude `node_modules`, `.git`, `.env`, and build artifacts from the build context.
3. Set a maximum image size policy: 200 MB for applications, 500 MB for ML model serving. Block images exceeding the limit.
4. Implement continuous vulnerability scanning with Trivy or Grype in CI and at registry admission.
5. Choose deployment strategy based on failure cost: canary for customer-facing, rolling update for internal tools, blue-green for critical infrastructure.
6. Configure resource requests and limits for every container; use Vertical Pod Autoscaler (VPA) to right-size over time.
7. Enforce non-root user, read-only root filesystem, and capability dropping in Kubernetes Pod Security Standards (restricted).

## Anti-patterns

- **Using `latest` tag** -- no reproducibility; you never know which version is running. Use semantic versioning or commit SHA tags.
- **Running as root** -- a container escape vulnerability gives the attacker root on the host. Always use a non-root user.
- **No resource limits** -- a memory leak in one container can OOM-kill all containers on the node. Always set limits.
- **Copying everything into the image** -- `.git`, `node_modules`, `.env` files bloat the image and may leak secrets. Use `.dockerignore`.
- **Single-stage build** -- includes build tools and dev dependencies in production. Use multi-stage builds.
- **No health probes** -- Kubernetes cannot detect when the application is stuck. Define liveness, readiness, and startup probes.
- **Image scanning only at build time** -- new CVEs are discovered daily. Scan continuously at runtime too.

## Related

- Same category: [./docker-kubernetes.md](./docker-kubernetes.md) -- Docker and Kubernetes observability
- Same category: [./cicd.md](./cicd.md) -- CI/CD pipeline design
- Same category: [./reverse-proxy.md](./reverse-proxy.md) -- reverse proxy patterns
- Upstream: [../../engineer/infrastructure/blue-green-deployment.md](../../engineer/infrastructure/blue-green-deployment.md) -- blue-green deployment
- Upstream: [../../engineer/infrastructure/canary-deployment.md](../../engineer/infrastructure/canary-deployment.md) -- canary deployment

## References

- Docker -- Dockerfile best practices and multi-stage builds documentation
- Kubernetes -- Pod Security Standards and security context documentation
- Google -- Distroless base images
- Anchore -- Trivy vulnerability scanner