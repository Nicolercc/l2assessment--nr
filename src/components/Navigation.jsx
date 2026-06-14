import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/history', label: 'History' },
  { to: '/dashboard', label: 'Dashboard' },
]

function Navigation() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-line">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-1">
            {links.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 font-sans font-medium text-sm transition-colors relative ${
                    active
                      ? 'text-brand'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
