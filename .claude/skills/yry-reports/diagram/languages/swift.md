# Swift Language Prompt Snippet

## Key Concepts

- **Optionals and Optional Chaining**: `Type?` wraps values that may be nil; `?.` chains safely
- **Protocols and Protocol Extensions**: Define contracts with default implementations via extensions
- **Value Types vs Reference Types**: Structs and enums are value types; classes are reference types
- **Closures**: Self-contained blocks of functionality that capture surrounding context
- **Property Wrappers**: `@State`, `@Binding`, `@Published` encapsulate property storage logic
- **Result Builders**: `@ViewBuilder`, `@resultBuilder` enable declarative DSL syntax
- **Actors and Structured Concurrency**: `actor` types for data isolation; `async let`, `TaskGroup`
- **Generics**: Type parameters with `where` clauses and associated type constraints
- **Enums with Associated Values**: Each case can carry distinct typed payloads
- **Extensions**: Add methods, computed properties, and protocol conformance to existing types

## Import Patterns

- `import Foundation` — core library with data types, collections, networking
- `import UIKit` — iOS UI framework for traditional view controller architecture
- `import SwiftUI` — declarative UI framework with reactive state management
- `@testable import ModuleName` — import with internal access for unit testing

## File Patterns

- `Package.swift` — Swift Package Manager manifest defining targets and dependencies
- `*.xcodeproj` / `*.xcworkspace` — Xcode project and workspace configuration
- `AppDelegate.swift` — UIKit application lifecycle entry point
- `App.swift` — SwiftUI application entry point using `@main`
- `Tests/` — test target directory following SPM or Xcode conventions

## Common Frameworks

- **SwiftUI** — Declarative UI framework with reactive data flow
- **UIKit** — Imperative UI framework using view controllers and Auto Layout
- **Vapor** — Server-side Swift web framework with async support
- **Combine** — Reactive framework for processing values over time
- **Core Data** — Object graph and persistence framework

## Example Language Notes

> Uses `@Published` property wrapper to automatically notify SwiftUI views of state
> changes. When the wrapped value mutates, the property wrapper triggers `objectWillChange`
> on the enclosing `ObservableObject`, causing dependent views to re-render.

## Edge Detection Heuristics

**Protocol conformance** — `class MyView: View { var body: some View { ... } }` → `implements` edges from the conforming type to each protocol. Protocol extensions provide default implementations — check for overrides.

**Dependency injection via initializer** — `init(service: UserServiceProtocol)` → `depends_on` edges from the consumer to the protocol type. Swift favors protocol-based DI over concrete class injection.

**Combine publisher chains** — `.map { ... }.flatMap { ... }.sink { ... }` → `transforms` edges between operators. `.sink` is the terminal subscriber; publishers are cold until subscribed.

**SwiftUI view hierarchy** — `NavigationView { List { ForEach(items) { item in RowView(item) } } }` → `contains` edges from parent views to child views. `@ViewBuilder` result builders compose multiple child views.

**Actor isolation** — `actor UserCache { func getUser(id: UUID) async -> User? { ... } }` → callers must `await` actor methods. Actor isolation creates async boundaries — mark `calls` edges as async.

**Property wrapper dependencies** — `@StateObject`, `@ObservedObject`, `@EnvironmentObject` → `depends_on` edges from the view to the observed object. Environment objects are injected through the view hierarchy.

**Vapor routing** — `app.get("users", ":id") { req -> User in ... }` → `routes` edges from the route registration to the handler closure. Route groups (`app.grouped(middleware)`) apply middleware to all nested routes.

**Extension-based modularity** — `extension User { func fullName() -> String { ... } }` in a different file → creates implicit cross-file coupling. The extension file `depends_on` the original type definition.
>
> Protocol extensions provide default implementations, allowing types to conform by
> simply declaring conformance — no method body needed if defaults suffice.
