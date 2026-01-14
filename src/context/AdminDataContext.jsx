import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { 
  getClients, 
  getProjects, 
  createClient, 
  createProject,
  updateClient as updateClientFirebase,
  updateProject as updateProjectFirebase,
  deleteClient as deleteClientFirebase,
  deleteProject as deleteProjectFirebase
} from '../firebase/services'

const AdminDataContext = createContext(null)

// Dados iniciais limpos
const seedData = {
  clients: [],
  projects: []
}

export function AdminDataProvider({ children }) {
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [clientsData, projectsData] = await Promise.all([
        getClients(),
        getProjects()
      ])
      setClients(clientsData)
      setProjects(projectsData)
      console.log('✅ Dados carregados do Firebase:', {
        clients: clientsData.length,
        projects: projectsData.length
      })
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Firebase:', error)
      setError(error.message)
      // Fallback para dados iniciais
      setClients(seedData.clients)
      setProjects(seedData.projects)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (clientData) => {
    try {
      setError(null)
      const docId = await createClient(clientData)
      const newClient = { id: docId, ...clientData }
      setClients(prev => [...prev, newClient])
      console.log('✅ Cliente criado no Firebase:', newClient)
      return newClient
    } catch (error) {
      console.error('❌ Erro ao criar cliente no Firebase:', error)
      setError(error.message)
      throw error
    }
  }

  const updateClientData = async (id, clientData) => {
    try {
      setError(null)
      await updateClientFirebase(id, clientData)
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      ))
      console.log('✅ Cliente atualizado no Firebase:', id, clientData)
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente no Firebase:', error)
      setError(error.message)
      throw error
    }
  }

  const deleteClient = async (id) => {
    try {
      setError(null)
      await deleteClientFirebase(id)
      setClients(prev => prev.filter(client => client.id !== id))
      // Também remove projetos associados
      setProjects(prev => prev.filter(project => project.clientId !== id))
      console.log('✅ Cliente excluído do Firebase:', id)
    } catch (error) {
      console.error('❌ Erro ao excluir cliente no Firebase:', error)
      setError(error.message)
      throw error
    }
  }

  const addProject = async (projectData) => {
    try {
      setError(null)
      const docId = await createProject(projectData)
      const newProject = { id: docId, ...projectData }
      setProjects(prev => [...prev, newProject])
      console.log('✅ Projeto criado no Firebase:', newProject)
      return newProject
    } catch (error) {
      console.error('❌ Erro ao criar projeto no Firebase:', error)
      setError(error.message)
      throw error
    }
  }

  const updateProjectData = async (id, projectData) => {
    try {
      setError(null)
      await updateProjectFirebase(id, projectData)
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...projectData } : project
      ))
      console.log('✅ Projeto atualizado no Firebase:', id, projectData)
    } catch (error) {
      console.error('❌ Erro ao atualizar projeto no Firebase:', error)
      setError(error.message)
      throw error
    }
  }

  const deleteProject = async (id) => {
    try {
      setError(null)
      await deleteProjectFirebase(id)
      setProjects(prev => prev.filter(project => project.id !== id))
      console.log('✅ Projeto excluído do Firebase:', id)
    } catch (error) {
      console.error('❌ Erro ao excluir projeto no Firebase:', error)
      setError(error.message)
      throw error
    }
  }

  const clientsById = useMemo(() => {
    const map = new Map()
    for (const c of clients) map.set(c.id, c)
    return map
  }, [clients])

  const projectsEnriched = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      // Manter o clientName original se existir, senão tentar buscar pelo clientId
      clientName: p.clientName || clientsById.get(p.clientId)?.name || ''
    }))
  }, [projects, clientsById])

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
    loading,
    error,
    setClients,
    setProjects,
    addClient,
    updateClient: updateClientData,
    deleteClient,
    addProject,
    updateProject: updateProjectData,
    deleteProject,
    addProjectHistory
  }

  // Mostrar indicador de carregamento enquanto dados não estão prontos
  if (loading) {
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
          <div>Carregando dados do Firebase...</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
            Aguarde um momento
          </div>
        </div>
      </div>
    )
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(220, 53, 69, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: '#ffffff',
        fontSize: '16px'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ marginBottom: '10px' }}>❌</div>
          <div>Erro ao carregar dados</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
            {error}
          </div>
          <button 
            onClick={loadData}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#ffffff',
              color: '#dc3545',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Tentar novamente
          </button>
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
