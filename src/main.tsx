import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isAppPath } from './utils/baseUrl'

if (isAppPath(window.location.pathname)) {
  window.location.replace(import.meta.env.BASE_URL)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
