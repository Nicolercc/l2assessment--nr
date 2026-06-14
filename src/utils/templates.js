// src/utils/templates.js
const actionTemplates = {
  'Billing Issue': 'Verify the account, then resolve via the billing portal or issue a correction.',
  'Technical Problem': 'Reproduce the issue, check system status, and open an engineering ticket if confirmed.',
  'Feature Request': 'Thank the user and log this in the product feedback board.',
  'General Inquiry': 'Answer directly or share the relevant help-center article.',
  'Account Management': 'Confirm identity, then process the account change requested.',
  'Positive Feedback': 'Acknowledge warmly. No action required.',
}

export function getRecommendedAction(category, urgency) {
  const base = actionTemplates[category] || 'Review manually.'
  if (urgency === 'High') return `⚡ Respond within 1 hour. ${base}`
  return base
}

export function getAvailableCategories() {
  return Object.keys(actionTemplates)
}

// Real escalation: driven by urgency + sensitive categories, NOT message length.
export function shouldEscalate(category, urgency) {
  if (urgency === 'High') return true
  if (category === 'Billing Issue' && urgency === 'Medium') return true
  return false
}
