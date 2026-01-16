import React, { useEffect, useState } from 'react'
import ImageModal from '../components/ImageModal'
import SEO from '../components/SEO'
import { validateForm, sanitizeInput, formatPhone } from '../utils/validation'
import './Home.css'
import '../components/FormValidation.css'

function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })

  const [modalImage, setModalImage] = useState(null)
  const [modalIndex, setModalIndex] = useState(-1)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Todas as imagens disponíveis (incluindo as novas imagens)
  const allImages = Array.from({ length: 25 }, (_, i) => ({
    src: `/gallery/bancada-porcelanato-${String(i + 1).padStart(3, '0')}.jpg`,
    alt: `Projeto ${i + 1}`
  }))

  // Carousel automático - 3 imagens destacadas
  // Usando a primeira (0), a imagem melhorada (23) e a nova melhorada (24)
  const featuredImages = [0, 23, 24] // Imagens 1, 24 (Melhorar Imagem), e 25 (Melhorar Imagem 1)

  // Projetos em destaque na galeria
  const featuredProjects = [
    {
      id: 1,
      title: 'Cozinha Moderna',
      image: '/gallery/bancada-porcelanato-001.jpg',
      description: 'Bancada de porcelanato com design moderno e acabamento premium'
    },
    {
      id: 2,
      title: 'Banheiro Executivo',
      image: '/gallery/bancada-porcelanato-015.jpg',
      description: 'Bancada para banheiro com cubas integradas e espaço otimizado'
    },
    {
      id: 3,
      title: 'Área Gourmet',
      image: '/gallery/bancada-porcelanato-025.jpg',
      description: 'Espaço gourmet completo com bancada e churrasqueira'
    }
  ]

  // Carousel automático
  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredImages.length)
    }, 5000) // Muda a cada 5 segundos

    return () => clearInterval(carouselInterval)
  }, [featuredImages.length])

  const openModal = (index) => {
    setModalIndex(index)
    setModalImage(allImages[index])
    
    // Track gallery view
    if (window.trackAnalytics) {
      window.trackAnalytics.galleryView(index)
    }
  }

  const closeModal = () => {
    setModalImage(null)
    setModalIndex(-1)
  }

  const nextImage = () => {
    if (modalIndex < allImages.length - 1) {
      const newIndex = modalIndex + 1
      setModalIndex(newIndex)
      setModalImage(allImages[newIndex])
    }
  }

  const prevImage = () => {
    if (modalIndex > 0) {
      const newIndex = modalIndex - 1
      setModalIndex(newIndex)
      setModalImage(allImages[newIndex])
    }
  }

  // Carousel automático
  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredImages.length)
    }, 5000) // Muda a cada 5 segundos

    return () => clearInterval(carouselInterval)
  }, [featuredImages.length])

  // Re-initialize scroll reveal when component mounts
  useEffect(() => {
    setTimeout(() => {
      import('../utils/scrollReveal.js').then((module) => {
        module.initScrollReveal()
      })
    }, 100)
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    
    // Formatar telefone
    if (name === 'phone') {
      const formattedPhone = formatPhone(value)
      setFormData({
        ...formData,
        [name]: formattedPhone
      })
    } else {
      setFormData({
        ...formData,
        [name]: sanitizeInput(value)
      })
    }
    
    // Limpar erro do campo quando usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  const handleForceWhatsApp = () => {
    const name = formData.name || 'Nome'
    const phone = formData.phone || ''
    const message = formData.message || ''
    const whatsappMessage = `Olá! Meu nome é ${name}. ${message} Telefone: ${phone}`
    const whatsappUrl = `https://wa.me/5511977180367?text=${encodeURIComponent(whatsappMessage)}`
    window.location.href = whatsappUrl
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const whatsappMessage = `Olá! Meu nome é ${formData.name}. ${formData.message} Telefone: ${formData.phone}`
    const whatsappUrl = `https://wa.me/5511977180367?text=${encodeURIComponent(whatsappMessage)}`
    window.location.href = whatsappUrl
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    const validation = validateForm(formData, 'contact')
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    const subject = 'Contato - Vander Porcelanato'
    const body = `Olá!\n\nNome: ${formData.name}\nTelefone: ${formData.phone}\n\nMensagem:\n${formData.message}`
    const mailtoUrl = `mailto:vanderporcelanato@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  return (
    <div>
      <SEO 
        title="Soluções Premium em Porcelanato"
        description="Especialistas em bancadas em porcelanato, cubas esculpidas e projetos sob medida na Grande São Paulo. Mais de 1.000 projetos entregues com qualidade premium."
        keywords="bancadas porcelanato, cubas esculpidas, porcelanato, lâminas sinterizadas, São Paulo"
        canonicalUrl="https://vanderbancadas.com.br"
        ogImage="/gallery/bancada-porcelanato-001.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Vander Bancadas",
          "description": "Especialistas em bancadas em porcelanato, cubas esculpidas e projetos sob medida na Grande São Paulo",
          "url": "https://vanderbancadas.com.br",
          "telephone": "+55-11-97718-0367",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-23.5505",
            "longitude": "-46.6333"
          },
          "serviceType": "Bancadas de Porcelanato, Cubas Esculpidas, Projetos Sob Medida",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "150"
          }
        }}
      />
      <section className="hero" id="inicio">
        <div className="hero-carousel">
          {featuredImages.map((imageIndex, idx) => (
            <div 
              key={imageIndex} 
              className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
              style={{ 
                backgroundImage: `url(/gallery/bancada-porcelanato-${String(imageIndex + 1).padStart(3, '0')}.jpg)`,
                imageRendering: 'high-quality'
              }}
              onClick={() => openModal(imageIndex)}
            ></div>
          ))}
        </div>
        <div className="hero-content">
          <h1 className="hero-title scroll-reveal">
            Soluções Premium em <span className="text-primary">Porcelanato e lâminas sinterizadas</span>
          </h1>
          <p className="hero-subtitle scroll-reveal">Durabilidade e Elegância em Cada Detalhe</p>
          <div className="hero-buttons scroll-reveal">
            <a href="#galeria" className="btn btn-primary" onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById('galeria')
              if (element) {
                window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' })
              }
            }}>Ver Projetos</a>
            <a href="#contato" className="btn btn-outline" onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById('contato')
              if (element) {
                window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' })
              }
            }}>Traga Seu Projeto</a>
          </div>
        </div>
      </section>

      <section className="features" id="sobre">
        <div className="container">
          <div className="scroll-reveal">
            <h2 className="section-title">Por Que Escolher a Vander?</h2>
            <p className="section-subtitle">Mais de 1.000 projetos entregues com excelência na Grande São Paulo</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card scroll-reveal-left">
              <div className="feature-icon">🏆</div>
              <h3>Qualidade Premium</h3>
              <p>Acabamento de alto padrão</p>
            </div>
            <div className="feature-card scroll-reveal">
              <div className="feature-icon">⚡</div>
              <h3>Instalação Rápida</h3>
              <p>Equipe especializada com agilidade e precisão na execução</p>
            </div>
            <div className="feature-card scroll-reveal-right">
              <div className="feature-icon">🛡️</div>
              <h3>Garantia Total</h3>
              <p>Compromisso com a durabilidade e satisfação do cliente</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" id="vantagens">
        <div className="container">
          <div className="scroll-reveal">
            <h2 className="section-title">Nossas Vantagens</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-item scroll-reveal-left">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Projetos Entregues</div>
            </div>
            <div className="stat-item scroll-reveal">
              <div className="stat-number">10+</div>
              <div className="stat-label">Anos de Experiência</div>
            </div>
            <div className="stat-item scroll-reveal">
              <div className="stat-number">100%</div>
              <div className="stat-label">Satisfação dos Clientes</div>
            </div>
            <div className="stat-item scroll-reveal-right">
              <div className="stat-number">24h</div>
              <div className="stat-label">Atendimento Rápido</div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="servicos">
        <div className="container">
          <div className="scroll-reveal">
            <h2 className="section-title">Nossos Serviços</h2>
            <p className="section-subtitle">Soluções completas em porcelanato e pedras naturais para transformar seus espaços</p>
          </div>
          <div className="services-grid">
            <div className="service-card scroll-reveal-left">
              <div className="service-icon">🏠</div>
              <h3>Bancadas em Porcelanato</h3>
              <p>Bancadas premium personalizadas para cozinhas, banheiros e áreas gourmet com materiais selecionados e acabamento impecável.</p>
              <ul>
                <li>✓ Materiais premium importados e nacionais</li>
                <li>✓ Corte e acabamento precisos</li>
                <li>✓ Instalação profissional</li>
                <li>✓ Resistência a manchas e riscos</li>
              </ul>
            </div>

            <div className="service-card scroll-reveal">
              <div className="service-icon">💧</div>
              <h3>Cubas Esculpidas</h3>
              <p>Cubas integradas esculpidas no mesmo material da bancada, design seamless e elegante.</p>
              <ul>
                <li>✓ Design sem costuras visíveis</li>
                <li>✓ Integração perfeita com a bancada</li>
                <li>✓ Funcionalidade e estética</li>
                <li>✓ Fácil limpeza e manutenção</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-section" id="galeria">
        <div className="container">
          <div className="scroll-reveal">
            <h2 className="section-title">Nossa Galeria</h2>
            <p className="section-subtitle">Conheça alguns dos nossos projetos realizados</p>
          </div>
          <div className="gallery-grid">
            {allImages.slice(0, 12).map((image, i) => (
              <div
                key={i}
                className="gallery-item scroll-reveal"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => openModal(i)}
              >
                <img src={image.src} alt={image.alt} />
                <div className="gallery-overlay">
                  <h3>{image.alt}</h3>
                  <p>Clique para ampliar</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contato">
        <div className="container">
          <div className="scroll-reveal">
            <h2 className="section-title">Fale Conosco</h2>
            <p className="section-subtitle">Entre em contato e solicite um orçamento personalizado para seu projeto</p>
          </div>
          <div className="contact-grid">
            <div className="contact-form scroll-reveal-left">
              <h3>Envie sua Mensagem</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleFormChange}
                    required 
                    className={formErrors.name ? 'error' : ''}
                    aria-invalid={formErrors.name ? 'true' : 'false'}
                    aria-describedby={formErrors.name ? 'name-error' : undefined}
                  />
                  {formErrors.name && (
                    <span id="name-error" className="error-message" role="alert">
                      {formErrors.name}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telefone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleFormChange}
                    required 
                    className={formErrors.phone ? 'error' : ''}
                    aria-invalid={formErrors.phone ? 'true' : 'false'}
                    aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                    placeholder="(11) 91234-5678"
                  />
                  {formErrors.phone && (
                    <span id="phone-error" className="error-message" role="alert">
                      {formErrors.phone}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="message">Mensagem</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    className={formErrors.message ? 'error' : ''}
                    aria-invalid={formErrors.message ? 'true' : 'false'}
                    aria-describedby={formErrors.message ? 'message-error' : undefined}
                  ></textarea>
                  {formErrors.message && (
                    <span id="message-error" className="error-message" role="alert">
                      {formErrors.message}
                    </span>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                </button>
                {formErrors.submit && (
                  <div className="error-message submit-error" role="alert">
                    {formErrors.submit}
                  </div>
                )}
              </form>
            </div>
            <div className="contact-info scroll-reveal-right">
              <h3>Informações de Contato</h3>
              <div className="info-item">
                <strong>Telefone</strong>
                <a href="tel:+5511977180367">(11) 97718-0367</a>
              </div>
              <div className="info-item">
                <strong>Instagram</strong>
                <a href="https://www.instagram.com/vander_bancadas/" target="_blank" rel="noopener noreferrer">
                  @vander_bancadas
                </a>
              </div>
              <div className="info-item">
                <strong>CNPJ</strong>
                <p>38.022.318/0001-46</p>
              </div>
              <div className="info-item">
                <strong>Localização</strong>
                <p>Atendemos toda Grande São Paulo</p>
              </div>
              <div className="info-item">
                <strong>WhatsApp</strong>
                <a href="https://wa.me/5511977180367" target="_blank" rel="noopener noreferrer" className="btn btn-primary whatsapp-home-link">
                  <img 
                    src="/whatsapp-icon.png" 
                    alt="WhatsApp" 
                    className="whatsapp-home-icon"
                  />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          imageSrc={modalImage.src}
          imageAlt={modalImage.alt}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
          hasNext={modalIndex < allImages.length - 1}
          hasPrev={modalIndex > 0}
        />
      )}
    </div>
  )
}

export default Home
