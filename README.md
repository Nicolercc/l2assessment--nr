# Relay AI — Customer Inbox Triage

## Overview

Relay AI promises to *categorize, prioritize, and route* support messages. This app is a lightweight AI-powered triage tool for customer support teams. It uses a single schema-constrained Groq LLM call to classify messages, applies urgency-aware escalation and recommendation logic, and gives agents confidence scores with one-click override (human-in-the-loop).

## Problem Statement

Support teams waste time manually reading and triaging customer messages. This tool provides an automated first pass at classification to help prioritize and route messages more efficiently — with transparency so agents can trust and correct the AI.

## Tech Stack

- **Frontend**: React 19 + Vite 7 + Tailwind CSS 3.4 + Framer Motion
- **AI**: Groq API (Llama 3.3 70B — free tier), structured JSON output
- **Routing**: React Router 7
- **Persistence**: localStorage (dev/assessment scope)
- **Eval**: Node eval harness (`npm run eval`)

## Setup Instructions

### Prerequisites

- Node.js 20.6+ (for `--env-file` in eval script)
- npm
- Groq API key (free — get from https://console.groq.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd l2assessment--nr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Groq API Key**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Groq API key:
   ```
   VITE_GROQ_API_KEY=gsk_your-actual-key-here
   ```

   Get your free API key from: https://console.groq.com/keys

4. **Run the application**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

5. **Run the eval harness**
   ```bash
   npm run eval
   ```

## How It Works

1. **Paste Message**: User pastes a customer support message into the text area
2. **Analyze**: Click "Analyze Message" to process the input
3. **Single Triage Call**: One structured LLM call returns category, urgency, confidence, reasoning, suggested reply, and tags
4. **Recommendations**: Template-based actions are urgency-aware; high-urgency items trigger escalation
5. **Human-in-the-Loop**: Agents can override category; corrections persist to history
6. **History**: All analyses are saved to localStorage and viewable in the History tab

## What I Changed and Why

### 1. Structured-output triage engine

**Before:** Free-form LLM prompt + string-matching (`content.includes('billing')`) and an inverted rule-based urgency scorer (short messages, ALL CAPS, and questions *lowered* urgency; every `!` added 30 points; clock-dependent weekend/time rules).

**After:** Single `triageMessage()` call with `temperature: 0`, `response_format: { type: 'json_object' }`, and a shared system prompt in `src/utils/prompt.js`. Returns category, urgency, confidence, reasoning, suggested reply, and tags in one pass. Deterministic mock fallback when the API is unavailable.

### 2. Confidence + agent override (human-in-the-loop)

The Analyze page shows a confidence score with a visual bar, source badge (AI vs Offline), and a category override dropdown. When an agent corrects a label, `corrected: true` is set and the recommendation/escalation logic recomputes. This earns trust instead of hiding uncertainty.

### 3. Fixed escalation and recommendation logic

**Before:** Feature requests mapped to "check billing portal"; `getRecommendedAction` ignored urgency; `shouldEscalate` checked `message.length > 100` and was never called.

**After:** Category-specific action templates, urgency-prefixed high-priority responses, and real escalation driven by urgency level and billing sensitivity.

### 4. "Signal" design system redesign

Replaced default blue Tailwind with a calm operations aesthetic:

- **Brand accent:** iris `#5B57E8` only for branding; red/amber/green reserved for urgency semantics
- **Typography:** Instrument Serif (display), Inter (UI), JetBrains Mono (tags/IDs)
- **Surface:** warm paper `#FBFBF9`, soft card shadows, 16px radius
- **Accessibility:** urgency tags always include icon + label (never color alone)
- **Motion:** Framer Motion for results entrance, confidence bar, escalation pulse

### 5. Eval harness

`eval/run-eval.mjs` scores the engine against 8 labeled test cases from `eval/cases.json`. Run with `npm run eval`.

**Score: Urgency 8/8 · Category 8/8** (up from ~3/8 with the old inverted urgency rules on the provided test set).

## Example Test Messages

Try analyzing these messages:

- `Our production server is down` → Technical Problem, High
- `Thank you for your amazing customer service!` → Positive Feedback, Low
- `Can you add a dark mode feature?` → Feature Request, Low
- `My payment failed and I can't access the dashboard` → Billing Issue, High
- `What are your business hours?` → General Inquiry, Low

## Security Note

⚠️ **Warning**: This application exposes the Groq API key in the browser (`dangerouslyAllowBrowser: true`). This is acceptable for local development only but should **never** be done in production.

## Next Steps

- **Serverless proxy**: Deploy a single Vercel/Netlify serverless function to hold the Groq API key server-side — the real production security fix.
- **Shared persistence + routing**: Move from per-browser localStorage to Supabase/Postgres so triage is a team tool with actual agent/queue routing.
- **Feedback loop**: Agent overrides captured in history become training/eval data — the flywheel that improves triage over time.

## Why Groq?

- Completely free — no credit card required
- Fast inference via Groq LPU
- Generous limits (~14,400 requests/day on free tier)
- High quality with Llama 3.3 70B
- Easy signup at https://console.groq.com

## License

This project is for educational purposes only.
