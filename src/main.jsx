import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

// Initialize scroll reveal and navbar scroll effects after DOM loads
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)

// Initialize scroll effects after render
setTimeout(() => {
  import('./utils/scrollReveal.js').then((module) => {
    module.initScrollReveal()
    module.handleNavbarScroll()
  })
}, 100)
