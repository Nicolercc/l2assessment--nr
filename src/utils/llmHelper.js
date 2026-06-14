// src/utils/llmHelper.js
import Groq from 'groq-sdk'
import { SYSTEM_PROMPT, MODEL, CATEGORIES } from './prompt'
import { estimateUrgencyFallback } from './urgencyScorer'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // dev only — see README "Next steps" for the serverless fix
})

/**
 * Triage a customer message in a single structured-output call.
 * @param {string} message
 * @returns {Promise<{category,urgency,confidence,reasoning,suggestedReply,tags,source}>}
 */
export async function triageMessage(message) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0, // deterministic classification
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    })
    const raw = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)
    return normalize(parsed, 'ai')
  } catch (error) {
    console.warn('Groq call failed, using deterministic fallback:', error.message)
    return getMockTriage(message)
  }
}

// Guarantee a valid, UI-safe object no matter what the model returns.
function normalize(obj, source) {
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
    source, // 'ai' | 'mock'
  }
}

// Deterministic, MEANING-AWARE fallback (no clock dependence, no inverted rules).
function getMockTriage(message) {
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
  const confidence = 0.55 // mock is a heuristic — signal lower certainty honestly
  return normalize(
    {
      category,
      urgency,
      confidence,
      reasoning: 'Offline heuristic classification (AI unavailable).',
      suggestedReply: '',
      tags: [],
    },
    'mock',
  )
}
