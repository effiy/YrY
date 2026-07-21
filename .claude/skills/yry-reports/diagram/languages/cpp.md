# C++ Language Prompt Snippet

## Key Concepts

- **Templates**: Function, class, and variadic templates for generic compile-time polymorphism
- **RAII**: Resource Acquisition Is Initialization — tie resource lifetime to object scope
- **Smart Pointers**: `unique_ptr` (exclusive), `shared_ptr` (reference-counted), `weak_ptr` (non-owning)
- **Move Semantics**: Rvalue references (`&&`) and `std::move` for efficient resource transfer
- **Operator Overloading**: Define custom behavior for operators on user-defined types
- **Virtual Functions and Vtable**: Runtime polymorphism through virtual method dispatch tables
- **Namespaces**: Organize symbols and prevent name collisions across translation units
- **Constexpr**: Compile-time evaluation of functions and variables for zero-runtime-cost computation
- **Lambda Expressions**: Anonymous functions with capture lists for closures
- **STL Containers and Algorithms**: Standard containers (vector, map, set) and generic algorithms
- **Concepts (C++20)**: Named constraints on template parameters replacing SFINAE patterns

## Import Patterns

- `#include <system_header>` — include standard library or system headers
- `#include "local_header.h"` — include project-local header files
- `using namespace std` — bring all names from std into scope (avoid in headers)
- `using std::vector` — selectively bring specific names into scope

## File Patterns

- `.h` / `.hpp` — header files containing declarations, templates, and inline definitions
- `.cpp` / `.cc` — implementation files with function definitions and static data
- `CMakeLists.txt` — CMake build system configuration
- `Makefile` — Make-based build rules and targets
- `main.cpp` — program entry point containing `int main()`

## Edge Detection Heuristics

**Template instantiations** — `std::vector<User>`, `std::unique_ptr<Connection>` → template user `depends_on` the template definition AND the type parameter. Template-heavy codebases have dense header dependency chains.

**Virtual function dispatch** — `virtual void process() = 0` in base → `implements` edges from each concrete subclass overriding it. vtable layout follows the inheritance hierarchy.

**RAII ownership** — `std::unique_ptr<T>`, `std::shared_ptr<T>`, custom destructors → owning class `depends_on` the managed resource. Unique = exclusive; shared = shared ownership semantics.

**Include graph** — `#include "user.h"` in `order.cpp` → `imports` edge from `.cpp` to `.h`. Header-only libraries collapse `.h`/`.cpp` into single-file dependencies.

**CMake target dependencies** — `target_link_libraries(myapp PRIVATE user_lib)` → `depends_on` from consumer to library. `PUBLIC` dependencies propagate to downstream consumers; `INTERFACE` are header-only.

**Signal/slot (Qt)** — `QObject::connect(sender, SIGNAL(changed()), receiver, SLOT(update()))` → `publishes` from signal, `subscribes` from slot. Auto-connections via naming convention are implicit.

**Factory pattern** — `static unique_ptr<Base> create(Type t)` → factory `depends_on` all concrete types it creates. Register-based factories add runtime plugin dependencies.

**Template specialization** — `template<> struct Traits<User> { ... }` → explicit specialization `depends_on` the primary template and the specialized type.

## Common Frameworks

- **Qt** — Cross-platform application framework with signal/slot mechanism
- **Boost** — Extensive collection of peer-reviewed portable libraries
- **Catch2** — Header-only testing framework with BDD-style syntax
- **Google Test** — Testing framework with fixtures, assertions, and mocking
- **gRPC** — High-performance RPC framework for service communication

## Example Language Notes

> Uses `std::unique_ptr<T>` for RAII-based ownership, ensuring deterministic cleanup
> when scope exits. The unique pointer cannot be copied, only moved, making ownership
> transfer explicit and preventing accidental double-free errors.
>
> Header/implementation separation (`.h`/`.cpp`) controls compilation boundaries —
> changes to a `.cpp` file only recompile that translation unit, not all includers.
