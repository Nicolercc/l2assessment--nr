import { useState } from 'react'
import UrgencyTag from '../components/UrgencyTag'
import { readHistory } from '../utils/storage'

function buildDashboardData() {
  const history = readHistory()
  const today = new Date().toDateString()
  const todayMessages = history.filter(item =>
    new Date(item.timestamp).toDateString() === today
  )

  const distinctDays = new Set(
    history.map(item => new Date(item.timestamp).toDateString())
  )
  const daySpan = Math.max(distinctDays.size, 1)
  const highUrgency = history.filter(h => h.urgency === 'High').length

  const categories = {}
  history.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1
  })

  const urgency = { High: 0, Medium: 0, Low: 0 }
  history.forEach(item => {
    urgency[item.urgency] = (urgency[item.urgency] || 0) + 1
  })

  return {
    stats: {
      total: history.length,
      today: todayMessages.length,
      highUrgencyPercent: history.length > 0 ? Math.round((highUrgency / history.length) * 100) : 0,
      avgPerDay: Math.round(history.length / daySpan),
    },
    categoryData: Object.entries(categories).map(([name, count]) => ({ name, count })),
    urgencyData: urgency,
  }
}

function DashboardPage() {
  const [{ stats, categoryData, urgencyData }] = useState(buildDashboardData)

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-ink">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Overview of message triage analytics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Messages', value: stats.total },
            { label: 'Today', value: stats.today },
            { label: 'High Urgency', value: `${stats.highUrgencyPercent}%` },
            { label: 'Avg Per Day', value: stats.avgPerDay },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded-card shadow-card border border-line p-6">
              <div className="text-sm text-muted mb-1">{label}</div>
              <div className="font-mono text-3xl font-medium text-ink">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-card shadow-card border border-line p-6">
            <h2 className="font-display text-2xl text-ink mb-4">Category Distribution</h2>
            {categoryData.length === 0 ? (
              <div className="text-center text-muted py-8 text-sm">No data yet</div>
            ) : (
              <div className="space-y-3">
                {categoryData.map((cat) => {
                  const percentage = stats.total > 0 ? (cat.count / stats.total) * 100 : 0
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-ink">{cat.name}</span>
                        <span className="font-mono text-muted">{cat.count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-paper rounded-full h-2">
                        <div
                          className="bg-brand h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-card shadow-card border border-line p-6">
            <h2 className="font-display text-2xl text-ink mb-4">Urgency Breakdown</h2>
            {stats.total === 0 ? (
              <div className="text-center text-muted py-8 text-sm">No data yet</div>
            ) : (
              <div className="space-y-4">
                {['High', 'Medium', 'Low'].map((level) => (
                  <div key={level} className="flex items-center justify-between">
                    <UrgencyTag level={level} />
                    <span className="font-mono text-2xl font-medium text-ink">{urgencyData[level]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-brand-50 border border-brand/20 rounded-card p-6 mt-6">
          <h2 className="font-display text-lg text-ink mb-2">Insights</h2>
          <div className="space-y-2 text-sm text-ink">
            {stats.highUrgencyPercent > 30 && (
              <p>High urgency messages represent {stats.highUrgencyPercent}% of total volume — consider additional support resources.</p>
            )}
            {stats.today > 10 && (
              <p>High activity today with {stats.today} messages analyzed.</p>
            )}
            {stats.total === 0 && (
              <p>Start by analyzing some messages to see insights here.</p>
            )}
            {stats.total > 0 && stats.highUrgencyPercent <= 30 && stats.today <= 10 && (
              <p className="text-muted">Volume is steady. No anomalies detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
