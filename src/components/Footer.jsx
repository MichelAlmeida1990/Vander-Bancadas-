import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">
              Vander <span className="logo-primary">Porcelanato</span>
            </h3>
            <p>Especialistas em bancadas em porcelanato, cubas esculpidas e limpeza profissional de quartzo e pedras naturais na Grande São Paulo.</p>
          </div>

          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><a href="/sobre">Sobre Nós</a></li>
              <li><a href="/servicos">Serviços</a></li>
              <li><a href="/galeria">Galeria</a></li>
              <li><a href="/contato">Contato</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contato</h4>
            <ul>
              <li>
                <a href="tel:+5511971678867">(11) 97167-8867</a>
              </li>
              <li>
                <a href="https://wa.me/5511971678867" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/vander_porcelanatos/" target="_blank" rel="noopener noreferrer">
                  Instagram: @vander_porcelanatos
                </a>
              </li>
            </ul>
            <p className="footer-location">Atendemos toda Grande São Paulo</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vander Porcelanato. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


