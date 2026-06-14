function UrgencyTag({ level, className = '' }) {
  const config = {
    High: { icon: '▲', label: 'High', bg: 'bg-high-bg', text: 'text-high' },
    Medium: { icon: '◆', label: 'Medium', bg: 'bg-med-bg', text: 'text-med' },
    Low: { icon: '▼', label: 'Low', bg: 'bg-low-bg', text: 'text-low' },
  }
  const { icon, label, bg, text } = config[level] || config.Medium
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${bg} ${text} ${className}`}>
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  )
}

export default UrgencyTag
