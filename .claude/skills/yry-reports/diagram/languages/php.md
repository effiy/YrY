# PHP Language Prompt Snippet

## Key Concepts

- **Namespaces**: Organize code and prevent naming collisions using backslash-delimited paths
- **Traits**: Horizontal code reuse mechanism for sharing methods across unrelated classes
- **Type Declarations**: Parameter, return, and property types (scalar, union, intersection types)
- **Attributes (PHP 8+)**: Native metadata annotations replacing docblock-based configuration
- **Enums (PHP 8.1+)**: First-class enumeration types with methods and interface implementation
- **Fibers**: Lightweight cooperative concurrency primitives for non-blocking I/O
- **Closures/Anonymous Functions**: First-class functions with explicit `use` for variable capture
- **Magic Methods**: Special methods like `__construct`, `__get`, `__set`, `__call` for object behavior
- **Dependency Injection**: Constructor injection managed by PSR-11 compatible containers
- **Middleware**: Request/response pipeline pattern central to modern PHP frameworks

## Import Patterns

- `use Namespace\ClassName` — import a class by its fully qualified name
- `use Namespace\ClassName as Alias` — import with an alias to avoid conflicts
- `namespace App\Http\Controllers` — declare the current file's namespace
- `use function Namespace\functionName` — import a namespaced function

## File Patterns

- `composer.json` — dependency management and PSR-4 autoloading configuration
- `index.php` — web application entry point (front controller)
- `artisan` — Laravel CLI entry point for commands and migrations
- `routes/` — route definition files (web.php, api.php in Laravel)
- PSR-4 autoloading maps namespace prefixes to directory paths

## Common Frameworks

- **Laravel** — Full-featured framework with Eloquent ORM, Blade templates, and queues
- **Symfony** — Component-based framework powering many PHP projects and libraries
- **WordPress** — CMS platform with hook-based plugin architecture
- **Slim** — Micro-framework for APIs and small applications
- **CodeIgniter** — Lightweight MVC framework with minimal configuration

## Edge Detection Heuristics

**Laravel service container binding** — `$this->app->bind(Interface::class, Concrete::class)` or `$this->app->singleton(...)` → `configures` edges from the service provider to the bound implementation. Service providers are the composition root.

**Eloquent relationships** — `$this->hasMany(Order::class)`, `$this->belongsTo(User::class)`, `$this->belongsToMany(Tag::class)` → `depends_on` edges between Eloquent model classes with relationship cardinality.

**Middleware registration** — `$middleware->web([...])` or `$router->middleware('auth')` → `middleware` edges from each middleware to the route groups they protect. Middleware priority is declared in `Kernel.php`.

**Event/listener wiring** — `Event::listen(OrderShipped::class, SendNotification::class)` in `EventServiceProvider` → `subscribes` from listener to event. Queued listeners add async indirection.

**Command/handler pattern** — `Artisan::command('report:generate', fn() => ...)` or console command classes → create `depends_on` edges from the command to the services it invokes.

**Policy/gate authorization** — `Gate::define('update-post', fn($user, $post) => ...)` → `middleware` edges from the policy to the controller actions they authorize. `$this->authorize('update-post', $post)` in controllers creates the dependency.

**Queue job dispatching** — `ProcessPayment::dispatch($order)` or `dispatch(new ProcessPayment($order))` → `triggers` edges from the dispatcher to the job class. Job chaining (`->chain([...])`) creates sequential dependencies.

**Blade component hierarchy** — `<x-layout>` / `<x-card>` components in Blade templates → `contains` edges from parent to child component, mirroring the React component pattern.

## Example Language Notes

> Uses PHP 8 attributes `#[Route('/api/users')]` for declarative route mapping on
> controller methods. Attributes replace the older docblock annotation pattern,
> providing native language support for metadata that tools can reflect upon.
>
> PSR-4 autoloading in `composer.json` maps `App\` to `src/`, so the class
> `App\Http\Controllers\UserController` loads from `src/Http/Controllers/UserController.php`.
