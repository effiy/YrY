---
title: agile-defect
name: agile-defect
description: >
  Agile platform defect management — search, triage, and inspect defects
  from the Zeekr Agile MP system. Auto-searches unresolved defects (pending +
  reopened) assigned to the current user, with filtering by iteration, priority,
  status, and severity. Supports triage confirmation and detail inspection.
  Auto-captures JWT token via Playwright when the user hasn't provided one.
  Trigger words: defect, bug, agile, triage, 缺陷, 敏捷平台.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-12
updated: 2026-08-12
category: aier/skills/agile-defect
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - agile
  - defect
  - bug
  - triage
chip: ai-methodology
---
# agile-defect

> Search, triage, and inspect defects from the Zeekr Agile MP defect management
> system. Default: unresolved defects assigned to you.

## What this skill does

1. **Auto-capture JWT token** — if no token is provided, use Playwright to open
   the user's browser, intercept the Agile MP API calls, and capture the
   `authorization` header. Also extracts the current user's ID and name from
   the JWT payload.
2. **Search defects** — call the `selectAll` API to find defects. Defaults to
   unresolved (pending + reopened) assigned to the current user. Supports
   filtering by iteration name, priority, severity, status, date range, and
   operator/proposer.
3. **Present triage summary** — show a numbered table of matching defects
   with key fields (ID, title, priority, severity, status, iteration, create time).
4. **User confirmation** — user marks each defect as "fix", "defer", or "close".
   Support batch operations (e.g., "mark 1-5 as fix").
5. **Fetch details** — for each "fix"-marked defect, call `selectOne/{id}`
   to retrieve the full description, screenshots, priority, severity,
   repro steps, and all metadata.

## What this skill does NOT do

- Does NOT modify defect status — read-only inspection and triage.
- Does NOT create or update defects — use the Agile MP web UI for mutations.
- Does NOT store or cache the JWT token — the user must provide it each session.

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/pdo-server/pdo/cooperation/bug/selectAll` | POST | Search defects with filters |
| `/pdo-server/pdo/cooperation/bug/selectOne/{defectId}` | GET | Fetch full defect detail |

**Base URL:** `https://gateway-int-zk.zeekrlife.com`

**Common headers (required for all requests):**
```
AppCode: PDO
lang: zh-CN
content-type: application/json
authorization: <JWT token>
```

### selectAll Request Body

```json
{
  "defectName": "",
  "productId": "11790486",
  "iterationId": "",
  "proposerId": null,
  "operatorId": "<user_id>",
  "status": "",
  "dateStartEnd": null,
  "proposerStartTime": "",
  "proposerEndTime": "",
  "defectTags": "",
  "priority": "",
  "defectSeverityLevel": "",
  "defectEnv": [],
  "rootCauseCategory": [],
  "defectCause": [],
  "defectCauseOne": "",
  "defectCauseTwo": [],
  "pageNo": 1,
  "pageSize": 20,
  "sortList": []
}
```

### Status Values

The API returns `status` as a numeric code:

| Status Code | Label | Meaning |
|-------------|-------|---------|
| `1` | 待解决 | Pending resolution |
| `2` | 处理中 | In progress |
| `3` | 重新打开 | Reopened |
| `4` | 已解决 | Resolved |
| `5` | 已关闭 | Closed |

Default unresolved filter: `status` = `1` or `3` (pending + reopened).

### Priority Values

The API returns `priority` as a string:

| Priority | Label |
|----------|-------|
| `P0` | 紧急 |
| `P1` | 高 |
| `P2` | 中 |
| `P3` | 低 |

### Severity Values

The API returns `defectSeverityLevel` as a numeric string:

| Severity | Label |
|----------|-------|
| `1` | 致命 |
| `2` | 严重 |
| `3` | 一般 |
| `4` | 轻微 |
| `5` | 建议 |

## Workflow

```
search → present → triage → detail
```

### Step 0: Obtain JWT Token (Auto via Playwright)

**This is the primary method.** When the user hasn't provided a token, run the
Playwright capture script instead of asking the user to manually copy from
DevTools.

The script (`capture-token.js`) does the following:

1. Launches Chromium via Playwright (`headless: false` so the user can log in
   if needed).
2. Uses `page.route('**/*')` to intercept ALL requests before navigation,
   capturing the `authorization` header from the first call to
   `gateway-int-zk.zeekrlife.com`.
3. Writes the full token to `/tmp/agile_token.txt`.
4. Navigates to `https://agilemp.zeekrlife.com/agile/#/projex/defect?productId=11790486`
   and waits for the page to load and make API calls.
5. Optionally intercepts the `selectAll` response to extract the user's ID
   and name from the records.

**Usage:**

```bash
NODE_PATH=/opt/homebrew/lib/node_modules node capture-token.js
```

**After the script runs:**
- Read the token from `/tmp/agile_token.txt`.
- The JWT payload contains `user_name`, `real_name`, `user_id`, `email`, and
  `emp_no` — use `user_id` as the `operatorId`.
- If the user searches for a teammate by name, first do a broad search
  (no `operatorId`) to discover their `operatorId` from the response records,
  then query with that ID.

**Decoding the JWT payload** (for extracting user info):

```bash
cat /tmp/agile_token.txt | cut -d'.' -f2 | base64 -d 2>/dev/null | python3 -m json.tool
```

The key fields: `user_id` (operatorId), `real_name` (中文名), `user_name`
(English account name), `emp_no` (employee number).

**Fallback:** If Playwright is unavailable or the script fails, ask the user
to provide the `authorization` header manually from browser DevTools → Network
tab → any API request to `gateway-int-zk.zeekrlife.com`.

### Step 1: Search

Run the `selectAll` POST request using `curl` with the captured token.
Default parameters:
- `operatorId`: current user's ID (from JWT or page data)
- `proposerStartTime` / `proposerEndTime`: use to filter by creation date
  (format: `YYYY-MM-DD HH:mm:ss`)
- `pageSize`: 50

If the user specifies filters, map them to request fields:
- **Iteration** → `iterationId` (resolve name to ID first — ask user if unknown)
- **Priority** → `priority` (P0/P1/P2/P3)
- **Status** → `status` (numeric: 1/2/3/4/5)
- **Severity** → `defectSeverityLevel` (numeric: 1/2/3/4/5)
- **Title** → `defectName` (supports partial match)
- **Operator** → `operatorId` (user ID)
- **Proposer** → `proposerId` (user ID)
- **Date range** → `proposerStartTime` / `proposerEndTime`

**Token management:** Read the token from `/tmp/agile_token.txt` into a shell
variable for each `curl` call:

```bash
TOKEN=$(cat /tmp/agile_token.txt) && curl -s '...' -H "authorization: $TOKEN" ...
```

**Parsing responses:** Use `python3 -c` for JSON formatting and table output.
The API response wraps data in `{"code": "200", "data": {"total": N, "records": [...]}}`.

### Step 2: Present

Parse the API response and display a numbered table:

```
| # | ID | Title | Priority | Severity | Status | Iteration |
|---|----|-------|----------|----------|--------|-----------|
| 1 | 110328 | Login page crash | high | serious | pending | Sprint 12 |
| 2 | 110329 | Slow data export | medium | general | reopened | Sprint 11 |
```

Show total count and page info. If more than `pageSize` results, offer to
paginate.

### Step 3: Triage

Ask the user to decide on each defect. Accept these actions:
- **fix** — mark for detailed inspection
- **defer** — skip for now
- **close** — remove from consideration (no-op in this skill)

Support batch syntax:
- `1-5 fix` — mark defects 1 through 5 as fix
- `1,3,5 fix` — mark specific defects
- `all fix` — mark all as fix
- `2 defer, 3 close` — mixed actions

### Step 4: Detail

For each "fix"-marked defect, call `selectOne/{defectId}` (GET) and present
the full detail:

- **Basic Info:** title, status, priority, severity
- **People:** proposer, operator, participants
- **Description:** defect description, repro steps, screenshots
- **Classification:** root cause category, defect cause, defect environment
- **Timeline:** created, updated, deadline

## Borders

| Boundary | Permission |
|----------|-----------|
| Agile MP API (`gateway-int-zk.zeekrlife.com`) | read-only |
| Local filesystem | no access |
| JWT token | user-provided, never stored |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Use Playwright to auto-capture the JWT token before the first API call | Faster than manual DevTools copy; handles the auth flow automatically |
| 2 | Read token from `/tmp/agile_token.txt` into a shell variable for each `curl` call | Avoids truncation; token is long (~900 chars) |
| 3 | Default to unresolved (status 1 + 3) assigned to current user | The most common triage scenario |
| 4 | Present results in a compact numbered table | Easy to reference in triage commands |
| 5 | Fetch details only for "fix"-marked defects | Avoids unnecessary API calls for deferred/closed items |
| 6 | If the API returns an auth error, re-run Playwright to get a fresh token | Tokens expire; auto-refresh is faster than asking the user |
| 7 | Paginate when results exceed `pageSize` | The API supports `pageNo` for pagination |
| 8 | When searching for a teammate by name, first do a broad search to discover their `operatorId` | The API doesn't support name-based filtering; lookup by ID is required |
| 9 | Use `python3 -c` to parse and format JSON responses into tables | Clean output; handles Unicode and field mapping in one pass |

## Supporting resources

- [capture-token.js](./capture-token.js) — Playwright script that auto-captures the JWT token and user info from the Agile MP web app.
- [commands/search.md](./commands/search.md) — Search defects with filters and pagination.
- [commands/detail.md](./commands/detail.md) — Fetch and display full defect details.

## Fallback

| Situation | Behavior |
|-----------|----------|
| JWT token missing or expired | Re-run `capture-token.js` with Playwright to get a fresh token |
| Playwright unavailable or script fails | Ask user to copy the `authorization` header from browser DevTools |
| API returns 4xx/5xx | Surface the error status and body; do not retry silently |
| Product ID unknown | Default to `11790486` (the user's product); ask if different |
| Iteration name provided but ID unknown | Ask user to look up the iteration ID from the Agile MP UI |
| No defects found | Report "no defects found" and offer to broaden the search |
| User searches by teammate name | Run a broad search first to discover the teammate's `operatorId`, then filter |
| Two users share the same name | Query both `operatorId` values and present results separately |
| User asks in a language other than English | Respond in the user's language; keep field names in original language |