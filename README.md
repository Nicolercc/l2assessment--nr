# Relay AI — Customer Inbox Triage

## What this is

Relay AI is a customer-support triage tool that classifies incoming messages, assigns urgency, and recommends next steps in a single structured AI call. Agents see a confidence score, can override the category (human-in-the-loop), and get escalation guidance when a message needs a fast response. Built as a React + Vite frontend with a Groq-powered triage engine, unit tests, CI, and a drift-proof eval harness.

## Run it

**Prerequisites:** Node.js 20.6+ (for `npm run eval` with `--env-file`), npm, a free [Groq API key](https://console.groq.com/keys).

```bash
npm install
cp .env.example .env.local   # add VITE_GROQ_API_KEY=gsk_...
npm run dev                  # http://localhost:5173
npm run test                 # unit tests (no network)
npm run eval                 # scored eval against 8 labeled cases (calls Groq)
```

Other scripts: `npm run lint`, `npm run build`, `npm run test:watch`.

**CI:** GitHub Actions runs lint, test, and build on every push/PR to `main`. On push to `main`, a separate eval job runs if the `GROQ_API_KEY` repository secret is set (mapped to `VITE_GROQ_API_KEY` in the workflow).

## What I changed and why

- **Structured single-call engine** — Replaced free-form LLM output + keyword guessing + inverted urgency rules with one `temperature: 0` JSON-mode call via `src/utils/triageCore.js` and a shared prompt contract in `src/utils/prompt.js`.
- **Deterministic, meaning-aware urgency** — Urgency is judged by signal words and meaning in the prompt and fallback scorer, not message length, punctuation, or time of day.
- **Confidence + agent override** — Analyze page shows confidence, source badge (AI vs Offline), and a category override that recomputes recommendations and persists corrections to history.
- **Policy-driven escalation and recommendations** — `templates.js` maps categories to actions; high urgency prepends SLA language; escalation is driven by urgency/category, not message length.
- **"Signal" design system** — Iris brand accent, semantic urgency colors with icon + label, Instrument Serif / Inter / JetBrains Mono, warm paper surfaces.
- **Unit tests** — 13 Vitest tests cover urgency fallback, recommendations, escalation, `normalize`, and mock triage with zero network calls.
- **Drift-proof eval** — `eval/run-eval.mjs` imports the same `triage()` function as the browser app (not a duplicated Groq call). Score: **8/8 urgency · 8/8 category** on the provided test set (up from ~3/8 with the original inverted rules).
- **Robustness polish** — Guarded `localStorage` reads via `storage.js`, 4000-char input cap, 404 route, offline-mode banner, accessibility quick wins on Analyze and History.

## Architecture & next steps (production)

This repo is intentionally a **local-first assessment frontend**. A production deployment would need:

**Serverless proxy** — Move the Groq key off the browser with a single API route (e.g. Vercel/Cloudflare Worker). Apply **PII redaction** (emails, card numbers, account IDs) and a **retention policy** at that boundary before any text reaches the model.

**Integrate, don't rebuild** — Write triage results (priority, tags, suggested assignee) back into the helpdesk the business already uses (Zendesk, Intercom, Freshdesk) via their APIs. The product wins by fitting the existing inbox, not replacing it.

**Multi-label taxonomy** — Real messages are often hybrid ("billing question + bug report"). A primary-intent label plus optional secondary tags would reduce forced misclassification.

**Confidence calibration** — Track override rate by confidence bin before using low-confidence scores to auto-route or auto-close. The eval harness already prints avg confidence for correct vs wrong predictions as a calibration seed.

**Closed correction loop** — Agent overrides should append to a versioned eval set; prompt or few-shot updates should be **eval-gated** so improvements cannot silently regress the 8-case (and expanded) golden sets in CI.

## License

Educational / assessment purposes only.
