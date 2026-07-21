# JavaScript Language Prompt Snippet

## Key Concepts

- **Closures**: Functions that capture variables from their enclosing lexical scope
- **Prototypes**: Prototype chain-based inheritance underlying all JavaScript objects
- **Promises**: Asynchronous value containers enabling `.then()` chaining and `async/await`
- **Event Loop**: Single-threaded concurrency model with microtask and macrotask queues
- **Destructuring**: Extract values from objects and arrays into distinct variables
- **Spread/Rest Operators**: `...` for expanding iterables or collecting remaining arguments
- **Proxies**: Meta-programming construct to intercept and customize object operations
- **Generators**: Functions using `function*` and `yield` for lazy iteration
- **Symbol**: Unique, immutable primitive used for non-string property keys
- **WeakMap/WeakSet**: Collections with weakly-held keys allowing garbage collection
- **Modules (ESM vs CJS)**: ES Modules use `import/export`; CommonJS uses `require/module.exports`

## Import Patterns

- `import { X } from 'module'` — ESM named import
- `const X = require('module')` — CommonJS require
- `import('module')` — dynamic import returning a Promise (code splitting)
- `export default X` / `export { X }` — ESM export forms

## File Patterns

- `index.js` — barrel file or directory entry point
- `.mjs` — explicitly ES Module files
- `.cjs` — explicitly CommonJS files
- `package.json` `"type"` field — sets default module system (`"module"` or `"commonjs"`)

## Common Frameworks

- **React** — Declarative UI with virtual DOM and component model
- **Vue** — Progressive framework with reactivity system and single-file components
- **Express** — Minimal and flexible Node.js web application framework
- **Next.js** — React framework for production with hybrid rendering
- **Svelte** — Compile-time framework that shifts work from runtime to build step

## Edge Detection Heuristics

When analyzing JavaScript files, look for these additional signals:

**Event emitter patterns** — `EventEmitter` / `.on('event', handler)` / `.emit('event', data)` → `publishes` from emitter to event name, `subscribes` from listener to event name. Common in Node.js services and state management.

**Middleware chains** — `app.use(fn)` / `router.use(fn)` in Express/Koa → `middleware` edges from the middleware function to the app/router. Order matters for execution.

**Higher-order functions** — `function wrapper(fn) { return function(...) { ... } }` → the returned function depends on the wrapped function. Create `depends_on` edges from the wrapper's output to the wrapped function.

**Promise chains** — `.then(fn).catch(fn).finally(fn)` → each `.then()` represents a transformation stage. For complex chains, create `transforms` edges between stages.

**Dynamic imports** — `import('./module.js')` or `require('./module')` with variable paths → create `depends_on` edges marked as dynamic (weight: 0.5). These are runtime-resolved, not static.

**CommonJS module.exports** — `module.exports = { fn1, fn2 }` → creates `exports` edges from the module to each exported function/class. Mirror of ESM `export` patterns.

**Prototype chain** — `Child.prototype = Object.create(Parent.prototype)` → `inherits` edge from child to parent. This is the pre-ES6 class inheritance pattern.

**Callback-based async** — `fs.readFile(path, (err, data) => { ... })` → the callback is an async continuation. Create `calls` edges from the caller to the callback, marked as async.

## Example Language Notes

> Closure captures outer `config` variable, providing encapsulated state without class
> overhead. The returned object's methods share access to the same `config` reference,
> forming a module pattern that was standard before ES Modules.
>
> When encountering `.mjs` vs `.cjs` extensions, the module system is determined by
> extension regardless of the `package.json` type field — useful in mixed codebases.
