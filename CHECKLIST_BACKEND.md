# 🚀 CHECKLIST - Implantação de Backend Básico

## 📋 **PRÉ-REQUISITOS**
- [ ] Node.js instalado (v18+)
- [ ] npm ou yarn instalado
- [ ] Conta no serviço de hosting (Vercel, Railway, etc.)
- [ ] Domínio configurado (opcional)

## 🗄️ **ESCOLHA DO BANCO DE DADOS**

### Opção 1: **Supabase (Recomendado)**
- [ ] Criar conta em https://supabase.com
- [ ] Criar novo projeto
- [ ] Configurar tabela `clients`
- [ ] Configurar tabela `projects`
- [ ] Obter URL e API Key

### Opção 2: **Firebase**
- [ ] Criar projeto em https://console.firebase.google.com
- [ ] Configurar Firestore Database
- [ ] Configurar Authentication
- [ ] Obter credenciais

### Opção 3: **Node.js + PostgreSQL**
- [ ] Servidor PostgreSQL (Railway, ElephantSQL)
- [ ] API Node.js com Express
- [ ] Configurar CORS
- [ ] Deploy separado

## 🏗️ **ESTRUTURA DO BACKEND**

### Models (Tabelas)
```sql
-- Clients
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  category VARCHAR(100),
  value DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  paid BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
- [ ] `GET /api/clients` - Listar clientes
- [ ] `POST /api/clients` - Criar cliente
- [ ] `PUT /api/clients/:id` - Atualizar cliente
- [ ] `DELETE /api/clients/:id` - Excluir cliente
- [ ] `GET /api/projects` - Listar projetos
- [ ] `POST /api/projects` - Criar projeto
- [ ] `PUT /api/projects/:id` - Atualizar projeto
- [ ] `DELETE /api/projects/:id` - Excluir projeto

## 🔧 **CONFIGURAÇÃO DO FRONTEND**

### Variáveis de Ambiente
```env
VITE_API_URL=https://sua-api.com
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave
```

### Substituir Context
- [ ] Atualizar `AdminDataContext.jsx`
- [ ] Remover localStorage/IndexedDB
- [ ] Integrar com API real
- [ ] Tratamento de erros
- [ ] Loading states

## 🚀 **DEPLOY**

### Frontend (Vercel)
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Deploy automático

### Backend (Supabase)
- [ ] Configurar Row Level Security
- [ ] Criar políticas de acesso
- [ ] Testar endpoints

## ✅ **TESTES**

### Funcionalidades
- [ ] Criar cliente
- [ ] Editar cliente
- [ ] Excluir cliente
- [ ] Criar projeto
- [ ] Editar projeto
- [ ] Excluir projeto
- [ ] Gerar PDF orçamento
- [ ] Gerar PDF contrato
- [ ] Persistência de dados

### Performance
- [ ] Tempo de carregamento < 3s
- [ ] Offline mode (cache)
- [ ] Error boundaries

## 🔐 **SEGURANÇA**

- [ ] Autenticação de usuários
- [ ] Validação de inputs
- [ ] Sanitização de dados
- [ ] Rate limiting
- [ ] HTTPS obrigatório

## 📊 **MONITORAMENTO**

- [ ] Logs de erros
- [ ] Analytics de uso
- [ ] Backup automático
- [ ] Health checks

## 🎯 **PÓS-LAUNCH**

- [ ] Teste completo com usuário real
- [ ] Documentação da API
- [ ] Treinamento do cliente
- [ ] Plano de manutenção

---

## 🚨 **PRIORIDADES**

1. **CRÍTICO**: Persistência de dados
2. **ALTO**: Funcionalidades CRUD
3. **MÉDIO**: Performance e UX
4. **BAIXO**: Monitoramento e analytics

---

## 📞 **SUPORTE**

- **Documentação**: Wiki do repositório
- **Deploy**: Vercel + Supabase (recomendado)
- **Custo**: ~$0-20/mês
- **Tempo estimado**: 2-3 dias

---

**Próximo passo**: Escolher o banco de dados e começar pela persistência!
