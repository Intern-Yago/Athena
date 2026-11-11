# Athena Soluções Automotivas - Manual de Identidade Visual & Cores HEX

Documento oficial de referência técnica de cores, paleta cromática e códigos HEX utilizados na plataforma e materiais institucionais da **Athena**.

---

## 1. Cores Primárias da Marca (Dourado / Âmbar Athena)

A paleta dourada representa a nobreza, robustez e alta precisão dos equipamentos automotivos comercializados pela Athena.

| Tonalidade | Código HEX | Código RGB | Tailwind Token | Aplicação Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Dourado Claro** | `#FBBF24` | `rgb(251, 191, 36)` | `amber-400` | Início do gradiente dourado, estrelas de destaque ativas, foco luminoso |
| **Dourado Athena Oficial** | `#F59E0B` | `rgb(245, 158, 11)` | `amber-500` | Cor primária institucional, botões de ação principal (`.btn-gold`), selos oficiais |
| **Dourado Queimado** | `#D97706` | `rgb(217, 119, 6)` | `amber-600` | Estado de hover, bordas ativas de formulários, acentos visuais |
| **Ouro Profundo** | `#B45309` | `rgb(180, 83, 9)` | `amber-700` | Tipografia em fundos claros exigindo alta legibilidade (WCAG AA/AAA) |
| **Marrom Dourado Escuro** | `#92400e` | `rgb(146, 64, 14)` | `amber-800` | Textos em badges claros de destaque |
| **Marrom Café Ouro** | `#78350F` | `rgb(120, 53, 15)` | `amber-900` | Contornos profundos e sombras quentes |
| **Fundo Dourado Suave** | `#FEF3C7` | `rgb(254, 243, 199)` | `amber-100` | Fundo de produtos destacados no Admin e cards promocionais |
| **Brilho Dourado Mínimo** | `#FFFBEB` | `rgb(255, 251, 235)` | `amber-50` | Fundo de linhas ativas em tabelas e seleções |

### Gradiente Oficial dos Botões (`.btn-gold`)
```css
background-color: #f59e0b;
background-image: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
color: #020617;
border: 1px solid #f59e0b;
```

---

## 2. Cores Estruturais e Neutras (Slate / Grafite Automotivo)

A base escura confere o visual técnico, premium e moderno inspirado no segmento de tecnologia e oficinas de alta performance.

| Tonalidade | Código HEX | Código RGB | Tailwind Token | Aplicação Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Preto Noturno Absoluto** | `#020617` | `rgb(2, 6, 23)` | `slate-950` | Fundo da barra superior, carrossel de banners, modais escuros, texto no botão ouro |
| **Grafite Profundo** | `#0F172A` | `rgb(15, 23, 42)` | `slate-900` | Superfície do Header, cards com fundo noturno, tipografia principal clara |
| **Grafite Médio** | `#1E293B` | `rgb(30, 41, 59)` | `slate-800` | Bordas e divisores de seções escuras, botões neutros escuros |
| **Grafite Neutro** | `#334155` | `rgb(51, 65, 85)` | `slate-700` | Badges de produtos rascunho, textos secundários em modo escuro |
| **Cinza Metálico** | `#475569` | `rgb(71, 85, 105)` | `slate-600` | Subtítulos e legendas informativas |
| **Cinza Suave** | `#64748B` | `rgb(100, 116, 139)` | `slate-500` | Textos secundários, contadores e placeholders |
| **Borda Média** | `#CBD5E1` | `rgb(203, 213, 225)` | `slate-300` | Bordas de inputs, barras de rolagem e divisores de tabela |
| **Borda Clara** | `#E2E8F0` | `rgb(226, 232, 240)` | `slate-200` | Bordas padrão de cartões de produtos e caixas de texto |
| **Cinza de Superfície** | `#F1F5F9` | `rgb(241, 245, 249)` | `slate-100` | Fundo de cabeçalhos de tabelas, botões de paginação desativados |
| **Branco Gelo de Fundo** | `#F8FAFC` | `rgb(248, 250, 252)` | `slate-50` | Fundo geral da aplicação (body background) |
| **Branco Puro** | `#FFFFFF` | `rgb(255, 255, 255)` | `white` | Fundo de cards, painéis, modais claros e contraste máximo |

---

## 3. Cores Semânticas e Operacionais (Status & Funcionalidades)

| Função | Código HEX | Código RGB | Token / Classe | Aplicação Principal |
| :--- | :--- | :--- | :--- | :--- |
| **WhatsApp Oficial** | `#25D366` | `rgb(37, 211, 102)` | `--whatsapp` | Botões flutuantes e links diretos de atendimento comercial |
| **Sucesso / Aprovado** | `#10B981` | `rgb(16, 185, 129)` | `emerald-500` | Status de produtos publicados, pedidos concluídos, pagamentos PIX |
| **Sucesso Escuro** | `#059669` | `rgb(5, 150, 105)` | `emerald-600` | Textos e bordas de sucesso com alto contraste |
| **Sucesso Fundo** | `#D1FAE5` | `rgb(209, 250, 229)` | `emerald-100` | Fundo de badges de status "Publicado" e "Concluído" |
| **Atenção / Desconto OFF** | `#DC2626` | `rgb(220, 38, 38)` | `red-600` | Badges de desconto promocional (`-XX% OFF`), botões de exclusão |
| **Alerta Fundo** | `#FEF2F2` | `rgb(254, 242, 242)` | `red-50` | Fundo de avisos de erro e exclusão |
| **Informativo / Links** | `#0284C7` | `rgb(2, 132, 199)` | `sky-600` | Badges de marcas, links de ajuda e termos legais |
| **A-Points Fidelidade** | `#9333EA` | `rgb(147, 51, 234)` | `purple-600` | Pontuação de cashback A-Points, saldo e benefícios de fidelidade |
| **A-Points Fundo** | `#F3E8FF` | `rgb(243, 232, 255)` | `purple-100` | Fundo de cards e extratos do programa A-Points |

---

## 4. Guia Rápido de Aplicação

- **Botão Principal de Compra / Cotação**: Utilizar sempre `.btn-gold` com fundo `#F59E0B` e texto escuro `#020617`.
- **Preços e Ofertas**: Texto em destaque com cor `#D97706` ou fundo dourado.
- **Top Bar & Header Superior**: Fundo escuro `#020617` com ícones e acentos em `#F59E0B`.
- **Cards de Produto**: Fundo `#FFFFFF` com borda suave `#E2E8F0` sobre o fundo da página `#F8FAFC`.
