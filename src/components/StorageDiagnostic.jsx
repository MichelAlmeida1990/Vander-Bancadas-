import React, { useState, useEffect } from 'react'
import { diagnoseStorage } from '../utils/enhancedDb.js'

const StorageDiagnostic = () => {
  const [diagnosis, setDiagnosis] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isVisible) {
      diagnoseStorage().then(setDiagnosis)
    }
  }, [isVisible])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        🔍 Diagnóstico
      </button>
    )
  }

  if (!diagnosis) {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 10000,
        minWidth: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>🔍</div>
          <div>Analisando armazenamento...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#ffffff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 10000,
      minWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333333' }}>🔍 Diagnóstico do Armazenamento</h2>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666666'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{
          padding: '15px',
          background: diagnosis.indexedDB ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          border: `1px solid ${diagnosis.indexedDB ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333333' }}>
            IndexedDB
          </div>
          <div style={{ color: diagnosis.indexedDB ? '#155724' : '#721c24' }}>
            {diagnosis.indexedDB ? '✅ Disponível' : '❌ Indisponível'}
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: diagnosis.localStorage ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          border: `1px solid ${diagnosis.localStorage ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333333' }}>
            LocalStorage
          </div>
          <div style={{ color: diagnosis.localStorage ? '#155724' : '#721c24' }}>
            {diagnosis.localStorage ? '✅ Disponível' : '❌ Indisponível'}
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: diagnosis.backup ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          border: `1px solid ${diagnosis.backup ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333333' }}>
            Backup Automático
          </div>
          <div style={{ color: diagnosis.backup ? '#155724' : '#721c24' }}>
            {diagnosis.backup ? '✅ Disponível' : '❌ Indisponível'}
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: '#e2e3e5',
          borderRadius: '8px',
          border: '1px solid #d6d8dc'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333333' }}>
            Tamanho Total dos Dados
          </div>
          <div style={{ color: '#666666', fontFamily: 'monospace' }}>
            {(diagnosis.totalSize / 1024).toFixed(2)} KB
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>
          📋 Recomendações
        </div>
        <div style={{ fontSize: '14px', color: '#666666', lineHeight: '1.5' }}>
          {diagnosis.indexedDB && diagnosis.localStorage && diagnosis.backup ? (
            <div style={{ color: '#155724' }}>
              ✅ <strong>Sistema robusto ativo!</strong><br />
              Seus dados estão protegidos com múltiplas camadas de backup.
            </div>
          ) : (
            <div style={{ color: '#856404' }}>
              ⚠️ <strong>Atenção:</strong><br />
              {diagnosis.indexedDB ? 'LocalStorage indisponível.' : 
               diagnosis.localStorage ? 'IndexedDB indisponível.' :
               'Ambos sistemas indisponíveis.'}<br />
              Considere usar um navegador mais recente.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StorageDiagnostic
