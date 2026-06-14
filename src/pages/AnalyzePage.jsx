import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion as Motion } from 'framer-motion'
import { triageMessage } from '../utils/llmHelper'
import { getRecommendedAction, shouldEscalate, getAvailableCategories } from '../utils/templates'
import { readHistory, writeHistory, readExampleMessage, clearExampleMessage } from '../utils/storage'
import UrgencyTag from '../components/UrgencyTag'

const MESSAGE_MAX = 4000
const MESSAGE_WARN = 3800
const MESSAGE_INPUT_ID = 'customer-message'

function AnalyzePage() {
  const [message, setMessage] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [replyCopied, setReplyCopied] = useState(false)

  useEffect(() => {
    const exampleMessage = readExampleMessage()
    if (exampleMessage) {
      setMessage(exampleMessage.slice(0, MESSAGE_MAX))
      clearExampleMessage()
    }
  }, [])

  const updateHistoryEntry = (updatedResult) => {
    const history = readHistory()
    const idx = history.findIndex((h) => h.timestamp === updatedResult.timestamp)
    if (idx !== -1) {
      history[idx] = updatedResult
      writeHistory(history)
    }
  }

  const handleCategoryOverride = (newCategory) => {
    if (!results) return
    const updated = {
      ...results,
      category: newCategory,
      corrected: true,
      recommendedAction: getRecommendedAction(newCategory, results.urgency),
      escalate: shouldEscalate(newCategory, results.urgency),
    }
    setResults(updated)
    updateHistoryEntry(updated)
  }

  const handleAnalyze = async () => {
    const trimmed = message.trim()
    if (!trimmed) {
      setEmptyError(true)
      return
    }
    if (message.length > MESSAGE_MAX) {
      return
    }
    setEmptyError(false)
    setIsLoading(true)
    setResults(null)

    try {
      const triage = await triageMessage(trimmed)
      const recommendedAction = getRecommendedAction(triage.category, triage.urgency)
      const escalate = shouldEscalate(triage.category, triage.urgency)
      const analysisResult = {
        message: trimmed,
        category: triage.category,
        urgency: triage.urgency,
        confidence: triage.confidence,
        reasoning: triage.reasoning,
        suggestedReply: triage.suggestedReply,
        tags: triage.tags,
        source: triage.source,
        recommendedAction,
        escalate,
        corrected: false,
        timestamp: new Date().toISOString(),
      }
      setResults(analysisResult)

      const history = readHistory()
      history.push(analysisResult)
      writeHistory(history)
    } catch (error) {
      console.error('Error analyzing message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessage('')
    setResults(null)
    setEmptyError(false)
  }

  const handleMessageChange = (value) => {
    setMessage(value.slice(0, MESSAGE_MAX))
    if (emptyError) setEmptyError(false)
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleAnalyze()
    }
  }

  const handleCopyResults = () => {
    if (!results) return
    const text = `Category: ${results.category}\nUrgency: ${results.urgency}\nConfidence: ${Math.round(results.confidence * 100)}%\nRecommendation: ${results.recommendedAction}\n\nReasoning: ${results.reasoning}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyReply = () => {
    if (!results?.suggestedReply) return
    navigator.clipboard.writeText(results.suggestedReply)
    setReplyCopied(true)
    setTimeout(() => setReplyCopied(false), 2000)
  }

  const nearCap = message.length >= MESSAGE_WARN
  const atCap = message.length >= MESSAGE_MAX

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-surface rounded-card shadow-card border border-line p-6 mb-6">
          <h1 className="font-display text-3xl text-ink mb-2">Analyze Customer Message</h1>
          <p className="text-muted text-sm mb-6">
            Paste a customer support message below to automatically categorize and prioritize.
          </p>

          <div className="mb-4">
            <label htmlFor={MESSAGE_INPUT_ID} className="block text-sm font-medium text-ink mb-2">
              Customer Message
            </label>
            <textarea
              id={MESSAGE_INPUT_ID}
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste customer message here..."
              className="w-full border border-line rounded-control p-3 h-40 focus:ring-2 focus:ring-brand/30 focus:border-brand bg-paper text-ink"
              disabled={isLoading}
            />
            {emptyError && (
              <p className="text-sm text-high mt-1">Please enter a message to analyze.</p>
            )}
            <div className={`text-sm mt-1 font-mono ${nearCap ? 'text-med' : 'text-muted'}`}>
              {message.length} / {MESSAGE_MAX} characters
              {atCap && <span className="ml-2">— maximum length reached</span>}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || atCap}
              aria-busy={isLoading}
              className={`flex-1 py-3 rounded-control font-medium transition-colors ${
                isLoading || atCap
                  ? 'bg-line text-muted cursor-not-allowed'
                  : 'bg-brand text-white hover:bg-brand-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Message'
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="px-6 py-3 border border-line rounded-control font-medium text-muted hover:text-ink hover:bg-paper transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {results && (
          <Motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-card shadow-card border border-line p-6"
            aria-live="polite"
            aria-atomic="true"
          >
            {results.source === 'mock' && (
              <div className="mb-4 border border-med/30 bg-med-bg text-med px-4 py-3 rounded-control text-sm">
                Showing offline heuristic results — live AI was unavailable.
              </div>
            )}

            {results.escalate && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.85, 1] }}
                transition={{ duration: 2, repeat: 1 }}
                className="mb-4 border-2 border-high bg-high-bg text-high px-4 py-3 rounded-control font-medium text-sm"
              >
                ⚡ Escalate — respond within 1 hour
              </Motion.div>
            )}

            <h2 className="font-display text-2xl text-ink mb-4">Analysis Results</h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted mb-1">Category</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block bg-brand-50 text-brand px-4 py-2 rounded-full font-medium text-sm">
                    {results.category}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    {Math.round(results.confidence * 100)}%
                  </span>
                  <div className="w-20 h-2 bg-paper rounded-full overflow-hidden border border-line">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${results.confidence * 100}%` }}
                      className="h-full bg-brand rounded-full"
                    />
                  </div>
                  {results.confidence < 0.6 && (
                    <span className="text-xs text-med bg-med-bg px-2 py-1 rounded-full">
                      Low confidence — review
                    </span>
                  )}
                  <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                    results.source === 'ai' ? 'bg-brand-50 text-brand' : 'bg-paper text-muted border border-line'
                  }`}>
                    {results.source === 'ai' ? 'AI' : 'Offline'}
                  </span>
                  {results.corrected && (
                    <span className="text-xs text-muted">✎ Corrected by agent</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted mb-1">Override Category</div>
                <select
                  value={results.category}
                  onChange={(e) => handleCategoryOverride(e.target.value)}
                  className="border border-line rounded-control px-3 py-2 text-sm bg-paper text-ink"
                >
                  {getAvailableCategories().map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-sm font-medium text-muted mb-1">Urgency Level</div>
                <UrgencyTag level={results.urgency} />
              </div>

              {results.tags?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted mb-1">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map((tag) => (
                      <span key={tag} className="text-xs font-mono bg-paper border border-line text-muted px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted mb-1">Recommended Action</div>
                <div className="bg-brand-50 border border-brand/20 rounded-control p-4">
                  <p className="text-ink text-sm">{results.recommendedAction}</p>
                </div>
              </div>

              {results.suggestedReply && (
                <div>
                  <div className="text-sm font-medium text-muted mb-1">Suggested Reply</div>
                  <div className="bg-low-bg border border-low/20 rounded-control p-4">
                    <p className="text-ink text-sm mb-3">{results.suggestedReply}</p>
                    <button
                      onClick={handleCopyReply}
                      className="text-sm bg-surface border border-line px-3 py-1 rounded-control hover:bg-paper text-muted"
                    >
                      {replyCopied ? 'Copied ✓' : 'Copy reply'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted mb-1">AI Reasoning</div>
                <div className="bg-paper border border-line rounded-control p-4">
                  <div className="prose prose-sm max-w-none text-ink">
                    <ReactMarkdown>{results.reasoning}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-line">
              <button
                onClick={handleCopyResults}
                className="bg-paper border border-line text-muted px-4 py-2 rounded-control hover:text-ink font-medium text-sm transition-colors"
              >
                {copied ? 'Copied ✓' : 'Copy Results'}
              </button>
            </div>
          </Motion.div>
        )}
      </div>
    </div>
  )
}

export default AnalyzePage
