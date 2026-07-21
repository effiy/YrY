# Dockerfile Language Prompt Snippet

## Key Concepts

- **Multi-Stage Builds**: Multiple `FROM` statements to separate build and runtime stages, reducing image size
- **Layer Caching**: Each instruction creates a layer; order instructions from least to most frequently changing for cache efficiency
- **Base Images**: `FROM image:tag` selects the starting image; prefer slim/alpine variants for smaller images
- **COPY vs ADD**: `COPY` for local files (preferred), `ADD` for URLs and tar extraction
- **Build Arguments**: `ARG` for build-time variables, `ENV` for runtime environment variables
- **Health Checks**: `HEALTHCHECK` instruction for container orchestrator readiness probes
- **Entry Point vs CMD**: `ENTRYPOINT` sets the executable, `CMD` provides default arguments
- **User Permissions**: `USER` instruction to run as non-root for security
- **Ignore Patterns**: `.dockerignore` excludes files from the build context (like `.gitignore`)

## Notable File Patterns

- `Dockerfile` — Primary container image definition (at project root)
- `Dockerfile.dev` / `Dockerfile.prod` — Environment-specific Dockerfiles
- `docker-compose.yml` — Multi-container application orchestration
- `docker-compose.override.yml` — Local development overrides
- `.dockerignore` — Build context exclusion patterns

## Edge Detection Heuristics

**Build stage chain** — Multi-stage builds with `FROM build AS builder` + `FROM alpine` + `COPY --from=builder` → each stage produces artifacts consumed by later stages. Create `depends_on` edges from the runtime stage to each build stage it copies from.

**Package manifest dependency** — `COPY package.json package-lock.json ./` before `RUN npm ci` → the Dockerfile `depends_on` the package manifest. Without the manifest, the build fails at the install step.

**Entry point resolution** — `ENTRYPOINT ["node", "dist/server.js"]` or `CMD ["python", "-m", "app"]` → the Dockerfile `deploys` the referenced application entry point file. The CMD/ENTRYPOINT tells you what binary/script actually runs.

**Health check targeting** — `HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health` → creates a health monitoring dependency on the application's health endpoint. The orchestrator kills containers failing this check.

**Compose service dependencies** — `depends_on: - postgres - redis` in docker-compose → `depends_on` edges from the service to each dependency. `depends_on` with `condition: service_healthy` creates stronger coupling than the default start-order-only.

**Volume/bind mount coupling** — `volumes: - ./src:/app/src` in docker-compose → the container `depends_on` the host directory. Bind mounts are common in development; named volumes in production.

**Network isolation** — `networks: - frontend - backend` in docker-compose → services on different networks have different reachability. Services sharing a network have implicit `related` edges.

## Summary Style

> "Multi-stage Docker build producing a minimal Node.js production image with N build stages."
> "Docker Compose configuration orchestrating N services with shared networking and persistent volumes."
> "Development Dockerfile with hot-reload support and mounted source volumes."
