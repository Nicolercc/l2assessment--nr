import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPT, MODEL, CATEGORIES } from '../src/utils/prompt.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cases = JSON.parse(readFileSync(join(__dirname, 'cases.json'), 'utf-8'))

const apiKey = process.env.VITE_GROQ_API_KEY
if (!apiKey) {
  console.error('Missing VITE_GROQ_API_KEY — set it in .env.local')
  process.exit(1)
}

const groq = new Groq({ apiKey })

function normalize(obj) {
  const category = CATEGORIES.includes(obj.category) ? obj.category : 'General Inquiry'
  const urgency = ['High', 'Medium', 'Low'].includes(obj.urgency) ? obj.urgency : 'Medium'
  return { category, urgency }
}

async function triage(message) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
  })
  const raw = response.choices[0]?.message?.content ?? '{}'
  return normalize(JSON.parse(raw))
}

console.log('\nRelay AI — Triage Eval Harness\n')
console.log('─'.repeat(72))

let urgencyCorrect = 0
let categoryCorrect = 0

for (const c of cases) {
  const result = await triage(c.message)
  const uOk = result.urgency === c.expectedUrgency
  const catOk = result.category === c.expectedCategory
  if (uOk) urgencyCorrect++
  if (catOk) categoryCorrect++

  const preview = c.message.length > 40 ? c.message.slice(0, 40) + '…' : c.message
  console.log(
    `${uOk && catOk ? '✓' : '✗'} "${preview}"`,
  )
  console.log(
    `    urgency: ${result.urgency} (expected ${c.expectedUrgency}) ${uOk ? '✓' : '✗'}`,
  )
  console.log(
    `    category: ${result.category} (expected ${c.expectedCategory}) ${catOk ? '✓' : '✗'}`,
  )
}

console.log('─'.repeat(72))
console.log(`\nUrgency: ${urgencyCorrect}/${cases.length} · Category: ${categoryCorrect}/${cases.length}\n`)
