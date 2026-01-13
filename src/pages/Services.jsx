import React from 'react'
import './Services.css'

function Services() {
  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <h1>Nossos <span className="text-primary">Serviços</span></h1>
          <p>Soluções completas em porcelanato e pedras naturais para transformar seus espaços</p>
        </div>
      </section>

      <section className="services-content">
        <div className="container">
          <div className="services-grid">
            <div className="service-card">
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

            <div className="service-card">
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

            <div className="service-card">
              <div className="service-icon">✨</div>
              <h3>Limpeza de Porcelanato, Lâminas Sinterizadas e Quartzo</h3>
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
    </div>
  )
}

export default Services


