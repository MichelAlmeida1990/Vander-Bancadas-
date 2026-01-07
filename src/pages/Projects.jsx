import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './Projects.css'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState({})
  const [formData, setFormData] = useState({
    // Formulário de Projeto
    name: '',
    clientId: '',
    category: '',
    estimatedValue: '',
    startDate: '',
    estimatedEndDate: '',
    description: '',
    // Formulário de Cliente
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientType: 'residential'
  })

  // Fases do projeto com impacto financeiro
  const projectPhases = [
    { 
      id: 'analysis', 
      name: 'Análise e Orçamento', 
      percentage: 10, 
      status: 'pending',
      description: 'Análise técnica, medições e preparação de orçamento detalhado'
    },
    { 
      id: 'approval', 
      name: 'Aprovação', 
      percentage: 0, 
      status: 'pending',
      description: 'Aprovação do cliente e assinatura de contrato'
    },
    { 
      id: 'materials', 
      name: 'Compra de Materiais', 
      percentage: 30, 
      status: 'pending',
      description: 'Aquisição de porcelanatos, insumos e ferramentas'
    },
    { 
      id: 'preparation', 
      name: 'Preparação', 
      percentage: 20, 
      status: 'pending',
      description: 'Preparação do local, remoção de bancadas antigas'
    },
    { 
      id: 'installation', 
      name: 'Instalação', 
      percentage: 30, 
      status: 'pending',
      description: 'Instalação das novas bancadas e acabamento'
    },
    { 
      id: 'finalization', 
      name: 'Finalização', 
      percentage: 10, 
      status: 'pending',
      description: 'Limpeza, inspeção final e entrega'
    }
  ]

  useEffect(() => {
    // Dados mockados
    setClients([
      { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321', type: 'residential', projects: 3, totalValue: 75000 },
      { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 91234-5678', type: 'residential', projects: 2, totalValue: 45000 },
      { id: 3, name: 'Tech Solutions Ltda', email: 'contato@techsolutions.com.br', phone: '(11) 3333-4444', type: 'commercial', projects: 5, totalValue: 180000 }
    ])

    setProjects([
      {
        id: 1,
        name: 'Cozinha Moderna - Apartamento 1201',
        clientId: 1,
        clientName: 'João Silva',
        category: 'Cozinhas',
        estimatedValue: 25000,
        actualValue: 24500,
        startDate: '2024-06-01',
        estimatedEndDate: '2024-06-20',
        actualEndDate: '2024-06-18',
        status: 'completed',
        phases: [
          { id: 'analysis', status: 'completed', completedDate: '2024-06-02', actualCost: 2500 },
          { id: 'approval', status: 'completed', completedDate: '2024-06-05', actualCost: 0 },
          { id: 'materials', status: 'completed', completedDate: '2024-06-08', actualCost: 7500 },
          { id: 'preparation', status: 'completed', completedDate: '2024-06-12', actualCost: 5000 },
          { id: 'installation', status: 'completed', completedDate: '2024-06-16', actualCost: 7500 },
          { id: 'finalization', status: 'completed', completedDate: '2024-06-18', actualCost: 2000 }
        ]
      },
      {
        id: 2,
        name: 'Banheiro Premium - Casa de Campo',
        clientId: 2,
        clientName: 'Maria Santos',
        category: 'Banheiros',
        estimatedValue: 18000,
        actualValue: null,
        startDate: '2024-06-15',
        estimatedEndDate: '2024-06-30',
        actualEndDate: null,
        status: 'in-progress',
        phases: [
          { id: 'analysis', status: 'completed', completedDate: '2024-06-16', actualCost: 1800 },
          { id: 'approval', status: 'completed', completedDate: '2024-06-18', actualCost: 0 },
          { id: 'materials', status: 'in-progress', completedDate: null, actualCost: 4500 },
          { id: 'preparation', status: 'pending', completedDate: null, actualCost: null },
          { id: 'installation', status: 'pending', completedDate: null, actualCost: null },
          { id: 'finalization', status: 'pending', completedDate: null, actualCost: null }
        ]
      }
    ])
  }, [])

  const toggleProjectExpansion = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  const handleNewProject = () => {
    if (!formData.name || !formData.clientId || !formData.estimatedValue) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const newProject = {
      id: projects.length + 1,
      name: formData.name,
      clientId: parseInt(formData.clientId),
      clientName: clients.find(c => c.id === parseInt(formData.clientId))?.name || '',
      category: formData.category,
      estimatedValue: parseFloat(formData.estimatedValue),
      actualValue: null,
      startDate: formData.startDate,
      estimatedEndDate: formData.estimatedEndDate,
      actualEndDate: null,
      status: 'pending',
      phases: projectPhases.map(phase => ({
        ...phase,
        status: 'pending',
        completedDate: null,
        actualCost: null
      }))
    }

    setProjects([...projects, newProject])
    setShowNewProject(false)
    setFormData({
      ...formData,
      name: '',
      clientId: '',
      category: '',
      estimatedValue: '',
      startDate: '',
      estimatedEndDate: '',
      description: ''
    })
  }

  const handleNewClient = () => {
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const newClient = {
      id: clients.length + 1,
      name: formData.clientName,
      email: formData.clientEmail,
      phone: formData.clientPhone,
      address: formData.clientAddress,
      type: formData.clientType,
      projects: 0,
      totalValue: 0
    }

    setClients([...clients, newClient])
    setShowNewClient(false)
    setFormData({
      ...formData,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientType: 'residential'
    })
  }

  const updatePhaseStatus = (projectId, phaseId, newStatus) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const updatedPhases = project.phases.map(phase => {
          if (phase.id === phaseId) {
            return {
              ...phase,
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
              actualCost: newStatus === 'completed' ? (project.estimatedValue * phase.percentage / 100) : null
            }
          }
          return phase
        })

        // Atualizar status do projeto baseado nas fases
        const completedPhases = updatedPhases.filter(p => p.status === 'completed').length
        const totalPhases = updatedPhases.length
        let newProjectStatus = 'pending'
        
        if (completedPhases === totalPhases) {
          newProjectStatus = 'completed'
        } else if (completedPhases > 0) {
          newProjectStatus = 'in-progress'
        }

        return {
          ...project,
          phases: updatedPhases,
          status: newProjectStatus,
          actualValue: newProjectStatus === 'completed' ? 
            updatedPhases.reduce((sum, phase) => sum + (phase.actualCost || 0), 0) : 
            project.actualValue
        }
      }
      return project
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745'
      case 'in-progress': return '#ffc107'
      case 'pending': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'in-progress': return 'Em Andamento'
      case 'pending': return 'Pendente'
      default: return 'Pendente'
    }
  }

  const getPhaseProgress = (phases) => {
    const completed = phases.filter(p => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  const getFinancialImpact = (project) => {
    if (project.status === 'completed') {
      return project.actualValue || 0
    }
    const completedPhases = project.phases.filter(p => p.status === 'completed')
    return completedPhases.reduce((sum, phase) => sum + (phase.actualCost || 0), 0)
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Gestão de Projetos</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowNewClient(true)}>
            <Plus size={16} />
            Novo Cliente
          </button>
          <button className="btn-primary" onClick={() => setShowNewProject(true)}>
            <Plus size={16} />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} color="#D4A574" />
          </div>
          <div className="stat-content">
            <h3>Total de Projetos</h3>
            <span className="stat-value">{projects.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} color="#28a745" />
          </div>
          <div className="stat-content">
            <h3>Receita Gerada</h3>
            <span className="stat-value">
              R$ {projects.reduce((sum, p) => sum + getFinancialImpact(p), 0).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} color="#ffc107" />
          </div>
          <div className="stat-content">
            <h3>Em Andamento</h3>
            <span className="stat-value">{projects.filter(p => p.status === 'in-progress').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} color="#007bff" />
          </div>
          <div className="stat-content">
            <h3>Concluídos</h3>
            <span className="stat-value">{projects.filter(p => p.status === 'completed').length}</span>
          </div>
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="projects-list">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header" onClick={() => toggleProjectExpansion(project.id)}>
              <div className="project-info">
                <h3>{project.name}</h3>
                <div className="project-meta">
                  <span className="client">
                    <User size={14} />
                    {project.clientName}
                  </span>
                  <span className="category">{project.category}</span>
                  <span className="status" style={{ color: getStatusColor(project.status) }}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              </div>
              <div className="project-financial">
                <div className="values">
                  <span className="estimated">Orçado: R$ {project.estimatedValue.toLocaleString('pt-BR')}</span>
                  {project.actualValue && (
                    <span className="actual">Real: R$ {project.actualValue.toLocaleString('pt-BR')}</span>
                  )}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${getPhaseProgress(project.phases)}%`,
                      backgroundColor: getStatusColor(project.status)
                    }}
                  />
                </div>
                <span className="progress-text">{getPhaseProgress(project.phases)}%</span>
              </div>
              <div className="expand-icon">
                {expandedProjects[project.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Fases do Projeto */}
            {expandedProjects[project.id] && (
              <div className="project-phases">
                <h4>Fases do Projeto</h4>
                <div className="phases-grid">
                  {project.phases.map(phase => (
                    <div key={phase.id} className={`phase-card ${phase.status}`}>
                      <div className="phase-header">
                        <h5>{phase.name}</h5>
                        <span className="percentage">{phase.percentage}%</span>
                      </div>
                      <p className="phase-description">{phase.description}</p>
                      <div className="phase-details">
                        {phase.completedDate && (
                          <span className="completed-date">
                            <Calendar size={12} />
                            {format(new Date(phase.completedDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        )}
                        {phase.actualCost && (
                          <span className="cost">
                            <DollarSign size={12} />
                            R$ {phase.actualCost.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <div className="phase-actions">
                        {phase.status !== 'completed' && (
                          <button 
                            className="btn-complete"
                            onClick={() => updatePhaseStatus(project.id, phase.id, 'completed')}
                          >
                            <CheckCircle size={14} />
                            Concluir
                          </button>
                        )}
                        {phase.status === 'completed' && (
                          <span className="completed-badge">
                            <CheckCircle size={14} />
                            Concluído
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Novo Projeto */}
      {showNewProject && (
        <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Projeto</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Projeto*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Cozinha Moderna - Apartamento 1201"
                />
              </div>
              <div className="form-group">
                <label>Cliente*</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Cozinhas">Cozinhas</option>
                  <option value="Banheiros">Banheiros</option>
                  <option value="Áreas Gourmet">Áreas Gourmet</option>
                  <option value="Comerciais">Comerciais</option>
                </select>
              </div>
              <div className="form-group">
                <label>Valor Estimado*</label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                  placeholder="25000"
                />
              </div>
              <div className="form-group">
                <label>Data de Início</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Data de Término Estimada</label>
                <input
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={(e) => setFormData({...formData, estimatedEndDate: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNewProject(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleNewProject}>Criar Projeto</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNewClient && (
        <div className="modal-overlay" onClick={() => setShowNewClient(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Cliente</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome*</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="João Silva"
                />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="joao@email.com"
                />
              </div>
              <div className="form-group">
                <label>Telefone*</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  placeholder="(11) 98765-4321"
                />
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                  placeholder="Rua das Flores, 123 - São Paulo/SP"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Cliente</label>
                <select
                  value={formData.clientType}
                  onChange={(e) => setFormData({...formData, clientType: e.target.value})}
                >
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNewClient(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleNewClient}>Criar Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
