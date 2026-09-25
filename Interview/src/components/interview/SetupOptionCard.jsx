import { CheckRounded } from '@mui/icons-material'

export default function SetupOptionCard({ selected, value, label, description, icon: Icon, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={\`setup-option-card \${selected ? 'selected' : ''} \${compact ? 'compact' : ''}\`}
      onClick={() => onClick(value)}
      aria-pressed={selected}
    >
      {Icon ? <span className="setup-option-icon"><Icon /></span> : null}
      <span className="setup-option-copy">
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <span className="setup-option-check" aria-hidden="true">{selected ? <CheckRounded /> : null}</span>
    </button>
  )
}
