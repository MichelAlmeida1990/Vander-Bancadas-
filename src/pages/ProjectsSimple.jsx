import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Clock, DollarSign, User, Calendar, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useLocation } from 'react-router-dom'
import './ProjectsClean.css'
import '../styles/admin-footer.css'
import { useAdminData } from '../context/AdminDataContext.jsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Função para criar data local sem problemas de timezone
const createLocalDate = (dateString) => {
  if (!dateString) return null
  // Converte YYYY-MM-DD para Date
  const [year, month, day] = dateString.split('-')
  // Cria data sem complicações de timezone
  return new Date(year, month - 1, day)
}

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
    setShowNewClient(true)
  }

  const openProjectModal = () => {
    setShowNewProject(true)
  }

  const closeClientModal = () => {
    setShowNewClient(false)
    window.history.replaceState(null, '', '/admin/projects')
  }

  const closeProjectModal = () => {
    setShowNewProject(false)
    window.history.replaceState(null, '', '/admin/projects')
  }

  const handleNewProject = () => {
    if (!formData.name || !formData.clientId || !formData.value) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const selectedClient = clients.find(c => c.id === parseInt(formData.clientId))

    addProject({
      name: formData.name,
      clientId: parseInt(formData.clientId),
      clientName: selectedClient?.name || 'Cliente não encontrado',
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

  const exportProjectToPDF = async (project) => {
    try {
      // Criar um elemento HTML temporário para o orçamento
      const budgetElement = document.createElement('div')
      budgetElement.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        padding: 50px;
        background: white;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #333;
        line-height: 1.6;
      `
      
      const statusColor = project.status === 'completed' ? '#28a745' : 
                          project.status === 'in-progress' ? '#ffc107' : '#6c757d'
      
      const statusText = project.status === 'completed' ? 'Concluído' : 
                        project.status === 'in-progress' ? 'Em Andamento' : 'Pendente'
      
      budgetElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #D4A574; padding-bottom: 25px;">
          <div style="margin-bottom: 20px;">
            <img src="/gallery/bancada-porcelanato-025.jpg" alt="Vander Bancadas Logo" style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 4px solid #D4A574; box-shadow: 0 4px 15px rgba(212, 165, 116, 0.3);" />
          </div>
          <h1 style="color: #D4A574; margin: 15px 0 0 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">VANDER BANCADAS</h1>
          <p style="margin: 8px 0; color: #666; font-size: 16px; font-weight: 500;">Especialistas em Bancadas de Porcelanato</p>
          <p style="margin: 5px 0; color: #888; font-size: 13px;">WhatsApp: (11) 97167-8867 | Instagram: @vander_porcelanatos</p>
          <p style="margin: 5px 0; color: #888; font-size: 13px;">Atendimento em toda a Grande São Paulo</p>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h2 style="color: #333; margin-bottom: 15px; font-size: 24px; border-left: 4px solid #D4A574; padding-left: 15px;">PROPOSTA COMERCIAL</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #D4A574;">
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Projeto:</strong> <span style="color: #555;">${project.name || 'Não informado'}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Cliente:</strong> <span style="color: #555;">${project.clientName || 'Não informado'}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Categoria:</strong> <span style="color: #555;">${project.category || 'Não informada'}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Data da Proposta:</strong> <span style="color: #555;">${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Status:</strong> <span style="color: ${statusColor}; font-weight: 600; padding: 4px 12px; background: ${statusColor}20; border-radius: 20px; font-size: 13px;">${statusText}</span></p>
          </div>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; border-left: 4px solid #D4A574; padding-left: 15px;">DETALHES FINANCEIROS</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 16px; color: #333;"><strong>Valor do Projeto:</strong></span>
              <span style="font-size: 20px; font-weight: 700; color: #D4A574;">R$ ${(project.value || 0).toLocaleString('pt-BR')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #dee2e6;">
              <span style="font-size: 16px; color: #333;"><strong>Situação Pagamento:</strong></span>
              <span style="font-size: 16px; font-weight: 600; color: ${project.paid ? '#28a745' : '#dc3545'};">${project.paid ? '✓ PAGO' : '○ PENDENTE'}</span>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; border-left: 4px solid #D4A574; padding-left: 15px;">CRONOGRAMA</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            ${project.startDate ? `
              <div style="margin-bottom: 10px;">
                <span style="font-size: 15px; color: #333;"><strong>Início Previsto:</strong></span>
                <span style="margin-left: 10px; color: #555;">${format(createLocalDate(project.startDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            ` : '<p style="color: #888; font-style: italic;">Data de início não definida</p>'}
            ${project.endDate ? `
              <div>
                <span style="font-size: 15px; color: #333;"><strong>Término Previsto:</strong></span>
                <span style="margin-left: 10px; color: #555;">${format(createLocalDate(project.endDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #D4A574;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Vander Porcelanato</h4>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Especialistas em bancadas em porcelanato, cubas esculpidas e limpeza profissional</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Atendimento em toda a Grande São Paulo com qualidade e garantia</p>
          </div>
          <div style="display: flex; justify-content: space-around; margin-top: 20px; text-align: center;">
            <div>
              <p style="margin: 0; color: #333; font-weight: 600; font-size: 14px;">WHATSAPP</p>
              <p style="margin: 0; color: #D4A574; font-size: 13px;">(11) 97167-8867</p>
            </div>
            <div>
              <p style="margin: 0; color: #333; font-weight: 600; font-size: 14px;">INSTAGRAM</p>
              <p style="margin: 0; color: #D4A574; font-size: 13px;">@vander_porcelanatos</p>
            </div>
            <div>
              <p style="margin: 0; color: #333; font-weight: 600; font-size: 14px;">CNPJ</p>
              <p style="margin: 0; color: #D4A574; font-size: 13px;">XX.XXX.XXX/0001-XX</p>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 11px; font-style: italic;">
          <p>Proposta válida por 30 dias | Sujeito à aprovação técnica no local</p>
        </div>
      `
      
      document.body.appendChild(budgetElement)
      
      // Aguardar a imagem carregar antes de capturar
      const image = budgetElement.querySelector('img')
      if (image) {
        await new Promise((resolve, reject) => {
          image.onload = resolve
          image.onerror = reject
          // Timeout caso a imagem não carregue
          setTimeout(() => reject(new Error('Image load timeout')), 5000)
        })
      }
      
      // Capturar o elemento como imagem
      const canvas = await html2canvas(budgetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
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
      const fileName = `proposta_${project.name?.replace(/[^a-z0-9]/gi, '_') || 'projeto'}_${format(new Date(), 'dd-MM-yyyy')}.pdf`
      pdf.save(fileName)
      
      // Remover elemento temporário
      document.body.removeChild(budgetElement)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.')
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
                    <div className="project-name">{project.name || 'Sem nome'}</div>
                    <div className="project-category">{project.category || 'Sem categoria'}</div>
                  </div>
                </td>
                <td>
                  <div className="client-info">
                    <User size={14} />
                    {project.clientName || 'Cliente não encontrado'}
                  </div>
                </td>
                <td className="value">R$ {(project.value || 0).toLocaleString('pt-BR')}</td>
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
                    <button 
                      className="icon-btn pdf-btn"
                      onClick={() => exportProjectToPDF(project)}
                      title="Exportar Orçamento PDF"
                    >
                      <Download size={14} />
                    </button>
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
                  placeholder="Data início"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  onFocus={(e) => e.target.showPicker()}
                  onClick={(e) => e.target.showPicker()}
                />
                <input
                  type="date"
                  placeholder="Data término"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  onFocus={(e) => e.target.showPicker()}
                  onClick={(e) => e.target.showPicker()}
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
