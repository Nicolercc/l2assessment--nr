// src/utils/prompt.js
// Single source of truth for the triage contract (used by app + eval).

export const CATEGORIES = [
  'Billing Issue',
  'Technical Problem',
  'Feature Request',
  'General Inquiry',
  'Account Management',
  'Positive Feedback',
]

export const URGENCY_LEVELS = ['High', 'Medium', 'Low']

export const MODEL = 'llama-3.3-70b-versatile'

export const SYSTEM_PROMPT = `You are the triage engine for Relay AI, a customer-support tool for small businesses.
Classify ONE customer message and return STRICT JSON. No prose, no markdown, JSON only.

Schema:
{
  "category": one of ${JSON.stringify(CATEGORIES)},
  "urgency": "High" | "Medium" | "Low",
  "confidence": number between 0 and 1 (your certainty in the category),
  "reasoning": ONE short sentence in plain text explaining the call,
  "suggestedReply": ONE or TWO sentences the agent could send back,
  "tags": array of 1-3 short lowercase keywords
}

Urgency rules (judge by MEANING, not formatting):
- HIGH: outage / "down" / cannot access / data loss / double-charged / failed payment blocking work / security / legal / threatening to cancel / explicit time pressure. Short messages CAN be high ("server down now").
- MEDIUM: a real problem that is not blocking, ambiguous issues, account changes.
- LOW: questions answerable from docs, feature requests, thanks / positive feedback.
Never lower urgency just because a message is short, polite, capitalized, or contains "!".
Never raise urgency just because of exclamation marks or ALL CAPS alone.
If the message is genuine praise with no request, category = "Positive Feedback", urgency = "Low".`
