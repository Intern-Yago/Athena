import { describe, it } from 'node:test';
import assert from 'node:assert';

// Lógica de filtragem pura de banners de acordo com agendamento
function filterVisibleBanners(banners, referenceTime = new Date()) {
  const nowMs = referenceTime instanceof Date ? referenceTime.getTime() : new Date(referenceTime).getTime();

  return (banners || []).filter((b) => {
    if (!b || b.isActive === false) return false;
    if (!b.desktopImage && !b.desktop_image) return false;

    // Checagem de início de publicação (publishAt)
    const pub = b.publishAt || b.publish_at;
    if (pub) {
      const pubMs = new Date(pub).getTime();
      if (!isNaN(pubMs) && nowMs < pubMs) return false;
    }

    // Checagem de encerramento / término de publicação (unpublishAt)
    const unpub = b.unpublishAt || b.unpublish_at;
    if (unpub) {
      const unpubMs = new Date(unpub).getTime();
      if (!isNaN(unpubMs) && nowMs > unpubMs) return false;
    }

    return true;
  });
}

function getBannerStatus(banner, referenceTime = new Date()) {
  if (!banner || banner.isActive === false) {
    return 'paused';
  }

  const nowMs = referenceTime instanceof Date ? referenceTime.getTime() : new Date(referenceTime).getTime();
  const pub = banner.publishAt || banner.publish_at;
  const unpub = banner.unpublishAt || banner.unpublish_at;

  const pubTime = pub ? new Date(pub).getTime() : null;
  const unpubTime = unpub ? new Date(unpub).getTime() : null;

  if (pubTime && !isNaN(pubTime) && nowMs < pubTime) {
    return 'scheduled';
  }

  if (unpubTime && !isNaN(unpubTime) && nowMs > unpubTime) {
    return 'expired';
  }

  return 'active';
}

describe('Agendamento de Banners da Home (Scheduled Banners)', () => {
  const mockBanners = [
    {
      id: 'bnr_standard_immediate',
      title: 'Banner Padrão Imediato',
      desktopImage: 'https://images.unsplash.com/photo-1?w=1920',
      isActive: true,
      publishAt: null,
      unpublishAt: null
    },
    {
      id: 'bnr_black_friday_scheduled',
      title: 'Black Friday Athena',
      desktopImage: 'https://images.unsplash.com/photo-2?w=1920',
      isActive: true,
      publishAt: '2026-11-01T00:00:00.000Z',
      unpublishAt: '2026-11-30T23:59:59.000Z'
    },
    {
      id: 'bnr_past_promo',
      title: 'Promoção Antiga',
      desktopImage: 'https://images.unsplash.com/photo-3?w=1920',
      isActive: true,
      publishAt: '2026-09-01T00:00:00.000Z',
      unpublishAt: '2026-09-30T23:59:59.000Z'
    },
    {
      id: 'bnr_paused',
      title: 'Banner Pausado Manualmente',
      desktopImage: 'https://images.unsplash.com/photo-4?w=1920',
      isActive: false,
      publishAt: null,
      unpublishAt: null
    }
  ];

  it('1. Antes da data agendada (ex: Outubro/2026), banner de Black Friday NÃO deve aparecer no site', () => {
    const octoberDate = new Date('2026-10-28T14:00:00.000Z');
    const visible = filterVisibleBanners(mockBanners, octoberDate);

    const ids = visible.map(b => b.id);
    assert.ok(ids.includes('bnr_standard_immediate'), 'Banner imediato deve aparecer');
    assert.ok(!ids.includes('bnr_black_friday_scheduled'), 'Banner agendado NÃO deve aparecer em outubro');
    assert.ok(!ids.includes('bnr_past_promo'), 'Banner encerrado em setembro NÃO deve aparecer');
    assert.ok(!ids.includes('bnr_paused'), 'Banner pausado NÃO deve aparecer');

    assert.strictEqual(getBannerStatus(mockBanners[1], octoberDate), 'scheduled');
  });

  it('2. No dia agendado (ex: 01 de Novembro/2026), o banner de Black Friday DEVE ser publicado automaticamente', () => {
    const novemberDate = new Date('2026-11-01T08:00:00.000Z');
    const visible = filterVisibleBanners(mockBanners, novemberDate);

    const ids = visible.map(b => b.id);
    assert.ok(ids.includes('bnr_standard_immediate'), 'Banner imediato permanece ativo');
    assert.ok(ids.includes('bnr_black_friday_scheduled'), 'Banner agendado DEVE aparecer em novembro');

    assert.strictEqual(getBannerStatus(mockBanners[1], novemberDate), 'active');
  });

  it('3. Após a data de término (ex: Dezembro/2026), o banner agendado DEVE expirar e sair do ar', () => {
    const decemberDate = new Date('2026-12-01T10:00:00.000Z');
    const visible = filterVisibleBanners(mockBanners, decemberDate);

    const ids = visible.map(b => b.id);
    assert.ok(!ids.includes('bnr_black_friday_scheduled'), 'Banner agendado encerrou e NÃO deve aparecer');
    assert.strictEqual(getBannerStatus(mockBanners[1], decemberDate), 'expired');
  });

  it('4. Banners sem data de término permanecem ativos indefinidamente', () => {
    const futureDate = new Date('2029-01-01T00:00:00.000Z');
    const visible = filterVisibleBanners(mockBanners, futureDate);

    const ids = visible.map(b => b.id);
    assert.ok(ids.includes('bnr_standard_immediate'), 'Banner contínuo segue ativo no futuro distante');
  });

  it('5. Status correto para banner pausado manualmente mesmo se dentro da data', () => {
    const banner = {
      id: 'bnr_custom',
      isActive: false,
      publishAt: '2026-10-01T00:00:00.000Z'
    };
    assert.strictEqual(getBannerStatus(banner, new Date('2026-10-28T14:00:00.000Z')), 'paused');
  });
});
