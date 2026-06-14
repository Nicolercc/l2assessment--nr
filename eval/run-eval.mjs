import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Groq from 'groq-sdk'
import { triage } from '../src/utils/triageCore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cases = JSON.parse(readFileSync(join(__dirname, 'cases.json'), 'utf-8'))

const apiKey = process.env.VITE_GROQ_API_KEY
if (!apiKey) {
  console.error('Missing VITE_GROQ_API_KEY — set it in .env.local')
  process.exit(1)
}

const groq = new Groq({ apiKey })

console.log('\nRelay AI — Triage Eval Harness\n')
console.log('─'.repeat(72))

let urgencyCorrect = 0
let categoryCorrect = 0
const correctConfidences = []
const wrongConfidences = []

for (const c of cases) {
  const result = await triage(c.message, { client: groq })
  const uOk = result.urgency === c.expectedUrgency
  const catOk = result.category === c.expectedCategory
  if (uOk) urgencyCorrect++
  if (catOk) categoryCorrect++

  if (catOk) correctConfidences.push(result.confidence)
  else wrongConfidences.push(result.confidence)

  const preview = c.message.length > 40 ? c.message.slice(0, 40) + '…' : c.message
  console.log(`${uOk && catOk ? '✓' : '✗'} "${preview}"`)
  console.log(`    urgency: ${result.urgency} (expected ${c.expectedUrgency}) ${uOk ? '✓' : '✗'}`)
  console.log(`    category: ${result.category} (expected ${c.expectedCategory}) ${catOk ? '✓' : '✗'}`)
}

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

console.log('─'.repeat(72))
console.log(`\nUrgency: ${urgencyCorrect}/${cases.length} · Category: ${categoryCorrect}/${cases.length}`)
console.log(
  `Confidence — correct: ${avg(correctConfidences).toFixed(2)} · wrong: ${avg(wrongConfidences).toFixed(2)}\n`,
)
