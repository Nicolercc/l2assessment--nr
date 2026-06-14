import { Link } from 'react-router-dom'

function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 text-brand hover:opacity-90 transition-opacity ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M16 28C16 28 8 20 8 12C8 7.58 11.58 4 16 4C20.42 4 24 7.58 24 12C24 20 16 28 16 28Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 22C16 22 11 17 11 12C11 9.24 13.24 7 16 7C18.76 7 21 9.24 21 12C21 17 16 22 16 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="font-display text-xl text-ink leading-none">Relay AI</span>
    </Link>
  )
}

export default Logo
