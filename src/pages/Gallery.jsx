import React, { useState } from 'react'
import './Gallery.css'

const galleryImages = Array.from({ length: 22 }, (_, i) => ({
  id: i + 1,
  src: `/gallery/bancada-porcelanato-${String(i + 1).padStart(3, '0')}.jpg`,
  alt: `Bancada em porcelanato - Projeto ${i + 1}`,
  title: `Projeto ${i + 1}`
}))

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <h1>Nossa <span className="text-primary">Galeria</span></h1>
          <p>Mais de 1.000 projetos entregues com excelência e qualidade premium</p>
        </div>
      </section>

      <section className="gallery-content">
        <div className="container">
          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <div 
                key={image.id} 
                className="gallery-item"
                onClick={() => setSelectedImage(image)}
              >
                <img src={image.src} alt={image.alt} loading="lazy" />
                <div className="gallery-overlay">
                  <h3>{image.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <h3>{selectedImage.title}</h3>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery


