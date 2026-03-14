import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Ocultar preloader cuando React termina de montar
if (window.__hidePreloader) {
  setTimeout(window.__hidePreloader, 1000)
}