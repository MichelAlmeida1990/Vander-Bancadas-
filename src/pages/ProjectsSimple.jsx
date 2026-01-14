import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, User, CheckCircle, Clock, Download, FileText, Edit, Trash2, X, DollarSign, Calendar } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import '../styles/modal-projeto.css'
import '../styles/projects-page.css'
import '../styles/admin-footer.css'
import '../styles/categories.css'
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
    email: 'Vander1988@hotmail.com',
    instagram: '@vander_bancadas'
  }

  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    category: [], // Array para múltiplas categorias
    value: '',
    startDate: '',
    endDate: '',
    clientName: '', 
    clientEmail: '', 
    clientPhone: '',
    // Campos dinâmicos para categorias
    categories: {
      cozinha: { checked: false, observation: '', value: '' },
      banheiro: { checked: false, observation: '', value: '' },
      area_gourmet: { checked: false, observation: '', value: '' },
      nicho: { checked: false, observation: '', value: '' },
      prateleira: { checked: false, observation: '', value: '' },
      bancada: { checked: false, observation: '', value: '' }
    }
  })

  const showFeedback = (message) => {
    setFeedback(message)
    setTimeout(() => {
      setFeedback('')
    }, 2500)
  }

  // Função para calcular valor total das categorias
  const calculateTotalValue = (categories) => {
    if (!categories) return '0.00'
    
    const total = Object.values(categories || formData.categories)
      .filter(cat => cat.checked)
      .reduce((sum, cat) => sum + parseFloat(cat.value || 0), 0)
    return total.toFixed(2)
  }

  // Função para atualizar categoria
  const updateCategory = (categoryName, field, value) => {
    setFormData(prev => {
      const prevCategories = prev.categories || {}
      const updatedCategories = {
        ...prevCategories,
        [categoryName]: {
          ...prevCategories[categoryName],
          [field]: value
        }
      }
      
      // Atualizar array de categorias marcadas
      const checkedCategories = Object.entries(updatedCategories)
        .filter(([_, cat]) => cat.checked)
        .map(([name, _]) => {
          const categoryNames = {
            cozinha: 'Cozinha',
            banheiro: 'Banheiro',
            area_gourmet: 'Área Gourmet',
            nicho: 'Nicho',
            prateleira: 'Prateleira',
            bancada: 'Bancada'
          }
          return categoryNames[name]
        })
      
      // Calcular valor total com as categorias atualizadas
      const totalValue = Object.values(updatedCategories)
        .filter(cat => cat.checked)
        .reduce((sum, cat) => sum + parseFloat(cat.value || 0), 0)
      
      return {
        ...prev,
        categories: updatedCategories,
        category: checkedCategories,
        value: totalValue.toFixed(2)
      }
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const modal = params.get('modal')

    // Evita abrir modal se já estiver aberto
    if (modal === 'client' && !showNewClient) {
      setShowNewClient(true)
      setShowNewProject(false)
    }

    if (modal === 'project' && !showNewProject) {
      setShowNewProject(true)
      setShowNewClient(false)
    }
  }, [location.search, showNewClient, showNewProject])

  // Atualizar valor total quando as categorias mudam
  useEffect(() => {
    if (!formData.categories) return
    
    const totalValue = Object.values(formData.categories)
      .filter(cat => cat.checked)
      .reduce((sum, cat) => sum + parseFloat(cat.value || 0), 0)
    
    if (totalValue !== parseFloat(formData.value)) {
      setFormData(prev => ({
        ...prev,
        value: totalValue.toFixed(2)
      }))
    }
  }, [formData.categories])

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

    // Melhorar a busca do cliente - tentar como número e como string
    const selectedClient = clients.find(c => 
      c.id === parseInt(formData.clientId) || c.id === formData.clientId
    )

    addProject({
      name: formData.name,
      clientId: parseInt(formData.clientId),
      clientName: selectedClient?.name || 'Cliente não encontrado',
      category: formData.category,
      value: parseFloat(formData.value),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'pending',
      paid: false,
      categories: formData.categories // Salvar categorias detalhadas
    })
    
    setShowNewProject(false)
    showFeedback('Projeto cadastrado com sucesso!')
    setFormData({ 
      name: '', 
      clientId: '', 
      category: [], 
      value: '', 
      startDate: '', 
      endDate: '',
      clientName: '', 
      clientEmail: '', 
      clientPhone: '',
      categories: {
        cozinha: { checked: false, observation: '', value: '' },
        banheiro: { checked: false, observation: '', value: '' },
        area_gourmet: { checked: false, observation: '', value: '' },
        nicho: { checked: false, observation: '', value: '' },
        prateleira: { checked: false, observation: '', value: '' },
        bancada: { checked: false, observation: '', value: '' }
      }
    })
  }

  const handleNewClient = () => {
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    // Verifica se já existe um cliente com mesmo email para evitar duplicação
    const existingClient = clients.find(c => c.email === formData.clientEmail)
    if (existingClient) {
      alert('Já existe um cliente com este email!')
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
    // Limpa a URL para não abrir o modal novamente ao recarregar
    window.history.replaceState(null, '', '/admin/projects')
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
          <p style="margin: 8px 0; color: #666; font-size: 16px; font-weight: 500;">Especialistas em Bancadas de Porcelanato, Lâminas Sinterizadas e Quartzo</p>
          <p style="margin: 5px 0; color: #888; font-size: 13px;">WhatsApp: (11) 97167-8867 | Instagram: @vander_bancadas</p>
          <p style="margin: 5px 0; color: #888; font-size: 13px;">Email: Vander1988@hotmail.com</p>
          <p style="margin: 5px 0; color: #888; font-size: 13px;">Atendimento em toda a Grande São Paulo</p>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h2 style="color: #333; margin-bottom: 15px; font-size: 24px; border-left: 4px solid #D4A574; padding-left: 15px;">PROPOSTA COMERCIAL</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #D4A574;">
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Projeto:</strong> <span style="color: #555;">${project.name || 'Não informado'}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Cliente:</strong> <span style="color: #555;">${project.clientName || 'Não informado'}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Categoria:</strong> <span style="color: #555;">${Array.isArray(project.category) ? project.category.join(', ') : (project.category || 'Não informada')}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Data da Proposta:</strong> <span style="color: #555;">${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</span></p>
            <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #333;">Status:</strong> <span style="color: ${statusColor}; font-weight: 600; padding: 4px 12px; background: ${statusColor}20; border-radius: 20px; font-size: 13px;">${statusText}</span></p>
          </div>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; border-left: 4px solid #D4A574; padding-left: 15px;">DETALHES DAS CATEGORIAS</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            ${project.categories ? Object.entries(project.categories)
              .filter(([_, cat]) => cat.checked)
              .map(([key, cat]) => {
                const categoryNames = {
                  cozinha: 'Cozinha',
                  banheiro: 'Banheiro',
                  area_gourmet: 'Área Gourmet',
                  nicho: 'Nicho',
                  prateleira: 'Prateleira',
                  bancada: 'Bancada'
                }
                return `
                  <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #dee2e6;">
                    <h4 style="color: #D4A574; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${categoryNames[key]}</h4>
                    ${cat.observation ? `<p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Observação:</strong> ${cat.observation}</p>` : ''}
                    <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Valor:</strong> <span style="color: #D4A574; font-weight: 600;">R$ ${parseFloat(cat.value || 0).toLocaleString('pt-BR')}</span></p>
                  </div>
                `
              }).join('') : '<p style="color: #666; font-style: italic;">Nenhuma categoria detalhada</p>'}
          </div>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; border-left: 4px solid #D4A574; padding-left: 15px;">DETALHES FINANCEIROS</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 16px; color: #333;"><strong>Valor Total do Projeto:</strong></span>
              <span style="font-size: 20px; font-weight: 700; color: #D4A574;">R$ ${(project.value || 0).toLocaleString('pt-BR')}</span>
            </div>
            ${project.categories ? `
              <div style="border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 10px;">
                <h5 style="margin: 0 0 10px 0; font-size: 14px; color: #666; font-weight: 600;">RESUMO POR CATEGORIA:</h5>
                ${Object.entries(project.categories)
                  .filter(([_, cat]) => cat.checked)
                  .map(([key, cat]) => {
                    const categoryNames = {
                      cozinha: 'Cozinha',
                      banheiro: 'Banheiro',
                      area_gourmet: 'Área Gourmet',
                      nicho: 'Nicho',
                      prateleira: 'Prateleira',
                      bancada: 'Bancada'
                    }
                    return `
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
                        <span style="color: #666;">${categoryNames[key]}:</span>
                        <span style="color: #333; font-weight: 500;">R$ ${parseFloat(cat.value || 0).toLocaleString('pt-BR')}</span>
                      </div>
                    `
                  }).join('')}
              </div>
            ` : ''}
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
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Especialistas em bancadas de porcelanato, lâminas sinterizadas e quartzo com acabamento em massa base epóxi</p>
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
      `
      
      // Gerar HTML das categorias com observações
      const categoriesHTML = contractData.categories ? 
        Object.entries(contractData.categories)
          .filter(([_, cat]) => cat.checked)
          .map(([key, cat]) => {
            const categoryNames = {
              cozinha: 'Cozinha',
              banheiro: 'Banheiro',
              area_gourmet: 'Área Gourmet',
              nicho: 'Nicho',
              prateleira: 'Prateleira',
              bancada: 'Bancada'
            }
            return `
              <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #dee2e6;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #D4A574;">${categoryNames[key]}</p>
                ${cat.observation ? `<p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Observações:</strong> ${cat.observation}</p>` : ''}
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Valor:</strong> R$ ${parseFloat(cat.value || 0).toLocaleString('pt-BR')}</p>
              </div>
            `
          }).join('') : ''
      
      contractElement.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4A574; margin: 0; font-size: 28px; border-bottom: 3px solid #D4A574; padding-bottom: 10px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
            <p style="margin: 10px 0; color: #666; font-size: 14px;">Vander Bancadas - CNPJ: ${companyData.cnpj}</p>
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
            
            ${categoriesHTML ? `
              <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #D4A574;">
                <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">ESPECIFICAÇÕES DETALHADAS:</h4>
                ${categoriesHTML}
              </div>
            ` : ''}
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
            <p style="margin: 10px 0;">I. Efetuar o pagamento nas condições acordadas;</p>
            <p style="margin: 10px 0;">II. Garantir acesso ao local da obra;</p>
            <p style="margin: 10px 0;">III. Informar sobre qualquer irregularidade no local;</p>
            <p style="margin: 10px 0;">IV. Disponibilizar ponto de água e energia elétrica.</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 10px;">CLÁUSULA SEXTA – DA RESCISÃO</h3>
            <p style="margin: 10px 0;">O contrato poderá ser rescindido por:</p>
            <p style="margin: 10px 0;">I. Mútuo acordo entre as partes;</p>
            <p style="margin: 10px 0;">II. Inadimplência do contratante por mais de 30 dias;</p>
            <p style="margin: 10px 0;">III. Descumprimento de quaisquer cláusulas contratuais.</p>
          </div>
          
          <div style="margin-top: 50px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div style="text-align: center; width: 45%;">
                <p style="margin: 0 0 60px 0; border-bottom: 1px solid #333; padding-bottom: 5px;">${companyData.name}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">CONTRATADO</p>
              </div>
              <div style="text-align: center; width: 45%;">
                <p style="margin: 0 0 60px 0; border-bottom: 1px solid #333; padding-bottom: 5px;">${contractData.clientName}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">CONTRATANTE</p>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })} - São Paulo/SP</p>
          </div>
        </div>
      `
      
      document.body.appendChild(contractElement)
      
      // Capturar o elemento como imagem
      const canvas = await html2canvas(contractElement, {
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
    <div className="projects-simple">
      {feedback && (
        <div className="feedback-message">
          <span style={{
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
                    <div className="project-category">{Array.isArray(project.category) ? project.category.join(', ') : (project.category || 'Sem categoria')}</div>
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
                          paymentTerms: '',
                          categories: project.categories || {} // Incluir categorias com observações
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
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Projeto</h2>
              <button className="modal-close-btn" onClick={() => setShowNewProject(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h3 className="section-title">Informações Básicas</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome do projeto *</label>
                    <input
                      type="text"
                      placeholder="Ex: Cozinha Completa"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cliente *</label>
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
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Categorias e Valores</h3>
                
                {/* Nicho */}
                <div className="category-card">
                  <label className="category-header">
                    <input
                      type="checkbox"
                      checked={formData.categories?.nicho?.checked || false}
                      onChange={(e) => updateCategory('nicho', 'checked', e.target.checked)}
                    />
                    <span className="category-title">Nicho</span>
                  </label>
                  {formData.categories?.nicho?.checked && (
                    <div className="category-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Observação</label>
                          <input
                            type="text"
                            placeholder="Detalhes do nicho"
                            value={formData.categories?.nicho?.observation || ''}
                            onChange={(e) => updateCategory('nicho', 'observation', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (R$)</label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={formData.categories?.nicho?.value || ''}
                            onChange={(e) => updateCategory('nicho', 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prateleira */}
                <div className="category-card">
                  <label className="category-header">
                    <input
                      type="checkbox"
                      checked={formData.categories?.prateleira?.checked || false}
                      onChange={(e) => updateCategory('prateleira', 'checked', e.target.checked)}
                    />
                    <span className="category-title">Prateleira</span>
                  </label>
                  {formData.categories?.prateleira?.checked && (
                    <div className="category-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Observação</label>
                          <input
                            type="text"
                            placeholder="Detalhes da prateleira"
                            value={formData.categories?.prateleira?.observation || ''}
                            onChange={(e) => updateCategory('prateleira', 'observation', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (R$)</label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={formData.categories?.prateleira?.value || ''}
                            onChange={(e) => updateCategory('prateleira', 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bancada */}
                <div className="category-card">
                  <label className="category-header">
                    <input
                      type="checkbox"
                      checked={formData.categories?.bancada?.checked || false}
                      onChange={(e) => updateCategory('bancada', 'checked', e.target.checked)}
                    />
                    <span className="category-title">Bancada</span>
                  </label>
                  {formData.categories?.bancada?.checked && (
                    <div className="category-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Observação</label>
                          <input
                            type="text"
                            placeholder="Detalhes da bancada"
                            value={formData.categories?.bancada?.observation || ''}
                            onChange={(e) => updateCategory('bancada', 'observation', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (R$)</label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={formData.categories?.bancada?.value || ''}
                            onChange={(e) => updateCategory('bancada', 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cozinha */}
                <div className="category-card">
                  <label className="category-header">
                    <input
                      type="checkbox"
                      checked={formData.categories?.cozinha?.checked || false}
                      onChange={(e) => updateCategory('cozinha', 'checked', e.target.checked)}
                    />
                    <span className="category-title">Cozinha</span>
                  </label>
                  {formData.categories?.cozinha?.checked && (
                    <div className="category-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Observação</label>
                          <input
                            type="text"
                            placeholder="Detalhes da cozinha"
                            value={formData.categories?.cozinha?.observation || ''}
                            onChange={(e) => updateCategory('cozinha', 'observation', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (R$)</label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={formData.categories?.cozinha?.value || ''}
                            onChange={(e) => updateCategory('cozinha', 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Banheiro */}
                <div className="category-card">
                  <label className="category-header">
                    <input
                      type="checkbox"
                      checked={formData.categories?.banheiro?.checked || false}
                      onChange={(e) => updateCategory('banheiro', 'checked', e.target.checked)}
                    />
                    <span className="category-title">Banheiro</span>
                  </label>
                  {formData.categories?.banheiro?.checked && (
                    <div className="category-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Observação</label>
                          <input
                            type="text"
                            placeholder="Detalhes do banheiro"
                            value={formData.categories?.banheiro?.observation || ''}
                            onChange={(e) => updateCategory('banheiro', 'observation', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (R$)</label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={formData.categories?.banheiro?.value || ''}
                            onChange={(e) => updateCategory('banheiro', 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Área Gourmet */}
                <div className="category-card">
                  <label className="category-header">
                    <input
                      type="checkbox"
                      checked={formData.categories?.area_gourmet?.checked || false}
                      onChange={(e) => updateCategory('area_gourmet', 'checked', e.target.checked)}
                    />
                    <span className="category-title">Área Gourmet</span>
                  </label>
                  {formData.categories?.area_gourmet?.checked && (
                    <div className="category-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Observação</label>
                          <input
                            type="text"
                            placeholder="Detalhes da área gourmet"
                            value={formData.categories?.area_gourmet?.observation || ''}
                            onChange={(e) => updateCategory('area_gourmet', 'observation', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (R$)</label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={formData.categories?.area_gourmet?.value || ''}
                            onChange={(e) => updateCategory('area_gourmet', 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Valor Total */}
                <div className="total-card">
                  <div className="total-content">
                    <h4>Valor Total do Orçamento</h4>
                    <div className="total-value">R$ {formData.value}</div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Datas do Projeto</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Data de início</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      onFocus={(e) => e.target.showPicker()}
                      onClick={(e) => e.target.showPicker()}
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de término</label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      onFocus={(e) => e.target.showPicker()}
                      onClick={(e) => e.target.showPicker()}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewProject(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleNewProject}>Criar Projeto</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNewClient && (
        <div className="modal-overlay" onClick={closeClientModal}>
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
              <button className="btn" onClick={closeClientModal}>Cancelar</button>
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
