---
name: The Social Base modular code rules
description: "Apply when creating or modifying The Social Base source. Keep feature boundaries clear, split oversized files by responsibility, and preserve behavior."
applyTo:
  - "src/**"
  - "server/**"
  - "extension/**"
  - "scripts/**"
  - "launcher/**"
  - "android/app/src/**"
  - "src-tauri/**"
---

# Modular source rules

- Follow the ownership and dependency flow in `docs/engineering/MODULARIZATION_BLUEPRINT.md`.
- Target 100–120 lines per source/test file; keep every source and test file below 150 lines.
- Before a file reaches 150 lines, split its contents into cohesive modules by responsibility. Existing oversized files are violations and must be reduced; no baseline exception applies.
- Keep UI, HTTP mapping, use cases/domain rules, persistence, provider adapters, and native hosts in their own departments.
- Do not import another feature's internal files. Add a public contract only for real cross-feature use.
- Use role-based kebab-case module names; keep Vue component names in PascalCase.
- Add focused tests and visible failure handling. Do not silently report connected, published, or saved when the operation failed.
- Before a broad refactor, run `npm run modularity:audit`; then work on one vertical slice and verify it before moving on.
