import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { DollarSign, TrendingUp, Users, Calendar, FileText, AlertCircle, CheckCircle, Clock, Target, Zap, Award, ShoppingCart, CreditCard, Building, Phone, Mail, Star, Filter, Download, Plus, Edit, Trash2, Eye, BarChart3, Settings } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './Dashboard.css'
import '../styles/admin-footer.css'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [finances, setFinances] = useState({})

  // Dados mockados para demonstração
  useEffect(() => {
    // Dados financeiros
    setFinances({
      revenue: {
        current: 285000,
        growth: 23.5,
        monthly: [45000, 52000, 48000, 61000, 58000, 67000]
      },
      expenses: {
        current: 125000,
        growth: 12.3,
        categories: [
          { name: 'Matérias-primas', value: 45000, color: '#D4A574' },
          { name: 'Mão de obra', value: 35000, color: '#B8945A' },
          { name: 'Marketing', value: 15000, color: '#E8C9A0' },
          { name: 'Operacional', value: 20000, color: '#F5F3F0' },
          { name: 'Outros', value: 10000, color: '#6B6B6B' }
        ]
      },
      profit: {
        current: 160000,
        margin: 56.1,
        monthly: [20000, 32000, 23000, 46000, 38000, 49000]
      },
      cashFlow: [
        { month: 'Jan', income: 45000, expenses: 32000 },
        { month: 'Fev', income: 52000, expenses: 35000 },
        { month: 'Mar', income: 48000, expenses: 28000 },
        { month: 'Abr', income: 61000, expenses: 42000 },
        { month: 'Mai', income: 58000, expenses: 38000 },
        { month: 'Jun', income: 67000, expenses: 45000 }
      ]
    })

    // Projetos
    setProjects([
      { id: 1, name: 'Cozinha Moderna', client: 'João Silva', value: 25000, status: 'completed', date: '2024-06-15', category: 'Cozinhas' },
      { id: 2, name: 'Banheiro Premium', client: 'Maria Santos', value: 18000, status: 'in-progress', date: '2024-06-20', category: 'Banheiros' },
      { id: 3, name: 'Área Gourmet', client: 'Carlos Oliveira', value: 35000, status: 'pending', date: '2024-06-25', category: 'Áreas Gourmet' },
      { id: 4, name: 'Bancada Office', client: 'Ana Costa', value: 22000, status: 'completed', date: '2024-06-10', category: 'Comerciais' },
      { id: 5, name: 'Suíte Master', client: 'Pedro Lima', value: 28000, status: 'in-progress', date: '2024-06-18', category: 'Banheiros' }
    ])

    // Clientes
    setClients([
      { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321', projects: 3, value: 75000, status: 'active' },
      { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 91234-5678', projects: 2, value: 45000, status: 'active' },
      { id: 3, name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '(11) 97654-3210', projects: 1, value: 35000, status: 'new' }
    ])
  }, [])

  const StatCard = ({ icon: Icon, title, value, change, color = '#D4A574' }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">
          <span className="value">R$ {value.toLocaleString('pt-BR')}</span>
          {change && (
            <span className={`change ${change > 0 ? 'positive' : 'negative'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <StatCard 
          icon={DollarSign} 
          title="Faturamento" 
          value={finances.revenue?.current || 0} 
          change={finances.revenue?.growth || 0}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Lucro" 
          value={finances.profit?.current || 0} 
          change={finances.profit?.margin || 0}
          color="#28a745"
        />
        <StatCard 
          icon={Users} 
          title="Clientes Ativos" 
          value={clients.filter(c => c.status === 'active').length} 
          change={12.5}
          color="#007bff"
        />
        <StatCard 
          icon={FileText} 
          title="Projetos" 
          value={projects.length} 
          change={8.3}
          color="#ffc107"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Faturamento vs Lucro</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={finances.revenue?.monthly?.map((rev, i) => ({
              month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i],
              faturamento: rev,
              lucro: finances.profit?.monthly?.[i] || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Area type="monotone" dataKey="faturamento" stackId="1" stroke="#D4A574" fill="#D4A574" fillOpacity={0.6} />
              <Area type="monotone" dataKey="lucro" stackId="1" stroke="#28a745" fill="#28a745" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Distribuição de Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={finances.expenses?.categories || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(finances.expenses?.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderFinancial = () => (
    <div className="dashboard-financial">
      <div className="financial-header">
        <div className="period-selector">
          <button 
            className={dateRange === '7d' ? 'active' : ''}
            onClick={() => setDateRange('7d')}
          >
            7 dias
          </button>
          <button 
            className={dateRange === '30d' ? 'active' : ''}
            onClick={() => setDateRange('30d')}
          >
            30 dias
          </button>
          <button 
            className={dateRange === '90d' ? 'active' : ''}
            onClick={() => setDateRange('90d')}
          >
            90 dias
          </button>
          <button 
            className={dateRange === '1y' ? 'active' : ''}
            onClick={() => setDateRange('1y')}
          >
            1 ano
          </button>
        </div>
        <button className="export-btn">
          <Download size={16} />
          Exportar Relatório
        </button>
      </div>

      <div className="financial-summary">
        <div className="summary-card revenue">
          <div className="summary-icon">
            <TrendingUp size={32} color="#28a745" />
          </div>
          <div className="summary-content">
            <h4>Receita Total</h4>
            <p className="amount">R$ {(finances.revenue?.current || 0).toLocaleString('pt-BR')}</p>
            <span className="growth">+{finances.revenue?.growth || 0}% vs período anterior</span>
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="summary-icon">
            <CreditCard size={32} color="#dc3545" />
          </div>
          <div className="summary-content">
            <h4>Despesas Totais</h4>
            <p className="amount">R$ {(finances.expenses?.current || 0).toLocaleString('pt-BR')}</p>
            <span className="growth">+{finances.expenses?.growth || 0}% vs período anterior</span>
          </div>
        </div>

        <div className="summary-card profit">
          <div className="summary-icon">
            <DollarSign size={32} color="#D4A574" />
          </div>
          <div className="summary-content">
            <h4>Lucro Líquido</h4>
            <p className="amount">R$ {(finances.profit?.current || 0).toLocaleString('pt-BR')}</p>
            <span className="margin">Margem: {finances.profit?.margin || 0}%</span>
          </div>
        </div>
      </div>

      <div className="chart-card cash-flow">
        <h3>Fluxo de Caixa</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={finances.cashFlow || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Legend />
            <Bar dataKey="income" fill="#28a745" name="Receitas" />
            <Bar dataKey="expenses" fill="#dc3545" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderProjects = () => (
    <div className="dashboard-projects">
      <div className="projects-header">
        <h3>Gerenciamento de Projetos</h3>
        <div className="projects-actions">
          <button className="btn-primary">
            <Plus size={16} />
            Novo Projeto
          </button>
          <button className="btn-secondary">
            <Filter size={16} />
            Filtrar
          </button>
        </div>
      </div>

      <div className="projects-stats">
        <div className="project-stat">
          <span className="count">{projects.filter(p => p.status === 'completed').length}</span>
          <span className="label">Concluídos</span>
        </div>
        <div className="project-stat">
          <span className="count">{projects.filter(p => p.status === 'in-progress').length}</span>
          <span className="label">Em Andamento</span>
        </div>
        <div className="project-stat">
          <span className="count">{projects.filter(p => p.status === 'pending').length}</span>
          <span className="label">Pendentes</span>
        </div>
      </div>

      <div className="projects-table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.client}</td>
                <td>R$ {project.value.toLocaleString('pt-BR')}</td>
                <td>{project.category}</td>
                <td>
                  <span className={`status ${project.status}`}>
                    {project.status === 'completed' ? 'Concluído' :
                     project.status === 'in-progress' ? 'Em Andamento' : 'Pendente'}
                  </span>
                </td>
                <td>{format(new Date(project.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" title="Visualizar">
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn danger" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderClients = () => (
    <div className="dashboard-clients">
      <div className="clients-header">
        <h3>Gestão de Clientes</h3>
        <button className="btn-primary">
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      <div className="clients-grid">
        {clients.map(client => (
          <div key={client.id} className="client-card">
            <div className="client-header">
              <div className="client-info">
                <h4>{client.name}</h4>
                <span className={`status ${client.status}`}>
                  {client.status === 'active' ? 'Ativo' : 
                   client.status === 'new' ? 'Novo' : 'Inativo'}
                </span>
              </div>
              <div className="client-actions">
                <button className="icon-btn">
                  <Edit size={16} />
                </button>
              </div>
            </div>
            <div className="client-details">
              <div className="detail-item">
                <Mail size={14} />
                <span>{client.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={14} />
                <span>{client.phone}</span>
              </div>
              <div className="detail-item">
                <FileText size={14} />
                <span>{client.projects} projetos</span>
              </div>
              <div className="detail-item">
                <DollarSign size={14} />
                <span>R$ {client.value.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderIdeas = () => (
    <div className="dashboard-ideas">
      <h3>Ideias e Oportunidades</h3>
      
      <div className="ideas-grid">
        <div className="idea-card priority-high">
          <div className="idea-header">
            <AlertCircle size={20} color="#dc3545" />
            <span className="priority">Alta Prioridade</span>
          </div>
          <h4>Expansão para Regiões</h4>
          <p>Análise de mercado indica alta demanda por serviços premium em Campinas e Santos. Considerar abertura de filiais.</p>
          <div className="idea-metrics">
            <span>Potencial: R$ 500K/mês</span>
            <span>Investimento: R$ 80K</span>
            <span>ROI: 18 meses</span>
          </div>
          <div className="idea-actions">
            <button className="btn-primary">Analisar</button>
            <button className="btn-secondary">Arquivar</button>
          </div>
        </div>

        <div className="idea-card priority-medium">
          <div className="idea-header">
            <Target size={20} color="#ffc107" />
            <span className="priority">Média Prioridade</span>
          </div>
          <h4>Serviço de Manutenção</h4>
          <p>Criar plano de manutenção anual para clientes existentes com receita recorrente garantida.</p>
          <div className="idea-metrics">
            <span>Potencial: R$ 150K/mês</span>
            <span>Investimento: R$ 20K</span>
            <span>ROI: 8 meses</span>
          </div>
          <div className="idea-actions">
            <button className="btn-primary">Desenvolver</button>
            <button className="btn-secondary">Estudar</button>
          </div>
        </div>

        <div className="idea-card priority-low">
          <div className="idea-header">
            <Zap size={20} color="#28a745" />
            <span className="priority">Baixa Prioridade</span>
          </div>
          <h4>Parcerias com Arquitetos</h4>
          <p>Programa de comissionamento para arquitetos e designers de interiores.</p>
          <div className="idea-metrics">
            <span>Potencial: R$ 80K/mês</span>
            <span>Investimento: R$ 5K</span>
            <span>ROI: 3 meses</span>
          </div>
          <div className="idea-actions">
            <button className="btn-primary">Implementar</button>
            <button className="btn-secondary">Agendar</button>
          </div>
        </div>

        <div className="idea-card innovation">
          <div className="idea-header">
            <Award size={20} color="#D4A574" />
            <span className="priority">Inovação</span>
          </div>
          <h4>Realidade Aumentada</h4>
          <p>App AR para visualização de bancadas no ambiente dos clientes antes da instalação.</p>
          <div className="idea-metrics">
            <span>Potencial: R$ 200K/mês</span>
            <span>Investimento: R$ 50K</span>
            <span>ROI: 12 meses</span>
          </div>
          <div className="idea-actions">
            <button className="btn-primary">Prototipar</button>
            <button className="btn-secondary">Pesquisar</button>
          </div>
        </div>
      </div>

      <div className="ideas-summary">
        <h4>Métricas de Oportunidades</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Oportunidades Ativas</span>
            <span className="value">12</span>
          </div>
          <div className="summary-item">
            <span className="label">Potencial Total</span>
            <span className="value">R$ 930K/mês</span>
          </div>
          <div className="summary-item">
            <span className="label">ROI Médio</span>
            <span className="value">10.2 meses</span>
          </div>
          <div className="summary-item">
            <span className="label">Taxa de Conversão</span>
            <span className="value">23%</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <AlertCircle size={20} />
            <span className="badge">3</span>
          </button>
          <button className="settings-btn">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Visão Geral
        </button>
        <button 
          className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <DollarSign size={16} />
          Financeiro
        </button>
        <button 
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => window.location.href = '/admin/projects'}
        >
          <FileText size={16} />
          Projetos
        </button>
        <button 
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users size={16} />
          Clientes
        </button>
        <button 
          className={`tab ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          <Target size={16} />
          Ideias
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'clients' && renderClients()}
        {activeTab === 'ideas' && renderIdeas()}
      </div>

      {/* Footer Admin Simples */}
      <div className="admin-simple-footer">
        <div className="footer-content">
          <p>&copy; 2024 Vander Bancadas - Painel Administrativo</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
