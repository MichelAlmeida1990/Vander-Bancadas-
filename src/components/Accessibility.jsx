import React, { useEffect } from 'react'

const Accessibility = () => {
  useEffect(() => {
    // Skip to content functionality
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-to-content'
    skipLink.textContent = 'Pular para o conteúdo principal'
    document.body.insertBefore(skipLink, document.body.firstChild)

    // Keyboard navigation enhancement
    const handleKeyDown = (e) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
      
      // Escape key to close modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal, .lightbox')
        modals.forEach(modal => {
          if (modal.style.display !== 'none') {
            modal.style.display = 'none'
            // Focus back to trigger element
            const trigger = document.querySelector('[aria-expanded="true"]')
            if (trigger) {
              trigger.focus()
              trigger.setAttribute('aria-expanded', 'false')
            }
          }
        })
      }
    }

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation')
    }

    // Focus management for modals
    const trapFocus = (element) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus()
              e.preventDefault()
            }
          }
        }
      })
    }

    // Add ARIA labels dynamically
    const addAriaLabels = () => {
      // Images without alt text
      const images = document.querySelectorAll('img:not([alt])')
      images.forEach(img => {
        img.setAttribute('alt', 'Imagem decorativa')
      })

      // Links without descriptive text
      const links = document.querySelectorAll('a[href^="tel"], a[href^="mailto"]')
      links.forEach(link => {
        if (link.textContent.trim() === '') {
          if (link.href.startsWith('tel:')) {
            link.setAttribute('aria-label', `Telefone: ${link.textContent.replace(/\D/g, '')}`)
          } else if (link.href.startsWith('mailto:')) {
            link.setAttribute('aria-label', `Email: ${link.href.replace('mailto:', '')}`)
          }
        }
      })

      // Form inputs without labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
      inputs.forEach(input => {
        const placeholder = input.getAttribute('placeholder')
        if (placeholder) {
          input.setAttribute('aria-label', placeholder)
        }
      })
    }

    // Announce page changes to screen readers
    const announcePageChange = () => {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.id = 'page-announcer'
      document.body.appendChild(announcer)

      // Announce route changes
      let currentPath = window.location.pathname
      setInterval(() => {
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname
          const pageName = currentPath === '/' ? 'Página inicial' : 
                          currentPath === '/sobre' ? 'Sobre nós' :
                          currentPath === '/servicos' ? 'Serviços' :
                          currentPath === '/galeria' ? 'Galeria' :
                          currentPath === '/contato' ? 'Contato' : 'Página'
          announcer.textContent = `Navegou para: ${pageName}`
        }
      }, 100)
    }

    // Initialize accessibility features
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    addAriaLabels()
    announcePageChange()

    // Watch for dynamic content changes
    const observer = new MutationObserver(() => {
      addAriaLabels()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      observer.disconnect()
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink)
      }
    }
  }, [])

  return null
}

export default Accessibility
