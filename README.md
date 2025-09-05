# 🛒 Controle de Compras Pessoal

![Badge de Deploy](https://img.shields.io/website?label=vercel&style=for-the-badge&up_message=online&url=https%3A%2F%2Fcontrole-compras-ten.vercel.app%2F)
![Badge de Linguagem](https://img.shields.io/github/languages/top/sergiofisio/controle_compras?style=for-the-badge)
![Badge de Licença](https://img.shields.io/github/license/sergiofisio/controle_compras?style=for-the-badge)

<br>

<p align="center">
  <img src="https://controle-compras-ten.vercel.app/logo.png" alt="Logo do Controle de Compras" width="150">
</p>

<p align="center">
  Um aplicativo web full-stack, moderno e responsivo, para gerenciamento e análise inteligente de despesas com compras.
</p>

<p align="center">
  <a href="https://controle-compras-ten.vercel.app/"><strong>Acesse a Demo »</strong></a>
</p>
<br>

## 🖼️ Galeria

| Dashboard | Gerenciamento de Itens | Formulário de Compra |
| :---: | :---: | :---: |
| ![Screenshot do Dashboard](https://controle-compras-ten.vercel.app/dashboard.png) | ![Screenshot do Gerenciador de Itens](https://controle-compras-ten.vercel.app/items.png) | ![Screenshot do Formulário de Compras](https://controle-compras-ten.vercel.app/compras.png)

## ✨ Funcionalidades

- **Dashboard Analítico:** Visão geral com estatísticas mensais (total gasto, nº de compras, ticket médio) e um gráfico de evolução de despesas com ECharts.
- **CRUD Completo e Interativo:**
  - **Gerenciamento de Compras:** Registre novas compras com data, supermercado e uma lista dinâmica de itens com quantidade e preço.
  - **Histórico Detalhado:** Visualize o histórico de compras em um formato de acordeão expansível, com detalhes de cada item.
  - **Catálogo Inteligente:** Gerencie um catálogo completo de `Itens`, `Categorias`, `Marcas` e `Supermercados`.
  - **Criação "On-the-Fly":** Adicione novas categorias e marcas diretamente do formulário de criação de itens, sem interromper o fluxo de trabalho.
- **Experiência de Usuário Otimizada:**
  - **Navegação Instantânea:** Transições de página fluidas com *Skeleton Loaders* automáticos, graças ao `loading.tsx` do Next.js.
  - **Feedback em Tempo Real:** Notificações (Toasts) para cada ação bem-sucedida ou com erro.
  - **Loading Global:** Overlay de carregamento que impede cliques múltiplos durante ações críticas (criar, deletar, etc.).

---

## 🚀 Tecnologias e Arquitetura

O projeto foi construído com uma stack full-stack TypeScript, focada em performance, manutenibilidade e uma excelente experiência de desenvolvimento.

### **Arquitetura Backend (dentro do Next.js)**
- **Framework:** **Next.js (App Router & API Routes)** servindo como um backend serverless.
- **Padrão de Camadas:** A lógica é dividida em **Rotas → Serviços → Repositórios**, garantindo separação de responsabilidades e facilitando testes.
- **Linguagem:** **TypeScript**.
- **Banco de Dados:** **PostgreSQL** hospedado na nuvem.
- **ORM:** **Prisma** para uma interação segura e tipada com o banco de dados.
- **Validação:** **Zod** para validação de ponta a ponta dos schemas de dados, garantindo que apenas dados limpos cheguem à API.

### **Arquitetura Frontend**
- **Framework:** **Next.js** com **React**, utilizando Server e Client Components.
- **Linguagem:** **TypeScript** & TSX.
- **Estilização:** **Tailwind CSS** para uma estilização utilitária e responsiva.
- **Componentes de UI:** **shadcn/ui**, uma coleção de componentes acessíveis e customizáveis.
- **Gerenciamento de Estado do Servidor:** **TanStack Query (React Query)** para gerenciar de forma eficiente o cache, revalidação e estados de UI (loading/error) dos dados da API.
- **Gerenciamento de Estado Global:** **Zustand** para um estado global leve e sem boilerplate, ideal para o controle de UI como o overlay de loading.
- **Gráficos:** **ECharts for React** para visualizações de dados dinâmicas.
- **Formulários:** **React Hook Form** para formulários performáticos e com validação integrada ao Zod.

### **Deploy**
- **Plataforma:** **Vercel**, com deploys contínuos a partir do Git.

---

## 💡 Conceitos e Padrões Aplicados

- **SEO Otimizado:** Uso da API de Metadados do Next.js para gerar tags de SEO dinâmicas e estáticas no servidor.
- **Otimizações de Performance em React:** Uso estratégico de `React.memo`, `useCallback`, e `useMemo` para evitar re-renderizações desnecessárias.
- **Hooks Customizados:** Encapsulamento de toda a lógica de dados em hooks reutilizáveis (ex: `useCategories`), mantendo os componentes de UI limpos e declarativos.
- **Componentização e Reutilização:** Criação de componentes genéricos (ex: `NamedEntityForm`) e específicos para cada funcionalidade.
- **Tratamento de Erros:** Gestão de erros robusta em todas as camadas, com feedback claro para o usuário e status codes HTTP apropriados.

---

## 🛠️ Como Rodar o Projeto Localmente

*(Esta seção permanece a mesma, pois já estava excelente)*

### **Pré-requisitos**
- [Node.js](https://nodejs.org/en) (v18 ou superior)
- [Yarn](https://yarnpkg.com/)
- Um banco de dados PostgreSQL.

### **Passos**
1.  Clone: `git clone https://github.com/sergiofisio/controle_compras.git`
2.  Instale: `cd controle_compras && yarn install`
3.  Configure: Renomeie `.env.example` para `.env` e adicione sua `DATABASE_URL`.
4.  Migre o DB: `npx prisma migrate dev`
5.  Rode: `yarn dev`
6.  Acesse: `http://localhost:3000`

---

## 🔮 Próximos Passos

- [ ] **Autenticação de Usuários:** Implementar login com NextAuth.js ou Clerk.
- [ ] **Edição de Compras:** Criar a interface e a lógica para editar uma compra já registrada.
- [ ] **Filtros Avançados:** Adicionar filtros por período no dashboard e nas listas.
- [ ] **Testes Automatizados:** Implementar testes unitários com Vitest/Jest para garantir a estabilidade.