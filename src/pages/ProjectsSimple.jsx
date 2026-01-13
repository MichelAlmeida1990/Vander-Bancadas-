import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Clock, DollarSign, User, Calendar, Download, FileText } from 'lucide-react'
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
  
  // Estados para o modal de contrato
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
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
  
  // Dados da empresa Vander Bancadas
  const companyData = {
    name: 'Vander Bancadas',
    cnpj: '38.022.318/0001-46',
    address: 'São Paulo, SP',
    phone: '(11) 97167-8867',
    email: 'contato@vanderbancadas.com.br',
    instagram: '@vander_bancadas'
  }

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
          <p style="margin: 8px 0; color: #666; font-size: 16px; font-weight: 500;">Especialistas em Bancadas de Mármore e Granito</p>
          <p style="margin: 5px 0; color: #888; font-size: 13px;">WhatsApp: (11) 97167-8867 | Instagram: @vander_bancadas</p>
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
          </div>
        </div>
        
        <div style="margin-bottom: 35px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #D4A574;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px; text-align: center;">⚠️ CONDIÇÕES COMERCIAIS IMPORTANTES</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6;">
              <strong style="color: #D4A574; display: block; margin-bottom: 5px;">📅 Validade</strong>
              Orçamento válido por 2 meses
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6;">
              <strong style="color: #D4A574; display: block; margin-bottom: 5px;">🚚 Prazo de Entrega</strong>
              20 a 30 dias corridos
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6;">
              <strong style="color: #D4A574; display: block; margin-bottom: 5px;">💳 Desconto PIX/Dinheiro</strong>
              5% de desconto
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6;">
              <strong style="color: #D4A574; display: block; margin-bottom: 5px;">📦 Parcelamento</strong>
              Até 6x sem juros
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6; grid-column: span 2;">
              <strong style="color: #D4A574; display: block; margin-bottom: 5px;">🔧 Sinal Obrigatório</strong>
              50% de sinal (pode ser parcelado) - Prazo de instalação contado a partir do pagamento do sinal
            </div>
          </div>
          <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-radius: 6px; border-left: 3px solid #ffc107; font-size: 12px;">
            <strong style="color: #856404;">⭐ ACABAMENTO PREMIUM:</strong> Trabalhamos com acabamento em massa base epóxi, oferecendo melhor acabamento e maior resistência mecânica contra impactos e desplacamento.
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
            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Vander Bancadas</h4>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Especialistas em bancadas em mármore, granito e quartzo com acabamento em massa base epóxi</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Atendimento em toda a Grande São Paulo com qualidade e garantia</p>
          </div>
          <div style="display: flex; justify-content: space-around; margin-top: 20px; text-align: center;">
            <div>
              <p style="margin: 0; color: #333; font-weight: 600; font-size: 14px;">WHATSAPP</p>
              <p style="margin: 0; color: #D4A574; font-size: 13px;">(11) 97167-8867</p>
            </div>
            <div>
              <p style="margin: 0; color: #333; font-weight: 600; font-size: 14px;">INSTAGRAM</p>
              <p style="margin: 0; color: #D4A574; font-size: 13px;">@vander_bancadas</p>
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
          <p style="margin: 10px 0;">O presente contrato tem como objeto a prestação de serviços de fornecimento e instalação de bancadas em mármore, granito e similares, conforme especificações do projeto <strong>"${contractData.projectName}"</strong>.</p>
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
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '4px'
                      }}
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      className="icon-btn contract-btn"
                      onClick={() => {
                        setSelectedProject(project)
                        setContractData({
                          clientName: project.clientName || '',
                          clientCpf: '',
                          clientRg: '',
                          clientAddress: '',
                          clientPhone: '',
                          clientEmail: '',
                          projectName: project.name,
                          projectValue: (project.value || 0).toString(),
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
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '4px'
                      }}
                    >
                      <FileText size={14} />
                    </button>
                    <button 
                      className="icon-btn edit-btn"
                      onClick={() => openEditModal(project)}
                      title="Editar projeto"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="icon-btn delete-btn"
                      onClick={() => deleteProject(project.id)}
                      title="Excluir projeto"
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
            <div style={{marginBottom: '15px'}}>
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
            <div style={{marginBottom: '15px'}}>
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
            <div style={{marginBottom: '15px'}}>
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
            <div style={{marginBottom: '15px'}}>
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
            <div style={{marginBottom: '15px'}}>
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
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
              <button 
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
                onClick={generateContractPDF}
                disabled={!contractData.clientName || !contractData.clientCpf || !contractData.clientAddress || !contractData.clientPhone || !contractData.projectValue}
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

export default ProjectsSimple
