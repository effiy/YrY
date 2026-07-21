# API Reference

> The daily.dev REST API — endpoint catalog, auth, rate limits,
> error handling, and ready-to-use agent workflows.

## Authentication

```
Authorization: Bearer $DAILY_DEV_TOKEN
```

Resolve the token first — see
[references/token-storage.md](./token-storage.md).

## Base URL

```
https://api.daily.dev/public/v1
```

## OpenAPI spec

The full spec is live and self-describing:

```
https://api.daily.dev/public/v1/docs/json
```

Pull a specific endpoint schema:

```bash
curl -s https://api.daily.dev/public/v1/docs/json \
    | jq '.paths["/feeds/foryou"].get'
```

Pull a specific component schema (replace `def-17` with the `$ref`
tail):

```bash
curl -s https://api.daily.dev/public/v1/docs/json \
    | jq '.components.schemas["def-17"]'
```

**Always refresh the endpoint catalog from the spec before calling
an unfamiliar endpoint** — daily.dev ships breaking changes without
warning, and the spec is the source of truth.

## Rate limits

- **60 requests per minute** per user
- Check response headers:
  - `X-RateLimit-Limit` — maximum requests in the window
  - `X-RateLimit-Remaining` — requests left in the current window
  - `X-RateLimit-Reset` — Unix timestamp when the window resets
  - `Retry-After` — seconds to wait (only set on 429)
- On 429, sleep `Retry-After` seconds and retry once. If it
  persists, surface to the user.

## Errors

| Code | Meaning | Recovery |
|------|---------|----------|
| 401  | Token invalid or missing | Re-resolve token; point user to https://app.daily.dev/settings/api |
| 403  | Plus subscription required | Point user to https://app.daily.dev/plus |
| 404  | Resource not found | Verify the id/path; some endpoints require a numeric id |
| 429  | Rate-limit exceeded | Sleep `Retry-After` seconds; retry once |

**Error response shape:**

```json
{
  "error": "error_code",
  "message": "Human readable message"
}
```

## Agent use cases

These are the patterns agents reach for most. Use the API surface
that matches the user's intent, not the other way around.

### 🔍 GitHub Repo → Personalized Feed

Detect the user's stack from `package.json`, `go.mod`, `Cargo.toml`,
`requirements.txt`, etc. Then:

1. `GET /tags` — list all available tags for deterministic matching
2. `POST /feeds/filters/tags/follow` — follow matching tags
3. `POST /feeds/custom/` — create a feed tuned to the stack
4. Surface trending articles about the user's actual dependencies

**Trigger:** "Set up daily.dev based on my GitHub projects"

### 🛠️ GitHub → Auto-fill Stack Profile

Build the user's daily.dev profile from their code:

1. Scan repos for languages, frameworks, tools actually used
2. `GET /profile/stack/search` to find matching tech on daily.dev
3. `POST /profile/stack/` to populate by section (languages,
   frameworks, tools)
4. `PATCH /profile/` bio based on primary tech and contributions

**Trigger:** "Build my daily.dev profile from my GitHub"

### 🚀 New Project → Curated Onboarding

When a user initializes a new project or clones a repo:

1. Analyze tech choices from config files
2. Create a custom feed via `POST /feeds/custom/` filtered to those
   technologies
3. Build a "Getting Started" bookmark list with foundational
   articles
4. Block irrelevant tags to keep the feed focused

**Trigger:** "Help me learn the stack for this project"

### 📊 Weekly Digest → Synthesized Briefing

1. `GET /feeds/foryou` and `GET /feeds/popular` filtered by
   followed tags
2. Cross-reference with recent GitHub activity to prioritize
3. Summarize key articles and trending discussions
4. Deliver as a structured briefing with links

**Trigger:** Scheduled, or "Give me my weekly dev news"

### 📚 Research Project Workspace

Deep-dive on a topic (e.g., "I want to learn Kubernetes"):

1. `POST /feeds/custom/` filtered to the topic
2. `POST /bookmarks/lists` to set up a matching bookmark list
3. As the user reads, `POST /bookmarks/` to save articles to the
   list
4. Track progress: bookmarked posts vs. new feed items
5. Adjust filters over time (beginner → advanced)

**Trigger:** "Start a research project on [topic]"

### 🧠 Agent Self-Improvement Feed

Overcome the agent's own knowledge cutoff:

1. `POST /feeds/custom/` for tech the agent frequently helps with
2. Periodically `GET /feeds/custom/{feedId}` to ingest recent
   articles
3. `GET /posts/{id}` to read full summaries
4. Provide advice with current info:
   "As of this week, the recommended approach is..."
5. Adjust feed filters based on what users are asking about

**Trigger:** Agent background process, or
"What's new in [technology] since your training?"

### 🔀 Multi-Source Synthesis

Balanced perspectives across publishers:

1. `GET /search/posts` for a topic → coverage from multiple sources
2. `GET /search/sources` → authoritative publishers
3. `GET /feeds/source/{source}` → posts from each publisher
4. Synthesize diverse viewpoints with citations
5. Surface where sources agree vs. disagree

**Trigger:** "What are the different perspectives on [topic]?"
or "Compare approaches to [problem]"

### 📈 Trending Radar

Stay ahead of community signals:

1. `GET /feeds/popular` → what's gaining traction
2. Cross-reference with followed tags → relevant trends
3. `GET /feeds/discussed` → active debate
4. Alert when technologies in the user's stack are trending
5. `GET /tags` for the full catalog, `GET /search/tags` to explore
   adjacent trending topics

**Trigger:** "What should I be paying attention to?"
or "What's trending in [area]?"

## Endpoint catalog

The catalog below is regenerated from the live OpenAPI spec. If a
call fails, fetch the spec again — the endpoint may have moved.

To regenerate this section, run:

```bash
curl -s https://api.daily.dev/public/v1/docs/json \
    | jq -r '.paths | to_entries | map(.key as $path | .value | to_entries | map(.key as $method | {tag: (.value.tags[0] // "other"), line: ("\(.key | ascii_upcase) \($path)" + (if .value.description then " - \(.value.description)" else "" end) + (if (.value.parameters | length) > 0 then "\n  Params: " + ([.value.parameters[] | "\(.name)(\(.in)): \(.description // .schema.type)"] | join("; ")) else "" end) + (if .value.requestBody then "\n  Body: " + (.value.requestBody.content["application/json"].schema | if .properties then ([.properties | to_entries[] | "\(.key)"] | join(", ")) elif ."$ref" then (."$ref" | split("/") | last) else "object" end) else "" end))})) | flatten | group_by(.tag) | map("#### \(.[0].tag)\n" + (map(.line) | join("\n\n"))) | join("\n\n")'
```

> Note: the inline `!` block in the original daily.dev SKILL.md
> regenerated the catalog automatically on every load. The
> trade-off is runtime cost (a network call to the spec on every
> trigger) vs. freshness. The `daily-dev` skill prefers a manual
> refresh on demand — call the snippet above when you need the
> current catalog.
