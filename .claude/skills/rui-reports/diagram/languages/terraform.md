# Terraform Language Prompt Snippet

## Key Concepts

- **Declarative Infrastructure**: Define desired state; Terraform computes and applies the diff
- **Providers**: Plugins connecting to cloud APIs (AWS, GCP, Azure, Kubernetes, etc.)
- **Resources**: `resource "type" "name"` blocks declaring infrastructure components
- **Data Sources**: `data "type" "name"` blocks reading existing infrastructure state
- **Variables**: `variable` blocks for parameterizing configurations with defaults and validation
- **Outputs**: `output` blocks exposing values for cross-module references or human consumption
- **Modules**: Reusable, composable infrastructure packages with their own variables and outputs
- **State Management**: `.tfstate` files tracking real-world resource mapping (never commit to git)
- **Workspaces**: Isolated state environments for managing dev/staging/prod from one codebase
- **Plan and Apply**: `terraform plan` previews changes, `terraform apply` executes them

## Notable File Patterns

- `main.tf` — Primary resource definitions
- `variables.tf` — Input variable declarations with types and defaults
- `outputs.tf` — Output value definitions
- `providers.tf` — Provider configuration and version constraints
- `backend.tf` — Remote state backend configuration (S3, GCS, etc.)
- `modules/**/*.tf` — Reusable infrastructure modules
- `*.tfvars` — Variable value files for different environments
- `terraform.lock.hcl` — Provider version lock file

## Edge Detection Heuristics

**Resource dependency chain** — `aws_db_instance.main depends_on [aws_security_group.db]` or implicit references (`aws_subnet.main.id`) → `depends_on` edges from the dependent resource to the dependency. Terraform builds a DAG from these; explicit `depends_on` overrides automatic inference.

**Module composition** — `module "vpc" { source = "./modules/vpc" }` → `depends_on` edges from the calling configuration to the module. Module outputs consumed via `module.vpc.vpc_id` create implicit data-flow dependencies.

**Provider configuration** — `provider "aws" { region = var.region }` + `required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }` → the configuration `depends_on` each declared provider. Provider aliases enable multi-region/multi-account patterns.

**Data source resolution** — `data "aws_ami" "ubuntu" { ... }` + `ami = data.aws_ami.ubuntu.id` → the resource `depends_on` the data source. Data sources pull in external state without creating new resources.

**Remote state dependency** — `data "terraform_remote_state" "vpc" { backend = "s3" }` → cross-state references. The consuming configuration `depends_on` the remote state's outputs. This enables multi-repo infrastructure decomposition.

**Variable/Output flow** — `variable "instance_type"` → `var.instance_type` in a resource → the resource `depends_on` the variable definition. `output "db_endpoint"` → consumed by another module via `module.db.db_endpoint` creates cross-module data flow.

**Provisioner chain** — `provisioner "local-exec" { command = "kubectl apply -f manifests/" }` → the resource's `provisions` edge extends to the provisioner's target. Provisioners bridge Terraform to external systems (K8s, config management, scripts).

## Summary Style

> "Terraform configuration provisioning N AWS resources including VPC, ECS cluster, and RDS instance."
> "Infrastructure module defining a reusable Kubernetes namespace with RBAC and network policies."
> "Variable definitions for N environment-specific settings (region, instance type, scaling)."
