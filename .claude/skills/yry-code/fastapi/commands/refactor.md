# refactor

> Suggest idiomatic rewrites for a single FastAPI file or function.

## When to use

The user asked to "refactor", "modernize", "fix this to match best
practices", or wants a single file brought up to the ruleset in this
skill.

## Workflow

1. Read the target file. Identify all anti-patterns from
   `references/anti-patterns.md` and modernization opportunities
   (default-arg `Depends`, Pydantic v1 leftovers, sync-in-async, etc.).
2. For each finding, produce a **diff snippet** showing the original and
   the proposed change. Don't refactor code the user didn't ask about —
   the goal is targeted modernization, not a rewrite.
3. Group findings by category:
   - **Async correctness** (`async def` blocking calls, sync deps)
   - **Pydantic** (`json_encoders`, default-arg, contradicting constraint)
   - **Dependencies** (`Annotated[T, Depends(...)]`, chaining)
   - **Database** (sync session, double-construction with `response_model`)
   - **Auth** (`python-jose` → PyJWT)
   - **Tests** (`async_asgi_testclient` → httpx + ASGITransport,
     `monkeypatch` → `dependency_overrides`)
4. End each category with a one-line rationale that cites the relevant
   `references/` file.
5. If the file mixes many domains or has structural problems, recommend
   `/yry-code-fastapi review` for a fuller pass.

## Diff format

```diff
- from jose import jwt
+ import jwt
```
…with a comment above explaining why.

## What NOT to do

- Don't refactor style (import ordering, quoting) — ruff handles that.
- Don't add type hints to untyped code unless the user asked.
- Don't introduce a new dependency (e.g. SQLAlchemy 2.0 when the project
  is on 1.4) — flag it, but don't change it without permission.
- Don't refactor business logic. The point is to bring the file in line
  with the ruleset, not to redesign it.
