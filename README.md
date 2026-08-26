# Athena Soluções Automotivas — Catálogo Digital de Equipamentos

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![Supabase PostgreSQL](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare_R2_WebP-F38020?style=for-the-badge&logo=cloudflare)](https://cloudflare.com)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

**Athena Soluções Automotivas** é uma plataforma web moderna, rápida e de alta performance desenvolvida para exibição, gerenciamento e cotação comercial de equipamentos automotivos de linha pesada e leve (elevadores, scanners de diagnóstico, alinhadores 3D, desmontadoras de pneus, móveis modulares e ferramentas especiais).

---

## 1. Visão Geral da Arquitetura

* **Frontend:** React 18 + Vite + Tailwind CSS v4 com rotas limpas HTML5 (sem hashtags).
* **Cache Local do Navegador:** **IndexedDB** para carregamento instantâneo do catálogo sem limite de cota de memória.
* **Backend API:** Node.js + Express hospedado no Render com middlewares de segurança OWASP (Helmet, Rate Limiting, CORS e Swagger Docs em `/api-docs`).
* **Banco de Dados Relacional Permanente:** **PostgreSQL no Supabase** (com Row Level Security e Connection Pooler IPv4).
* **Armazenamento de Fotos e Mídia:** **Cloudflare R2 Object Storage** com taxa zero de saída (Zero Egress) e conversão automática de imagens para **WebP** via motor `sharp`. Cloudinary mantido como fallback redundante.

---

## 2. Principais Funcionalidades

### 2.1. Catálogo & Filtros E-commerce Avançados
* **Painel Lateral Fixo (Sticky Sidebar)** com busca integrada por palavra-chave.
* **Seleção Múltipla com Checkboxes `[x]`**: Permite selecionar simultaneamente várias marcas e várias categorias.
* **Cruzamento Inteligente de Filtros**: Bloqueia e desabilita automaticamente opções incompatíveis com contadores dinâmicos `(Qtd)` em tempo real.
* **Slider Dinâmico de Preço Máximo**: Filtra equipamentos dentro do orçamento desejado pelo cliente.
* **Paginação Inteligente Deslizante**: Navegação dinâmica exibindo a primeira página, páginas adjacentes e a última página com elipses (`...`).
* **Comparador de Equipamentos Lado a Lado**: Permite comparar especificações técnicas de até 3 equipamentos simultaneamente.
* **Gerador de Catálogo em PDF**: Exportação instantânea de catálogo comercial formatado em PDF.

### 2.2. Páginas Dedicadas de Produtos (`/produto/:slug`)
* **URLs Amigáveis para SEO**: Rotas limpas baseadas no slug do equipamento.
* **Carrossel Interativo & Lupa de Zoom**: Visualização de alta definição com fotos em formato WebP.
* **Barra de Pré-visualização Estilo Shopify**: Barra superior para administradores com status do produto e botão "Voltar para a Edição" que reabre o editor com alterações não salvas preservadas.
* **Navegação Inteligente no Botão Voltar**: Retorna dinamicamente para o Painel Admin, Categoria, Marca ou Catálogo dependendo da origem do visitante.
* **Recomendação de Produtos Relacionados**: Exibe 3 produtos complementares automaticamente.
* **Anexos e Fichas Técnicas (PDF)**: Botão de download com formatação automática (`Baixe Ficha Tecnica`, `Baixe Manual de Instrucoes`).
* **Cotação Direta via WhatsApp**: Botão com mensagem pronta contendo o nome e dados do equipamento.

### 2.3. Painel Administrativo Completo (`/admin`)
* **Modal de Edição 2 Colunas Estilo Shopify (`max-w-6xl`)**: Amplo espaço de trabalho com prévia em tempo real de mídias, especificações com auto-sugestões e badges.
* **Editor de Descrições Estilo Word (RichTextEditor)**:
  * Atalhos de teclado: `Ctrl+B` (Negrito), `Ctrl+I` (Itálico), `Ctrl+U` (Sublinhado), `Ctrl+Z` (Desfazer), `Ctrl+Y` (Refazer).
  * Listas inteligentes: Continuação automática no `Enter`, saída no `Enter Duplo`, recuo de sub-itens via `Tab` / `Shift+Tab`, auto-formatação ao digitar `- ` ou `1. `, e botão para renumerar listas.
  * Formatação de cores (Dourado, Azul, Verde, Vermelho) e destaques em amarelo.
* **Conversor Automático WebP no Backend**: Qualquer imagem enviada (JPG/PNG pesada) é convertida automaticamente para WebP e salva no Cloudflare R2.
* **Gestão de Status (`Publicado` vs `Rascunho`)**: Controle total de visibilidade pública.
* **Reordenação Comercial Prioritária**: Subir e descer posições de marcas e produtos no catálogo.
* **Gestão de Usuários e Permissões**: Perfis de Administrador e Vendedor com senhas criptografadas em `bcrypt`.

---

## 3. Links Úteis & Contas da Infraestrutura

| Serviço | Função | Conta / Acesso | Link de Acesso |
| :--- | :--- | :--- | :--- |
| **Site Oficial** | Catálogo em Produção | Domínio Oficial | [athenaconsultoria.com.br](https://www.athenaconsultoria.com.br) |
| **GitHub** | Repositório de Código | Conta Yago | [github.com/Intern-Yago/Athena](https://github.com/Intern-Yago/Athena) |
| **Vercel** | Hospedagem do Frontend | Conta Yago | [vercel.com](https://vercel.com) |
| **Render** | Servidor Backend API | Conta Yago | [dashboard.render.com](https://dashboard.render.com) |
| **Supabase** | Banco de Dados PostgreSQL | `athena.consultoria.automotiva@gmail.com` (via GitHub) | [supabase.com](https://supabase.com) |
| **Cloudflare R2** | Storage de Mídia WebP | `athena.consultoria.automotiva@gmail.com` | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **Cloudinary** | Fallback de Mídia Secundário | Conta Yago | [cloudinary.com](https://cloudinary.com) |

---

## 4. Variáveis de Ambiente (Environment Variables)

### Backend (Render / `.env`)
| Variável | Descrição |
| :--- | :--- |
| `DATABASE_URL` | String de conexão IPv4 Pooler do Supabase PostgreSQL |
| `R2_ACCOUNT_ID` | Account ID da Cloudflare |
| `R2_ACCESS_KEY_ID` | Chave de Acesso S3 do Cloudflare R2 |
| `R2_SECRET_ACCESS_KEY` | Chave Secreta S3 do Cloudflare R2 |
| `R2_BUCKET_NAME` | Nome do Bucket (`athena-catalogo`) |
| `R2_ENDPOINT` | Endpoint S3 do Cloudflare R2 |
| `R2_PUBLIC_URL` | URL pública do Bucket (`https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev`) |

### Frontend (Vercel / `.env`)
| Variável | Descrição |
| :--- | :--- |
| `VITE_API_URL` | URL pública da API do Backend (`https://athena-backend-hu1m.onrender.com/api`) |

---

## 5. Atendimento Comercial & Redes

* **WhatsApp Oficial:** [(61) 98348-5671](https://wa.me/5561983485671)
* **Instagram Oficial:** [@athena.solucoes.automotivas](https://www.instagram.com/athena.solucoes.automotivas/)
* **E-mail Corporativo:** `athena.consultoria.automotiva@gmail.com`
