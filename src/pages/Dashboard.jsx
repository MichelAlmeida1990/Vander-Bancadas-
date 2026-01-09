import React, { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { DollarSign, TrendingUp, Users, Calendar, FileText, AlertCircle, CheckCircle, Clock, Target, Zap, Award, ShoppingCart, CreditCard, Building, Phone, Mail, Star, Filter, Download, Plus, Edit, Trash2, Eye, BarChart3, Settings } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './Dashboard.css'
import '../styles/admin-footer.css'
import { useAdminData } from '../context/AdminDataContext.jsx'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  const { clients, projects } = useAdminData()

  const now = useMemo(() => new Date(), [])

  const monthStart = useMemo(() => startOfMonth(now), [now])
  const monthEnd = useMemo(() => endOfMonth(now), [now])

  const normalizedProjects = useMemo(() => {
    return projects.map((p) => {
      const dateStr = p.endDate || p.startDate
      const date = dateStr ? new Date(dateStr) : null
      return {
        ...p,
        date,
        client: p.clientName || ''
      }
    })
  }, [projects])

  const projectsThisMonth = useMemo(() => {
    return normalizedProjects.filter((p) => p.date && isSameMonth(p.date, now))
  }, [normalizedProjects, now])

  const monthActiveClientsCount = useMemo(() => {
    const set = new Set()
    for (const p of projectsThisMonth) {
      if (p.clientId) set.add(p.clientId)
    }
    return set.size
  }, [projectsThisMonth])

  const profitMonth = useMemo(() => {
    return projectsThisMonth.reduce((sum, p) => sum + (Number(p.value) || 0), 0)
  }, [projectsThisMonth])

  const profitYear = useMemo(() => {
    const year = now.getFullYear()
    return normalizedProjects
      .filter((p) => p.date && p.date.getFullYear() === year)
      .reduce((sum, p) => sum + (Number(p.value) || 0), 0)
  }, [normalizedProjects, now])

  const monthCalendarDays = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }, [monthStart, monthEnd])

  const clientsComputed = useMemo(() => {
    const byClient = new Map()
    for (const p of normalizedProjects) {
      if (!p.clientId) continue
      const current = byClient.get(p.clientId) || { count: 0, total: 0 }
      byClient.set(p.clientId, {
        count: current.count + 1,
        total: current.total + (Number(p.value) || 0)
      })
    }

    return clients.map((c) => {
      const stats = byClient.get(c.id) || { count: 0, total: 0 }
      const status = stats.count > 0 ? 'active' : 'new'
      return {
        ...c,
        projects: stats.count,
        value: stats.total,
        status
      }
    })
  }, [clients, normalizedProjects])

  const finances = useMemo(() => {
    const paidSum = normalizedProjects.filter((p) => p.paid).reduce((sum, p) => sum + (Number(p.value) || 0), 0)
    const unpaidSum = normalizedProjects.filter((p) => !p.paid).reduce((sum, p) => sum + (Number(p.value) || 0), 0)
    const totalSum = paidSum + unpaidSum

    const months = Array.from({ length: 6 }).map((_, idx) => {
      const d = subMonths(startOfMonth(now), 5 - idx)
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: format(d, 'MMM', { locale: ptBR })
      }
    })

    const byMonthIncome = new Map(months.map((m) => [m.key, 0]))
    for (const p of normalizedProjects) {
      if (!p.date || Number.isNaN(p.date.getTime())) continue
      const key = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, '0')}`
      if (!byMonthIncome.has(key)) continue
      byMonthIncome.set(key, byMonthIncome.get(key) + (Number(p.value) || 0))
    }

    const monthly = months.map((m) => byMonthIncome.get(m.key) || 0)

    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevMonthDate = subMonths(now, 1)
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`
    const currentMonthIncome = byMonthIncome.get(currentMonthKey) || 0
    const prevMonthIncome = byMonthIncome.get(prevMonthKey) || 0

    const revenueGrowth = prevMonthIncome > 0 ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0

    const expensesCurrent = 0
    const expensesGrowth = 0

    const profitCurrent = totalSum - expensesCurrent
    const profitMargin = totalSum > 0 ? (profitCurrent / totalSum) * 100 : 0

    const profitMonthly = monthly.map((v) => v)

    const cashFlow = months.map((m, i) => ({
      month: m.label,
      income: monthly[i] || 0,
      expenses: 0
    }))

    return {
      revenue: {
        current: totalSum,
        growth: Number(revenueGrowth.toFixed(1)),
        monthly
      },
      expenses: {
        current: expensesCurrent,
        growth: expensesGrowth,
        categories: []
      },
      profit: {
        current: profitCurrent,
        margin: Number(profitMargin.toFixed(1)),
        monthly: profitMonthly
      },
      cashFlow,
      receivable: unpaidSum
    }
  }, [normalizedProjects, now])

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
          value={clientsComputed.filter(c => c.status === 'active').length} 
          color="#007bff"
        />
        <StatCard 
          icon={FileText} 
          title="Projetos" 
          value={normalizedProjects.length} 
          color="#ffc107"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Resumo do Mês</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} />
                <strong>Clientes ativos do mês</strong>
              </div>
              <div style={{ fontSize: 26, marginTop: 8 }}>
                {monthActiveClientsCount}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={18} />
                <strong>Lucro do mês</strong>
              </div>
              <div style={{ fontSize: 26, marginTop: 8 }}>
                R$ {profitMonth.toLocaleString('pt-BR')}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DollarSign size={18} />
                <strong>Lucro anual</strong>
              </div>
              <div style={{ fontSize: 26, marginTop: 8 }}>
                R$ {profitYear.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Calendário do Mês ({format(now, 'MMMM yyyy', { locale: ptBR })})</h3>
          {monthCalendarDays.length === 0 ? (
            <p>Nenhum dia disponível.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
                <div key={d} style={{ fontWeight: 700, opacity: 0.75, textAlign: 'center' }}>{d}</div>
              ))}
              {(() => {
                const firstWeekday = monthStart.getDay()
                return Array.from({ length: firstWeekday }).map((_, i) => <div key={`pad-${i}`} />)
              })()}
              {monthCalendarDays.map((day) => {
                const dayProjects = projectsThisMonth.filter((p) => p.date && isSameDay(p.date, day))
                return (
                  <div
                    key={day.toISOString()}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: dayProjects.length ? 'rgba(212, 165, 116, 0.12)' : 'rgba(255,255,255,0.03)',
                      minHeight: 64
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{day.getDate()}</span>
                      {dayProjects.length > 0 && (
                        <span style={{ fontSize: 12, opacity: 0.9 }}>{dayProjects.length} proj.</span>
                      )}
                    </div>
                    {dayProjects.slice(0, 2).map((p) => (
                      <div key={p.id} style={{ fontSize: 12, opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                    ))}
                    {dayProjects.length > 2 && (
                      <div style={{ fontSize: 12, opacity: 0.75 }}>+{dayProjects.length - 2}...</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
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
          <button className="btn-primary" onClick={() => (window.location.href = '/admin/projects?modal=project')}>
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
          <span className="count">{normalizedProjects.filter(p => p.status === 'completed').length}</span>
          <span className="label">Concluídos</span>
        </div>
        <div className="project-stat">
          <span className="count">{normalizedProjects.filter(p => p.status === 'in-progress').length}</span>
          <span className="label">Em Andamento</span>
        </div>
        <div className="project-stat">
          <span className="count">{normalizedProjects.filter(p => p.status === 'pending').length}</span>
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
            {normalizedProjects.map(project => (
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
                <td>{project.date ? format(project.date, 'dd/MM/yyyy', { locale: ptBR }) : ''}</td>
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
        <button className="btn-primary" onClick={() => (window.location.href = '/admin/projects?modal=client')}>
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      <div className="clients-grid">
        {clientsComputed.map(client => (
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
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
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'clients' && renderClients()}
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
