const COMMERCIAL_MESSAGE =
  'Olá! Conheci a Athena pelo cartão digital e gostaria de informações sobre seus produtos e soluções.';

const TECHNICAL_SUPPORT_MESSAGE =
  'Olá, Henrique! Acessei o cartão digital da Athena e preciso de suporte técnico.';

export const DIGITAL_CARD_CONFIG = {
  pageTitle: 'Athena | Cartão Digital',
  pageDescription:
    'Cartão de visita digital oficial da ATHENA Consultoria Automotiva. Equipamentos, ferramentas e soluções para o seu negócio.',
  companyName: 'ATHENA',
  companySubtitle: 'CONSULTORIA AUTOMOTIVA',
  tagline: 'Equipamentos, ferramentas e soluções para o seu negócio.',
  footerText: 'ATHENA • SEMPRE AO SEU LADO',
  logoUrl: '/logo_semfundo.png',
  websiteUrl: 'https://www.athenaconsultoria.com.br/',
  instagramUrl: 'https://www.instagram.com/athena.solucoes.automotivas/',
  mapsUrl:
    'https://www.google.com/maps/place/Sh+Arniqueiras%2FCol%C3%B4nia+Agr%C3%ADcola+Vereda+da+Cruz+Chac+517+-+Col.+Agr%C3%ADcola+Vereda+da+Cruz+-+St.+Hab.+Arniqueira,+Bras%C3%ADlia+-+DF/@-15.8485476,-48.0273207,18z/data=!3m1!4b1!4m6!3m5!1s0x935a3276830b9d97:0x8d02e1421cc9ab49!8m2!3d-15.8485502!4d-48.0260306!16s%2Fg%2F11c5jw91kp?entry=ttu',
  locationLabel: 'Brasília - DF • Envio Nacional',
  addressStreet: 'ST SHA Conjunto 6 Chácara 517, Loja 05 - Arniqueira',
  addressCity: 'Brasília',
  addressRegion: 'DF',
  addressPostalCode: '71996-413',
  email: 'contato@athenaconsultoria.com.br',
  commercialWhatsAppNumber: '5561983485671',
  technicalSupportWhatsAppNumber: '556191831000',
  commercialInitialMessage: COMMERCIAL_MESSAGE,
  technicalSupportInitialMessage: TECHNICAL_SUPPORT_MESSAGE,
  commercialWhatsAppUrl: `https://wa.me/5561983485671?text=${encodeURIComponent(COMMERCIAL_MESSAGE)}`,
  technicalSupportWhatsAppUrl: `https://wa.me/556191831000?text=${encodeURIComponent(TECHNICAL_SUPPORT_MESSAGE)}`,
  profiles: {
    default: {
      key: 'default',
      buttonLabel: 'Salvar Contatos na Agenda',
      fileName: 'contatos-athena-consultoria.vcf',
      isMultiContact: true,
    },
    lidiane: {
      key: 'lidiane',
      name: 'Lidiane',
      roleLabel: 'Consultora Comercial',
      buttonLabel: 'Salvar Contato — Lidiane',
      fileName: 'lidiane-athena-consultoria.vcf',
      fullName: 'Lidiane - Athena Consultoria Automotiva',
      firstName: 'Lidiane',
      lastName: 'Athena Consultoria',
      title: 'Comercial | Athena Consultoria Automotiva',
      phones: [
        { type: 'CELL,WORK,VOICE', label: 'Comercial', number: '+5561983485671' },
      ],
    },
    henrique: {
      key: 'henrique',
      name: 'Henrique',
      roleLabel: 'Suporte Técnico',
      buttonLabel: 'Salvar Contato — Henrique',
      fileName: 'henrique-athena-suporte.vcf',
      fullName: 'Henrique - Athena Suporte Técnico',
      firstName: 'Henrique',
      lastName: 'Athena Suporte Técnico',
      title: 'Suporte Técnico | Athena Consultoria Automotiva',
      phones: [
        { type: 'CELL,WORK,VOICE', label: 'Suporte Técnico', number: '+556191831000' },
      ],
    },
  },
};

/**
 * Resolves which contact profile is active based on the URL pathname (`/lidiane`, `/henrique`, or default).
 */
export function getDigitalCardProfile(pathname) {
  const rawPath = (
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  )
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '');

  const segments = rawPath.split('/');
  const targetSegment = segments[0] === 'cartao' ? segments[1] : segments[0];

  if (targetSegment === 'lidiane') {
    return DIGITAL_CARD_CONFIG.profiles.lidiane;
  }

  if (targetSegment === 'henrique') {
    return DIGITAL_CARD_CONFIG.profiles.henrique;
  }

  return DIGITAL_CARD_CONFIG.profiles.default;
}

function buildSingleVCardBlock(contactProfile) {
  const phoneLines = contactProfile.phones.map(
    (p) => `TEL;TYPE=${p.type}:${p.number}`
  );

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${contactProfile.lastName};${contactProfile.firstName};;;`,
    `FN:${contactProfile.fullName}`,
    'ORG:ATHENA Consultoria Automotiva',
    `TITLE:${contactProfile.title}`,
    ...phoneLines,
    `EMAIL;TYPE=INTERNET,WORK:${DIGITAL_CARD_CONFIG.email}`,
    `URL:${DIGITAL_CARD_CONFIG.websiteUrl}`,
    `ADR;TYPE=WORK:;;${DIGITAL_CARD_CONFIG.addressStreet};${DIGITAL_CARD_CONFIG.addressCity};${DIGITAL_CARD_CONFIG.addressRegion};${DIGITAL_CARD_CONFIG.addressPostalCode};Brasil`,
    `NOTE:${DIGITAL_CARD_CONFIG.tagline}`,
    'END:VCARD',
  ];

  return lines.join('\r\n');
}

/**
 * Generates a valid vCard 3.0 payload.
 * When `default` is selected, it bundles BOTH separate contacts (Lidiane + Henrique)
 * into a single `.vcf` file so iOS and Android import both separate contacts at once!
 */
export function buildVCardContent(profileKeyOrObj = 'default') {
  const profile =
    typeof profileKeyOrObj === 'string'
      ? DIGITAL_CARD_CONFIG.profiles[profileKeyOrObj] || DIGITAL_CARD_CONFIG.profiles.default
      : profileKeyOrObj || DIGITAL_CARD_CONFIG.profiles.default;

  if (profile.key === 'default' || profile.isMultiContact) {
    return [
      buildSingleVCardBlock(DIGITAL_CARD_CONFIG.profiles.lidiane),
      buildSingleVCardBlock(DIGITAL_CARD_CONFIG.profiles.henrique),
    ].join('\r\n');
  }

  return buildSingleVCardBlock(profile);
}

/**
 * Checks whether the current request is targeting the NFC Digital Card subdomain
 * (`cartao.athenaconsultoria.com.br`), or local/LAN preview for testing on mobile.
 */
export function isDigitalCardSubdomain(hostname, search = '', pathname = '') {
  const host = (
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  ).toLowerCase();

  if (host === 'cartao.athenaconsultoria.com.br' || host.startsWith('cartao.')) {
    return true;
  }

  const query =
    search || (typeof window !== 'undefined' ? window.location.search : '');
  const path = (
    pathname || (typeof window !== 'undefined' ? window.location.pathname : '')
  ).toLowerCase();

  const isLocalOrLan =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    host.endsWith('.local');

  if (isLocalOrLan) {
    if (
      new URLSearchParams(query).has('cartao') ||
      path === '/cartao' ||
      path.startsWith('/cartao/')
    ) {
      return true;
    }
  }

  return false;
}
