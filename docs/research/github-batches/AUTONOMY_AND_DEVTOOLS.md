# Autonomy and developer-tool repositories

**Reviewed:** 2026-11-05  
**Scope:** Social browser automation, agent runtimes, and browser evaluation tooling.

| Repository | Summary | License signal | Decision |
|---|---|---|---|
| [PatrickMihalcea/SocialMediaAutomation](https://github.com/PatrickMihalcea/SocialMediaAutomation) | Scripts for automatic Instagram/TikTok media upload, with Python setup and tests. | No license detected in the repository page. | **Do not pull or reuse.** Browser-based account automation is not our supported publishing boundary; reuse rights are also unclear. |
| [hot-dev/hot](https://github.com/hot-dev/hot) | Apache-2.0 workflow language/runtime for events, schedules, agents, MCP tools, and long-running tasks. | Apache-2.0. | **Do not embed.** It introduces a separate compiler/runtime and duplicates our Node scheduler and job direction. Revisit only if a real workflow-runtime gap appears. |
| [hcipengm/cogneva](https://github.com/hcipengm/cogneva) | Distributed, long-running multi-agent platform in Rust. Its README says namespace partitioning is not authorization. | Modified MIT with an attribution-display requirement above stated scale thresholds. | **Do not embed.** Large architecture mismatch, autonomous behavior exceeds first-release scope, and the license has an additional condition to review. |
| [lexmount/browser-eval](https://github.com/lexmount/browser-eval) | Apache-2.0 harness for comparing web fetch/search/browser trajectory tools with reproducible evaluation reports. | Apache-2.0. | **Optional QA reference, not an app dependency.** It evaluates agent/browser tools rather than replacing our UI acceptance checks. Do not add its Python runtime until we adopt browser-agent evaluation. |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent/tree/d914e2334466d8e71dfa45da43fe7e48c7675ec7) | General-purpose agent with terminal/tool access, MCP clients, persistent memory, scheduled jobs, messaging integrations, and Windows support in the reviewed revision. | MIT, per the repository README and license. | **Do not embed or install in this pass.** Consider only as an isolated development tool after choosing a model/provider and tightly limiting workspace, shell, network, and credential access. Never connect it to live publishing credentials. |

The app should keep automated source checks and authorized-provider API checks separate from any browser-agent evaluation. Never use an evaluation harness to authorize unattended actions against customer social accounts.

Hermes is a tool candidate, not an implementation dependency or the product assistant. Its breadth exceeds the [minimal assistant plan](../../product/AI_ASSISTANT_PLAN.md); the current `/api/marketing/ai-catalog` is discovery metadata, not an MCP transport. Reassess after the provider and tool-permission decisions are recorded.
