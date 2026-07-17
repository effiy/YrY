# scaffold

> Generate a best-practice FastAPI project skeleton.

## When to use

The user said "scaffold", "create a new FastAPI project", "bootstrap",
"init", or asked the skill to create a project directory.

## Workflow

1. Confirm the target directory and the list of domain packages.
   Default domains are `auth` and `posts` (override with `--domain NAME`).
2. Run the scaffolder:
   ```shell
   python3 .claude/skills/rui-code/fastapi/scripts/scaffold_fastapi.py <target> --domain auth --domain posts
   ```
   Add `--force` only if the user explicitly approves overwriting an
   existing non-empty directory.
3. Verify the tree matches `references/project-structure.md`. Show the
   `tree <target>` (or `find <target> -type f`) output to the user.
4. Print the "Next steps" block from the script's stdout. Don't add extra
   steps unless the user asked.
5. Cite `references/project-structure.md` and `references/quick-reference.md`
   so the user knows where the structure comes from.

## Customizing the scaffold

- Add a new domain: `python3 .../scaffold_fastapi.py <target> --domain billing`.
  The script creates `src/billing/`, `tests/billing/`, and registers the
  router in `src/main.py` (only for the first domain — for additional
  domains, ask the user whether to add a router include).
- Override the project name: rename the target directory to the desired
  package name; the script derives the name from the directory.
- Drop a default domain: pass `--domain` with only the domains you want.

## What the script does NOT do

- Does not run `uv sync` / `pip install` / `poetry install`. Tell the user
  to do this themselves.
- Does not run `alembic init`. The script writes `alembic.ini` but stops
  before generating `migrations/env.py` because the async template needs
  an interactive prompt.
- Does not write tests beyond a smoke test. Domain tests are the user's
  job.
- Does not commit to git. Tell the user to `git init && git add .`.
