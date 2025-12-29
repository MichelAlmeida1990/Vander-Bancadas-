import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const navItems = [
  { path: '/#inicio', label: 'Início', hash: '#inicio' },
  { path: '/#sobre', label: 'Sobre', hash: '#sobre' },
  { path: '/#servicos', label: 'Serviços', hash: '#servicos' },
  { path: '/#galeria', label: 'Galeria', hash: '#galeria' },
  { path: '/#contato', label: 'Contato', hash: '#contato' },
]

function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['inicio', 'sobre', 'servicos', 'galeria', 'contato']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Controla o overflow do body quando menu está aberto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.classList.add('menu-open')
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.classList.remove('menu-open')
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.classList.remove('menu-open')
    }
  }, [isOpen])


  const handleLinkClick = (e, hash) => {
    setIsOpen(false)
    if (hash) {
      e.preventDefault()
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''))
        if (element) {
          const offsetTop = element.offsetTop - 80
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link 
            to="/#inicio" 
            className="navbar-logo" 
            onClick={(e) => handleLinkClick(e, '#inicio')}
          >
            <span className="logo-text-fallback">Vander</span>
            <span className="logo-primary">Bancadas</span>
          </Link>

          <div className={`menu ${isOpen ? 'open' : ''}`} aria-label="Menu">
            {isOpen && (
              <div 
                className="menu-overlay"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
              />
            )}
            <input 
              type="checkbox" 
              id="menu-checkbox" 
              className="menu-checkbox"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
            />
            <label htmlFor="menu-checkbox">
              <div className="button button1">
                <span className="bar bar1"></span>
                <span className="bar bar2"></span>
                <span className="bar bar3"></span>
              </div>
            </label>

            <ul className={`menu-list ${isOpen ? 'active' : ''}`}>
              <li className="menu-close-wrapper">
                <button 
                  className="menu-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar menu"
                >
                  <span>×</span>
                </button>
              </li>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={activeSection === item.hash.replace('#', '') ? 'active' : ''}
                    onClick={(e) => handleLinkClick(e, item.hash)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
