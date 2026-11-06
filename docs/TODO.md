# Planejamento: Campanha WhatsApp Rifa Athena Consultoria (Hermes Agent)

## 📌 Visão Geral
Automatização humanizada via **Hermes Agent** para prospecção e engajamento de contatos do WhatsApp que possuem a marcação de **"cliente"** no nome/título, apresentando a rifa oficial do Elevador Automotivo Mahovi MAH-1001 4.0T.

---

## 🎯 Dados Oficiais da Rifa
* **Site Oficial:** [rifa.athenaconsultoria.com.br](https://rifa.athenaconsultoria.com.br)
* **Prêmio Principal:** Elevador Eletro-hidráulico Mahovi MAH-1001 4.0 Toneladas Pro (zero na caixa com Nota Fiscal emitida no nome/CNPJ da oficina).
* **Prêmio Flexível:** O ganhador pode optar pelo valor equivalente do equipamento via PIX na conta.
* **Valor da Cota:** R$ 100,00 por número/cota.
* **Total de Cotas:** Apenas 600 cotas disponíveis.
* **Causa/Propósito:** Construção do primeiro Centro de Treinamento Automotivo da Athena em Brasília (qualificação técnica com workshops e cursos gratuitos de mecânica, elétrica, injeção e gestão).
* **Previsão do Sorteio:** 15 de Outubro (meta mínima de 60% das cotas / 360 cotas).
* **Forma de Compra:** Direto pelo site via PIX ou Cartão de Crédito com aprovação imediata.

---

## 🚦 Fases do Projeto

### Fase 1: Extração e Tratamento de Contatos
- [ ] Criar script de extração de contatos do WhatsApp (`scripts/extract_whatsapp_contacts.js` e `scripts/filtrar_clientes.py`).
- [ ] Varrer contatos e filtrar apenas aqueles com `"cliente"` (case-insensitive) no nome.
- [ ] Higienização dos nomes: remover sufixos/prefixos como "- Cliente", "Cliente Fulano", "Oficina X" para manter apenas o primeiro nome humanizado (ex: *"Oi, Marcos!"* em vez de *"Oi, Marcos Cliente"*).
- [ ] Gerar arquivo de saída `data/clientes_campanha.json` com nome original, nome tratado, telefone e status.
- [ ] Apresentar listagem filtrada para aprovação prévia do usuário antes de qualquer envio.

### Fase 2: Configuração do Hermes Gateway
- [ ] Ajustar o modo de operação do WhatsApp Bridge de `self-chat` para `bot` (`WHATSAPP_MODE=bot`).
- [ ] Remover o prefixo automático de sistema (`WHATSAPP_REPLY_PREFIX=""` em vez de `⚕ Hermes Agent`).
- [ ] Habilitar permissão de mensagens externas (`WHATSAPP_ALLOWED_USERS=*`).
- [ ] Definir a persona / system prompt da campanha no Hermes (SOUL / prompt de atendimento) com todas as informações e argumentos da rifa.

### Fase 3: Disparo Cadenciado da Saudação (Anti-Ban)
- [ ] Configurar mensagem inicial humanizada:
  - Antes das 12h: *"Oi, [Nome], bom dia! Tudo bem?"*
  - Após as 12h: *"Oi, [Nome], boa tarde! Tudo bem?"*
- [ ] Implementar delay aleatório entre mensagens (40 a 90 segundos entre cada envio) para evitar detecção de spam.
- [ ] Controle de lote diário seguro (ex: 20 a 40 disparos por dia).
- [ ] Teste piloto: Realizar o primeiro disparo para o número do próprio usuário para validação ponta a ponta.

### Fase 4: Atendimento Reativo pelo Hermes (IA)
- [ ] Escutar respostas dos clientes que receberam a saudação.
- [ ] Enviar a mensagem de apresentação da rifa de forma fluida:
  > *"Tô passando aqui rapidinho para te falar da nossa rifa da Athena! A gente lançou uma rifa com apenas 600 cotas concorrendo a um Elevador Mahovi MAH-1001 de 4 Toneladas zero bala (ou se preferir, o valor dele no PIX). Custa R$ 100 a cota e a arrecadação é para construir o Centro de Treinamento Automotivo aqui de Brasília. Dá uma olhada no site para escolher seu número: rifa.athenaconsultoria.com.br"*
- [ ] Hermes tira dúvidas em tempo real:
  - Formas de pagamento (PIX ou cartão pelo site).
  - Prazo e data do sorteio.
  - Entrega e frete (entregue na oficina do ganhador).
  - Transparência e propósito da campanha da Athena.
- [ ] Encaminhamento direto para finalização da compra no site.

### Fase 5: Monitoramento e Relatório
- [ ] Registro de histórico de interações (`pendente`, `saudacao_enviada`, `respondeu`, `converteu`).
- [ ] Relatório diário de conversas ativas e feedbacks recebidos.

---

## 🛡️ Medidas de Segurança Anti-Bloqueio (WhatsApp)
1. **Nunca disparar em massa instantâneo:** Disparos de 100 mensagens no mesmo minuto geram banimento do chip.
2. **Intervalo dinâmico:** Entre cada mensagem inicial, aguardar de 40 a 90 segundos.
3. **Variação de texto (Spintax):** Alternar pequenas variações na saudação (*"Oi"*, *"Olá"*, *"Tudo bem?"*, *"Como você tá?"*).
4. **Horário comercial:** Disparos apenas em horários adequados (09:00 às 18:00).

---

## 🔒 Segurança de Infraestrutura: Cloudflare Zero Trust (Ambiente Interno / CRM)

### 1. Bloqueio de Acesso por E-mail (Access Policy)
- [ ] Criar Application Self-Hosted no Cloudflare Zero Trust para `interno.athenaconsultoria.com.br`.
- [ ] Configurar tempo de sessão (Session Duration) para 7 dias ou 30 dias (evita solicitar código repetidamente).
- [ ] Adicionar política de acesso tipo `Allow` com lista de e-mails autorizados (suporta `@gmail.com` e e-mails pessoais/corporativos da equipe).
- [ ] Validar fluxo de envio de PIN de 6 dígitos para o e-mail no primeiro login.

### 2. Configurações Adicionais de Blindagem Zero Trust
- [ ] **Geoblocking (Country Restriction):** Bloquear acessos fora do Brasil no subdomínio `interno.athenaconsultoria.com.br` (reduz 98% dos scanners de botnets russas/chinesas).
- [ ] **WAF Rate Limiting na Borda:** Limitar tentativas de requisições por IP na rota do CRM para mitigar DDoS ou varreduras automatizadas.
- [ ] **Cloudflare Bot Management:** Ativar o modo de desafio (Managed Challenge) para requisições com User-Agents suspeitos ou de ferramentas OSINT (shodan, censys, curl não autorizado).
- [ ] **Isolamento de Origem:** Manter token secreto `ATHENA_ORIGIN_SECRET` entre Cloudflare e Render para impedir qualquer bypass direto ao servidor de backend.

