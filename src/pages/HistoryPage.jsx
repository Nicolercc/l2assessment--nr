import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import UrgencyTag from '../components/UrgencyTag'
import { readHistory, writeHistory } from '../utils/storage'

function HistoryPage() {
  const [history, setHistory] = useState(() => readHistory())
  const [filter, setFilter] = useState('all')
  const [expandedTimestamp, setExpandedTimestamp] = useState(null)

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      writeHistory([])
      setHistory([])
      setExpandedTimestamp(null)
    }
  }

  const toggleExpanded = (timestamp) => {
    setExpandedTimestamp(expandedTimestamp === timestamp ? null : timestamp)
  }

  const handleRowKeyDown = (e, timestamp) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleExpanded(timestamp)
    }
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  const filteredHistory = filter === 'all'
    ? sortedHistory
    : sortedHistory.filter(item => item.category === filter)

  const categories = [...new Set(history.map(item => item.category))]

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-surface rounded-card shadow-card border border-line p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl text-ink">Analysis History</h1>
              <p className="text-muted text-sm mt-1">View and manage past message analyses</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="bg-high-bg text-high px-4 py-2 rounded-control hover:opacity-90 font-medium text-sm"
              >
                Clear All
              </button>
            )}
          </div>

          {history.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-control font-medium text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-brand text-white'
                    : 'bg-surface border border-line text-muted hover:text-ink'
                }`}
              >
                All ({history.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-control font-medium text-sm transition-colors ${
                    filter === category
                      ? 'bg-brand text-white'
                      : 'bg-surface border border-line text-muted hover:text-ink'
                  }`}
                >
                  {category} ({history.filter(h => h.category === category).length})
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredHistory.length === 0 && (
          <div className="bg-surface rounded-card shadow-card border border-line p-12 text-center">
            <div className="text-xl text-muted mb-2">No history yet</div>
            <p className="text-muted text-sm mb-6">Analyzed messages will appear here</p>
            <Link
              to="/analyze"
              className="inline-block bg-brand text-white px-6 py-3 rounded-control hover:bg-brand-600 font-medium"
            >
              Analyze a Message
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.timestamp}
              className="bg-surface rounded-card shadow-card border border-line overflow-hidden"
            >
              <div
                role="button"
                tabIndex={0}
                aria-expanded={expandedTimestamp === item.timestamp}
                className="p-4 cursor-pointer hover:bg-paper/50 transition-colors"
                onClick={() => toggleExpanded(item.timestamp)}
                onKeyDown={(e) => handleRowKeyDown(e, item.timestamp)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-xs text-muted mb-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    <div className="text-ink font-medium mb-2 text-sm">
                      &ldquo;{item.message.substring(0, 100)}{item.message.length > 100 ? '…' : ''}&rdquo;
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs bg-brand-50 text-brand px-2.5 py-1 rounded-full font-medium">
                        {item.category}
                      </span>
                      <UrgencyTag level={item.urgency} />
                      {item.corrected && (
                        <span className="text-xs text-muted">✎ Corrected</span>
                      )}
                      {item.source && (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          item.source === 'ai' ? 'bg-brand-50 text-brand' : 'bg-paper text-muted'
                        }`}>
                          {item.source === 'ai' ? 'AI' : 'Offline'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-muted ml-4 text-sm">
                    {expandedTimestamp === item.timestamp ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {expandedTimestamp === item.timestamp && (
                <div className="border-t border-line p-4 bg-paper/50">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">Full Message</div>
                      <div className="text-sm text-ink bg-surface p-3 rounded-control border border-line">
                        {item.message}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">Recommended Action</div>
                      <div className="text-sm text-ink bg-brand-50 p-3 rounded-control border border-brand/20">
                        {item.recommendedAction}
                      </div>
                    </div>
                    {item.suggestedReply && (
                      <div>
                        <div className="text-xs font-medium text-muted mb-1">Suggested Reply</div>
                        <div className="text-sm text-ink bg-surface p-3 rounded-control border border-line">
                          {item.suggestedReply}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">AI Reasoning</div>
                      <div className="bg-surface p-3 rounded-control border border-line">
                        <div className="prose prose-sm max-w-none text-ink">
                          <ReactMarkdown>{item.reasoning}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
