const steps = ['Configure', 'Prepare', 'Interview', 'Results']

export default function SetupProgress() {
  return (
    <ol className="setup-progress" aria-label="Interview journey">
      {steps.map((step, index) => (
        <li key={step} className={index === 0 ? 'active' : ''}>
          <span className="setup-progress-number">{index + 1}</span>
          <span className="setup-progress-label">{step}</span>
          {index < steps.length - 1 ? <span className="setup-progress-line" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  )
}
