# 🔥 CONFIGURAÇÃO FIREBASE - Vander Bancadas

## 📋 **PASSO A PASSO**

### 1. Criar Projeto Firebase
- Acessar: https://console.firebase.google.com
- Criar novo projeto: "vander-bancadas"
- Ativar Firestore Database
- Ativar Authentication (Email/Senha)

### 2. Configurar Firestore
```
Coleção: clients
{
  name: string,
  email: string,
  phone: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

Coleção: projects
{
  name: string,
  clientId: string (reference),
  category: string,
  value: number,
  status: string,
  paid: boolean,
  startDate: string,
  endDate: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. Configurar Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔧 **INTEGRAÇÃO COM O FRONTEND**

### Instalar Dependências
```bash
npm install firebase
```

### Criar Arquivo de Configuração
`src/firebase/config.js`
```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "vander-bancadas.firebaseapp.com",
  projectId: "vander-bancadas",
  storageBucket: "vander-bancadas.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

### Criar Services
`src/firebase/services.js`
```javascript
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore'
import { db } from './config'

// Clients
export const clientsCollection = collection(db, 'clients')

export const getClients = async () => {
  const snapshot = await getDocs(clientsCollection)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const createClient = async (clientData) => {
  return await addDoc(clientsCollection, {
    ...clientData,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

export const updateClient = async (id, clientData) => {
  const clientDoc = doc(db, 'clients', id)
  return await updateDoc(clientDoc, {
    ...clientData,
    updatedAt: new Date()
  })
}

export const deleteClient = async (id) => {
  const clientDoc = doc(db, 'clients', id)
  return await deleteDoc(clientDoc)
}

// Projects
export const projectsCollection = collection(db, 'projects')

export const getProjects = async () => {
  const snapshot = await getDocs(projectsCollection)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const createProject = async (projectData) => {
  return await addDoc(projectsCollection, {
    ...projectData,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

export const updateProject = async (id, projectData) => {
  const projectDoc = doc(db, 'projects', id)
  return await updateDoc(projectDoc, {
    ...projectData,
    updatedAt: new Date()
  })
}

export const deleteProject = async (id) => {
  const projectDoc = doc(db, 'projects', id)
  return await deleteDoc(projectDoc)
}
```

## 🔄 **ATUALIZAR ADMIN DATA CONTEXT**

### Substituir `AdminDataContext.jsx`
```javascript
import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  getClients, 
  getProjects, 
  createClient, 
  createProject,
  updateClient,
  updateProject,
  deleteClient as deleteClientFirebase,
  deleteProject as deleteProjectFirebase
} from '../firebase/services'

const AdminDataContext = createContext(null)

export function AdminDataProvider({ children }) {
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [clientsData, projectsData] = await Promise.all([
        getClients(),
        getProjects()
      ])
      setClients(clientsData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (clientData) => {
    try {
      const docRef = await createClient(clientData)
      const newClient = { id: docRef.id, ...clientData }
      setClients(prev => [...prev, newClient])
      return newClient
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      throw error
    }
  }

  const updateClientData = async (id, clientData) => {
    try {
      await updateClient(id, clientData)
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      ))
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  }

  const deleteClient = async (id) => {
    try {
      await deleteClientFirebase(id)
      setClients(prev => prev.filter(client => client.id !== id))
      // Também remove projetos associados
      setProjects(prev => prev.filter(project => project.clientId !== id))
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      throw error
    }
  }

  const addProject = async (projectData) => {
    try {
      const docRef = await createProject(projectData)
      const newProject = { id: docRef.id, ...projectData }
      setProjects(prev => [...prev, newProject])
      return newProject
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      throw error
    }
  }

  const updateProjectData = async (id, projectData) => {
    try {
      await updateProject(id, projectData)
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...projectData } : project
      ))
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      throw error
    }
  }

  const deleteProject = async (id) => {
    try {
      await deleteProjectFirebase(id)
      setProjects(prev => prev.filter(project => project.id !== id))
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      throw error
    }
  }

  return (
    <AdminDataContext.Provider value={{
      clients,
      projects,
      loading,
      addClient,
      updateClient: updateClientData,
      deleteClient,
      addProject,
      updateProject: updateProjectData,
      deleteProject
    }}>
      {children}
    </AdminDataContext.Provider>
  )
}
```

## 🌐 **DEPLOY**

### Frontend (Vercel)
- Adicionar variáveis de ambiente no Vercel:
  ```
  VITE_FIREBASE_API_KEY=sua-chave
  VITE_FIREBASE_AUTH_DOMAIN=vander-bancadas.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=vander-bancadas
  VITE_FIREBASE_STORAGE_BUCKET=vander-bancadas.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=seu-id
  VITE_FIREBASE_APP_ID=seu-app-id
  ```

### Firebase
- Configurar regras de segurança
- Ativar índices compostos se necessário
- Monitorar uso no console

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ Criar projeto Firebase
2. ⏳ Instalar dependências
3. ⏳ Criar arquivos de configuração
4. ⏳ Atualizar AdminDataContext
5. ⏳ Testar localmente
6. ⏳ Fazer deploy
7. ⏳ Remover código antigo (localStorage)

---

**Está pronto para começar a implementação!**
