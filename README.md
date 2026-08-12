# 🚘 Athena Soluções Automotivas — Catálogo Digital de Equipamentos

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

**Athena Soluções Automotivas** é uma plataforma web moderna, rápida e de alta performance desenvolvida para exibição, gerenciamento e cotação comercial de equipamentos automotivos de linha pesada e leve (elevadores, scanners de diagnóstico, alinhadores 3D, desmontadoras de pneus e ferramentas especiais).

---

## 🌟 Principais Funcionalidades

### 🛒 Catálogo & Filtros E-commerce (Estilo KaBuM! / Amazon)
- **Painel Lateral Fixo (Sticky Sidebar)** com busca integrada por palavra-chave.
- **Seleção Múltipla com Checkboxes `[x]`**: Permite selecionar simultaneamente várias marcas e várias categorias.
- **Cruzamento Inteligente de Filtros**: Bloqueia e desabilita (`disabled`) automaticamente opções incompatíveis com contadores dinâmicos `(Qtd)` em tempo real.
- **Paginação `-- Ver mais --` / `-- Ver menos --`**: Exibe inicialmente as principais marcas/categorias e expande as demais sob demanda.
- **Slider Dinâmico de Preço Máximo**: Filtra equipamentos dentro do orçamento desejado pelo cliente.
- **Paginação do Catálogo**: Organização limpa de 20 equipamentos por página com barra de navegação.

### 📄 Páginas Dedicadas de Produtos (`/#/produto/:slug`)
- **URLs Amigáveis para SEO**: Rotas limpas baseadas no slug do equipamento.
- **Navegação Inteligente "Voltar"**: Identifica se o visitante veio de uma marca, categoria ou link direto e adapta a navegação de retorno.
- **Recomendação de Produtos Relacionados**: Exibe automaticamente 3 produtos complementares (mesma categoria/marca diferente, mesma marca/categoria diferente e destaque).
- **Anexos e Documentos Opcionais**: Sistema de upload para manuais e fichas técnicas em PDF com o botão formatado **`Baixe <NomeFormatado>`**.
- **Cotação Direta via WhatsApp**: Botão preenchendo mensagem oficial com dados e especificações do equipamento.

### 🏷️ Páginas de Fabricantes & Parceiros (`/#/marca/:slug`)
- Exibição de logo oficial da marca armazenada no Cloudinary CDN.
- Botão **`Visitar Site Oficial ↗`** para redirecionar diretamente ao site oficial do fabricante parceiro (ex: Engecass, Launch, Raven, Napro, Sun).

### ⚙️ Painel Administrativo Completo (`/#/admin`)
- **Gestão de Status (`Publicado` vs `Rascunho`)**: Permite criar e visualizar rascunhos em modo de pré-visualização exclusiva antes da publicação.
- **Reordenação Comercial Prioritária**: Botões **⬆️ Subir** e **⬇️ Descer** para colocar marcas parceiras estratégicas no topo dos filtros.
- **Gerador de Alt Text para SEO com IA**: Gera descrições acessíveis automáticas para imagens de produtos.
- **Upload Direto para Nuvem Cloudinary**: Processamento de imagens JPG/PNG e PDFs de manuais convertidos para CDN global de alta velocidade.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Interface do Usuário)
- **React (v18)** + **Vite** — Build super rápido e estrutura SPA baseada em Hash Router.
- **Tailwind CSS (v4)** — Design moderno, responsivo e adaptado para performance de 60 FPS (sem blurs pesados de GPU).
- **Lucide React Icons** — Conjunto de ícones vetoriais modernos.

### Backend & Nuvem
- **Node.js + Express API** — Servidor REST API responsável pelas rotas de produtos, categorias, marcas e uploads.
- **PostgreSQL (`pg`)** — Banco de dados relacional permanente hospedado na nuvem Render com migrações automáticas.
- **Cloudinary SDK** — Object storage para armazenamento de mídia CDN.

---

## 📂 Estrutura do Projeto

```text
athena/
├── backend/                  # Servidor API Node.js + Express
│   ├── data/                 # Fallback local em arquivo JSON (athena-db.json)
│   ├── server.js             # Código principal do servidor API com PostgreSQL e Cloudinary
│   └── package.json
├── public/                   # Logotipo e assets estáticos
├── src/
│   ├── components/           # Componentes reutilizáveis (Header, Footer, Catalog, FilterSidebar, AdminPanel, ProductCard)
│   ├── data/                 # Dados iniciais de seed (initialData.js)
│   ├── pages/                # Páginas estáticas e dinâmicas (ProductDetailPage, CategoryPage, BrandPage, AboutPage)
│   ├── App.jsx               # Roteador principal e gerenciador de estado
│   ├── main.jsx
│   └── index.css             # Design System Tailwind v4
├── render.yaml               # Arquivo de configuração Render Blueprint
├── package.json
└── README.md
```

---

## 🌐 Variáveis de Ambiente (Environment Variables)

### Backend (Render / Produção)
| Variável | Descrição |
| :--- | :--- |
| `DATABASE_URL` | URL de conexão do PostgreSQL (ex: `postgresql://user:pass@host/dbname`) |
| `CLOUDINARY_CLOUD_NAME` | Nome da conta Cloudinary (`y0p1s8mx`) |
| `CLOUDINARY_API_KEY` | Chave de API do Cloudinary |
| `CLOUDINARY_API_SECRET` | Chave secreta do Cloudinary |

### Frontend (Vercel / Produção)
| Variável | Descrição |
| :--- | :--- |
| `VITE_API_URL` | URL pública da API do Backend (ex: `https://athena-backend-hu1m.onrender.com/api`) |

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/Intern-Yago/Athena.git
cd Athena
```

### 2. Instalar dependências do Frontend
```bash
npm install
```

### 3. Instalar dependências do Backend
```bash
cd backend
npm install
cd ..
```

### 4. Executar em modo de desenvolvimento
```bash
# Executar o Frontend React
npm run dev

# Em outro terminal, executar o Backend Node.js
npm run server
```

O Frontend estará disponível em `http://localhost:5173` e a API do Backend em `http://localhost:3001/api`.

---

## 📞 Suporte Comercial & Contato

- **Empresa**: Athena Soluções Automotivas
- **WhatsApp**: [(61) 98348-5671](https://wa.me/5561983485671)
- **Instagram**: [@athena.solucoes.automotivas](https://www.instagram.com/athena.solucoes.automotivas/)
