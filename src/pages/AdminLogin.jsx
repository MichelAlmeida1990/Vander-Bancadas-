import React, { useState } from 'react'
import './AdminLogin.css'

const ADMIN_PASSWORD = 'vander2025'

function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simula delay para evitar tentativas rápidas
    await new Promise(r => setTimeout(r, 500))

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('vander_admin_token', 'true')
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/admin'
      window.location.href = next
    } else {
      setError('Senha incorreta')
    }
    setLoading(false)
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Acesso Restrito</h1>
        <p>Digite a senha para acessar o painel administrativo</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
