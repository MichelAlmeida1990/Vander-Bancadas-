export const initScrollReveal = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  }, observerOptions)

  // Observe all scroll-reveal elements
  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach((el) => {
    observer.observe(el)
  })
}

export const handleNavbarScroll = () => {
  const navbar = document.querySelector('.navbar')
  if (!navbar) return

  const handleScroll = () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled')
    } else {
      navbar.classList.remove('scrolled')
    }
  }

  // Check initial state
  handleScroll()

  window.addEventListener('scroll', handleScroll)
}

