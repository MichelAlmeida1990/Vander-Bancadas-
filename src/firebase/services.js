// Firebase Services
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './config'

// Collections
export const clientsCollection = collection(db, 'clients')
export const projectsCollection = collection(db, 'projects')

// CLIENTS SERVICES
export const getClients = async () => {
  try {
    const snapshot = await getDocs(clientsCollection)
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    throw error
  }
}

export const createClient = async (clientData) => {
  try {
    const docRef = await addDoc(clientsCollection, {
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    throw error
  }
}

export const updateClient = async (id, clientData) => {
  try {
    const clientDoc = doc(db, 'clients', id)
    await updateDoc(clientDoc, {
      ...clientData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    throw error
  }
}

export const deleteClient = async (id) => {
  try {
    const clientDoc = doc(db, 'clients', id)
    await deleteDoc(clientDoc)
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    throw error
  }
}

// PROJECTS SERVICES
export const getProjects = async () => {
  try {
    const snapshot = await getDocs(projectsCollection)
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    throw error
  }
}

export const createProject = async (projectData) => {
  try {
    const docRef = await addDoc(projectsCollection, {
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    throw error
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const projectDoc = doc(db, 'projects', id)
    await updateDoc(projectDoc, {
      ...projectData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    throw error
  }
}

export const deleteProject = async (id) => {
  try {
    const projectDoc = doc(db, 'projects', id)
    await deleteDoc(projectDoc)
  } catch (error) {
    console.error('Erro ao excluir projeto:', error)
    throw error
  }
}

// Get projects by client
export const getProjectsByClient = async (clientId) => {
  try {
    const q = query(
      projectsCollection, 
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
  } catch (error) {
    console.error('Erro ao buscar projetos do cliente:', error)
    throw error
  }
}
