const DB_NAME = 'vander_admin_db'
const DB_VERSION = 1
const STORE_NAME = 'kv'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
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

export async function idbGet(key) {
  const db = await openDb()
  try {
    const value = await withStore(db, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(key)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
    })
    return value
  } finally {
    db.close()
  }
}

export async function idbSet(key, value) {
  const db = await openDb()
  try {
    await withStore(db, 'readwrite', (store) => {
      store.put(value, key)
    })
  } finally {
    db.close()
  }
}

export async function idbDel(key) {
  const db = await openDb()
  try {
    await withStore(db, 'readwrite', (store) => {
      store.delete(key)
    })
  } finally {
    db.close()
  }
}
