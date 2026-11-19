# Minimal AI assistant plan

**Status:** Optional text-only Gemini backend implemented; UI is not connected yet. No model or runtime is installed locally.  
**Research checked:** 2026-11-05

Keep AI optional and incremental: one user-supplied question per request, no conversation memory, no workspace-wide retrieval, and no autonomous actions. Larger work must be split into small prompts by the user.

## Provider research

| Option | Current fit | Limits and privacy |
|---|---|---|
| **Gemini API free tier** | Current optional provider: `gemini-3.5-flash-lite`, called only from the local server. | Free access and quotas may change. Google says free-tier content may be used to improve products. Do not send confidential client data. |
| **Groq API** | Possible later adapter after a cost/privacy review. | Model and organization rate limits apply; exact limits are account-specific. Do not promise permanently free access. |

**Current behavior:** requests are disabled until `GEMINI_API_KEY` is configured in `.env`. Each request accepts one prompt of at most 2,000 characters and caps the response at 256 tokens. No imported profile, client record, or other workspace data is attached. The API status reports that prompts leave the device; show that notice before connecting a UI.

## Small first release

For now the backend returns text only. It must not publish, schedule, delete data, connect accounts, send messages, browse pages, access the workspace, run shell/SQL, or execute model-generated code. Do not add these capabilities without a separate reviewed design and explicit user confirmation.

## Safe execution flow

```text
One short user prompt
  -> input length and shape validation
  -> Gemini adapter (server-side key, short timeout, bounded output)
  -> concise text reply or explicit provider error
```

Never let model output call an API directly. Keep provider keys server-side, out of browser bundles, logs, and source control. Explain what data leaves the device before enabling a cloud provider.

## Modular target

```text
server/assistant/assistant-service.mjs
server/integrations/ai/gemini-adapter.mjs
server/routes/assistant-routes.mjs
```

Keep the UI in a feature-owned folder when it is implemented. Do not add a general-purpose agent framework, local model, Hermes runtime, or MCP server for this feature.

## Delivery phases

1. **Backend (done):** optional Gemini text endpoint, input/output limits, server-only key, origin checks, and explicit quota/configuration errors.
2. **UI (pending):** connect a small prompt/reply panel; display the external-data notice and let users split larger tasks.
3. **Evaluate:** verify provider terms, regional availability, key storage, data handling, rate limits, and costs before any broader release.
4. **Agency release (not approved):** tenant isolation, audit, retention/deletion, usage budgets, evaluations, and contract review before handling client data.

## Release checks

- No model response can trigger application actions or retrieve workspace data.
- The UI identifies provider use and data transfer before a prompt is sent.
- Requests remain optional, single-turn, text-only, and bounded; no local model is required.
- Provider errors, quotas, and unavailable models are visible; no fake or success-shaped fallback.
- Test common intents, ambiguous commands, prompt injection, denied permissions, provider outage, and user cancellation.

## Official sources

- [Ollama local and cloud API quickstart](https://docs.ollama.com/quickstart)
- [Ollama API endpoints](https://docs.ollama.com/api/introduction)
- [Gemini API pricing and free-tier data use](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API terms](https://aistudio.google.com/docs/terms)
- [Gemini API key handling](https://aistudio.google.com/docs/api-key)
- [Groq API rate limits](https://console.groq.com/docs/rate-limits)
