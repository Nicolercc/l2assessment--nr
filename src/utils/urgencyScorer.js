// src/utils/urgencyScorer.js
// Deterministic fallback urgency. No clock dependence. Judges by signal words, not formatting.

const HIGH_SIGNALS = [
  'down', 'outage', 'cannot access', "can't access", 'cant access', 'not working',
  'broken', 'crash', 'data loss', 'lost data', 'double charged', 'charged twice',
  'urgent', 'asap', 'immediately', 'emergency', 'security', 'breach', 'hacked',
  'losing', 'lawsuit', 'legal', 'cancel my', 'refund now',
]
const MEDIUM_SIGNALS = [
  'error', 'bug', 'issue', 'problem', 'failed', 'slow', 'timeout', 'loading',
  'payment', 'billing', 'charge', 'invoice', 'account',
]
const LOW_SIGNALS = [
  'thank', 'thanks', 'appreciate', 'love', 'great', 'feature', 'suggestion',
  'wish', 'would love', 'question', 'how do i', 'business hours',
]

export function estimateUrgencyFallback(message) {
  const m = (message || '').toLowerCase()
  const hit = (list) => list.some((w) => m.includes(w))
  if (hit(HIGH_SIGNALS)) return 'High'
  if (hit(LOW_SIGNALS) && !hit(MEDIUM_SIGNALS)) return 'Low'
  if (hit(MEDIUM_SIGNALS)) return 'Medium'
  return 'Medium'
}
