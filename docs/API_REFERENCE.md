# Athena Soluções Automotivas — Guia de Referência da API & Hermes Gateway

> **Versão da API**: `2.1.0`  
> **Ambiente de Produção**: `https://athena-backend-hu1m.onrender.com`  
> **Proxy Oficial**: `https://www.athenaconsultoria.com.br`  
> **Ambiente Local**: `http://localhost:3001`  
> **Swagger UI Interativo**: `https://athena-backend-hu1m.onrender.com/api-docs` (ou `/api/docs`)  
> **Especificação OpenAPI 3.1 (JSON)**: `GET /api/openapi.json` ou localmente em [`docs/openapi.json`](./openapi.json)

---

## 📑 Índice Geral
1. [Visão Geral & Arquitetura](#1-visão-geral--arquitetura)
2. [Modelos de Autenticação](#2-modelos-de-autenticação)
3. [Guia de Integração para Agentes (Hermes & AGY)](#3-guia-de-integração-para-agentes-hermes--agy)
4. [Equipamentos (Produtos)](#4-equipamentos-produtos)
5. [Categorias](#5-categorias)
6. [Marcas Parceiras](#6-marcas-parceiras)
7. [Banners Promocionais](#7-banners-promocionais)
8. [Hermes Agent Gateway (`/api/hermes/*`)](#8-hermes-agent-gateway-apihermes)
9. [Fidelidade & Recompensas (A-Points)](#9-fidelidade--recompensas-a-points)
10. [Integração Omie ERP](#10-integração-omie-erp)
11. [Checkout & Pagamentos (Asaas)](#11-checkout--pagamentos-asaas)
12. [Cupons de Desconto](#12-cupons-de-desconto)
13. [Autenticação, Clientes & Staff](#13-autenticação-clientes--staff)
14. [Mídia & Cloudflare R2](#14-mídia--cloudflare-r2)
15. [Monitoramento & Healthcheck](#15-monitoramento--healthcheck)
16. [Template de Skill AGY para o Hermes](#16-template-de-skill-agy-para-o-hermes)

---

## 1. Visão Geral & Arquitetura

A API da **Athena Soluções Automotivas** é construída em Node.js e Express, operando sobre banco relacional PostgreSQL (`pg`) com fallback resiliente para banco JSON local.

### Características Centrais
- **Design RESTful & JSON**: Todas as requisições com payload utilizam `Content-Type: application/json`.
- **Pre-Warming Anti-Hibernação**: Rota leve `GET /api/ping` para acordar containers no Render antes de requisições de autenticação.
- **Otimizações de Banco (Zero N+1)**: Reordenações em lote (`reorder`) executadas via PostgreSQL `UNNEST($1::varchar[], $2::int[])` em única query atômica.
- **Segurança OWASP**: Headers restritivos (`nosniff`, `DENY` frames, remoção de `x-powered-by`, mascaramento de `Server: Athena-Gateway`) e sanitização estrita de inputs.

---

## 2. Modelos de Autenticação

### 2.1. JWT Bearer Token (Usuários, Staff & Admin)
Utilizado nas rotas públicas autenticadas e administrativas.
- **Header**: `Authorization: Bearer <TOKEN_JWT>`
- **Como obter**: Chamar `POST /api/auth/login` com email e senha.
- **Níveis de Permissão (`role`)**:
  - `admin`: Acesso total a configurações, CRUD de produtos, exclusões e ajustes de pontos.
  - `vendedor`: Acesso à listagem de equipamentos, pedidos e criação de clientes.
  - `cliente`: Acesso ao próprio perfil, pedidos e extrato de pontos.

### 2.2. Hermes Secret Key (Agente Autônomo Hermes)
Utilizado exclusivamente no gateway `/api/hermes/*`.
- **Header Principal**: `x-hermes-key: <HERMES_SECRET_KEY>`
- **Alternativa via Query Param**: `?key=<HERMES_SECRET_KEY>`
- **Alternativa via Bearer**: `Authorization: Bearer <HERMES_SECRET_KEY>`
- **Ambiente**: Configurada no servidor através da variável `HERMES_SECRET_KEY`.

### 2.3. HTTP Basic Auth (Swagger UI)
- Utilizado ao acessar a interface visual interativa em `/api-docs` ou `/api/docs`.
- Usuário padrão: `admin` (configurado via `SWAGGER_USER`).
- Senha padrão: `AthenaAdmin2026!` (configurado via `SWAGGER_PASSWORD`).

---

## 3. Guia de Integração para Agentes (Hermes & AGY)

Ao criar scripts ou skills para o Hermes automatizar consultas ou atendimento:

1. **Consulta Rápida de Produto**: Use `GET /api/products/:identifier` passando o código ou slug do produto.
2. **Pesquisa Semântica/Texto**: Use `POST /api/hermes/products` enviando `{"search": "elevador pantográfico"}` para obter os itens formatados para LLMs.
3. **Consulta de Fidelidade do Cliente**: Use `GET /api/hermes/customers/:identifier` passando CPF, CNPJ, e-mail ou telefone.
4. **Lançamento de Pontos**: Use `POST /api/hermes/customers/:identifier/credit`.
5. **Especificação OpenAPI em Tempo de Execução**: Faça `GET /api/openapi.json` para carregar dinamicamente as definições de Tool Calling.

---

## 4. Equipamentos (Produtos)

### `GET /api/products`
Retorna equipamentos do catálogo com suporte a filtros e paginação híbrida.

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `page` | integer | - | Ativa paginação se fornecido (ex: `1`) |
| `limit` | integer | `24` | Quantidade de itens por página (máx: 100) |
| `status` | string | `published` | Filtrar por `published`, `draft` ou `rascunho` |
| `categoryId`| string | - | ID da categoria (ex: `elevadores`) |
| `brandId` | string | - | ID da marca fabricante (ex: `mahovi`) |
| `featured` | boolean | - | Filtrar apenas itens em destaque (`true`/`false`) |
| `search` | string | - | Busca textual em nome, descrição, slug e badge |

**Exemplo de Resposta Paginada (`GET /api/products?page=1&limit=2`):**
```json
{
  "data": [
    {
      "id": "dt-esc01",
      "name": "Kit Escareador para Assento de Injetores Diesel - Delta Ferramentas DT-ESC01",
      "slug": "kit-escareador-para-assento-de-injetores-diesel-delta-ferramentas-dt-esc01",
      "categoryId": "acessorios",
      "categoryName": "Acessórios diversos",
      "brandId": "delta",
      "brandName": "Delta Ferramentas",
      "price": 450.0,
      "priceNegotiable": false,
      "badge": "Pronta Entrega",
      "tags": ["diesel", "injetores"],
      "status": "published",
      "isFeatured": true,
      "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/dt-esc01.webp",
      "inStock": true,
      "aPoints": 45
    }
  ],
  "pagination": {
    "total": 593,
    "page": 1,
    "limit": 2,
    "totalPages": 297
  }
}
```

---

### `GET /api/products/:identifier`
Busca um único equipamento por **ID** ou **Slug**.

**Parâmetros de Rota:**
- `:identifier` (string, obrigatório): ID ou Slug do equipamento. Ex: `dt-esc01` ou `fabricado-com-alta-qualidade-dt-esc01-delta`.

**Exemplo de Chamada (curl):**
```bash
curl -X GET "https://athena-backend-hu1m.onrender.com/api/products/dt-esc01"
```

**Exemplo de Resposta (200 OK):**
```json
{
  "id": "dt-esc01",
  "name": "Kit Escareador para Assento de Injetores Diesel - Delta DT-ESC01",
  "slug": "kit-escareador-para-assento-de-injetores-diesel-delta-dt-esc01",
  "categoryId": "acessorios",
  "categoryName": "Acessórios diversos",
  "brandId": "delta",
  "brandName": "Delta Ferramentas",
  "price": 450.0,
  "priceNegotiable": false,
  "badge": "Destaque",
  "tags": ["diesel", "injetores", "delta"],
  "compatibleProductIds": ["scanner-launch-pad-vii"],
  "recommendedProductIds": [],
  "status": "published",
  "isFeatured": true,
  "image": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/dt-esc01.webp",
  "images": [],
  "altText": "Kit de escareador para bicos injetores diesel Delta",
  "description": "Ferramenta essencial para limpeza e retificação da sede dos injetores diesel.",
  "specs": [
    { "label": "Composição", "value": "17 peças em estojo reforçado" },
    { "label": "Aplicação", "value": "Motores Common Rail linha leve e pesada" }
  ],
  "attachments": [],
  "inStock": true,
  "customTabs": [],
  "aPoints": 45
}
```

---

### `POST /api/products`
Cadastra ou atualiza um produto (`ON CONFLICT (id) DO UPDATE`).
- **Autenticação**: `Bearer <token>` (Admin)

**Payload (JSON):**
```json
{
  "id": "dt-esc01",
  "name": "Kit Escareador para Assento de Injetores Diesel Delta",
  "slug": "kit-escareador-delta-dt-esc01",
  "categoryId": "acessorios",
  "brandId": "delta",
  "price": 450.0,
  "priceNegotiable": false,
  "badge": "Novo",
  "tags": ["injetores", "diesel"],
  "status": "published",
  "isFeatured": true,
  "inStock": true,
  "aPoints": 45
}
```

---

### `PUT /api/products/reorder`
Reordena equipamentos em lote com UNNEST atômico.
- **Autenticação**: `Bearer <token>` (Admin)

**Payload:**
```json
{
  "products": [
    { "id": "dt-esc01" },
    { "id": "elevador-4000kg" }
  ]
}
```

---

## 5. Categorias

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Pública | Lista todas as categorias em ordem comercial |
| `GET` | `/api/categories/:identifier`| Pública | Busca categoria unitária por ID ou Slug |
| `POST`| `/api/categories` | Admin | Cria ou atualiza uma categoria |
| `PUT` | `/api/categories/:id` | Admin | Atualiza categoria existente |
| `PUT` | `/api/categories/reorder` | Admin | Reordena categorias em lote |
| `DELETE`| `/api/categories/:id` | Admin | Exclui uma categoria |

**Exemplo de Categoria Unitária (`GET /api/categories/elevadores`):**
```json
{
  "id": "elevadores",
  "name": "Elevadores",
  "slug": "elevadores",
  "description": "Elevadores automotivos pantográficos, 2 e 4 colunas",
  "icon": "Layers",
  "order": 1
}
```

---

## 6. Marcas Parceiras

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/brands` | Pública | Lista todas as marcas parceiras em ordem comercial |
| `GET` | `/api/brands/:identifier` | Pública | Busca marca unitária por ID ou Slug |
| `POST`| `/api/brands` | Admin | Cadastra nova marca parceira |
| `PUT` | `/api/brands/:id` | Admin | Atualiza dados da marca |
| `PUT` | `/api/brands/reorder` | Admin | Reordena marcas parceiras em lote |
| `DELETE`| `/api/brands/:id` | Admin | Exclui marca parceira |

**Exemplo de Marca Unitária (`GET /api/brands/delta`):**
```json
{
  "id": "delta",
  "name": "Delta Ferramentas",
  "slug": "delta-ferramentas",
  "description": "Ferramentas especiais e equipamentos para injeção diesel",
  "logo": "https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/delta.webp",
  "websiteUrl": "https://www.deltaferramentas.com.br",
  "order": 2
}
```

---

## 7. Banners Promocionais

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/banners` | Pública | Lista banners ativos da vitrine |
| `POST`| `/api/banners` | Admin | Cria um novo banner promocional |
| `PUT` | `/api/banners/:id` | Admin | Atualiza banner existente |
| `PUT` | `/api/banners/reorder` | Admin | Reordena sequência de exibição dos banners |
| `DELETE`| `/api/banners/:id` | Admin | Remove banner da vitrine |

---

## 8. Hermes Agent Gateway (`/api/hermes/*`)

O Gateway Hermes é a ponte oficial para agentes autônomos de inteligência artificial.

### Headers de Autenticação Obrigatórios:
```http
x-hermes-key: <HERMES_SECRET_KEY>
Content-Type: application/json
```

---

### `GET /api/hermes/status`
Retorna a saúde da conexão do agente e contadores operacionais.

**Resposta (200 OK):**
```json
{
  "status": "online",
  "service": "Athena Hermes Intelligence Bridge",
  "version": "2.0.0",
  "timestamp": "2026-09-16T12:00:00.000Z",
  "stats": {
    "totalClients": 1420,
    "totalRewards": 8,
    "totalProducts": 593
  }
}
```

---

### `POST /api/hermes/products` (Compatível com Gemini / Hermes Tool Calling)
Busca híbrida de produtos. Consulta primeiro o PostgreSQL e, se não encontrar (ou se `forceOmie=true`), consulta o ERP Omie.

**Payload:**
```json
{
  "search": "escareador delta",
  "limit": 5,
  "forceOmie": false
}
```

**Resposta (200 OK):**
```json
{
  "total": 1,
  "source": "postgresql",
  "products": [
    {
      "id": "dt-esc01",
      "name": "Kit Escareador para Assento de Injetores Diesel - Delta DT-ESC01",
      "price": 450.0,
      "category": "Acessórios diversos",
      "brand": "Delta Ferramentas",
      "inStock": true,
      "url": "https://www.athenaconsultoria.com.br/#/produto/kit-escareador-para-assento-de-injetores-diesel-delta-dt-esc01"
    }
  ]
}
```

---

### `GET /api/hermes/customers/:identifier`
Localiza ficha de cliente por **ID**, **CPF**, **CNPJ**, **E-mail** ou **Telefone**.

**Exemplo:**
```bash
curl -H "x-hermes-key: YOUR_KEY" \
  "https://athena-backend-hu1m.onrender.com/api/hermes/customers/05123456000189"
```

**Resposta:**
```json
{
  "id": "usr_9123",
  "name": "Centro Automotivo Pinheiro",
  "document": "05.123.456/0001-89",
  "email": "contato@pinheiroauto.com.br",
  "phone": "61999998888",
  "aPoints": 450,
  "ordersCount": 4,
  "totalSpent": 32000.0,
  "recentTransactions": [
    { "type": "credit", "points": 100, "reason": "Compra Scanner Pad VII", "date": "2026-09-10" }
  ]
}
```

---

### `POST /api/hermes/customers/:identifier/credit`
Credita pontos no saldo do cliente.

**Payload:**
```json
{
  "points": 50,
  "reason": "Bonificação por indicação de cliente",
  "orderId": "ped_9812"
}
```

---

### `POST /api/hermes/customers/:identifier/debit`
Debita pontos do saldo do cliente (com validação de saldo insuficiente).

**Payload:**
```json
{
  "points": 100,
  "reason": "Resgate de Voucher R$ 100 em Ferramentas"
}
```

---

### `GET /api/hermes/loyalty/insights`
Gera listas automáticas de inteligência comercial para o Hermes realizar prospecção ativa:
- `inactiveWithPoints`: Clientes com saldo acumulado que não compram há mais de 60 dias.
- `nearReward`: Clientes que faltam menos de 40 pontos para resgatar uma recompensa (gatilho de fechamento).
- `topLoyaltyClients`: Clientes VIP para atendimento prioritário.

---

### `GET /api/hermes/tool-declaration`
Retorna a declaração pronta de ferramentas (Tool Declaration) formatada para o SDK do Google Gemini e Hermes Agent.

---

## 9. Fidelidade & Recompensas (A-Points)

- Cada produto pode bonificar pontos (`aPoints`) após a compra.
- Os pontos são resgatáveis por descontos comerciais ou brindes.

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/points/me` | Bearer | Extrato de pontos do cliente autenticado |
| `GET` | `/api/rewards` | Pública | Lista de prêmios e vouchers disponíveis |
| `POST`| `/api/rewards/redeem` | Bearer | Solicita o resgate de um prêmio com débito de pontos |
| `GET` | `/api/admin/points/transactions` | Admin | Auditoria global de pontos |
| `POST`| `/api/admin/points/adjust` | Admin | Ajuste manual de saldo (crédito/débito) |

---

## 10. Integração Omie ERP

A plataforma conecta com a API v1 do Omie ERP para manter estoque e códigos fiscais sincronizados.

- `GET /api/omie/status`: Valida conectividade com a API Omie.
- `GET /api/admin/omie/sync-status`: Informa quantos produtos estão vinculados, pendentes ou divergentes.
- `POST /api/admin/omie/reconcile`: Dispara rotina assíncrona de reconciliação.
- `POST /api/admin/omie/link-product`: Associa manualmente `siteProductId` a `omieProductCode`.
- `POST /api/webhooks/omie`: Endpoint receptor de webhooks disparados pelo Omie quando produtos ou pedidos são alterados.

---

## 11. Checkout & Pagamentos (Asaas)

A Athena integra com o gateway **Asaas** para liquidação automática via PIX, Cartão e Boleto.

### Criar Cobrança (`POST /api/payments/charge`)
**Payload:**
```json
{
  "orderId": "ped_2026_091",
  "billingType": "PIX",
  "value": 1450.00
}
```

**Resposta:**
```json
{
  "id": "pay_asaas_891238",
  "status": "PENDING",
  "value": 1450.00,
  "pixQrCode": "00020126580014br.gov.bcb.pix0136...",
  "pixCopyAndPaste": "00020126580014br.gov.bcb.pix...",
  "dueDate": "2026-09-17"
}
```

---

## 12. Cupons de Desconto

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/coupons/validate` | Pública | Valida código e calcula desconto sobre `orderTotal` |
| `GET` | `/api/coupons` | Pública | Lista cupons ativos para o carrinho |
| `POST` | `/api/coupons` | Admin | Cadastra novo cupom |
| `PUT` | `/api/coupons/:id` | Admin | Atualiza regras do cupom |
| `DELETE`| `/api/coupons/:id` | Admin | Inativa ou remove cupom |

---

## 13. Autenticação, Clientes & Staff

- `POST /api/auth/login`: Autentica usuário com e-mail e senha. Retorna `{ token, user }`.
- `POST /api/auth/register`: Cadastro público de novos compradores.
- `GET /api/auth/me`: Retorna dados do perfil do usuário autenticado.
- `POST /api/auth/forgot-password`: Envia código/link de redefinição de senha por e-mail.
- `POST /api/auth/reset-password`: Redefine senha utilizando token seguro.
- `GET /api/users`: Lista equipe e clientes com paginação híbrida (`?page=1&limit=20&role=vendedor`).
- `POST /api/admin/users/:id/generate-temp-password`: Gera senha temporária de 8 dígitos de emergência para acesso imediato.

---

## 14. Mídia & Cloudflare R2

O armazenamento de mídia da Athena utiliza **Cloudflare R2** com conversão instantânea de imagens para **WebP** através do `sharp`.

### `POST /api/upload`
- **Formato**: `multipart/form-data`
- **Campos**: `file` (arquivo binário JPG/PNG/WEBP), `folder` (ex: `produtos` ou `marcas`).
- **Retorno**: URL pública permanente do CDN Cloudflare R2 (`https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/...`).

### `POST /api/upload/delete`
- **Payload**: `{"publicId": "produtos/dt-esc01.webp"}`
- Exclui fisicamente o objeto do bucket R2 para evitar custos de armazenamento órfão.

---

## 15. Monitoramento & Healthcheck

- `GET /api/ping`: Retorna `{ "status": "pong", "timestamp": 1789560000000 }`. Latência média de 5ms.
- `GET /api/health`: Retorna integridade da conexão PostgreSQL pooler.
- `GET /api/openapi.json`: Retorna a especificação formal completa OpenAPI 3.1.0 em formato JSON.

---

## 16. Template de Skill AGY para o Hermes

Quando você solicitar ao **AGY** para criar uma skill de automação para o **Hermes**, forneça a estrutura abaixo:

```yaml
---
name: athena-hermes-assistant
description: Skill de automação e consulta rápida de catálogo, clientes e fidelidade da Athena Soluções Automotivas para o agente Hermes.
---

# Athena Hermes Assistant Skill

## Regras de Execução
1. O Hermes deve utilizar a chave `HERMES_SECRET_KEY` enviada no cabeçalho `x-hermes-key`.
2. Para consultas de produtos, utilize sempre `POST /api/hermes/products` com o parâmetro `search`.
3. Para consultar saldo ou fidelidade de um cliente, chame `GET /api/hermes/customers/{documento_ou_telefone}`.
4. Para emitir ou consultar orçamentos em PDF comercial, leia os campos `specs` e `price` retornados em `GET /api/products/{id}`.

## Exemplo de Script Python para o Hermes
```python
import os
import requests

API_URL = os.getenv("ATHENA_API_URL", "https://athena-backend-hu1m.onrender.com/api")
HERMES_KEY = os.getenv("HERMES_SECRET_KEY", "")

headers = {
    "x-hermes-key": HERMES_KEY,
    "Content-Type": "application/json"
}

def consultar_produto(termo: str):
    res = requests.post(f"{API_URL}/hermes/products", json={"search": termo, "limit": 3}, headers=headers)
    return res.json()

def consultar_cliente(identificador: str):
    res = requests.get(f"{API_URL}/hermes/customers/{identificador}", headers=headers)
    return res.json()

def creditar_pontos(cliente_id: str, pontos: int, motivo: str):
    payload = {"points": pontos, "reason": motivo}
    res = requests.post(f"{API_URL}/hermes/customers/{cliente_id}/credit", json=payload, headers=headers)
    return res.json()
```
