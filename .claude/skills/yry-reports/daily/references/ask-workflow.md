# Ask Mode — Iterative Search & Synthesis

When the user asks a developer question, treat daily.dev as a search
engine. Run multiple queries, dedupe, weigh by engagement, and
synthesize an answer with citations.

## Workflow

### 1. Resolve the token

Follow [references/token-storage.md](./token-storage.md). Skip the
call entirely if no token is available — see the "no results" path
below.

### 2. Search iteratively

There is no hard limit on the number of queries. Search like you
would with web search.

**Keyword search** — exact term match, best for technology names,
library names, error strings:

```bash
curl -s -H "Authorization: Bearer $DAILY_DEV_TOKEN" \
    "https://api.daily.dev/public/v1/recommend/keyword?q=react+server+components&limit=20"
```

**Semantic search** — natural-language query, best for open-ended
"how do I" / "what is" questions:

```bash
curl -s -H "Authorization: Bearer $DAILY_DEV_TOKEN" \
    "https://api.daily.dev/public/v1/recommend/semantic?q=how+to+structure+a+monorepo+for+a+typescript+team&limit=20"
```

Both return the same article shape:

```json
{
  "data": [
    {
      "id": "...",
      "title": "Article title",
      "url": "https://...",
      "summary": "Article summary...",
      "tags": ["tag1", "tag2"],
      "readTime": 7,
      "numUpvotes": 342,
      "numComments": 28,
      "source": { "name": "Publisher Name" }
    }
  ]
}
```

#### Search strategy

1. **Start broad.** Run one keyword query and one semantic query
   in the same turn — they're cheap and complementary.
2. **Look for gaps.** After the first round:
   - Did the results cover every angle the question implies?
   - Did article titles / tags hint at sub-topics worth following up?
   - Were specific tools, libraries, or frameworks named in summaries?
3. **Follow up.** Search for those specific names, try synonyms,
   try the question rephrased as a how-to.
4. **Stop when done.** Stop when you have enough to answer the
   question, OR follow-ups return no new results.

### 3. Deduplicate

Merge all rounds, dedupe by `id`. Keep the first occurrence of
each article.

### 4. Synthesize the answer

Use the articles you collected. **Do not invent content the
articles don't say.** Reference specific articles when making
claims; weight by engagement signals:

- `numUpvotes` — community validation
- `numComments` — discussion / nuance
- `readTime` — depth
- `source.name` — publisher credibility

### 5. Write the sources block

```
### Sources from daily.dev

1. [Article Title](url) — summary snippet (⬆️ upvotes · 💬 comments · ⏱️ min read)
2. [Article Title](url) — summary snippet (⬆️ upvotes · 💬 comments · ⏱️ min read)
```

Sort by `numUpvotes` desc. Cap at ~10 sources in the block — if you
have more, group by sub-topic and show the top 2-3 per group.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| No results at all | State that daily.dev's article graph doesn't cover this topic; suggest rephrasing |
| Only some queries return | Use what you got; partial results are fine |
| 401 | Token invalid/expired → https://app.daily.dev/settings/api |
| 429 | Rate-limited → wait `Retry-After` seconds, retry once |
| 403 | Plus subscription required → https://app.daily.dev/plus |
| Conflict between two articles | Note both perspectives and the newer one |

## Output template

```markdown
**Direct answer:** <one or two sentences>

**Reasoning grounded in the articles:**
- <claim 1, citing article>
- <claim 2, citing article>
- <claim 3, citing article>

**Sub-topics worth exploring:** <1-3 follow-up angles>

### Sources from daily.dev

1. [Title](url) — summary (⬆️ N · 💬 N · ⏱️ N min)
2. ...
```

Keep the lead short. The user came for an answer; the sources are
the receipts, not the headline.
