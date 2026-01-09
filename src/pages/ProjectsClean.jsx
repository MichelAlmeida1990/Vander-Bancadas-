import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Clock, DollarSign, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './ProjectsClean.css'
import '../styles/admin-footer.css'

const ProjectsClean = () => {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
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

  useEffect(() => {
    console.log('ProjectsClean montado')
    setClients([
      { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 97718-0367' },
      { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 97718-0367' }
    ])

    setProjects([
      {
        id: 1,
        name: 'Cozinha Apartamento 1201',
        clientId: 1,
        clientName: 'João Silva',
        category: 'Cozinha',
        value: 25000,
        startDate: '2024-06-01',
        endDate: '2024-06-18',
        status: 'completed',
        paid: true
      },
      {
        id: 2,
        name: 'Banheiro Casa de Campo',
        clientId: 2,
        clientName: 'Maria Santos',
        category: 'Banheiro',
        value: 18000,
        startDate: '2024-06-15',
        endDate: '2024-06-30',
        status: 'in-progress',
        paid: false
      }
    ])
  }, [])

  const handleNewProject = () => {
    console.log('handleNewProject iniciado')
    console.log('formData:', formData)
    
    if (!formData.name || !formData.clientId || !formData.value) {
      console.log('Validação falhou - campos obrigatórios')
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const newProject = {
      id: projects.length + 1,
      name: formData.name,
      clientId: parseInt(formData.clientId),
      clientName: clients.find(c => c.id === parseInt(formData.clientId))?.name || '',
      category: formData.category,
      value: parseFloat(formData.value),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'pending',
      paid: false
    }

    console.log('Novo projeto criado:', newProject)
    setProjects([...projects, newProject])
    setShowNewProject(false)
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
    console.log('Formulário resetado')
  }

  const handleNewClient = () => {
    console.log('handleNewClient iniciado')
    console.log('formData:', formData)
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      console.log('Validação falhou - campos obrigatórios')
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const newClient = {
      id: clients.length + 1,
      name: formData.clientName,
      email: formData.clientEmail,
      phone: formData.clientPhone
    }

    console.log('Novo cliente criado:', newClient)
    setClients([...clients, newClient])
    setShowNewClient(false)
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
    console.log('Formulário resetado')
  }

  const updateProjectStatus = (projectId, newStatus) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return { ...project, status: newStatus }
      }
      return project
    }))
  }

  const togglePayment = (projectId) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return { ...project, paid: !project.paid }
      }
      return project
    }))
  }

  const deleteProject = (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjects(projects.filter(p => p.id !== projectId))
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
      {/* Header Simples */}
      <div className="page-header">
        <h1>Projetos</h1>
        <div className="header-actions">
          <button 
            type="button"
            className="btn" 
            onClick={(e) => {
              e.preventDefault()
              console.log('=== Botão Cliente clicado ===')
              console.log('Evento:', e)
              console.log('showNewClient antes:', showNewClient)
              setShowNewClient(true)
              console.log('showNewClient depois:', true)
            }}
          >
            <Plus size={16} />
            Cliente
          </button>
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={(e) => {
              e.preventDefault()
              console.log('=== Botão Projeto clicado ===')
              console.log('Evento:', e)
              console.log('showNewProject antes:', showNewProject)
              setShowNewProject(true)
              console.log('showNewProject depois:', true)
            }}
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

export default ProjectsClean
