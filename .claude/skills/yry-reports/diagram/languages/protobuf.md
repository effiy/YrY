# Protobuf Language Prompt Snippet

## Key Concepts

- **Message Types**: `message` blocks defining structured data with typed, numbered fields
- **Field Numbers**: Permanent identifiers (1-536870911) — never reuse deleted numbers for backward compatibility
- **Scalar Types**: `int32`, `int64`, `string`, `bytes`, `bool`, `float`, `double`, and more
- **Enums**: Named integer constants for categorical values
- **Services**: `service` blocks defining RPC (Remote Procedure Call) method signatures
- **Oneof**: Mutually exclusive field groups — only one field in the group can be set
- **Repeated Fields**: `repeated` keyword for list/array fields
- **Maps**: `map<key_type, value_type>` for dictionary/hash fields
- **Packages and Imports**: Namespace organization and cross-file references
- **Proto2 vs Proto3**: Proto3 (current) removes required/optional distinction and defaults all fields

## Notable File Patterns

- `*.proto` — Protocol Buffer definition files
- `proto/**/*.proto` — Organized proto definitions by service or domain
- `buf.yaml` / `buf.gen.yaml` — Buf tool configuration for linting and code generation
- `*_pb2.py` / `*.pb.go` / `*_pb.ts` — Generated code (should be excluded from analysis)

## Edge Detection Heuristics

**RPC service contracts** — `service UserService { rpc GetUser(GetUserRequest) returns (User); }` → `defines_schema` edges from the proto service to the gRPC handler that implements it. Each RPC is an explicit API contract.

**Message composition** — `message Order { User user = 1; repeated OrderItem items = 2; }` → `depends_on` edges from Order to User and OrderItem message types. Message nesting reflects domain model structure.

**Field number permanence** — Field numbers (`= 1`, `= 2`) must never be reused or renumbered → this is a strong schema evolution constraint. Note when `reserved` fields appear (evidence of schema evolution).

**Proto import graph** — `import "google/api/annotations.proto"` or `import "common/types.proto"` → `imports` edges from the importing file to the imported file. Well-known types (`google.protobuf.Timestamp`) create external dependencies.

**Oneof semantics** — `oneof result { User user = 1; Error error = 2; }` → the containing message `depends_on` each oneof variant. Oneof is protobuf's discriminated union — only one field is set at a time.

**gRPC streaming patterns** — `rpc Watch(WatchRequest) returns (stream Event)` (server streaming), `rpc Upload(stream Chunk) returns (UploadResult)` (client streaming), `rpc Chat(stream Message) returns (stream Message)` (bidirectional) → streaming RPCs create long-lived connections. Mark edges as streaming.

**Code generation pipeline** — `protoc --go_out=. --go-grpc_out=. service.proto` (in buf.gen.yaml or Makefile) → the generated `.pb.go` and `_grpc.pb.go` files `depends_on` the proto source. Buf's `buf.gen.yaml` centralizes codegen configuration.

**Package/option scoping** — `package com.example.api.v1; option go_package = "github.com/example/api/v1;apiv1";` → the package declaration defines the generated code's namespace. Multi-language `option` blocks create language-specific dependency paths.

## Summary Style

> "Protocol Buffer definitions for N message types and M RPC services in the user authentication domain."
> "Shared proto types defining common request/response envelopes and error codes."
> "gRPC service definition with N methods for real-time data streaming and batch processing."
