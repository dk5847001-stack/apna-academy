export default function SectionPill({ children, icon: Icon }) {
  return (
    <span className="section-pill">
      {Icon ? <Icon fontSize="inherit" /> : null}
      {children}
    </span>
  )
}
