export const validateForm = (formData, formType = 'contact') => {
  const errors = {}
  
  // Validação de nome
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres'
  } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.name)) {
    errors.name = 'Nome deve conter apenas letras'
  }

  // Validação de telefone
  if (!formData.phone) {
    errors.phone = 'Telefone é obrigatório'
  } else {
    const phoneClean = formData.phone.replace(/\D/g, '')
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      errors.phone = 'Telefone deve ter 10 ou 11 dígitos'
    } else if (!/^[1-9]{2}[0-9]{8,9}$/.test(phoneClean)) {
      errors.phone = 'Telefone inválido'
    }
  }

  // Validação específica para formulário de contato
  if (formType === 'contact') {
    if (!formData.email) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.message || formData.message.trim().length < 10) {
      errors.message = 'Mensagem deve ter pelo menos 10 caracteres'
    } else if (formData.message.trim().length > 500) {
      errors.message = 'Mensagem deve ter no máximo 500 caracteres'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export const formatPhone = (phone) => {
  const phoneClean = phone.replace(/\D/g, '')
  
  if (phoneClean.length <= 10) {
    return phoneClean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return phoneClean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
