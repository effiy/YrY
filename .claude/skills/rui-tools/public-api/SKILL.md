---
name: rui-tools-public-api
description: >
  Curated free public API navigator — pulls 730+ free public APIs
  across 48 categories (Animals, Anime, Finance, Music, Weather,
  Geocoding, Machine Learning, etc.) from public-api-lists/
  public-api-lists, indexes them locally with their auth / HTTPS /
  CORS metadata, and recommends the right API for a given task.
  Trigger when the user wants to: find a free public API for a side
  project or production app, pick an API for a specific domain
  (weather, finance, geocoding, anime, music, news, translation,
  cryptocurrency, jobs), filter public APIs by auth requirement
  (no-auth / apiKey / OAuth), HTTPS support, or CORS friendliness,
  discover APIs that don't need a key for quick prototyping, find an
  alternative to a paid API, or browse the public-api-lists catalog.
  Trigger words: "public api", "free api", "open api", "api list",
  "api directory", "api catalog", "api navigator", "no auth api",
  "api without key", "api key free", "cors api", "free weather api",
  "free geocoding api", "free finance api", "free crypto api",
  "free music api", "free news api", "free anime api", "free
  pokemon api", "free dictionary api", "free translation api",
  "free currency api", "public api directory", "open api list",
  "free api list", "api endpoints list".

  Do NOT trigger for: paid / commercial API procurement, scraping
  guidance, internal / private API design, API gateway /
  rate-limiting infrastructure, or any task unrelated to the curated
  public-api-lists catalog above.
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-public-api — Curated Free Public API Navigator

> Pick the right free public API. Pulls from
> [public-api-lists/public-api-lists](https://github.com/public-api-lists/public-api-lists),
> ~787 APIs across 48 categories, indexed with auth / HTTPS / CORS metadata.

## What this skill does

1. **Maps an API question to a category** across the single registered
   source (`public-api-lists`) — 48 categories including Animals,
   Anime, Books, Business, Calendar, Cryptocurrency, Development,
   Finance, Games & Comics, Geocoding, Government, Health, Music,
   News, Sports & Fitness, Weather.
2. **Recommends 1-3 APIs** for the requested domain, surfacing the
   description, auth requirement, HTTPS support, and CORS behaviour
   straight from the upstream table.
3. **Filters by constraints** when asked — "no auth", "API key only",
   "CORS-friendly", "HTTPS required", "free", "no key needed in the
   browser" — by matching the `auth`, `https`, `cors` columns in
   `references/index.json`.
4. **Suggests alternatives** when a category is empty for a niche
   intent (e.g. "movie recommendations" → `Video` or `Entertainment`-
   adjacent categories like `Open Data` or `Personality`).
5. **Cites every recommendation** by exact title and URL with the
   `[src:public-api-lists]` tag.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot
  in `references/`.
- Does NOT cover paid / commercial APIs, B2B SaaS APIs, or any
  vendor-locked endpoint not in the free public catalog.
- Does NOT teach how to call an API, write HTTP code, or debug
  CORS — the index records *what* the API requires, not *how* to use
  it. Link to the API's docs page (URL column) for usage.
- Does NOT replace the API's own documentation — only knows the
  high-level description, auth, HTTPS, and CORS status.
- Does NOT auto-generate API client code — recommend an API, then
  hand off to standard Claude Code.
- Does NOT cover non-API public data sources (CSV downloads, RSS
  feeds, static datasets) unless explicitly listed in the upstream.

## Workflow

1. **Read** `references/sources.json` and `references/index.md` (or
   `references/index.json` for machine filtering).
2. **Match** the user's intent to one of the 48 categories:
   - "weather API" / "forecast" → `Weather`
   - "stock / forex / crypto prices" → `Finance` or `Cryptocurrency`
     or `Currency Exchange`
   - "anime / manga" → `Anime`
   - "movies / shows / streaming" → `Video` (no dedicated "Movies"
     category — flag this gap)
   - "translation" → `Development` (search for `translat` in
     descriptions)
   - "address → lat/lng" → `Geocoding`
   - "company / business data" → `Business` or `Open Data`
   - "open government data" → `Government` or `Open Data`
   - "ML models" → `Machine Learning`
   - "music" → `Music`
3. **Filter** by constraints the user named:
   - "no auth" / "no API key" → `auth == "No"` (case-insensitive
     contains `no`, exclude `apiKey` / `OAuth` / `X-Mashape-Key`).
   - "API key only" → `auth` contains `apiKey`.
   - "OAuth" → `auth` contains `OAuth`.
   - "CORS-friendly for browser" → `cors == "Yes"`.
   - "HTTPS only" → `https == "Yes"`.
   - "works in the browser without a key" → `auth == "No"` AND
     `cors == "Yes"`.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.
   Quote the `auth` / `https` / `cors` columns verbatim — do not
   paraphrase. `Unknown` in the CORS column means "the upstream
   maintainer didn't verify it" — do NOT claim "CORS supported" or
   "CORS unsupported" based on that.
5. **Flag gaps** when the requested domain is missing (e.g. "Movies"
   is not a top-level category — point to `Video` or suggest the
   closest match).

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified category index, start here.
- [references/index.json](./references/index.json) — machine-readable index (filterable by `auth` / `https` / `cors`).
- [references/sources.json](./references/sources.json) — registered sources.
- [references/README-public-api-lists.md](./references/README-public-api-lists.md) — verbatim upstream README.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Grep `references/README-public-api-lists.md` directly. |
| Domain not in any registered source | State the gap, suggest the closest related category (e.g. "no Movies category — try `Video`"). |
| Stale README (upstream has moved on) | Tell the user the snapshot may be stale; suggest re-fetching from the upstream `public-api-lists/public-api-lists` repo. |
| User asks for a paid / commercial API | Out of scope; point the user at vendor docs or a paid API marketplace. |
| User asks how to call an API / write HTTP code | Out of scope; link to the API's own docs page (URL column). |
| User wants the entire 700+ list dumped | Allowed but discouraged — show the category table from `references/index.md` and ask which slice to narrow down. |
| Upstream table has no `Description` for an entry | Use the API title itself as the fallback description; flag it as "(no upstream description)". |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
