# GraphQL Language Prompt Snippet

## Key Concepts

- **Type System**: Strongly typed schema defining the API contract with scalar, object, enum, and union types
- **Queries**: Read operations fetching data with field-level selection (no over-fetching)
- **Mutations**: Write operations for creating, updating, and deleting data
- **Subscriptions**: Real-time data push over WebSocket connections
- **Resolvers**: Functions mapping schema fields to data sources (database, API, cache)
- **Fragments**: Reusable field selections reducing query duplication across operations
- **Directives**: `@deprecated`, `@include`, `@skip` for conditional field inclusion and schema metadata
- **Input Types**: `input` keyword for complex mutation arguments
- **Interfaces and Unions**: Polymorphic types for shared fields across multiple object types
- **Schema Stitching / Federation**: Composing multiple GraphQL services into a unified graph

## Notable File Patterns

- `schema.graphql` / `*.graphql` — Schema definition files
- `*.gql` — Alternative extension for GraphQL files
- `schema/*.graphql` — Split schema files by domain (users.graphql, orders.graphql)
- `*.resolvers.ts` / `*.resolvers.js` — Resolver implementations (TypeScript/JavaScript convention)
- `codegen.yml` — GraphQL Code Generator configuration

## Edge Detection Heuristics

**Resolver type mapping** — `Query { user(id: ID!): User }` + resolver function `user(parent, args, context)` → the resolver `implements` the schema field. Create `defines_schema` edges from schema to resolver files.

**Object type relationships** — `type Order { user: User! items: [OrderItem!]! }` → `depends_on` edges from Order to User and OrderItem types. Field references create a type dependency graph.

**Interface/Union implementations** — `type User implements Node { ... }` → `implements` edges from the concrete type to the interface. `union SearchResult = User \| Order` creates type union dependencies.

**Input type usage** — `mutation { createUser(input: CreateUserInput!): User }` → the mutation `depends_on` the input type. Input types are write-side contracts; object types are read-side.

**Fragment composition** — `fragment UserFields on User { id name }` + `query { user { ...UserFields } }` → the query `depends_on` the fragment. Fragments are reusable type selections that reduce duplication.

**Codegen configuration** — `schema: "./schema.graphql"` in `codegen.yml` → `configures` edges from the codegen config to the schema file. Codegen produces typed clients/resolvers from schema definitions.

**Subscription channels** — `subscription { orderUpdated(orderId: ID!): Order }` → `publishes` edges from the mutation that triggers the event to the subscription. Subscriptions create real-time data flows.

**Schema stitching/federation** — `extend type User @key(fields: "id")` in a federated subgraph → `cross_domain` edges between subgraph services. Federation enables distributed GraphQL across microservices.

## Summary Style

> "GraphQL schema defining N types, M queries, and K mutations for the user management API."
> "API schema with type definitions for products, orders, and payment processing with pagination."
> "Subscription schema enabling real-time notifications for order status updates."
