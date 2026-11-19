# Social publishing and agent repositories

**Reviewed:** 2026-11-05  
**Scope:** Human-approved content generation, publishing pipelines, and scheduled feed examples.

| Repository | Useful pattern | License signal | Decision |
|---|---|---|---|
| [personal-social-agent](https://github.com/ansaribilal14/personal-social-agent) | X/Threads editorial pipeline with deterministic checks, explicit human approval, idempotent outbox, kill switch, audit trail, and CI orchestration. Python + GitHub Actions + Discord + Buffer. | MIT | **Pulled** to [`research/third_party/personal-social-agent`](../../../research/third_party/personal-social-agent). Best reference in this batch for approval/version binding, retries, and kill-switch behavior. Study the small domain patterns; do not adopt its Buffer integration as a universal adapter. |
| [mellumo](https://github.com/dodamworks/mellumo) | Agent-driven automation built as a derivative of Postiz. Its README says it starts from Postiz v2.25.3, is in foundation stage, and retains upstream app features. | AGPL-3.0 derivative | **Do not pull.** Postiz is already present in the research snapshots; this adds license and maintenance surface without a clear separate feature advantage. Track its agent approach as a reference only. |
| [scalepilot-autopost](https://github.com/nikopastore/scalepilot-autopost) | Scheduled AI-generated niche content, duplicate detection, platform-specific RSS, and GitHub Actions. | MIT | **Pulled** to [`research/third_party/scalepilot-autopost`](../../../research/third_party/scalepilot-autopost). Reusable idea: a content-feed adapter can decouple generation from publishing. The repository is hard-coded for recruitment content and auto-generates daily posts; do not use it for client content without per-client inputs, review, and approval. |

## Pull records

- `personal-social-agent`: commit `88541f832e395f92d3566b6eb4d30c4382c7a5bd`.
- `scalepilot-autopost`: commit `e79e6572e406ee8066c5e1ce662c68753ea77b01`.

The snapshots are reference code only. No third-party dependencies were installed and no workflows were run.
