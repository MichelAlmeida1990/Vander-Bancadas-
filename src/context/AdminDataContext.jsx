import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { idbGet, idbSet } from '../utils/adminDb.js'

const STORAGE_KEY = 'vander_admin_data_v1'

const AdminDataContext = createContext(null)

const seedData = {
  clients: [],
  projects: []
}

const safeParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function AdminDataProvider({ children }) {
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const hydratedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      // 1) IndexedDB (preferencial)
      const fromIdb = await idbGet(STORAGE_KEY)
      if (cancelled) return

      if (fromIdb && Array.isArray(fromIdb.clients) && Array.isArray(fromIdb.projects)) {
        setClients(fromIdb.clients)
        setProjects(fromIdb.projects)
        hydratedRef.current = true
        return
      }

      // 2) Migração do localStorage antigo (se existir)
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? safeParse(raw) : null
      
      if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.projects)) {
        setClients(parsed.clients)
        setProjects(parsed.projects)
        hydratedRef.current = true
        await idbSet(STORAGE_KEY, parsed)
        return
      }

      // 3) Seed inicial
      setClients(seedData.clients)
      setProjects(seedData.projects)
      hydratedRef.current = true
      await idbSet(STORAGE_KEY, { clients: seedData.clients, projects: seedData.projects })
    }

    hydrate()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydratedRef.current) return
    idbSet(STORAGE_KEY, {
      clients,
      projects
    })
  }, [clients, projects])

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
    addProjectHistory
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
