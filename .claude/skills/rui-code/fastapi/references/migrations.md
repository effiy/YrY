# Migrations — Alembic

## Initialize with the async template

```shell
alembic init -t async migrations
```

This generates an `env.py` that wires `AsyncEngine` and an async migration
context — required for projects that use `AsyncSession`.

## Descriptive filenames

```ini
# alembic.ini
file_template = %%(year)d-%%(month).2d-%%(day).2d_%%(slug)s
```

Result: `2026-04-14_add_post_content_idx.py` instead of the opaque
`a3f9b2c1d4e5_add_post_content_idx.py`. Easy to read in `git log -- migrations/`.

## Rules

- Migrations must be **static** — no dynamic imports, no `subprocess.run`
  that hits the network.
- Migrations must be **reversible** — always implement `downgrade()`.
  "I'll add it later" is how you end up unable to roll back a bad release.
- Add a `.. empty message ..` migration **never** — if there's no schema
  change, the migration isn't needed.
- Use the same naming convention as your tables (`post`, `user`) and
  indexes (`%(column_0_label)s_idx`).
