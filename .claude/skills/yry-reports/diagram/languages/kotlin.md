# Kotlin Language Prompt Snippet

## Key Concepts

- **Coroutines and Flow**: Structured concurrency with suspending functions; Flow for reactive streams
- **Data Classes**: Auto-generated `equals`, `hashCode`, `toString`, `copy`, and destructuring
- **Sealed Classes/Interfaces**: Restricted hierarchies enabling exhaustive `when` expressions
- **Extension Functions**: Add methods to existing classes without inheritance or wrappers
- **Null Safety**: `?.` safe call, `!!` non-null assertion, `?:` Elvis operator for default values
- **Delegation (by keyword)**: Delegate interface implementation or property access to another object
- **DSL Builders**: Lambda-with-receiver syntax enabling type-safe builder patterns
- **Inline Functions and Reified Types**: Inline for zero-overhead lambdas; reified for runtime type access
- **Companion Objects**: Named or anonymous singleton associated with a class (replaces static members)
- **Scope Functions**: `let`, `run`, `apply`, `also`, `with` for concise object configuration and transformation

## Import Patterns

- `import package.ClassName` — import a specific class
- `import package.*` — wildcard import of all declarations in a package
- `import package.function as alias` — import with alias to resolve naming conflicts

## File Patterns

- `build.gradle.kts` — Gradle build script using Kotlin DSL
- `Application.kt` — application entry point (Spring Boot or Ktor)
- `src/main/kotlin/` — main source root following Gradle conventions
- `src/test/kotlin/` — test source root with matching package structure
- `settings.gradle.kts` — multi-module project configuration

## Common Frameworks

- **Spring Boot (Kotlin)** — Kotlin-first support with coroutines and DSL extensions
- **Ktor** — Kotlin-native async web framework from JetBrains
- **Jetpack Compose** — Declarative UI toolkit for Android using composable functions
- **Exposed** — Lightweight SQL framework with type-safe DSL and DAO patterns
- **Koin** — Pragmatic dependency injection framework using Kotlin DSL

## Edge Detection Heuristics

**Koin module definitions** — `val appModule = module { single { UserService(get()) } }` → `configures` edges from the module to each declared bean. `get()` inside the lambda references other beans → `depends_on` edges.

**Coroutine scope hierarchy** — `viewModelScope.launch { ... }`, `lifecycleScope.launch { ... }`, `GlobalScope.launch { ... }` → the launched coroutine depends on the scope's lifecycle. Create `calls` edges from the launch site to the suspended function.

**Flow operators** — `.map { ... }.filter { ... }.collect { ... }` → `transforms` edges between each operator stage. Flow is cold (doesn't run until collected); `collect` is the terminal operation.

**Sealed class routing** — `when (state) { is Success -> ... is Error -> ... is Loading -> ... }` → exhaustive branches create `depends_on` edges from the handler to each state type.

**Extension function dependencies** — `fun String.toSlug(): String = ...` → the extension function file depends on String. When extension functions cross module boundaries, create `depends_on` edges.

**Compose UI tree** — `@Composable fun HomeScreen() { Column { Header(); Body(); Footer() } }` → `contains` edges from parent composable to child composables. This represents the UI component tree.

**Delegation patterns** — `class LazyService by lazy { ... }` or `by viewModels()` → the delegating class depends on the delegate provider. Create `depends_on` edges from the consumer to the delegate.

**Ktor plugin installation** — `install(ContentNegotiation) { ... }` or `routing { get("/") { ... } }` → `configures` edges from the application to each installed plugin. Route handlers → `routes` edges.

## Example Language Notes

> Uses sealed class hierarchy with `when` exhaustive matching to handle all possible
> API response states. The compiler enforces that every variant is covered, eliminating
> the need for a fallback `else` branch and catching missing cases at compile time.
>
> Extension functions allow adding utilities like `String.toSlug()` without modifying
> the original class — keeping the extension discoverable through IDE auto-complete.
