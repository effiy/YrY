# SQL Language Prompt Snippet

## Key Concepts

- **DDL (Data Definition)**: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` for schema management
- **DML (Data Manipulation)**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` for data operations
- **Normalization**: Organizing tables to reduce redundancy through 1NF, 2NF, 3NF relationships
- **Foreign Keys**: `REFERENCES` constraints enforcing referential integrity between tables
- **Indexes**: `CREATE INDEX` for query performance optimization on frequently queried columns
- **Migrations**: Numbered, sequential schema changes applied in order for version control
- **Transactions**: `BEGIN`/`COMMIT`/`ROLLBACK` for atomic multi-statement operations
- **Views**: Named queries (`CREATE VIEW`) providing virtual tables for complex joins
- **Stored Procedures**: Server-side functions for encapsulating business logic in the database
- **Constraints**: `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT` for data integrity rules

## Notable File Patterns

- `migrations/*.sql` — Numbered migration files (e.g., `001_create_users.sql`, `002_add_orders.sql`)
- `schema.sql` — Full database schema definition (often generated from migrations)
- `seeds/*.sql` — Seed data for development and testing environments
- `*.up.sql` / `*.down.sql` — Reversible migration pairs (up applies, down reverts)
- `init.sql` — Database initialization script for Docker or fresh setup
- `procedures/*.sql` — Stored procedure definitions

## Edge Detection Heuristics

**Migration chain** — Numbered migrations (`001_*.sql`, `002_*.sql`, ...) form an ordered dependency chain. Create `migrates` edges from each migration to the tables it creates or alters. Migration N+1 implicitly `depends_on` migration N.

**Foreign key relationships** — `FOREIGN KEY (user_id) REFERENCES users(id)` → creates a `related` edge from the referencing table to the referenced table. Cascade behavior (`ON DELETE CASCADE`) adds architectural semantics.

**Index dependencies** — `CREATE INDEX idx_orders_user ON orders(user_id)` → the index `depends_on` the column(s) it indexes. Composite indexes create multi-column dependencies.

**View definitions** — `CREATE VIEW active_users AS SELECT ... FROM users WHERE ...` → the view `depends_on` every table in its FROM/JOIN clause. Materialized views add storage dependencies.

**Stored procedure dependencies** — `CREATE FUNCTION calculate_total(order_id INT) RETURNS ...` → the procedure `depends_on` every table it references in SELECT/INSERT/UPDATE/DELETE statements within its body.

**Trigger chains** — `CREATE TRIGGER update_inventory AFTER INSERT ON orders ...` → the trigger `subscribes` to the triggering table's events. Cascading triggers (trigger A fires trigger B) create implicit dependency chains.

**Schema/module boundaries** — Multiple `.sql` files that `CREATE SCHEMA` or use naming conventions (`sales.*`, `inventory.*`) → schema-level organization. Cross-schema references (e.g., `sales.orders` referencing `inventory.products`) → `cross_domain` edges.

**Up/down migration pairs** — `*.up.sql` and matching `*.down.sql` → the down migration reverses the up migration. Create `related` edges between paired files and note the reversible pattern.

## Summary Style

> "Database migration creating the users table with email, name, and authentication columns."
> "Schema definition with N tables covering user management, orders, and payment processing."
> "Seed data populating N tables with development fixtures for testing."
