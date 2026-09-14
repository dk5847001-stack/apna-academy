import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Users from './pages/Users.jsx'

const Root = () => {
  const showUsers = window.location.hash === '#users'
  return showUsers ? <Users /> : <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
