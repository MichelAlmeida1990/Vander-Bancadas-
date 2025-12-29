import React, { useState } from 'react'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const whatsappMessage = `Olá! Meu nome é ${formData.nome}. ${formData.mensagem} Email: ${formData.email} Telefone: ${formData.telefone}`
    const whatsappUrl = `https://wa.me/5511971678867?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <h1>Entre em <span className="text-primary">Contato</span></h1>
          <p>Traga seu projeto! Estamos prontos para transformar seu espaço</p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-wrapper">
              <h2>Solicite um Orçamento</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nome">Nome completo</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mensagem">Descreva seu projeto</label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-large">
                  Enviar
                </button>
              </form>
            </div>

            <div className="contact-info">
              <h2>Informações de Contato</h2>
              
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

              <div className="quick-actions">
                <a href="https://wa.me/5511971678867" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact


