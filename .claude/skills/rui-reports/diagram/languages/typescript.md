# TypeScript Language Prompt Snippet

## Key Concepts

- **Generics**: Parameterized types (`<T>`) enabling reusable, type-safe abstractions
- **Type Guards**: Runtime checks that narrow types within conditional blocks (`is`, `in`, `typeof`, `instanceof`)
- **Discriminated Unions**: Union types with a shared literal field used for exhaustive narrowing
- **Utility Types**: Built-in mapped types like `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`
- **Interfaces vs Types**: Interfaces support declaration merging; type aliases support unions and mapped types
- **Enums**: Numeric and string enums for named constant sets; prefer `as const` objects when possible
- **Mapped Types**: Transform existing types property-by-property using `[K in keyof T]` syntax
- **Conditional Types**: `T extends U ? X : Y` for type-level branching logic
- **Template Literal Types**: String manipulation at the type level using backtick syntax
- **Declaration Merging**: Interfaces with the same name merge their members automatically
- **Module Augmentation**: Extending third-party module types via `declare module` blocks

## Import Patterns

- `import { X } from 'module'` — named import (most common)
- `import type { X } from 'module'` — type-only import (erased at runtime)
- `import * as X from 'module'` — namespace import
- `import X from 'module'` — default import

## File Patterns

- `index.ts` — barrel file re-exporting public API from a directory
- `*.d.ts` — type declaration files (ambient declarations, no runtime code)
- `tsconfig.json` — TypeScript compiler configuration and project references
- `*.tsx` — TypeScript files containing JSX (React components)

## Common Frameworks

- **React** — UI component library with hooks and JSX
- **Angular** — Full-featured framework with decorators and dependency injection
- **Next.js** — React meta-framework with SSR, SSG, and API routes
- **NestJS** — Server-side framework inspired by Angular (decorators, modules, DI)
- **Express (with TS)** — Minimal HTTP framework with typed request/response handlers

## Edge Detection Heuristics

When analyzing TypeScript files, look for these additional signals:

**Path alias resolution** — `tsconfig.json` `paths` field maps `@/foo` → `src/foo`. When a file imports via alias, resolve to the actual path before creating `imports` edges.

**Decorator-based DI** — `@Injectable()`, `@Inject()`, `@Module()` (NestJS/Angular) indicate dependency injection. Classes decorated with `@Injectable()` are available for injection; constructor parameters with `@Inject()` create `depends_on` edges.

**Barrel re-exports** — `export * from './module'` or `export { X } from './module'` in `index.ts` → create `exports` edges from the barrel to each re-exported symbol's defining file.

**Generic constraints** — `<T extends BaseEntity>` indicates a type dependency. The constrained type parameter depends on the constraint type — trace `related` edges when constraints cross file boundaries.

**Conditional type usage** — `T extends U ? X : Y` patterns indicate type-level branching. When X and Y reference types from other files, note the conditional dependency.

**Zod/schema validation** — `z.object({...})` or `z.infer<typeof schema>` creates a runtime schema. Files importing the inferred type depend on the schema definition — create `depends_on` edges.

## Example Language Notes

> Uses generic type parameter `T extends BaseEntity` to ensure type safety across
> repository methods. The constraint guarantees all entities share a common `id` field
> while allowing specific entity types to flow through the data layer without casting.
>
> Barrel files (`index.ts`) re-export symbols so consumers import from the directory
> rather than reaching into internal module paths — maintaining encapsulation.
