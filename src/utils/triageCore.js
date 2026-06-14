// src/utils/triageCore.js
// Shared inference boundary — used by browser app and Node eval (no env/client construction here).
import { SYSTEM_PROMPT, MODEL, CATEGORIES } from './prompt.js'
import { estimateUrgencyFallback } from './urgencyScorer.js'

/** Guarantee a valid, UI-safe object no matter what the model returns. */
export function normalize(obj, source) {
  const category = CATEGORIES.includes(obj.category) ? obj.category : 'General Inquiry'
  const urgency = ['High', 'Medium', 'Low'].includes(obj.urgency) ? obj.urgency : 'Medium'
  const confidence =
    typeof obj.confidence === 'number' ? Math.min(1, Math.max(0, obj.confidence)) : 0.5
  return {
    category,
    urgency,
    confidence,
    reasoning: String(obj.reasoning || 'No reasoning returned.'),
    suggestedReply: String(obj.suggestedReply || ''),
    tags: Array.isArray(obj.tags) ? obj.tags.slice(0, 3).map(String) : [],
    source,
  }
}

/** Deterministic, meaning-aware fallback (no clock dependence, no inverted rules). */
export function getMockTriage(message) {
  const m = message.toLowerCase()
  const has = (...words) => words.some((w) => m.includes(w))

  let category = 'General Inquiry'
  if (has('refund', 'invoice', 'charge', 'billing', 'payment', 'card', 'subscription', 'plan'))
    category = 'Billing Issue'
  else if (has('bug', 'error', 'down', 'broken', 'crash', "can't access", 'not working', 'loading', 'timeout'))
    category = 'Technical Problem'
  else if (has('add', 'feature', 'would love', 'suggestion', 'wish', 'export', 'dark mode'))
    category = 'Feature Request'
  else if (has('cancel', 'delete account', 'change email', 'upgrade', 'downgrade'))
    category = 'Account Management'
  else if (has('thank', 'love', 'amazing', 'great work', 'awesome') && !has('but', 'however', 'issue'))
    category = 'Positive Feedback'

  const urgency = estimateUrgencyFallback(message)
  return normalize(
    {
      category,
      urgency,
      confidence: 0.55,
      reasoning: 'Offline heuristic classification (AI unavailable).',
      suggestedReply: '',
      tags: [],
    },
    'mock',
  )
}

/**
 * Run a single structured-output triage call via the provided Groq client.
 * @param {string} message
 * @param {{ client: import('groq-sdk').Groq }} options
 */
export async function triage(message, { client }) {
  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
  })
  const raw = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)
  return normalize(parsed, 'ai')
}
