// Sistema de persistência robusto com fallback múltiplo
const STORAGE_KEY = 'vander_admin_data_v2'
const DB_NAME = 'vander_admin_db'
const DB_VERSION = 2
const STORE_NAME = 'admin_data'

// Estrutura de dados validada
const validateData = (data) => {
  if (!data) return false
  
  const hasValidStructure = 
    typeof data === 'object' &&
    Array.isArray(data.clients) &&
    Array.isArray(data.projects)
  
  if (!hasValidStructure) return false
  
  // Validação adicional dos clientes
  const validClients = data.clients.every(client => 
    client && 
    typeof client.id === 'number' && 
    typeof client.name === 'string'
  )
  
  // Validação adicional dos projetos
  const validProjects = data.projects.every(project => 
    project && 
    typeof project.id === 'number' && 
    typeof project.name === 'string' &&
    typeof project.clientId === 'number'
  )
  
  return validClients && validProjects
}

// Backup automático para localStorage
const createBackup = (data) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_backup`, JSON.stringify(data))
    console.log('✅ Backup criado no localStorage')
  } catch (error) {
    console.warn('⚠️ Erro ao criar backup:', error)
  }
}

// Restauração do backup
const restoreBackup = () => {
  try {
    const backup = localStorage.getItem(`${STORAGE_KEY}_backup`)
    if (backup) {
      const data = JSON.parse(backup)
      if (validateData(data)) {
        console.log('✅ Backup restaurado do localStorage')
        return data
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao restaurar backup:', error)
  }
  return null
}

// IndexedDB operations
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function withStore(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)

    let result
    try {
      result = fn(store)
    } catch (err) {
      reject(err)
      return
    }

    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

// Função principal de obtenção de dados com múltiplos fallbacks
export async function getAdminData() {
  try {
    // 1. Tentar IndexedDB (principal)
    const db = await openDb()
    try {
      const value = await withStore(db, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const req = store.get(STORAGE_KEY)
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => reject(req.error)
        })
      })
      
      if (value && validateData(value)) {
        console.log('✅ Dados carregados do IndexedDB')
        createBackup(value) // Cria backup
        return value
      }
    } finally {
      db.close()
    }
  } catch (error) {
    console.warn('⚠️ IndexedDB falhou, tentando localStorage:', error)
  }

  // 2. Tentar localStorage (backup)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (validateData(data)) {
        console.log('✅ Dados carregados do localStorage')
        createBackup(data) // Cria backup
        return data
      }
    }
  } catch (error) {
    console.warn('⚠️ localStorage falhou:', error)
  }

  // 3. Tentar restauração do backup
  const backup = restoreBackup()
  if (backup) {
    return backup
  }

  // 4. Retornar dados iniciais (último recurso)
  console.log('📝 Usando dados iniciais')
  return {
    clients: [],
    projects: []
  }
}

// Função principal de salvamento com múltiplas camadas
export async function setAdminData(data) {
  if (!validateData(data)) {
    console.error('❌ Dados inválidos, salvamento cancelado')
    return false
  }

  let success = false

  // 1. Salvar no IndexedDB (principal)
  try {
    const db = await openDb()
    try {
      await withStore(db, 'readwrite', (store) => {
        store.put(data, STORAGE_KEY)
      })
      console.log('✅ Dados salvos no IndexedDB')
      success = true
    } finally {
      db.close()
    }
  } catch (error) {
    console.warn('⚠️ Erro ao salvar no IndexedDB:', error)
  }

  // 2. Salvar no localStorage (backup)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    createBackup(data) // Cria backup adicional
    console.log('✅ Dados salvos no localStorage')
    success = true
  } catch (error) {
    console.warn('⚠️ Erro ao salvar no localStorage:', error)
  }

  return success
}

// Função para limpar dados (reset completo)
export async function clearAdminData() {
  try {
    // Limpar IndexedDB
    const db = await openDb()
    try {
      await withStore(db, 'readwrite', (store) => {
        store.delete(STORAGE_KEY)
      })
      console.log('✅ IndexedDB limpo')
    } finally {
      db.close()
    }
  } catch (error) {
    console.warn('⚠️ Erro ao limpar IndexedDB:', error)
  }

  try {
    // Limpar localStorage
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}_backup`)
    console.log('✅ localStorage limpo')
  } catch (error) {
    console.warn('⚠️ Erro ao limpar localStorage:', error)
  }
}

// Função de diagnóstico
export async function diagnoseStorage() {
  const diagnosis = {
    indexedDB: false,
    localStorage: false,
    backup: false,
    totalSize: 0
  }

  // Verificar IndexedDB
  try {
    const db = await openDb()
    try {
      const data = await withStore(db, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const req = store.get(STORAGE_KEY)
          req.onsuccess = () => {
            const result = req.result
            diagnosis.indexedDB = !!result
            diagnosis.totalSize += JSON.stringify(result).length
            resolve(result)
          }
          req.onerror = () => reject(req.error)
        })
      })
    } finally {
      db.close()
    }
  } catch (error) {
    console.warn('IndexedDB não disponível:', error)
  }

  // Verificar localStorage
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      diagnosis.localStorage = true
      diagnosis.totalSize += data.length
    }
  } catch (error) {
    console.warn('localStorage não disponível:', error)
  }

  // Verificar backup
  try {
    const backup = localStorage.getItem(`${STORAGE_KEY}_backup`)
    diagnosis.backup = !!backup
  } catch (error) {
    console.warn('Backup não disponível:', error)
  }

  console.log('🔍 Diagnóstico do armazenamento:', diagnosis)
  return diagnosis
}
