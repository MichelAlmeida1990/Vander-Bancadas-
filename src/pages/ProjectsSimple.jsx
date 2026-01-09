import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Clock, DollarSign, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useLocation } from 'react-router-dom'
import './ProjectsClean.css'
import '../styles/admin-footer.css'
import { useAdminData } from '../context/AdminDataContext.jsx'

function ProjectsSimple() {
  const location = useLocation()
  const {
    clients,
    projects,
    addClient,
    addProject,
    updateProject,
    deleteProject: deleteProjectFromStore
  } = useAdminData()

  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    category: '',
    value: '',
    startDate: '',
    endDate: '',
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  })

  const showFeedback = (message) => {
    setFeedback(message)
    setTimeout(() => {
      setFeedback('')
    }, 2500)
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const modal = params.get('modal')

    if (modal === 'client') {
      setShowNewClient(true)
      setShowNewProject(false)
    }

    if (modal === 'project') {
      setShowNewProject(true)
      setShowNewClient(false)
    }
  }, [location.search])

  const openClientModal = () => {
    console.log('Abrindo modal cliente')
    setShowNewClient(true)
  }

  const openProjectModal = () => {
    console.log('Abrindo modal projeto')
    setShowNewProject(true)
  }

  const closeClientModal = () => {
    console.log('Fechando modal cliente')
    setShowNewClient(false)
    window.history.replaceState(null, '', '/admin/projects')
  }

  const closeProjectModal = () => {
    console.log('Fechando modal projeto')
    setShowNewProject(false)
    window.history.replaceState(null, '', '/admin/projects')
  }

  const handleNewProject = () => {
    if (!formData.name || !formData.clientId || !formData.value) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    addProject({
      name: formData.name,
      clientId: parseInt(formData.clientId),
      category: formData.category,
      value: parseFloat(formData.value),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'pending',
      paid: false
    })
    setShowNewProject(false)
    showFeedback('Projeto cadastrado com sucesso!')
    setFormData({ 
      name: '', 
      clientId: '', 
      category: '', 
      value: '', 
      startDate: '', 
      endDate: '',
      clientName: '', 
      clientEmail: '', 
      clientPhone: ''
    })
  }

  const handleNewClient = () => {
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    addClient({
      name: formData.clientName,
      email: formData.clientEmail,
      phone: formData.clientPhone
    })
    setShowNewClient(false)
    showFeedback('Cliente cadastrado com sucesso!')
    setFormData({ 
      name: '', 
      clientId: '', 
      category: '', 
      value: '', 
      startDate: '', 
      endDate: '',
      clientName: '', 
      clientEmail: '', 
      clientPhone: ''
    })
  }

  const updateProjectStatus = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus })
  }

  const togglePayment = (projectId) => {
    const project = projects.find((p) => p.id === projectId)
    updateProject(projectId, { paid: !project?.paid })
  }

  const deleteProject = (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProjectFromStore(projectId)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700'
    }
    return styles[status] || styles.pending
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      'in-progress': 'Em Andamento',
      completed: 'Concluído'
    }
    return texts[status] || 'Pendente'
  }

  const totalRevenue = projects.filter(p => p.paid).reduce((sum, p) => sum + p.value, 0)
  const pendingRevenue = projects.filter(p => !p.paid).reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="projects-page">
      {feedback && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          background: 'rgba(16, 185, 129, 0.18)',
          color: '#fff',
          padding: '12px 14px',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          maxWidth: 360,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.55)'
          }}>
            <CheckCircle size={16} color="#34d399" />
          </span>
          {feedback}
        </div>
      )}
      {/* Header Simples */}
      <div className="page-header">
        <h1>Projetos</h1>
        <div className="header-actions">
          <button
            className="btn"
            onClick={() => (window.location.href = '/admin')}
          >
            Dashboard
          </button>
          <button 
            className="btn" 
            onClick={openClientModal}
          >
            <Plus size={16} />
            Cliente
          </button>
          <button 
            className="btn btn-primary" 
            onClick={openProjectModal}
          >
            <Plus size={16} />
            Projeto
          </button>
        </div>
      </div>

      {/* Métricas Simples */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-value">{projects.length}</span>
          <span className="metric-label">Projetos</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
          <span className="metric-label">Recebido</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">R$ {pendingRevenue.toLocaleString('pt-BR')}</span>
          <span className="metric-label">A Receber</span>
        </div>
      </div>

      {/* Tabela Limpa */}
      <div className="projects-table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-category">{project.category}</div>
                  </div>
                </td>
                <td>
                  <div className="client-info">
                    <User size={14} />
                    {project.clientName}
                  </div>
                </td>
                <td className="value">R$ {project.value.toLocaleString('pt-BR')}</td>
                <td>
                  <span className={`status-badge ${getStatusBadge(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td>
                  <button 
                    className={`payment-btn ${project.paid ? 'paid' : 'unpaid'}`}
                    onClick={() => togglePayment(project.id)}
                  >
                    {project.paid ? (
                      <>
                        <CheckCircle size={14} />
                        Pago
                      </>
                    ) : (
                      <>
                        <Clock size={14} />
                        Pendente
                      </>
                    )}
                  </button>
                </td>
                <td>
                  <div className="table-actions">
                    <select 
                      className="status-select"
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="in-progress">Em Andamento</option>
                      <option value="completed">Concluído</option>
                    </select>
                    <button 
                      className="icon-btn danger"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Admin Simples */}
      <div className="admin-simple-footer">
        <div className="footer-content">
          <p>&copy; 2024 Vander Bancadas - Painel Administrativo</p>
        </div>
      </div>

      {/* Modal Novo Projeto */}
      {showNewProject && (
        <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Projeto</h2>
            <div className="form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nome do projeto"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Selecione o cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Categoria</option>
                  <option value="Cozinha">Cozinha</option>
                  <option value="Banheiro">Banheiro</option>
                  <option value="Área Gourmet">Área Gourmet</option>
                </select>
                <input
                  type="number"
                  placeholder="Valor"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                />
              </div>
              <div className="form-row">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowNewProject(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleNewProject}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNewClient && (
        <div className="modal-overlay" onClick={() => setShowNewClient(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Cliente</h2>
            <div className="form">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
              <input
                type="email"
                placeholder="E-mail"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.clientPhone}
                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowNewClient(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleNewClient}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsSimple
