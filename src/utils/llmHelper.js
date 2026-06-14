// src/utils/llmHelper.js
import Groq from 'groq-sdk'
import { triage, getMockTriage } from './triageCore.js'

const apiKey = import.meta.env.VITE_GROQ_API_KEY

if (import.meta.env.DEV && !apiKey) {
  console.warn(
    '[Relay AI] VITE_GROQ_API_KEY is missing — triage will use offline heuristic results. Add your key to .env.local.',
  )
}

const groq = apiKey
  ? new Groq({
      apiKey,
      dangerouslyAllowBrowser: true, // dev only — see README "Next steps" for the serverless fix
    })
  : null

/**
 * Triage a customer message in a single structured-output call.
 * @param {string} message
 * @returns {Promise<{category,urgency,confidence,reasoning,suggestedReply,tags,source}>}
 */
export async function triageMessage(message) {
  if (!groq) {
    return getMockTriage(message)
  }

  try {
    return await triage(message, { client: groq })
  } catch (error) {
    console.warn('Groq call failed, using deterministic fallback:', error.message)
    return getMockTriage(message)
  }
}
