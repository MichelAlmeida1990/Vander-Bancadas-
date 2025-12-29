import React, { useEffect, useState } from 'react'
import ImageModal from '../components/ImageModal'
import './Home.css'

function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })

  const [modalImage, setModalImage] = useState(null)
  const [modalIndex, setModalIndex] = useState(-1)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Todas as imagens disponíveis (incluindo as novas imagens)
  const allImages = Array.from({ length: 25 }, (_, i) => ({
    src: `/gallery/bancada-porcelanato-${String(i + 1).padStart(3, '0')}.jpg`,
    alt: `Projeto ${i + 1}`
  }))

  // Carousel automático - 3 imagens destacadas
  // Usando a primeira (0), a imagem melhorada (23) e a nova melhorada (24)
  const featuredImages = [0, 23, 24] // Imagens 1, 24 (Melhorar Imagem), e 25 (Melhorar Imagem 1)

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const whatsappMessage = `Olá! Meu nome é ${formData.name}. ${formData.message} Telefone: ${formData.phone}`
    const whatsappUrl = `https://wa.me/5511971678867?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div>
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
            Soluções Premium em <span className="text-primary">Porcelanato</span>
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
              <p>Materiais selecionados e acabamento impecável em cada projeto</p>
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
              <div className="stat-number">15+</div>
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

            <div className="service-card scroll-reveal-right">
              <div className="service-icon">✨</div>
              <h3>Limpeza de Quartzo e Pedras Naturais</h3>
              <p>Serviço especializado de limpeza e restauração para manter suas superfícies como novas.</p>
              <ul>
                <li>✓ Remoção de manchas profundas</li>
                <li>✓ Restauração do brilho original</li>
                <li>✓ Tratamento profissional</li>
                <li>✓ Proteção duradoura</li>
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
                  />
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
                  />
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
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary"><span>Enviar Mensagem</span></button>
              </form>
            </div>
            <div className="contact-info scroll-reveal-right">
              <h3>Informações de Contato</h3>
              <div className="info-item">
                <strong>Telefone</strong>
                <a href="tel:+5511971678867">(11) 97167-8867</a>
              </div>
              <div className="info-item">
                <strong>Instagram</strong>
                <a href="https://www.instagram.com/vander_porcelanatos/" target="_blank" rel="noopener noreferrer">
                  @vander_porcelanatos
                </a>
              </div>
              <div className="info-item">
                <strong>Localização</strong>
                <p>Atendemos toda Grande São Paulo</p>
              </div>
              <div className="info-item">
                <a href="https://wa.me/5511971678867" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
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
