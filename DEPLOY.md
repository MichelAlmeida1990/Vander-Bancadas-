# 🚀 Guia de Deploy na Vercel

## Passo a Passo

### 1. Acesse a Vercel
- Vá para [vercel.com](https://vercel.com)
- Faça login com sua conta GitHub

### 2. Importe o Projeto
- Clique em "Add New Project"
- Selecione o repositório: `MichelAlmeida1990/Vander-Bancadas-`
- A Vercel detectará automaticamente que é um projeto Vite

### 3. Configurações de Build
A Vercel detectará automaticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `dist` (automático)
- **Install Command**: `npm install` (automático)

### 4. Variáveis de Ambiente
Nenhuma variável de ambiente necessária no momento.

### 5. Deploy
- Clique em "Deploy"
- Aguarde o build completar (geralmente 1-2 minutos)
- Seu site estará disponível em uma URL da Vercel (ex: `vander-bancadas.vercel.app`)

### 6. Domínio Personalizado (Opcional)
- Vá em Settings > Domains
- Adicione seu domínio personalizado se desejar

## ✅ Configurações Automáticas

O projeto já está configurado com:
- ✅ `vercel.json` para roteamento SPA
- ✅ Build otimizado para produção
- ✅ Deploy automático a cada push na branch `main`

## 📝 Notas

- O deploy é automático a cada push na branch `main`
- Você pode configurar preview deployments para outras branches
- O site será atualizado automaticamente quando você fizer push

