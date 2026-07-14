# C# Language Prompt Snippet

## Key Concepts

- **LINQ Queries**: Language-integrated queries using method syntax (`.Where().Select()`) or query syntax
- **Async/Await with Task**: Asynchronous programming model returning `Task<T>` for non-blocking I/O
- **Generics and Constraints**: Type parameters with `where T : class, IDisposable` constraint clauses
- **Properties (get/set)**: First-class property syntax with backing fields, auto-properties, and init-only
- **Delegates and Events**: Type-safe function pointers; events provide publisher-subscriber pattern
- **Attributes**: Metadata annotations (`[HttpGet]`, `[Authorize]`) for declarative configuration
- **Nullable Reference Types**: Compiler-enforced null safety with `?` annotations (C# 8+)
- **Pattern Matching**: `is`, `switch` expressions with type, property, and relational patterns
- **Records and Init-Only Setters**: Immutable reference types with value equality semantics (C# 9+)
- **Dependency Injection (Built-in)**: First-class DI container in ASP.NET Core (`IServiceCollection`)

## Import Patterns

- `using System.Collections.Generic` — import a namespace for unqualified type access
- `using static System.Math` — import static members for direct method access
- `global using` — file-scoped usings applied to the entire project (C# 10)
- `using Alias = Namespace.Type` — type alias for disambiguation

## File Patterns

- `*.csproj` — MSBuild project file defining targets, packages, and build properties
- `*.sln` — Visual Studio solution file grouping multiple projects
- `Program.cs` — application entry point (top-level statements in .NET 6+)
- `Startup.cs` — service and middleware configuration (older ASP.NET Core pattern)
- `appsettings.json` — hierarchical application configuration

## Common Frameworks

- **ASP.NET Core** — Cross-platform web framework for APIs, MVC, and Razor Pages
- **Entity Framework** — ORM with LINQ-to-SQL, migrations, and change tracking
- **Blazor** — Component-based UI framework using C# instead of JavaScript
- **MAUI** — Cross-platform native UI for mobile and desktop applications
- **xUnit** — Modern testing framework with theories, facts, and dependency injection

## Edge Detection Heuristics

When analyzing C# files, look for these additional signals:

**ASP.NET Core middleware pipeline** — `app.UseMiddleware<AuthMiddleware>()` or `app.UseAuthentication()` → `middleware` edges from each middleware component to the application builder. The pipeline order in `Program.cs` determines execution sequence.

**Dependency injection registration** — `services.AddScoped<IUserService, UserService>()` or `services.AddSingleton<ICache>()` → `configures` edges from the composition root to each registered service. The lifetime (Scoped/Transient/Singleton) is architectural metadata.

**Controller route attributes** — `[Route("api/[controller]")]` + `[HttpGet("{id}")]` → `routes` edges from the controller to each action method. Combined route templates form the full URL path.

**Entity Framework relationships** — `[ForeignKey("CategoryId")]`, `.HasMany().WithOne()`, Fluent API configurations in `OnModelCreating` → `depends_on` edges between entity classes with cardinality.

**MediatR request/notification patterns** — `IRequest<TResponse>` + `IRequestHandler<TRequest, TResponse>` for commands/queries; `INotification` + `INotificationHandler<T>` for events → `depends_on` from handler to request/notification types.

**AutoMapper profiles** — `CreateMap<Source, Destination>()` → `transforms` edges from source to destination type. Profiles document type mapping contracts.

**Filter/attribute pipelines** — `[Authorize]`, `[ServiceFilter]`, `[TypeFilter]`, `[ExceptionFilter]` → these are middleware-like attributes that wrap controller actions. Create `middleware` edges from each filter to the decorated controller/action.

**Background services** — `BackgroundService` or `IHostedService` implementations with `ExecuteAsync` → long-running background workers. Create `depends_on` edges from the hosted service to the services it consumes.

## Example Language Notes

> Uses LINQ method syntax `.Where().Select()` to compose a query pipeline over the
> collection. LINQ operations are lazily evaluated — the query only executes when
> results are enumerated, allowing efficient composition without intermediate allocations.
>
> The built-in DI container in ASP.NET Core registers services in `Program.cs` and
> resolves them via constructor injection, following the composition root pattern.
