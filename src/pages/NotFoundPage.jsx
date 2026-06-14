import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-paper px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl text-ink mb-2">Page not found</h1>
        <p className="text-muted text-sm mb-6">That route doesn&apos;t exist.</p>
        <Link
          to="/"
          className="inline-block bg-brand text-white px-6 py-2.5 rounded-control hover:bg-brand-600 font-medium transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
