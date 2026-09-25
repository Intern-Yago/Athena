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

---

## 🗂️ 4. [CATÁLOGO & BANCO] Saneamento, Reclassificação e Otimização de Categorias de Produtos

### 📌 Diagnóstico da Situação Atual
- **Total de produtos auditados:** 640
- **Total de categorias cadastradas:** 43
- **Problema central:** Hiperconcentração na categoria genérica `Ferramentas & Armários` (321 produtos, 50,1% do site) e proliferação de micro-categorias redundantes de 1 a 3 produtos criadas durante importações de catálogos anteriores.
- **Produtos órfãos:** 2 produtos sem qualquer categoria vinculada (`category_id: null`).
- **Categorias sem uso:** 1 categoria com 0 produtos cadastrados.

---

### 📝 Checklist Detalhado para Execução

#### Fase 1: Correções Críticas & Imediatas
- [ ] **1.1 Vincular os 2 produtos órfãos:**
  - `prod_omie_11876016891` ("ELEVADOR GANGORRA 1.5TON PORTATIL") ➔ Vincular a `cat_elevadores` (*Elevadores*).
  - `prod_omie_11880776500` ("JG CHAVE HEXALOBULAR TIPO CANIVETE C/08 PECAS") ➔ Vincular a `cat_ferramentas` (*Ferramentas & Armários*).
- [ ] **1.2 Excluir categoria vazia:**
  - Excluir `cat_1789413312442` ("Canetas para testes e diagnósticos", slug: `canetas-para-testes-e-diagnosticos`) com 0 produtos.
- [ ] **1.3 Correção de título com prompt de imagem:**
  - Corrigir `prod_mahovi_mah-6004`: de `"tire o qr code, o texto descrição e redimensione para 1200x1200 - Mahovi MAH-6004"` ➔ `"Balanceadora de Rodas Computadorizada Linha Leve - Mahovi MAH-6004"`.

#### Fase 2: Fusão e Exclusão de Micro-Categorias Redundantes (1 a 3 produtos)
- [ ] **2.1 Apertadeira de rodas (1 produto):**
  - Mover `prod_sigma_sgt-7530` ("Apertadeira de Rodas 1\" 1.500 Nm 24V") ➔ `cat_1788453768939` (*Chaves de impacto*).
  - Excluir categoria `cat_1789067041029`.
- [ ] **2.2 Transmissão Automática (1 produto):**
  - Mover `prod_delta_dt-mft01` ("Máquina para Troca de Fluido da Transmissão Automática") ➔ `cat_1788371138282` (*Troca de fluido*).
  - Excluir categoria `cat_1789670494368`.
- [ ] **2.3 Fumaça & Nitrogênio (2 produtos):**
  - Mover `prod_mahovi_mah4040_fumaca` ("Gerador de Fumaça para Vazamentos") ➔ `cat_scanners` (*Scanners & Diagnóstico*).
  - Mover `prod_mahovi_mah-4014` ("Máquina de Calibragem c/ Nitrogênio 70L") ➔ `cat_1790016852133` (*Calibradores e Medidores*).
  - Excluir categoria `cat_1788376758844`.
- [ ] **2.4 Endoscópios e Boroscópios (1 produto):**
  - Mover `prod_1790341413049` ("Câmera Sonda Endoscópio/Boroscópio USB Tipo-C") ➔ `cat_scanners` (*Scanners & Diagnóstico*).
  - Excluir categoria `cat_1790341326840`.
- [ ] **2.5 Extensão para controle de torque (1 produto):**
  - Mover `prod_1789406547431` ("Kit Extensões para Controle de Torque 1/2″") ➔ `cat_1789075823822` (*Torquímetro*) ou `cat_1789405752776` (*Soquetes*).
  - Excluir categoria `cat_1789406515276`.
- [ ] **2.6 Suporte para Motor:**
  - Resgatar `prod_1790178303116` ("Suporte para Motor 450 kg") preso em `cat_elevadores` e unificar com `prod_1790178643434` ("Suporte para Motor 600 kg") em `cat_1790178421551`.
- [ ] **2.7 Ferramentas Automotivas (2 produtos):**
  - Mover kits de sincronismo de motor Sigma (BMW e Mercedes) ➔ `cat_1789498107322` (*Ferramentas de extração / especiais*) ou manter em *Ferramentas & Armários*.
  - Excluir categoria `cat_1790341668541`.

#### Fase 3: Descentralização de Produtos Mal Alocados
- [ ] **3.1 Limpar Macacos da Categoria Elevadores:**
  - Mover 5 macacos Sigma (`prod_sigma_sgt-3035`, `sgt-3040`, `sgt-3050`, `sgt-2025`, `sgt-2030`) ➔ `cat_1789587656316` (*Macaco Hidráulico*).
- [ ] **3.2 Limpar Lanternas de Scanners & Diagnóstico:**
  - Mover 10 lanternas e holofotes Sigma (`SGT-8501, 8503, 8510, 8511, 8516, 8517, 8518, 8519, 8520, 8525`) ➔ `cat_ferramentas` (ou criar categoria *Iluminação & Lanternas de Oficina*).
  - Mover `prod_1787753320561` ("VENU 5 – Sensor TPMS Universal") ➔ `cat_1789998064578` (*Válvulas para pneus / TPMS*).
  - Mover `prod_starkx_skx-028` ("Testador de Bateria com Impressora") ➔ `cat_1789414354078` (*Teste de bateria*).
- [ ] **3.3 Redistribuir os 36 itens de "Acessórios diversos":**
  - Mover Guincho 2T (`prod_1790179415072`) e Cavaletes (`prod_lapek_lpk-sup`) ➔ *Macaco Hidráulico / Elevação*.
  - Mover Saca Núcleo e Tampas de Válvula (`LPK-50033`, `50035`, `50036`, `50037`, `50038`) ➔ *Válvulas para pneus*.
  - Mover Alicate Balanceador (`LPK-50039`) ➔ *Desmontadoras & Balanceadoras*.
  - Mover Jogo de Soquetes 46 Peças (`prod_delta_dt-jsq01`) ➔ *Soquetes*.
  - Mover Saca Polia e Sacador GDI (`0699930039`, `DT-SAC07`) ➔ *Ferramentas de extração*.
  - Mover Bombas Manuais e Acoplador de Graxa ➔ *Bombas e Engraxadeiras Manuais*.
  - Mover Funis e Seringas de Óleo/Fluido ➔ *Troca e Coleta de Óleo*.
  - Mover Medidor Angular de Torque (`DT-MAT01`) ➔ *Torquímetro*.
  - Mover Kit Limpeza de Bicos (`DT-ADA01`) ➔ *Limpador e Testador de Injetores*.
  - Mover Termodensímetro (`DT-TFR01`) e Cabo OBD Bateria (`DT-ATB01`) ➔ *Scanners* / *Teste de bateria*.
- [ ] **3.4 Descentralizar itens específicos de "Ferramentas & Armários":**
  - Mover Chave de Impacto 3/4" Plus (`prod_sigma_sgt-0540b`) ➔ *Chaves de impacto*.
  - Mover Calibrador Digital (`prod_mahovi_mah-5010`) ➔ *Calibradores e Medidores*.
  - Mover Analisador de Fluído de Freio (`prod_starkx_skx208`) ➔ *Sistema de freios*.
  - Mover Tapetes Antiderrapantes (`prod_mahovi_mah-4020`) ➔ *Elevadores*.
  - Mover Rampa Plástica (`prod_mahovi_mah-1009-01`) ➔ *Rampas*.
  - Mover Visor ATF (`prod_1788380306494`) ➔ *Troca de fluido*.
  - Mover Funil de Óleo (`prod_mahovi_wal-fun`) ➔ *Troca e Coleta de Óleo*.
  - Mover Carregador SKX-038 e Auxiliar SKX-018 ➔ *Teste de bateria*.
  - Mover Detector de Continuidade SKX-088 ➔ *Scanners & Diagnóstico*.
  - Mover as 20+ Parafusadeiras industriais Sigma ➔ *Parafusadeira & Desparafusadeira*.
  - Criar/Avaliar categoria dedicada **Estética Automotiva & Pintura** para acolher mais de 80 produtos Sigma atualmente misturados (politrizes rotativas e roto orbitais, pistolas de pintura, máquinas airless, tornadores de limpeza, snow foam, lixadeiras elétricas e pneumáticas).

