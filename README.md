# 🛒 Controle de Compras Pessoal (Multiusuário)

![Badge de Deploy](https://img.shields.io/website?label=vercel&style=for-the-badge&up_message=online&url=https%3A%2F%2Fcontrole-compras-ten.vercel.app%2F)
![Badge de Linguagem](https://img.shields.io/github/languages/top/sergiofisio/controle_compras?style=for-the-badge)
![Badge de Licença](https://img.shields.io/github/license/sergiofisio/controle_compras?style=for-the-badge)

<br>

<p align="center">
  <img src="https://controle-compras-ten.vercel.app/logo.png" alt="Logo do Controle de Compras" width="150">
</p>

<p align="center">
  Uma aplicação web full-stack <strong>multiusuário</strong>, moderna e responsiva, para gerenciamento e análise inteligente de despesas com compras, com foco em segurança e uma experiência de usuário fluida.
</p>

<p align="center">
  <a href="https://controle-compras-ten.vercel.app/"><strong>Acesse a Demo »</strong></a>
</p>
<br>

## 🖼️ Galeria

| Dashboard | Gerenciamento de Itens | Formulário de Compra |
| :---: | :---: | :---: |
| ![Screenshot do Dashboard](https://controle-compras-ten.vercel.app/dashboard.png) | ![Screenshot do Gerenciador de Itens](https://controle-compras-ten.vercel.app/items.png) | ![Screenshot do Formulário de Compras](https://controle-compras-ten.vercel.app/compras.png) |

*(Nota: As imagens na galeria estão funcionando perfeitamente, pois você as colocou na pasta `public` do seu projeto.)*

---

## ✨ Funcionalidades

### **Autenticação e Segurança**
- **Sistema de Autenticação Completo:** Registro de novos usuários com senha criptografada (`bcrypt.js`) e fluxo de login seguro.
- **Gerenciamento de Sessão:** Sessões gerenciadas por **Auth.js (NextAuth.js)**, utilizando JSON Web Tokens (JWT) armazenados em cookies `HttpOnly` para máxima segurança.
- **Sessões Deslizantes:** O token de 24 horas é renovado automaticamente a cada uso, mantendo o usuário logado de forma segura.
- **Rotas Protegidas:** Um middleware centralizado protege todas as páginas e endpoints da API, redirecionando usuários não autorizados.

### **Gerenciamento de Dados**
- **Isolamento de Dados (Multi-Tenant):** Cada usuário tem acesso **exclusivo** aos seus próprios dados (compras, itens, categorias, etc.), garantindo total privacidade.
- **Dashboard Analítico:** Visão geral com estatísticas mensais (total gasto, nº de compras, ticket médio) e um gráfico de evolução de despesas com ECharts.
- **CRUD Completo e Interativo:**
  - **Gerenciamento de Compras:** Registre novas compras com uma lista dinâmica de itens.
  - **Histórico Detalhado:** Visualize o histórico de compras em um formato de acordeão expansível.
  - **Catálogo Inteligente:** Gerencie catálogos de `Itens`, `Categorias`, `Marcas` e `Supermercados`.
  - **Criação "On-the-Fly":** Adicione novas categorias e marcas diretamente do formulário de criação de itens através de modais.

### **Experiência do Usuário**
- **Navegação Instantânea:** Transições de página fluidas com *Skeleton Loaders* automáticos.
- **Feedback em Tempo Real:** Notificações (Toasts) para cada ação do usuário.
- **Loading Global:** Overlay de carregamento que impede cliques múltiplos durante ações críticas.

---

## 🚀 Tecnologias e Arquitetura

### **Backend**
- **Framework:** **Next.js (App Router & API Routes)**
- **Linguagem:** **TypeScript**
- **Banco de Dados:** **PostgreSQL**
- **ORM:** **Prisma**
- **Validação:** **Zod**
- **Autenticação:** **Auth.js (NextAuth.js)** com `PrismaAdapter`
- **Criptografia:** **bcrypt.js** para hashing de senhas

### **Frontend**
- **Framework:** **Next.js** com **React**
- **Estilização:** **Tailwind CSS** & **shadcn/ui**
- **Gerenciamento de Estado do Servidor:** **TanStack Query (React Query)**
- **Gerenciamento de Estado Global:** **Zustand**
- **Gráficos:** **ECharts for React**
- **Formulários:** **React Hook Form**

### **Deploy**
- **Plataforma:** **Vercel**

---

## 💡 Conceitos e Padrões Aplicados

- **Arquitetura Multi-Tenant:** Todo o backend foi refatorado para garantir o isolamento de dados, onde cada consulta ao banco de dados é filtrada pelo `userId`.
- **Segurança com Cookies HttpOnly:** O token de sessão é inacessível via JavaScript no navegador, prevenindo ataques XSS.
- **Proteção de Rotas com Middleware:** O middleware do Next.js atua como um "gatekeeper", centralizando a lógica de autorização.
- **Arquitetura em Camadas (Backend):** Lógica dividida em **Rotas → Serviços → Repositórios**.
- **SEO Otimizado:** Uso da API de Metadados do Next.js para gerar tags de SEO.
- **Otimizações de Performance em React:** Uso estratégico de `React.memo`, `useCallback`, e `useMemo`.
- **Hooks Customizados:** Encapsulamento de toda a lógica de dados em hooks reutilizáveis (ex: `useCategories`).
- **Componentização e Reutilização:** Criação de componentes genéricos (ex: `NamedEntityForm`, `CustomFormField`).

---

## 🛠️ Como Rodar o Projeto Localmente

### **Pré-requisitos**
- [Node.js](https://nodejs.org/en) (v18+)
- [Yarn](https://yarnpkg.com/)
- Um banco de dados PostgreSQL.

### **Passos**
1.  **Clone:** `git clone https://github.com/sergiofisio/controle_compras.git`
2.  **Instale:** `cd controle_compras && yarn install`
3.  **Configure as Variáveis de Ambiente:**
    - Renomeie `.env.example` para `.env`.
    - Preencha a `DATABASE_URL` com a string de conexão do seu PostgreSQL.
    - Gere e adicione um segredo para o NextAuth:
      ```env
      # Gere um segredo forte (ex: openssl rand -base64 32 no terminal)
      AUTH_SECRET="SEU_SEGREDO_FORTE_AQUI"
      ```
4.  **Migre o Banco de Dados:** `npx prisma migrate dev`
5.  **Rode:** `yarn dev`
6.  Acesse `http://localhost:3000`. Crie seu primeiro usuário através da página de registro.

---

## 🔮 Próximos Passos

O projeto possui uma base sólida e segura. As próximas evoluções podem incluir:
- [ ] **Rastreamento de Preços:** Criar a UI para registrar e visualizar o histórico de preços de um item por supermercado.
- [ ] **Edição de Compras:** Implementar a funcionalidade para editar uma compra já registrada.
- [ ] **Testes Automatizados:** Adicionar testes unitários e de integração para a API e os componentes.
- [ ] **Login com Provedores OAuth:** Adicionar opções de login com Google ou GitHub.