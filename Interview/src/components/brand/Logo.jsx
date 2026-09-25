import { ROUTES } from '../../routes/routes'
import { useRouter } from '../../routes/Router'

export default function Logo() {
  const { navigate } = useRouter()

  return (
    <a
      href={ROUTES.HOME}
      className="brand"
      aria-label="ApnaAcademy Interview AI home"
      onClick={(event) => {
        event.preventDefault()
        navigate(ROUTES.HOME)
      }}
    >
      <span className="brand-mark">
        <span className="brand-stroke brand-stroke-a" />
        <span className="brand-stroke brand-stroke-b" />
        <span className="brand-stroke brand-stroke-c" />
      </span>
      <span>
        <strong>ApnaAcademy</strong>
        <small>Interview AI</small>
      </span>
    </a>
  )
}
