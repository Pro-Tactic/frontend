# ProTactic Frontend

Interface web moderna e intuitiva desenvolvida com **React** e **Vite** para gerenciamento tático de times de futebol.

## 📋 Tabela de Conteúdos

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Rodar](#como-rodar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Componentes Principais](#componentes-principais)
- [Roteamento](#roteamento)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Build e Deploy](#build-e-deploy)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Visão Geral

O **ProTactic Frontend** é uma aplicação web responsiva que oferece uma experiência intuitiva para gerenciar:

- ✅ Autenticação e registro de usuários
- ✅ Gerenciamento de clubes e suas informações
- ✅ Cadastro e listagem de jogadores
- ✅ Criação de competições com regras customizadas
- ✅ Escalações táticas com posicionamento em campo
- ✅ Gerenciamento de adversários
- ✅ Registro de eventos em tempo real durante partidas
- ✅ Sistema de notas para anotações táticas
- ✅ Dashboard com análise de desempenho

## 🛠 Stack Tecnológico

| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 18.3.1 | Framework UI |
| **React Router** | 6.30.2 | Roteamento SPA |
| **Vite** | 7.2.4 | Build tool e dev server |
| **Tailwind CSS** | 3.4.17 | Estilização utilitária |
| **Axios** | 1.13.2 | Requisições HTTP |
| **Lucide React** | 0.562.0 | Ícones |
| **SweetAlert2** | 11.26.17 | Alertas e modais |
| **ESLint** | 9.39.1 | Linting de código |

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 16+** [Download aqui](https://nodejs.org/)
- **npm ou yarn** (gerenciador de pacotes)
- **Git** (controle de versão)

### Verificar instalação

```bash
node --version
npm --version
```

## 💾 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Pro-Tactic/frontend.git
cd frontend/frontend
```

### 2. Instale as dependências

```bash
npm install
```

ou com yarn:

```bash
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (pasta `frontend`):

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Pro-Tactic
```

## 🚀 Como Rodar

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:5173`

A aplicação recarrega automaticamente quando você faz alterações no código.

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

### Visualizar Build de Produção

```bash
npm run preview
```

### Verificar Linting

```bash
npm run lint
```

Corrigir automaticamente problemas de lint:

```bash
npm run lint -- --fix
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   └── PlayerStatsModal.jsx
│   │
│   ├── layouts/                # Layouts da aplicação
│   │   └── AppLayout.jsx       # Layout principal com navbar
│   │
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Login.jsx           # Página de login
│   │   ├── Registro.jsx        # Registro de usuário
│   │   ├── Inicio.jsx          # Dashboard principal
│   │   ├── Clube.jsx           # Detalhes do clube
│   │   ├── RegistroClube.jsx   # Cadastro de clube
│   │   ├── Elenco.jsx          # Gerenciar elenco
│   │   ├── ListarJogadores.jsx # Listar jogadores
│   │   ├── RegistroJogadores.jsx   # Cadastro de jogadores
│   │   ├── Escalacao.jsx       # Escalação/Formação
│   │   ├── Adversario.jsx      # Gerenciar adversários
│   │   ├── CriarPartida.jsx    # Criar partida
│   │   ├── TempoReal.jsx       # Tempo real da partida
│   │   ├── Notas.jsx           # Notas táticas
│   │   ├── RegistroCompeticoes.jsx  # Cadastro de competições
│   │   └── Sobre.jsx           # Página sobre
│   │
│   ├── services/               # Serviços da aplicação
│   │   ├── api.js              # Configuração Axios
│   │   └── navigation.js       # Lógica de navegação
│   │
│   ├── assets/                 # Recursos estáticos
│   │
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   ├── index.css               # Estilos globais
│   └── App.css                 # Estilos do app
│
├── public/                     # Arquivos públicos
├── icon/                       # Ícones
├── vite.config.js              # Configuração Vite
├── tailwind.config.js          # Configuração Tailwind
├── postcss.config.js           # Configuração PostCSS
├── eslint.config.js            # Configuração ESLint
├── package.json                # Dependências e scripts
├── package-lock.json
└── README.md
```

## ✨ Funcionalidades

### 🔐 Autenticação
- Registro de novos usuários
- Login com JWT
- Refresh automático de tokens
- Logout seguro

### 👥 Gerenciamento de Usuários
- Cadastro de administradores e treinadores
- Perfis de usuário
- Atribuição de clubes

### ⚽ Gerenciamento de Clubes
- Criar e editar clubes
- Upload de escudo/logo
- Informações (país, ano de fundação)

### 👨‍🦰 Gerenciamento de Jogadores
- Cadastro completo de jogadores
- Upload de fotos
- Número de camisa
- Posição na escalação
- Visão de elenco por clube

### 🏆 Competições
- Criar competições personalizadas
- Definir tamanho, divisão, formato
- Gerenciar premiações
- Tracker de participantes

### 📋 Escalações
- Editor visual de formação tática
- Posicionamento de jogadores no campo
- Visualização em tempo real
- Múltiplas formações

### 🎮 Tempo Real
- Acompanhamento ao vivo de partidas
- Registro de gols e eventos
- Chat de notificações
- Cronômetro integrado

### 📝 Notas Táticas
- Anotações sobre partidas
- Análise de desempenho
- Histórico de eventos

## 🧩 Componentes Principais

### PlayerStatsModal
Modal que exibe estatísticas detalhadas do jogador
- Histórico de gols
- Desempenho por competição
- Taxa de acertos

### AppLayout
Layout padrão da aplicação
- Navbar com navegação
- Menu lateral responsivo
- Footer
- Breadcrumb

## 🗂️ Roteamento

A aplicação usa **React Router v6** para navegação SPA.

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Página inicial/Login | Público |
| `/sobre` | Informações sobre | Público |
| `/registro` | Registro de usuário | Público |
| `/inicio` | Dashboard principal | Autenticado |
| `/clube` | Detalhes do clube | Autenticado |
| `/registrar-clube` | Cadastro de clube | Autenticado |
| `/elenco` | Gerenciar elenco | Autenticado |
| `/listar-jogadores` | Listar jogadores | Autenticado |
| `/registrar-jogadores` | Cadastro de jogadores | Autenticado |
| `/escalacao` | Editor de escalação | Autenticado |
| `/adversario` | Gerenciar adversários | Autenticado |
| `/criar-partida` | Criar nova partida | Autenticado |
| `/tempo-real` | Acompanhamento live | Autenticado |
| `/notas` | Anotações táticas | Autenticado |
| `/registrar-competicoes` | Cadastro de competições | Autenticado |

## 🔄 Variáveis de Ambiente

### Arquivo `.env.local`

```env
# API
VITE_API_URL=http://localhost:8000/api

# App
VITE_APP_NAME=Pro-Tactic
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=false
```

## 🔌 Integração com API

O serviço `api.js` gerencia todas as requisições HTTP:

```javascript
import api from './services/api';

// GET
const usuarios = await api.get('/users/');

// POST
const novoUsuario = await api.post('/users/', dados);

// PUT
await api.put(`/users/${id}/`, dados);

// DELETE
await api.delete(`/users/${id}/`);
```

### Exemplo de Requisição com Autenticação

```javascript
// O token é armazenado e enviado automaticamente
const response = await api.get('/jogadores/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎨 Tailwind CSS

Estilos utilitários pré-configurados para desenvolvimento rápido:

```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Botão
</button>
```

## 🚀 Build e Deploy

### Build Otimizado

```bash
npm run build
```

Gera arquivo otimizado em `dist/index.html`

### Deploy em Vercel

```bash
npm install -g vercel
vercel
```

### Deploy em Netlify

```bash
npm run build
# Arrastar pasta 'dist' para Netlify
```

### Deploy em Servidor Próprio

```bash
npm run build
# Copiar conteúdo de 'dist' para servidor web
```

## 🧪 Testar Localmente

1. Inicie o backend:
```bash
cd ../backend/protactic
python manage.py runserver
```

2. Em outro terminal, inicie o frontend:
```bash
npm run dev
```

3. Acesse `http://localhost:5173`

## 🐛 Troubleshooting

### Porta 5173 já em uso
```bash
npm run dev -- --port 3000
```

### Erro de CORS
Certifique-se que `VITE_API_URL` está correto e que o backend está com CORS configurado.

### Cache do Vite
```bash
rm -rf node_modules/.vite
npm run dev
```

### Limpar node_modules
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Exemplo de Fluxo de Uso

1. **Login** → Autenticar usuário
2. **Dashboard** → Visualizar informações do clube
3. **Registrar Jogadores** → Adicionar ao elenco
4. **Criar Competição** → Definir formato
5. **Escalação** → Montar formação tática
6. **Criar Partida** → Iniciar novo jogo
7. **Tempo Real** → Acompanhar partida
8. **Notas** → Registrar observações

## 📚 Documentação Oficial

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ pelo time ProTactic**

Para dúvidas ou sugestões, abra uma [issue](https://github.com/Pro-Tactic/frontend/issues).