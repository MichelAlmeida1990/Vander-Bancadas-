import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './Projects.css'
import { useAdminData } from '../context/AdminDataContext.jsx'

const Projects = () => {
  const { clients, projects, addClient, addProject, updateProject, deleteProject: deleteProjectFromStore } = useAdminData()
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

    const selectedClient = clients.find(c => c.id === parseInt(formData.clientId))

    addProject({
      name: formData.name,
      clientId: parseInt(formData.clientId),
      clientName: selectedClient?.name || 'Cliente não encontrado',
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
    })
    
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

    addClient({
      name: formData.clientName,
      email: formData.clientEmail,
      phone: formData.clientPhone,
      address: formData.clientAddress,
      type: formData.clientType
    })
    
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
    const project = projects.find(p => p.id === projectId)
    if (!project) return

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

    const actualValue = newProjectStatus === 'completed' ? 
      updatedPhases.reduce((sum, phase) => sum + (phase.actualCost || 0), 0) : 
      project.actualValue

    updateProject(projectId, {
      phases: updatedPhases,
      status: newProjectStatus,
      actualValue
    })
  }

  const deleteClient = (clientId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Todos os projetos associados também serão excluídos.')) {
      // O context já cuida de remover os projetos associados
      // Precisamos implementar no context ou fazer manualmente aqui
      const clientProjects = projects.filter(p => p.clientId === clientId)
      clientProjects.forEach(project => {
        deleteProjectFromStore(project.id)
      })
    }
  }

  const deleteProject = (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProjectFromStore(projectId)
    }
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
    if (!phases || phases.length === 0) return 0
    const completed = phases.filter(p => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  const getFinancialImpact = (project) => {
    if (project.status === 'completed') {
      return project.actualValue || project.estimatedValue || 0
    }
    const completedPhases = project.phases?.filter(p => p.status === 'completed') || []
    return completedPhases.reduce((sum, phase) => sum + (phase.actualCost || 0), 0)
  }

  const exportProjectToPDF = async (project) => {
    try {
      // Criar um elemento HTML temporário para o orçamento
      const budgetElement = document.createElement('div')
      budgetElement.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
        color: #333;
      `
      
      const client = clients.find(c => c.id === project.clientId)
      
      budgetElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #D4A574; padding-bottom: 20px;">
          <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Vander Bancadas</h1>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">Especialistas em Bancadas de Porcelanato</p>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">WhatsApp: (11) 97167-8867 | Instagram: @vander_porcelanatos</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 10px;">Orçamento de Projeto</h2>
          <p style="margin: 5px 0;"><strong>Projeto:</strong> ${project.name}</p>
          <p style="margin: 5px 0;"><strong>Cliente:</strong> ${client?.name || 'Não informado'}</p>
          <p style="margin: 5px 0;"><strong>Categoria:</strong> ${project.category || 'Não informada'}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${getStatusText(project.status)}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">Valores</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Valor Orçado:</strong> R$ ${project.estimatedValue.toLocaleString('pt-BR')}</p>
          ${project.actualValue ? `<p style="margin: 5px 0; font-size: 16px;"><strong>Valor Real:</strong> R$ ${project.actualValue.toLocaleString('pt-BR')}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">Fases do Projeto</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Fase</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">%</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${project.phases.map(phase => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${phase.name}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${phase.percentage}%</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${getStatusText(phase.status)}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">
                    ${phase.actualCost ? `R$ ${phase.actualCost.toLocaleString('pt-BR')}` : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${project.phases.filter(p => p.status === 'completed').length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">Resumo Financeiro</h3>
          <p style="margin: 5px 0;"><strong>Total Concluído:</strong> ${project.phases.filter(p => p.status === 'completed').length} de ${project.phases.length} fases</p>
          <p style="margin: 5px 0;"><strong>Valor Investido:</strong> R$ ${getFinancialImpact(project).toLocaleString('pt-BR')}</p>
          <p style="margin: 5px 0;"><strong>Progresso:</strong> ${getPhaseProgress(project.phases)}%</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>Vander Porcelanato - Especialistas em bancadas em porcelanato, cubas esculpidas e limpeza profissional</p>
          <p>Atendimento em toda a Grande São Paulo</p>
        </div>
      `
      
      document.body.appendChild(budgetElement)
      
      // Capturar o elemento como imagem
      const canvas = await html2canvas(budgetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      // Criar o PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      // Calcular dimensões para caber na página A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      // Salvar o PDF
      const fileName = `orcamento_${project.name.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`
      pdf.save(fileName)
      
      // Remover elemento temporário
      document.body.removeChild(budgetElement)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.')
    }
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
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Nenhum projeto encontrado. Crie seu primeiro projeto!</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header" onClick={() => toggleProjectExpansion(project.id)}>
                <div className="project-info">
                  <h3>{project.name || 'Sem nome'}</h3>
                  <div className="project-meta">
                    <span className="client">
                      <User size={14} />
                      {project.clientName || 'Cliente não encontrado'}
                    </span>
                    <span className="category">{project.category || 'Sem categoria'}</span>
                    <span className="status" style={{ color: getStatusColor(project.status) }}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </div>
                <div className="project-financial">
                  <div className="values">
                    <span className="estimated">Orçado: R$ {project.estimatedValue?.toLocaleString('pt-BR') || '0'}</span>
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
                <div className="project-actions">
                  <button 
                    className="btn-export-pdf"
                    onClick={(e) => {
                      e.stopPropagation()
                      exportProjectToPDF(project)
                    }}
                    title="Exportar Orçamento PDF"
                  >
                    <Download size={16} />
                    PDF
                  </button>
                  <div className="expand-icon">
                    {expandedProjects[project.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Fases do Projeto */}
              {expandedProjects[project.id] && project.phases && (
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
          ))
        )}
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
                  placeholder="(11) 97718-0367"
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
