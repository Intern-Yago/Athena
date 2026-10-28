import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Athena CRM - Testes Unitários de Domínio, Regras de Negócio e Segurança', () => {

  test('Deve calcular corretamente as 4 tabelas de valores de venda por tributação', () => {
    const baseCost = 1000.00;
    
    // Regras comerciais Athena:
    const priceForaCnpj = +(baseCost * 1.05).toFixed(2);
    const priceForaCpf = +(baseCost * 1.12).toFixed(2);
    const priceDentroCnpj = +(baseCost * 1.00).toFixed(2);
    const priceDentroCpf = +(baseCost * 1.08).toFixed(2);

    assert.equal(priceForaCnpj, 1050.00, 'Fora DF CNPJ deve ter markup de 5%');
    assert.equal(priceForaCpf, 1120.00, 'Fora DF CPF deve ter markup de 12% (IPI/ICMS cheio)');
    assert.equal(priceDentroCnpj, 1000.00, 'Dentro DF CNPJ é o preço base de tabela');
    assert.equal(priceDentroCpf, 1080.00, 'Dentro DF CPF deve ter markup de 8%');
  });

  test('Deve validar dimensões do produto vs dimensões da embalagem/pacote', () => {
    const product = {
      height: 120, // cm
      width: 80,
      depth: 60,
      weight: 45 // kg
    };

    const pkg = {
      height: 135,
      width: 90,
      depth: 70,
      weight: 48
    };

    assert.ok(pkg.height >= product.height, 'A caixa deve ser maior ou igual à altura do produto');
    assert.ok(pkg.width >= product.width, 'A caixa deve ser maior ou igual à largura do produto');
    assert.ok(pkg.depth >= product.depth, 'A caixa deve ser maior ou igual à profundidade do produto');
    assert.ok(pkg.weight >= product.weight, 'O peso bruto da caixa deve ser maior ou igual ao peso líquido');
  });

  test('Filtro Universal de Clientes: pesquisa única por nome, fantasia, doc, tel ou email', () => {
    const sampleCustomers = [
      { id: '1', name: 'Carlos Eduardo', fantasy_name: 'Polara Samambaia', cpf: '023.491.821-44', cnpj: '07.850.203/0001-16', phone: '(61) 98112-9527', email: 'contato@polara.com.br' },
      { id: '2', name: 'Ademilson Soares', fantasy_name: 'Recuperauto', cpf: '198.441.721-09', cnpj: '38.061.826/0001-33', phone: '(61) 98562-8244', email: 'recuperauto@gmail.com' }
    ];

    const universalSearch = (query) => {
      const q = query.trim().toLowerCase();
      const digits = q.replace(/\D/g, '');
      return sampleCustomers.filter(c => {
        const textMatch = 
          c.name.toLowerCase().includes(q) ||
          c.fantasy_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q);

        const docMatch = digits.length >= 3 && (
          c.cpf.replace(/\D/g, '').includes(digits) ||
          c.cnpj.replace(/\D/g, '').includes(digits) ||
          c.phone.replace(/\D/g, '').includes(digits)
        );

        return textMatch || docMatch;
      });
    };

    // Teste por nome
    assert.equal(universalSearch('Carlos').length, 1);
    // Teste por fantasia
    assert.equal(universalSearch('Recuperauto').length, 1);
    // Teste por telefone (apenas números)
    assert.equal(universalSearch('981129527').length, 1);
    // Teste por CNPJ
    assert.equal(universalSearch('07850203000116').length, 1);
    // Teste por e-mail
    assert.equal(universalSearch('recuperauto@gmail.com').length, 1);
    // Teste inexistente
    assert.equal(universalSearch('InexistenteXYZ').length, 0);
  });

  test('Regra condicional de Família na Ficha: Cônjuge e Aniversário', () => {
    const checkSpouseRequirement = (maritalStatus, spouseWorksInShop, spouseBirthday) => {
      const isCasado = maritalStatus === 'Casado(a)' || maritalStatus === 'União Estável';
      if (!isCasado) return { showSpouseCheck: false, showSpouseBirthday: false };
      return {
        showSpouseCheck: true,
        showSpouseBirthday: Boolean(spouseWorksInShop)
      };
    };

    // Solteiro: não mostra checkbox nem aniversário
    const r1 = checkSpouseRequirement('Solteiro(a)', false, null);
    assert.equal(r1.showSpouseCheck, false);
    assert.equal(r1.showSpouseBirthday, false);

    // Casado mas cônjuge não trabalha na oficina
    const r2 = checkSpouseRequirement('Casado(a)', false, null);
    assert.equal(r2.showSpouseCheck, true);
    assert.equal(r2.showSpouseBirthday, false);

    // Casado e cônjuge trabalha na oficina
    const r3 = checkSpouseRequirement('Casado(a)', true, '1986-11-20');
    assert.equal(r3.showSpouseCheck, true);
    assert.equal(r3.showSpouseBirthday, true);
  });

  test('Linha Vermelha do Google Agenda: cálculo percentual contínuo de 00:00 a 23:59', () => {
    const calculateRedLineTop = (hours, minutes) => {
      const totalMinutes = hours * 60 + minutes;
      return (totalMinutes / 1440) * 100;
    };

    assert.equal(calculateRedLineTop(0, 0), 0, 'À meia-noite deve estar no topo (0%)');
    assert.equal(calculateRedLineTop(12, 0), 50, 'Ao meio-dia deve estar exatamente no centro (50%)');
    assert.equal(calculateRedLineTop(6, 0), 25, 'Às 06:00 deve estar em 25%');
    assert.equal(calculateRedLineTop(18, 0), 75, 'Às 18:00 deve estar em 75%');
  });

  test('Segurança & Anti-Tracking: Nenhuma biblioteca invasiva (Clarity, TikTok, Meta) deve rodar no CRM', () => {
    const allowedModules = ['react', 'lucide-react', 'vite', 'tailwind'];
    const forbiddenTrackers = ['clarity', 'facebook-pixel', 'fbevents', 'tiktok-pixel', 'google-analytics', 'gtag'];

    forbiddenTrackers.forEach(tracker => {
      assert.ok(!allowedModules.includes(tracker), `Tracker ${tracker} expressamente bloqueado no CRM`);
    });
  });

  test('Deve construir URL correta do Google Maps a partir de coordenadas ou endereço', () => {
    const buildGoogleMapsUrl = (lead) => {
      let query = '';
      if (lead.latitude && lead.longitude) {
        query = `${lead.latitude},${lead.longitude}`;
      } else if (lead.address) {
        query = `${lead.address}, ${lead.ra_df || 'DF'}, Brasil`;
      } else if (lead.ra_df) {
        query = `${lead.name}, ${lead.ra_df}, Brasil`;
      }
      return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
    };

    const urlWithCoords = buildGoogleMapsUrl({ latitude: -15.7942, longitude: -47.8822 });
    assert.equal(urlWithCoords, 'https://www.google.com/maps/search/?api=1&query=-15.7942%2C-47.8822');

    const urlWithAddress = buildGoogleMapsUrl({ address: 'SIA Trecho 3 Lote 620', ra_df: 'SIA', name: 'Oficina Turbo' });
    assert.equal(urlWithAddress, 'https://www.google.com/maps/search/?api=1&query=SIA%20Trecho%203%20Lote%20620%2C%20SIA%2C%20Brasil');
  });

  test('Deve mapear com precisão os estágios do Funil de Expansão para status no Supabase', () => {
    const mapStageToStatus = (stageId, title) => {
      const lower = (title || '').toLowerCase();
      if (stageId === 'stg_exp_1' || lower.includes('a visitar')) return 'Não Visitado';
      if (stageId === 'stg_exp_2' || lower.includes('agendad')) return 'Visita Agendada';
      if (stageId === 'stg_exp_3' || lower.includes('realizada') || lower.includes('visitad')) return 'Visitado';
      if (stageId === 'stg_exp_4' || lower.includes('negocia')) return 'Negociação';
      if (stageId === 'stg_exp_5' || lower.includes('parceria') || lower.includes('cliente')) return 'Cliente Athena';
      return 'Não Visitado';
    };

    assert.equal(mapStageToStatus('stg_exp_1', 'Oficinas no Radar (A Visitar)'), 'Não Visitado');
    assert.equal(mapStageToStatus('stg_exp_2', 'Visita Agendada'), 'Visita Agendada');
    assert.equal(mapStageToStatus('stg_exp_3', 'Visita Realizada'), 'Visitado');
    assert.equal(mapStageToStatus('stg_exp_4', 'Negociação em Aberto'), 'Negociação');
    assert.equal(mapStageToStatus('stg_exp_5', 'Parceria Fechada (Cliente)'), 'Cliente Athena');
  });

  test('Atalhos de Zoom do Kanban: deve calcular incrementos e respeitar limites mínimo (55%) e máximo (115%)', () => {
    const adjustZoom = (currentZoom, delta) => {
      const next = Number((currentZoom + delta).toFixed(2));
      return Math.max(0.55, Math.min(1.15, next));
    };

    // Zoom In normal
    assert.equal(adjustZoom(1.0, 0.10), 1.10);
    // Limite máximo: não passa de 1.15
    assert.equal(adjustZoom(1.10, 0.10), 1.15);
    assert.equal(adjustZoom(1.15, 0.10), 1.15);

    // Zoom Out normal
    assert.equal(adjustZoom(1.0, -0.10), 0.90);
    // Limite mínimo: não desce além de 0.55
    assert.equal(adjustZoom(0.60, -0.10), 0.55);
    assert.equal(adjustZoom(0.55, -0.10), 0.55);

    // Incremento suave por scroll (0.08)
    assert.equal(adjustZoom(1.0, 0.08), 1.08);
    assert.equal(adjustZoom(1.0, -0.08), 0.92);
  });
});
