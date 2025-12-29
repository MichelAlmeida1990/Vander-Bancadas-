import React, { useEffect } from 'react'
import './ImageModal.css'

function ImageModal({ isOpen, imageSrc, imageAlt, onClose, onNext, onPrev, hasNext, hasPrev }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleArrowKeys = (e) => {
      if (!isOpen) return
      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev()
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
      window.addEventListener('keydown', handleArrowKeys)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('keydown', handleArrowKeys)
    }
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev])

  if (!isOpen) return null

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        {hasPrev && (
          <button className="image-modal-prev" onClick={onPrev} aria-label="Imagem anterior">
            ‹
          </button>
        )}
        {hasNext && (
          <button className="image-modal-next" onClick={onNext} aria-label="Próxima imagem">
            ›
          </button>
        )}
        <img src={imageSrc} alt={imageAlt} />
      </div>
    </div>
  )
}

export default ImageModal



