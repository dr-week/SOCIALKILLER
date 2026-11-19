# Architecture

The product target is an agency social operating system, not a scheduler-only app. The current code remains a local-first Vue/Node/SQLite modular monolith. The [MVP architecture plan](docs/research/MVP_ARCHITECTURE_PLAN.md) defines how to grow its module boundaries; hosted agency use requires authentication, workspace membership and authorization before launch.

See [the central architecture overview](docs/ARCHITECTURE.md) for module boundaries, runtime data flow, tenancy limits, and development rules.
