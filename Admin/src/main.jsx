import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import './index.css'
import App from './App.jsx'
import Users from './pages/Users.jsx'
import Notifications from './pages/Notifications.jsx'

const Root = () => {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (hash === '#users') return <Users />
  if (hash === '#notifications') return <Notifications />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
