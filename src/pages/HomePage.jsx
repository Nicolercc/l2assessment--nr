import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import UrgencyTag from '../components/UrgencyTag'

function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('triageHistory') || '[]')
    const today = new Date().toDateString()
    const todayCount = history.filter(item =>
      new Date(item.timestamp).toDateString() === today
    ).length

    setStats({ total: history.length, today: todayCount })
    setRecentActivity(history.slice(-3).reverse())
  }, [])

  const tryExample = () => {
    const examples = [
      "Our payment failed and we can't access our account",
      "The dashboard is loading very slowly",
      "Can you add a dark mode feature?",
    ]
    const random = examples[Math.floor(Math.random() * examples.length)]
    localStorage.setItem('exampleMessage', random)
    navigate('/analyze')
  }

  return (
    <div className="min-h-screen bg-paper py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-display text-5xl text-ink mb-4 leading-tight">
            Triage every message in seconds
          </h1>
          <p className="text-lg text-muted font-sans mb-3">
            AI-powered message categorization and routing for customer support teams
          </p>
          <p className="text-sm text-muted max-w-2xl">
            Relay AI is a subscription-based customer operations platform that uses AI to categorize,
            prioritize, and route incoming customer messages for small businesses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface rounded-card shadow-card border border-line p-6">
            <div className="font-mono text-3xl font-medium text-ink">{stats.total}</div>
            <div className="text-sm text-muted mt-1">Total Messages Analyzed</div>
          </div>
          <div className="bg-surface rounded-card shadow-card border border-line p-6">
            <div className="font-mono text-3xl font-medium text-ink">{stats.today}</div>
            <div className="text-sm text-muted mt-1">Analyzed Today</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/analyze"
              className="block bg-brand text-white rounded-card shadow-card p-6 hover:bg-brand-600 transition-colors"
            >
              <svg className="w-6 h-6 mb-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              <div className="font-semibold mb-1">Analyze Message</div>
              <div className="text-sm text-white/80">Triage a new customer message</div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/history"
              className="block bg-surface rounded-card shadow-card border border-line p-6 hover:border-brand/30 transition-colors"
            >
              <svg className="w-6 h-6 mb-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              <div className="font-semibold text-ink mb-1">View History</div>
              <div className="text-sm text-muted">See past analyses</div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }}>
            <button
              onClick={tryExample}
              className="w-full text-left bg-surface rounded-card shadow-card border border-line p-6 hover:border-brand/30 transition-colors"
            >
              <svg className="w-6 h-6 mb-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <div className="font-semibold text-ink mb-1">Try Example</div>
              <div className="text-sm text-muted">Use a sample message</div>
            </button>
          </motion.div>
        </div>

        {recentActivity.length > 0 ? (
          <div className="bg-surface rounded-card shadow-card border border-line p-6">
            <h2 className="font-display text-2xl text-ink mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.timestamp} className="flex items-center justify-between py-3 border-b border-line last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-muted mb-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    <div className="text-ink truncate text-sm">
                      &ldquo;{item.message.substring(0, 60)}&hellip;&rdquo;
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-brand-50 text-brand px-2.5 py-1 rounded-full font-medium">
                        {item.category}
                      </span>
                      <UrgencyTag level={item.urgency} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-card shadow-card border border-line p-10 text-center">
            <div className="text-muted mb-4">No messages analyzed yet</div>
            <Link
              to="/analyze"
              className="inline-block bg-brand text-white px-6 py-2.5 rounded-control hover:bg-brand-600 font-medium transition-colors"
            >
              Analyze Your First Message
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
