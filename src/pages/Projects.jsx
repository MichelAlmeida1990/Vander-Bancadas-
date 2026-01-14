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
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  
  // Debug para monitorar mudanças no modal
  useEffect(() => {
    console.log('🔍 showNewClient mudou para:', showNewClient)
  }, [showNewClient])
  const [contractData, setContractData] = useState({
    clientName: '',
    clientCpf: '',
    clientRg: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    projectName: '',
    projectValue: '',
    projectDescription: '',
    installationDate: '',
    paymentMethod: '',
    paymentTerms: ''
  })
  const [expandedProjects, setExpandedProjects] = useState({})
  
  // Dados da empresa Vander Bancadas
  const companyData = {
    name: 'Vander Bancadas',
    cnpj: '38.022.318/0001-46',
    address: 'São Paulo, SP',
    phone: '(11) 97167-8867',
    email: 'contato@vanderbancadas.com.br',
    instagram: '@vander_bancadas'
  }
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
      description: 'Aquisição de porcelanato e lâminas sinterizadas, quartzo, insumos e ferramentas'
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
      description: 'Inspeção final e entrega'
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

  const handleNewClient = async () => {
    console.log('🔍 handleNewClient iniciado')
    console.log('🔍 showNewClient antes:', showNewClient)
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsCreatingClient(true)
    console.log('🔍 isCreatingClient setado para true')
    
    try {
      console.log('🔍 Chamando addClient...')
      await addClient({
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientAddress,
        type: formData.clientType
      })
      
      console.log('🔍 addClient concluído com sucesso')
      
      // Se chegou aqui, deu certo - fecha o modal
      console.log('🔍 Fechando modal...')
      setShowNewClient(false)
      console.log('🔍 showNewClient setado para false')
      
      setFormData({
        ...formData,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientType: 'residential'
      })
      
      // Feedback de sucesso
      alert('Cliente criado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error)
      alert('Erro ao criar cliente. Tente novamente.')
    } finally {
      console.log('🔍 finally - isCreatingClient setado para false')
      setIsCreatingClient(false)
    }
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

    // Verificar se a fase de aprovação foi concluída para abrir modal de contrato
    if (phaseId === 'approval' && newStatus === 'completed') {
      const client = clients.find(c => c.id === project.clientId)
      setSelectedProject(project)
      setContractData({
        clientName: client?.name || '',
        clientCpf: '',
        clientRg: '',
        clientAddress: client?.address || '',
        clientPhone: client?.phone || '',
        clientEmail: client?.email || '',
        projectName: project.name,
        projectValue: project.estimatedValue.toString(),
        projectDescription: project.description || '',
        installationDate: '',
        paymentMethod: '',
        paymentTerms: ''
      })
      setShowContractModal(true)
    }

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

  const generateContractPDF = async () => {
    try {
      // Criar um elemento HTML temporário para o contrato
      const contractElement = document.createElement('div')
      contractElement.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.4;
      `
      
      contractElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #D4A574; padding-bottom: 20px;">
          <h1 style="color: #D4A574; margin: 0; font-size: 28px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
          <h2 style="color: #666; margin: 10px 0; font-size: 20px;">Vander Bancadas</h2>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">CNPJ: ${companyData.cnpj}</p>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">${companyData.address} | ${companyData.phone} | ${companyData.email}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">DAS PARTES</h3>
          <p style="margin: 10px 0;"><strong>CONTRATADO:</strong> ${companyData.name}, empresa inscrita no CNPJ nº ${companyData.cnpj}, com sede em ${companyData.address}.</p>
          <p style="margin: 10px 0;"><strong>CONTRATANTE:</strong> ${contractData.clientName}, portador(a) do CPF nº ${contractData.clientCpf || '[Informar]'}, RG nº ${contractData.clientRg || '[Informar]'}, residente e domiciliado(a) à ${contractData.clientAddress || '[Informar]'}.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA PRIMEIRA – DO OBJETO</h3>
          <p style="margin: 10px 0;">O presente contrato tem como objeto a prestação de serviços de fornecimento e instalação de bancadas em porcelanato e lâminas sinterizadas, quartzo e similares, conforme especificações do projeto <strong>"${contractData.projectName}"</strong>.</p>
          <p style="margin: 10px 0;"><strong>Descrição:</strong> ${contractData.projectDescription || 'Instalação de bancadas conforme projeto aprovado.'}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA SEGUNDA – DO VALOR E CONDIÇÕES DE PAGAMENTO</h3>
          <p style="margin: 10px 0;"><strong>Valor Total:</strong> R$ ${parseFloat(contractData.projectValue).toLocaleString('pt-BR')}</p>
          <p style="margin: 10px 0;"><strong>Forma de Pagamento:</strong> ${contractData.paymentMethod || 'A definir'}</p>
          <p style="margin: 10px 0;"><strong>Condições:</strong> ${contractData.paymentTerms || '50% de sinal e 50% na entrega'}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA TERCEIRA – DO PRAZO DE EXECUÇÃO</h3>
          <p style="margin: 10px 0;"><strong>Início Previsto:</strong> ${contractData.installationDate || 'A definir'}</p>
          <p style="margin: 10px 0;">O prazo de entrega varia entre 20 a 30 dias corridos, contados a partir do pagamento do sinal.</p>
          <p style="margin: 10px 0;">Trabalhamos com acabamento em massa base epóxi, oferecendo melhor acabamento e maior resistência mecânica contra impactos e desplacamento.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA QUARTA – DAS OBRIGAÇÕES DO CONTRATADO</h3>
          <p style="margin: 10px 0;">I. Fornecer materiais de qualidade conforme especificações acordadas;</p>
          <p style="margin: 10px 0;">II. Executar os serviços com profissionalismo e nos prazos estabelecidos;</p>
          <p style="margin: 10px 0;">III. Oferecer garantia de 2 anos contra defeitos de fabricação e instalação;</p>
          <p style="margin: 10px 0;">IV. Responsabilizar-se por quebras durante transporte e instalação.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA QUINTA – DAS OBRIGAÇÕES DO CONTRATANTE</h3>
          <p style="margin: 10px 0;">I. Garantir acesso ao local dos trabalhos;</p>
          <p style="margin: 10px 0;">II. Efetuar os pagamentos nos prazos estipulados;</p>
          <p style="margin: 10px 0;">III. Fornecer medidas corretas e projetos atualizados;</p>
          <p style="margin: 10px 0;">IV. Responsabilizar-se por itens fornecidos pelo cliente (cubas, torneiras).</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA SEXTA – CONDIÇÕES COMERCIAIS</h3>
          <p style="margin: 10px 0;">• Orçamento válido por 2 meses;</p>
          <p style="margin: 10px 0;">• 5% de desconto para pagamento em PIX ou dinheiro;</p>
          <p style="margin: 10px 0;">• Parcelamento em até 6x sem juros no cartão;</p>
          <p style="margin: 10px 0;">• Sinal obrigatório de 50% (pode ser parcelado).</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA SÉTIMA – DA GARANTIA</h3>
          <p style="margin: 10px 0;">O CONTRATADO oferece garantia de 2 (dois) anos contra defeitos de instalação, não cobrindo danos por uso inadequado, quedas ou impactos acidentais.</p>
        </div>
        
        <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #D4A574;">
          <div style="display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 45%;">
              <p style="margin: 0 0 60px 0; border-bottom: 1px solid #333; padding-bottom: 5px;">${companyData.name}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">CONTRATADO</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <p style="margin: 0 0 60px 0; border-bottom: 1px solid #333; padding-bottom: 5px;">${contractData.clientName}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">CONTRATANTE</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
            <p>São Paulo, ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>
        </div>
      `
      
      document.body.appendChild(contractElement)
      
      // Capturar o elemento como imagem
      const canvas = await html2canvas(contractElement, {
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
      const fileName = `contrato_${contractData.projectName.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`
      pdf.save(fileName)
      
      // Remover elemento temporário
      document.body.removeChild(contractElement)
      
      // Fechar modal
      setShowContractModal(false)
      
    } catch (error) {
      console.error('Erro ao gerar contrato:', error)
      alert('Ocorreu um erro ao gerar o contrato. Tente novamente.')
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
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
        color: #333;
      `
      
      const client = clients.find(c => c.id === project.clientId)
      
      budgetElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #D4A574; padding-bottom: 20px;">
          <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Vander Bancadas</h1>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">Especialistas em Bancadas de Porcelanato, Lâminas Sinterizadas e Quartzo</p>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">WhatsApp: (11) 97167-8867 | Instagram: @vander_bancadas</p>
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
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #D4A574; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 16px; text-align: center;">⚠️ CONDIÇÕES COMERCIAIS IMPORTANTES</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
              <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;">
                <strong style="color: #D4A574; display: block; margin-bottom: 3px;">📅 Validade</strong>
                Orçamento válido por 2 meses
              </div>
              <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;">
                <strong style="color: #D4A574; display: block; margin-bottom: 3px;">🚚 Prazo de Entrega</strong>
                20 a 30 dias corridos
              </div>
              <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;">
                <strong style="color: #D4A574; display: block; margin-bottom: 3px;">💳 Desconto PIX/Dinheiro</strong>
                5% de desconto
              </div>
              <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;">
                <strong style="color: #D4A574; display: block; margin-bottom: 3px;">📦 Parcelamento</strong>
                Até 6x sem juros
              </div>
              <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6; grid-column: span 2;">
                <strong style="color: #D4A574; display: block; margin-bottom: 3px;">🔧 Sinal Obrigatório</strong>
                50% de sinal (pode ser parcelado) - Prazo de instalação contado a partir do pagamento do sinal
              </div>
            </div>
            <div style="margin-top: 12px; padding: 10px; background: #fff3cd; border-radius: 6px; border-left: 3px solid #ffc107; font-size: 11px;">
              <strong style="color: #856404;">⭐ ACABAMENTO PREMIUM:</strong> Trabalhamos com acabamento em massa base epóxi, oferecendo melhor acabamento e maior resistência mecânica contra impactos e desplacamento.
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p><strong>Vander Bancadas</strong> - Especialistas em bancadas de porcelanato, lâminas sinterizadas e quartzo</p>
            <p>Atendimento em toda a Grande São Paulo</p>
          </div>
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
          <button 
            className="btn-primary" 
            onClick={() => {
              console.log('Testando modal...')
              setSelectedProject({name: 'Projeto Teste', estimatedValue: 25000, description: 'Descrição teste'})
              setContractData({
                clientName: 'Cliente Teste',
                clientCpf: '123.456.789-00',
                clientRg: '12.345.678-9',
                clientAddress: 'Rua Teste, 123 - São Paulo/SP',
                clientPhone: '(11) 97718-0367',
                clientEmail: 'teste@email.com',
                projectName: 'Projeto Teste',
                projectValue: '25000',
                projectDescription: 'Descrição detalhada dos serviços...',
                installationDate: '',
                paymentMethod: '',
                paymentTerms: ''
              })
              setShowContractModal(true)
            }}
            style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
          >
            🚨 TESTAR CONTRATO
          </button>
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
                <div className="project-actions" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <button 
                    className="btn-export-pdf"
                    onClick={(e) => {
                      e.stopPropagation()
                      exportProjectToPDF(project)
                    }}
                    title="Exportar Orçamento PDF"
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginRight: '8px'
                    }}
                  >
                    <Download size={14} />
                    <span>Orçamento</span>
                  </button>
                  <button 
                    className="btn-generate-contract"
                    onClick={(e) => {
                      e.stopPropagation()
                      const client = clients.find(c => c.id === project.clientId)
                      setSelectedProject(project)
                      setContractData({
                        clientName: client?.name || '',
                        clientCpf: '',
                        clientRg: '',
                        clientAddress: client?.address || '',
                        clientPhone: client?.phone || '',
                        clientEmail: client?.email || '',
                        projectName: project.name,
                        projectValue: project.estimatedValue.toString(),
                        projectDescription: project.description || '',
                        installationDate: '',
                        paymentMethod: '',
                        paymentTerms: ''
                      })
                      setShowContractModal(true)
                    }}
                    title="Gerar Contrato de Serviços"
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      minWidth: '80px'
                    }}
                  >
                    <FileText size={14} />
                    <span>Contrato</span>
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
              <button className="btn-secondary" onClick={() => setShowNewClient(false)} disabled={isCreatingClient}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleNewClient} disabled={isCreatingClient}>
                {isCreatingClient ? 'Criando...' : 'Criar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contrato */}
      {showContractModal && (
        <div className="modal-overlay" onClick={() => setShowContractModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '800px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h2>Gerar Contrato de Prestação de Serviços</h2>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Nome do Cliente*</label>
                <input
                  type="text"
                  value={contractData.clientName}
                  onChange={(e) => setContractData({...contractData, clientName: e.target.value})}
                  placeholder="Nome completo do cliente"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>CPF*</label>
                <input
                  type="text"
                  value={contractData.clientCpf}
                  onChange={(e) => setContractData({...contractData, clientCpf: e.target.value})}
                  placeholder="000.000.000-00"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>RG</label>
                <input
                  type="text"
                  value={contractData.clientRg}
                  onChange={(e) => setContractData({...contractData, clientRg: e.target.value})}
                  placeholder="00.000.000-0"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Endereço*</label>
                <input
                  type="text"
                  value={contractData.clientAddress}
                  onChange={(e) => setContractData({...contractData, clientAddress: e.target.value})}
                  placeholder="Rua das Flores, 123 - São Paulo/SP"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Telefone*</label>
                <input
                  type="tel"
                  value={contractData.clientPhone}
                  onChange={(e) => setContractData({...contractData, clientPhone: e.target.value})}
                  placeholder="(11) 97718-0367"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Email</label>
                <input
                  type="email"
                  value={contractData.clientEmail}
                  onChange={(e) => setContractData({...contractData, clientEmail: e.target.value})}
                  placeholder="cliente@email.com"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Nome do Projeto*</label>
                <input
                  type="text"
                  value={contractData.projectName}
                  onChange={(e) => setContractData({...contractData, projectName: e.target.value})}
                  placeholder="Cozinha Moderna"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Valor do Projeto*</label>
                <input
                  type="number"
                  value={contractData.projectValue}
                  onChange={(e) => setContractData({...contractData, projectValue: e.target.value})}
                  placeholder="25000"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{gridColumn: 'span 2'}}>
                <label>Descrição do Projeto</label>
                <textarea
                  value={contractData.projectDescription}
                  onChange={(e) => setContractData({...contractData, projectDescription: e.target.value})}
                  placeholder="Descrição detalhada dos serviços a serem executados..."
                  rows={3}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
              <div className="form-group">
                <label>Data Prevista de Instalação</label>
                <input
                  type="date"
                  value={contractData.installationDate}
                  onChange={(e) => setContractData({...contractData, installationDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select
                  value={contractData.paymentMethod}
                  onChange={(e) => setContractData({...contractData, paymentMethod: e.target.value})}
                >
                  <option value="">Selecione</option>
                  <option value="PIX">PIX (5% de desconto)</option>
                  <option value="Dinheiro">Dinheiro (5% de desconto)</option>
                  <option value="Cartão">Cartão (até 6x sem juros)</option>
                </select>
              </div>
              <div className="form-group" style={{gridColumn: 'span 2'}}>
                <label>Condições de Pagamento</label>
                <textarea
                  value={contractData.paymentTerms}
                  onChange={(e) => setContractData({...contractData, paymentTerms: e.target.value})}
                  placeholder="50% de sinal e 50% na entrega..."
                  rows={2}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
            </div>
            <div className="modal-actions" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowContractModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={generateContractPDF}
                disabled={!contractData.clientName || !contractData.clientCpf || !contractData.clientAddress || !contractData.clientPhone || !contractData.projectName || !contractData.projectValue}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#D4A574',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Gerar Contrato PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
