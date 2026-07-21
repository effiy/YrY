# Ruby Language Prompt Snippet

## Key Concepts

- **Blocks/Procs/Lambdas**: First-class callable objects; blocks are implicit, procs and lambdas are explicit
- **Mixins (include/extend)**: Share behavior across classes via modules without inheritance
- **Metaprogramming**: Dynamic method definition (`define_method`), interception (`method_missing`)
- **Duck Typing**: Objects are defined by what they can do, not what class they are
- **DSLs**: Domain-specific languages built using blocks and metaprogramming (e.g., Rails routes)
- **Monkey Patching**: Reopening existing classes to add or modify methods at runtime
- **Symbols**: Immutable, interned strings (`:name`) used as identifiers and hash keys
- **Open Classes**: Any class can be reopened and extended at any point in the program
- **Enumerable Module**: Mixin providing collection methods (map, select, reduce) to any class with `each`

## Import Patterns

- `require 'gem_name'` — load a gem or standard library module
- `require_relative './file'` — load a file relative to the current file's directory
- `load 'file.rb'` — load and re-execute a file (unlike require, does not cache)
- `autoload :ClassName, 'path'` — lazy loading of constants on first reference

## File Patterns

- `Gemfile` — dependency declarations managed by Bundler
- `Rakefile` — task definitions (Ruby's make equivalent)
- `spec/` — RSpec test directory with `*_spec.rb` convention
- `test/` — Minitest directory with `test_*.rb` or `*_test.rb` convention
- `config.ru` — Rack application entry point for web servers
- `lib/` — main source code directory by convention

## Common Frameworks

- **Rails** — Full-stack web framework following convention over configuration
- **Sinatra** — Minimal DSL for creating web applications quickly
- **RSpec** — Behavior-driven testing framework with expressive DSL
- **Sidekiq** — Background job processing using Redis-backed queues
- **Grape** — REST API micro-framework for Ruby

## Example Language Notes

> Uses `method_missing` to dynamically delegate attribute access to the wrapped model
> object. When a method is not found on the decorator, it falls through to the model,
> providing transparent delegation without explicit forwarding methods.

## Edge Detection Heuristics

**Module inclusion** — `include Enumerable`, `extend ActiveSupport::Concern`, `prepend BeforeAction` → `inherits` edges from the including class to the module. `include` adds instance methods; `extend` adds class methods; `prepend` inserts before the class in the ancestor chain.

**ActiveRecord associations** — `has_many :orders`, `belongs_to :user`, `has_one :profile`, `has_and_belongs_to_many :tags` → `depends_on` edges between model classes with cardinality. Polymorphic associations (`belongs_to :commentable, polymorphic: true`) add cross-model edges.

**Callbacks and hooks** — `before_save :encrypt_password`, `after_create :send_welcome_email` → `subscribes` edges from the model lifecycle event to the callback method. Callbacks create implicit execution order within the model.

**Service object pattern** — `class CreateOrderService; def call(params); ...; end; end` → the service orchestrates multiple models. Create `depends_on` edges from the service to each model/repository it invokes.

**Middleware (Rack) stack** — `use Rack::Cors`, `use Rack::Deflater`, `config.middleware.use CustomMiddleware` → `middleware` edges from each middleware to the application. Rack middleware wraps every request/response.

**Concern composition** — `included do; has_many :comments; end` inside `ActiveSupport::Concern` → the concern injects associations and methods into the host class. Create `configures` edges from the concern to each behavior it adds.

**Job classes** — `class ProcessPaymentJob < ApplicationJob; def perform(order_id); ...; end; end` + `ProcessPaymentJob.perform_later(order)` → `triggers` edges from the caller to the job class.

**Decorator/presenter pattern** — `class UserDecorator < SimpleDelegator` or Draper decorators → `depends_on` edges from the decorator to the decorated model. Method delegation is transparent via `method_missing`.
>
> Rails relies heavily on convention over configuration — file placement in `app/models/`,
> `app/controllers/`, etc. determines behavior without explicit registration.
