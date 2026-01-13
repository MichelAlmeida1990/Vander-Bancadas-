import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { getAdminData, setAdminData, diagnoseStorage } from '../utils/enhancedDb.js'

const AdminDataContext = createContext(null)

// Dados iniciais limpos
const seedData = {
  clients: [],
  projects: []
}

export function AdminDataProvider({ children }) {
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      try {
        // Carregar dados usando sistema robusto
        const data = await getAdminData()
        
        if (cancelled) return
        
        if (data && data.clients && data.projects) {
          setClients(data.clients)
          setProjects(data.projects)
          setIsHydrated(true)
          console.log('✅ Dados carregados com sucesso:', {
            clients: data.clients.length,
            projects: data.projects.length
          })
        } else {
          console.error('❌ Falha ao carregar dados')
        }
      } catch (error) {
        console.error('❌ Erro crítico na hidratação:', error)
        
        // Fallback para dados iniciais
        setClients(seedData.clients)
        setProjects(seedData.projects)
        setIsHydrated(true)
      }
    }

    hydrate()

    // Diagnóstico do armazenamento
    diagnoseStorage()

    return () => {
      cancelled = true
    }
  }, [])

  // Auto-salvamento robusto
  useEffect(() => {
    if (!isHydrated) return
    
    const saveData = async () => {
      try {
        const success = await setAdminData({ clients, projects })
        if (success) {
          console.log('✅ Dados salvos automaticamente')
        } else {
          console.warn('⚠️ Falha ao salvar dados automaticamente')
        }
      } catch (error) {
        console.error('❌ Erro ao salvar dados:', error)
      }
    }

    // Debounce para não sobrecarregar
    const timeoutId = setTimeout(saveData, 500)
    return () => clearTimeout(timeoutId)
  }, [clients, projects, isHydrated])

  const clientsById = useMemo(() => {
    const map = new Map()
    for (const c of clients) map.set(c.id, c)
    return map
  }, [clients])

  const projectsEnriched = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      clientName: clientsById.get(p.clientId)?.name || ''
    }))
  }, [projects, clientsById])

  const addClient = (client) => {
    setClients((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((c) => c.id)) + 1 : 1
      return [...prev, { id: nextId, ...client }]
    })
  }

  const updateClient = (clientId, patch) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...patch } : c)))
  }

  const deleteClient = (clientId) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId))
    setProjects((prev) => prev.filter((p) => p.clientId !== clientId))
  }

  const addProject = (project) => {
    setProjects((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1
      return [...prev, { id: nextId, notes: '', history: [], ...project }]
    })
  }

  const updateProject = (projectId, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...patch } : p)))
  }

  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  const addProjectHistory = (projectId, entry) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const history = Array.isArray(p.history) ? p.history : []
        return {
          ...p,
          history: [
            ...history,
            {
              id: history.length ? Math.max(...history.map((h) => h.id || 0)) + 1 : 1,
              date: new Date().toISOString(),
              ...entry
            }
          ]
        }
      })
    )
  }

  const value = {
    clients,
    projects: projectsEnriched,
    setClients,
    setProjects,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addProjectHistory,
    isHydrated // Expor status de hidratação
  }

  // Mostrar indicador de carregamento enquanto dados não estão prontos
  if (!isHydrated) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: '#ffffff',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>🔄</div>
          <div>Carregando dados...</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
            Aguarde um momento
          </div>
        </div>
      </div>
    )
  }

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) {
    throw new Error('useAdminData must be used within an AdminDataProvider')
  }
  return ctx
}
