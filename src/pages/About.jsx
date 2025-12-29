import React from 'react'
import './About.css'

function About() {
  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <h1>Sobre a <span className="text-primary">Vander</span></h1>
          <p>Especialistas em porcelanato, quartzo, granito e mármore. Atendendo a Grande São Paulo com projetos sob medida e qualidade premium.</p>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1.000+</div>
              <div className="stat-label">Projetos Entregues</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Anos de Experiência</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Satisfação Garantida</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <h2 className="section-title">Nossa História</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div className="timeline-content">
                <h3>Início da Jornada</h3>
                <p>Fundação da Vander Porcelanato com foco em qualidade e excelência</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2022</div>
              <div className="timeline-content">
                <h3>Expansão de Serviços</h3>
                <p>Inclusão de cubas esculpidas e serviços de limpeza profissional</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <h3>1.000+ Projetos</h3>
                <p>Milhares de projetos entregues com satisfação garantida</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About


