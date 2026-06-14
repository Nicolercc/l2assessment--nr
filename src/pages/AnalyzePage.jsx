import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { triageMessage } from '../utils/llmHelper'
import { getRecommendedAction, shouldEscalate, getAvailableCategories } from '../utils/templates'
import UrgencyTag from '../components/UrgencyTag'

function AnalyzePage() {
  const [message, setMessage] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [replyCopied, setReplyCopied] = useState(false)

  useEffect(() => {
    const exampleMessage = localStorage.getItem('exampleMessage')
    if (exampleMessage) {
      setMessage(exampleMessage)
      localStorage.removeItem('exampleMessage')
    }
  }, [])

  const updateHistoryEntry = (updatedResult) => {
    const history = JSON.parse(localStorage.getItem('triageHistory') || '[]')
    const idx = history.findIndex((h) => h.timestamp === updatedResult.timestamp)
    if (idx !== -1) {
      history[idx] = updatedResult
      localStorage.setItem('triageHistory', JSON.stringify(history))
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
    if (!message.trim()) {
      setEmptyError(true)
      return
    }
    setEmptyError(false)
    setIsLoading(true)
    setResults(null)

    try {
      const triage = await triageMessage(message)
      const recommendedAction = getRecommendedAction(triage.category, triage.urgency)
      const escalate = shouldEscalate(triage.category, triage.urgency)
      const analysisResult = {
        message,
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

      const history = JSON.parse(localStorage.getItem('triageHistory') || '[]')
      history.push(analysisResult)
      localStorage.setItem('triageHistory', JSON.stringify(history))
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

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-surface rounded-card shadow-card border border-line p-6 mb-6">
          <h1 className="font-display text-3xl text-ink mb-2">Analyze Customer Message</h1>
          <p className="text-muted text-sm mb-6">
            Paste a customer support message below to automatically categorize and prioritize.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-ink mb-2">
              Customer Message
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (emptyError) setEmptyError(false)
              }}
              placeholder="Paste customer message here..."
              className="w-full border border-line rounded-control p-3 h-40 focus:ring-2 focus:ring-brand/30 focus:border-brand bg-paper text-ink"
              disabled={isLoading}
            />
            {emptyError && (
              <p className="text-sm text-high mt-1">Please enter a message to analyze.</p>
            )}
            <div className="text-sm text-muted mt-1 font-mono">
              {message.length} characters
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-control font-medium transition-colors ${
                isLoading
                  ? 'bg-line text-muted cursor-not-allowed'
                  : 'bg-brand text-white hover:bg-brand-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-card shadow-card border border-line p-6"
          >
            {results.escalate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.85, 1] }}
                transition={{ duration: 2, repeat: 1 }}
                className="mb-4 border-2 border-high bg-high-bg text-high px-4 py-3 rounded-control font-medium text-sm"
              >
                ⚡ Escalate — respond within 1 hour
              </motion.div>
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
                    <motion.div
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
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AnalyzePage
