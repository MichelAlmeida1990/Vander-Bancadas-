import React, { useEffect } from 'react'

const Analytics = () => {
  useEffect(() => {
    // Google Analytics 4 Configuration
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX' // Replace with actual GA4 ID
    
    // Load Google Analytics script
    const loadGA = () => {
      // Create first script
      const script1 = document.createElement('script')
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script1)

      // Create second script
      const script2 = document.createElement('script')
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_title: document.title,
          page_location: window.location.href,
          content_group: 'Vander Bancadas Website'
        });
      `
      document.head.appendChild(script2)
    }

    // Custom event tracking
    const trackEvent = (eventName, parameters = {}) => {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          ...parameters,
          custom_parameter_1: 'Vander Bancadas',
          custom_parameter_2: 'Porcelanato Services'
        })
      }
    }

    // Track page views
    const trackPageView = (path) => {
      if (typeof gtag !== 'undefined') {
        gtag('config', GA_MEASUREMENT_ID, {
          page_path: path,
          page_title: document.title
        })
      }
    }

    // Track form submissions
    const trackFormSubmission = (formType) => {
      trackEvent('form_submission', {
        form_type: formType,
        page_location: window.location.pathname
      })
    }

    // Track phone clicks
    const trackPhoneClick = (phoneNumber) => {
      trackEvent('phone_click', {
        phone_number: phoneNumber,
        page_location: window.location.pathname
      })
    }

    // Track WhatsApp clicks
    const trackWhatsAppClick = () => {
      trackEvent('whatsapp_click', {
        page_location: window.location.pathname,
        source: 'contact_button'
      })
    }

    // Track gallery interactions
    const trackGalleryView = (imageIndex) => {
      trackEvent('gallery_view', {
        image_index: imageIndex,
        total_images: 25
      })
    }

    // Track service clicks
    const trackServiceClick = (serviceName) => {
      trackEvent('service_click', {
        service_name: serviceName,
        page_location: window.location.pathname
      })
    }

    // Enhanced E-commerce tracking (for future use)
    const trackLead = (leadData) => {
      trackEvent('generate_lead', {
        currency: 'BRL',
        value: 0, // Update with actual lead value if available
        lead_type: leadData.type,
        contact_method: leadData.method
      })
    }

    // Scroll depth tracking
    let maxScroll = 0
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        
        // Track milestones: 25%, 50%, 75%, 90%, 100%
        if ([25, 50, 75, 90, 100].includes(scrollPercent)) {
          trackEvent('scroll_depth', {
            scroll_percentage: scrollPercent,
            page_location: window.location.pathname
          })
        }
      }
    }

    // Performance tracking
    const trackPerformance = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
          trackEvent('page_performance', {
            load_time: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
            dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
            page_location: window.location.pathname
          })
        }
      }
    }

    // Initialize analytics
    const initAnalytics = () => {
      loadGA()
      
      // Track initial page view
      setTimeout(() => {
        trackPageView(window.location.pathname)
      }, 1000)

      // Set up event listeners
      window.addEventListener('scroll', trackScrollDepth, { passive: true })
      
      // Track performance after page load
      window.addEventListener('load', () => {
        setTimeout(trackPerformance, 2000)
      })

      // Track route changes (for SPA)
      let currentPath = window.location.pathname
      setInterval(() => {
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname
          trackPageView(currentPath)
        }
      }, 500)

      // Add global tracking functions
      window.trackAnalytics = {
        formSubmission: trackFormSubmission,
        phoneClick: trackPhoneClick,
        whatsappClick: trackWhatsAppClick,
        galleryView: trackGalleryView,
        serviceClick: trackServiceClick,
        lead: trackLead
      }
    }

    // Check consent (GDPR/CCPA compliance)
    const hasConsent = localStorage.getItem('analytics-consent')
    if (hasConsent === 'true' || !hasConsent) {
      initAnalytics()
    }

    // Cleanup
    return () => {
      window.removeEventListener('scroll', trackScrollDepth)
      delete window.trackAnalytics
    }
  }, [])

  return null
}

export default Analytics
