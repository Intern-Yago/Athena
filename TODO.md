# 📋 Athena Soluções Automotivas — Roadmap & Backlog (TODO)

---

## 🚀 1. [PRIORIDADE MÁXIMA] Sistema de Variações de Produtos (Cores, Tamanhos, Modelos & Integração Omie)

### 📌 Contexto & Motivação
- Existem equipamentos (como carrinhos de oficina, bancadas, alinhadores, scanners) cuja única diferença entre itens físicos é a **cor** (ex: Vermelho, Azul, Preto) ou o **tamanho/especificação** (ex: 5 gavetas vs 7 gavetas, 220V vs 380V, 1.500mm vs 2.000mm).
- Em vez de cadastrar 3 a 5 produtos separados e poluir o catálogo com itens repetidos, unificamos em **1 produto pai** com **variações selecionáveis**.
- No **Omie ERP**, cada variação física possui seu próprio cadastro com código SKU e estoque individualizado.

---

### 🧠 Regras de Negócio & Fallbacks Inteligentes

| Atributo | Comportamento se Preenchido | Comportamento se NÃO Preenchido (Fallback) |
| :--- | :--- | :--- |
| **Preço (`price`)** | Cobra o valor específico da variação selecionada. | **Herda automaticamente o preço base do produto pai**. |
| **Imagem (`image`)** | Ao clicar na variação, a galeria/foto principal troca para a imagem daquela opção. | **Mantém a imagem e galeria principal do produto pai** (nada quebra). |
| **Estoque Omie** | Consulta o saldo em estoque no Omie via `sku` / `omieCode` da variação. | Se não encontrar no ERP ou não tiver saldo, **define estoque como 0** (esgotado). |
| **Identificação Omie** | Cada variação guarda seu `sku` e `omieCode` exclusivos. | Permite que o checkout e a nota fiscal no Omie saiam com a baixa no produto exato. |

---

### 🎨 Design & Experiência do Usuário (UI / UX)

#### 1. Tipos de Seletores Dinâmicos:
- **Variações de Cor (Swatches):**
  - Círculos de 28–32px preenchidos com a cor real (`colorHex`).
  - Anel de destaque na cor ativa (borda dupla âmbar/escuro).
  - Rótulo logo acima: `Cor: [Nome da Cor Selecionada]`.
- **Variações de Tamanho / Medida / Modelo (Pills / Chips):**
  - Botões arredondados modernos (ex: `[ 5 Gavetas ]`, `[ 7 Gavetas ]` ou `[ 220V ]`, `[ 380V ]`).
  - Efeito visual de botão ativo e hover suave.

#### 2. Na Página de Detalhes ([ProductDetailPage.jsx](src/pages/ProductDetailPage.jsx)):
- Bloco posicionado estrategicamente entre o título do produto e a caixa de preço/botões de compra.
- Ao clicar em uma opção:
  - Foto principal muda instantaneamente (se houver foto para a variação).
  - Preço e parcelamento recalculam (se houver preço diferente).
  - Status de estoque exibe a quantidade disponível daquela variação.
  - Botão do WhatsApp gera a mensagem incluindo a variação escolhida:
    > *"Olá Athena! Tenho interesse no Carrinho de Oficina na cor **Vermelho (SKU: WLF-CAR-VM)**..."*

#### 3. No Card do Catálogo ([ProductCard.jsx](src/components/ProductCard.jsx)):
- Mini-swatches (bolinhas) discretas indicando que o produto tem cores disponíveis.
- Passar o mouse sobre a bolinha já pode alternar a foto do card (estilo lojas premium).

#### 4. No Carrinho de Compras ([CartContext.jsx](src/context/CartContext.jsx)):
- O item adicionado ao carrinho salva:
  - `productId`, `variantId`, `variantName` (ex: "Vermelho - 5 Gavetas").
  - `sku` da variação.
  - Imagem e preço calculados.
- Na listagem do carrinho e no resumo do pedido, aparece discriminada a opção escolhida.

#### 5. No Painel Administrativo ([AdminPanel.jsx](src/components/AdminPanel.jsx)):
- Seção no modal/formulário de edição do produto: **"Variações do Produto (Cores / Tamanhos)"**.
- Botão **"+ Adicionar Variação"** com campos:
  - Nome da Variação (ex: "Vermelho", "7 Gavetas", "220V").
  - Código SKU Omie (obrigatório para integração de estoque).
  - Código Omie numérico (opcional).
  - Seletor de Cor HEX (opcional — se informado, vira bolinha de cor; se vazio, vira botão de texto).
  - Preço Diferenciado (opcional — em branco herda o valor geral).
  - URL da Imagem da Variação (opcional — em branco herda a foto geral).

---

### 📦 Exemplo de Estrutura de Dados (JSON / Supabase)

```json
{
  "id": "prod_carrinho_oficina_modular",
  "name": "Carrinho de Ferramentas Modular Wolfcar",
  "slug": "carrinho-de-ferramentas-modular-wolfcar",
  "price": 1499.00,
  "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/carrinho-geral.webp",
  "categoryId": "cat_ferramentas",
  "brandId": "brand_wolfcar",
  "variants": [
    {
      "id": "var_vermelho_5g",
      "name": "Vermelho - 5 Gavetas",
      "sku": "WLF-CAR-VM-5G",
      "omieCode": 892011,
      "colorHex": "#DC2626",
      "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/carrinho-vermelho.webp"
    },
    {
      "id": "var_azul_5g",
      "name": "Azul - 5 Gavetas",
      "sku": "WLF-CAR-AZ-5G",
      "omieCode": 892012,
      "colorHex": "#1E40AF",
      "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/carrinho-azul.webp"
    },
    {
      "id": "var_preto_7g",
      "name": "Preto - 7 Gavetas",
      "sku": "WLF-CAR-PR-7G",
      "omieCode": 892013,
      "colorHex": "#18181B",
      "price": 1799.00
    }
  ]
}
```

---

### 📝 Checklist de Tarefas para Execução

- [ ] **1.1 Modelo & Banco:** Adicionar a coluna/campo `variants` (JSONB) no Supabase / PostgreSQL e no seed `initialData.js`.
- [ ] **1.2 Backend (Omie Sync):** Atualizar o serviço de consulta de estoque (`omieProductSyncService.js` / `hermesProductService.js`) para suportar consulta de saldo por SKU de variação.
- [ ] **1.3 ProductDetailPage:** Implementar seletor dinâmico (`selectedVariant`) com suporte a cores e chips, fallbacks de imagem e preço, e atualização da mensagem WhatsApp.
- [ ] **1.4 CartContext & Checkout:** Atualizar `addToCart` para persistir `variantId`, `variantName` e `sku`.
- [ ] **1.5 ProductCard:** Exibir swatches de cores / badge de opções no catálogo.
- [ ] **1.6 AdminPanel:** Adicionar gerenciador visual de variações no formulário de produtos.

---

---

## 🕶️ 2. [BACKLOG / FUTURO] Visualização 3D Interativa & Realidade Aumentada (WebAR)

### 📌 Contexto & Objetivo
- Permitir que proprietários de oficinas e concessionárias visualizem equipamentos (elevadores, bancadas modulares, carrinhos de ferramentas) em **escala real (1:1)** no espaço físico da sua oficina usando a câmera do celular (iOS e Android), sem precisar instalar aplicativos.
- No computador (desktop), exibir visualizador 3D 360° interativo com botão/QR Code para abrir no celular.

### 📱 Tecnologias & Formatos Recomendados
- **Biblioteca Web:** `<model-viewer>` do Google (leve, nativa para navegadores mobile).
- **Formatos de Arquivo:**
  - Android: `.glb` (carregado via Scene Viewer nativo).
  - iOS (iPhone/iPad): `.usdz` ou `.glb` com conversão/fallback via Quick Look.
- **Armazenamento:** Arquivos 3D hospedados no Cloudflare R2 ou Cloudinary CDN.

### 🛠️ Métodos para Obtenção dos Modelos 3D (Sem custos abusivos)
1. **Modelos CAD dos Fabricantes:** Solicitar arquivos `.step` ou `.obj` às montadoras parceiras (Wolfcar, Engecass, Sigma Tools, Marcon) e converter para `.glb` no Blender.
2. **Fotogrametria no Galpão / Oficina:** Usar o celular com apps como *Polycam*, *Luma AI* ou *Kiri Engine* girando em volta do produto físico montado para gerar a malha com texturas reais.
3. **IAs Image-to-3D:** Ferramentas gratuitas/freemium como Tripo3D, Rodin ou Meshy (exportação `.glb`).
4. **Modeladores Freelancers:** Para chaparias retas de oficinas (muito barato, R$ 80 - R$ 150 por peça).

### 📐 Calibração de Escala
- Para projeção fiel no chão (AR 1:1), a altura/largura da malha deve corresponder a 1 unidade = 1 metro.
- Script ou atributo `scale` no `<model-viewer>` com base nas medidas da ficha técnica.

---

## 📌 3. Outras Melhorias & Tarefas Futuras do Backlog

- [ ] **Sincronização Bidirecional via Webhooks do Omie:** Receber atualizações de estoque e preço do Omie em tempo real via webhook HTTP.
- [ ] **Cálculo de Frete Automatizado:** Integração com Melhor Envio / Correios / Transportadoras para cotação em tempo real na página do produto.
- [ ] **Exportação de Relatórios de Vendas / Cotações:** Download de orçamentos e pedidos em PDF para envio formal a oficinas e concessionárias.
- [ ] **Otimização Contínua de SEO:** Gerar automaticamente dados estruturados Schema.org `hasVariant` para o Google Shopping indexar cada variação.

