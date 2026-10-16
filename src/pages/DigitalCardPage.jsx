import React, { useEffect, useMemo } from 'react';
import {
  Globe,
  Instagram,
  Phone,
  Headset,
  ChevronRight,
  UserPlus,
  MapPin,
} from 'lucide-react';
import {
  DIGITAL_CARD_CONFIG,
  getDigitalCardProfile,
  buildVCardContent,
} from '../config/digitalCardConfig';

const NAVIGATION_CARDS = [
  {
    id: 'website',
    profileMatch: null,
    title: 'Nosso site',
    description: 'Conheça mais sobre a Athena',
    href: DIGITAL_CARD_CONFIG.websiteUrl,
    icon: Globe,
    isWhatsApp: false,
    ariaLabel: 'Nosso site — Conheça mais sobre a Athena (abre em nova aba)',
  },
  {
    id: 'instagram',
    profileMatch: null,
    title: 'Instagram',
    description: 'Acompanhe nossas novidades',
    href: DIGITAL_CARD_CONFIG.instagramUrl,
    icon: Instagram,
    isWhatsApp: false,
    ariaLabel: 'Instagram — Acompanhe nossas novidades (abre em nova aba)',
  },
  {
    id: 'commercial',
    profileMatch: 'lidiane',
    title: 'Contato Comercial',
    description: 'Fale com a Lidiane',
    href: DIGITAL_CARD_CONFIG.commercialWhatsAppUrl,
    icon: Phone,
    isWhatsApp: true,
    ariaLabel: 'Contato Comercial — Fale com a Lidiane pelo WhatsApp (abre em nova aba)',
  },
  {
    id: 'support',
    profileMatch: 'henrique',
    title: 'Suporte Técnico',
    description: 'Fale com o Henrique',
    href: DIGITAL_CARD_CONFIG.technicalSupportWhatsAppUrl,
    icon: Headset,
    isWhatsApp: true,
    ariaLabel: 'Suporte Técnico — Fale com o Henrique pelo WhatsApp (abre em nova aba)',
  },
];

export default function DigitalCardPage() {
  const activeProfile = useMemo(() => getDigitalCardProfile(), []);

  const vCardDataUri = useMemo(() => {
    const vcfText = buildVCardContent(activeProfile);
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcfText)}`;
  }, [activeProfile]);

  useEffect(() => {
    const pageTitle =
      activeProfile.key !== 'default'
        ? `Athena | ${activeProfile.name} (${activeProfile.roleLabel})`
        : DIGITAL_CARD_CONFIG.pageTitle;

    document.title = pageTitle;

    const setMetaTag = (selector, attrName, attrValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag(
      'meta[name="description"]',
      'name',
      'description',
      DIGITAL_CARD_CONFIG.pageDescription
    );
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag(
      'meta[property="og:description"]',
      'property',
      'og:description',
      DIGITAL_CARD_CONFIG.pageDescription
    );
    setMetaTag(
      'meta[property="og:url"]',
      'property',
      'og:url',
      `https://cartao.athenaconsultoria.com.br${window.location.pathname}`
    );
    setMetaTag('meta[name="theme-color"]', 'name', 'theme-color', '#0F172B');

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute(
        'href',
        `https://cartao.athenaconsultoria.com.br${window.location.pathname}`
      );
    }

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('type', 'image/png');
      favicon.setAttribute('href', DIGITAL_CARD_CONFIG.logoUrl);
    }
  }, [activeProfile]);

  return (
    <div
      className="relative min-h-dvh w-full bg-[#0F172B] text-white flex flex-col justify-between overflow-hidden select-none"
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
      }}
    >
      {/* Subtle Engineering Technical Grid + Geometric Corner Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Ultra-discreet industrial blueprint grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Top-left geometric frame */}
        <svg
          className="absolute top-0 left-0 w-36 h-36 sm:w-48 sm:h-48 text-[#1E293B]"
          viewBox="0 0 160 160"
          fill="none"
        >
          <path d="M0 44L44 0H60L0 60V44Z" fill="currentColor" fillOpacity="0.45" />
          <path d="M0 84L84 0" stroke="currentColor" strokeWidth="1.2" />
          <path d="M0 112L112 0" stroke="#D65630" strokeWidth="1" strokeOpacity="0.35" />
          <path d="M16 16H48M16 16V48" stroke="#D65630" strokeWidth="1.5" strokeOpacity="0.55" />
        </svg>

        {/* Top-right geometric frame */}
        <svg
          className="absolute top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 text-[#1E293B]"
          viewBox="0 0 160 160"
          fill="none"
        >
          <path d="M160 44L116 0H100L160 60V44Z" fill="currentColor" fillOpacity="0.45" />
          <path d="M160 84L76 0" stroke="currentColor" strokeWidth="1.2" />
          <path d="M160 112L48 0" stroke="#D65630" strokeWidth="1" strokeOpacity="0.35" />
          <path d="M144 16H112M144 16V48" stroke="#D65630" strokeWidth="1.5" strokeOpacity="0.55" />
        </svg>

        {/* Bottom-left geometric frame */}
        <svg
          className="absolute bottom-0 left-0 w-36 h-36 sm:w-48 sm:h-48 text-[#1E293B]"
          viewBox="0 0 160 160"
          fill="none"
        >
          <path d="M0 116L44 160H60L0 100V116Z" fill="currentColor" fillOpacity="0.45" />
          <path d="M0 76L84 160" stroke="currentColor" strokeWidth="1.2" />
          <path d="M16 144H48M16 144V112" stroke="#D65630" strokeWidth="1.5" strokeOpacity="0.45" />
        </svg>

        {/* Bottom-right geometric frame */}
        <svg
          className="absolute bottom-0 right-0 w-36 h-36 sm:w-48 sm:h-48 text-[#1E293B]"
          viewBox="0 0 160 160"
          fill="none"
        >
          <path d="M160 116L116 160H100L160 100V116Z" fill="currentColor" fillOpacity="0.45" />
          <path d="M160 76L76 160" stroke="currentColor" strokeWidth="1.2" />
          <path d="M144 144H112M144 144V112" stroke="#D65630" strokeWidth="1.5" strokeOpacity="0.45" />
        </svg>
      </div>

      {/* Main Centered Container */}
      <main className="relative z-10 w-full max-w-[420px] mx-auto my-auto flex flex-col items-center py-3 sm:py-6">
        {/* Header: Official Logo + Brand Identity */}
        <header className="flex flex-col items-center text-center w-full mb-6">
          <div className="relative mb-4">
            {/* Subtle outer metallic-navy ring */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-[#16213A] border border-[#293B5F] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-0.5">
                <img
                  src={DIGITAL_CARD_CONFIG.logoUrl}
                  alt="Logotipo oficial da ATHENA Consultoria Automotiva"
                  width="120"
                  height="120"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.14em] text-white leading-none">
            {DIGITAL_CARD_CONFIG.companyName}
          </h1>

          <p className="mt-2 text-xs sm:text-[13px] font-semibold tracking-[0.26em] text-[#CBD5E1] uppercase">
            {DIGITAL_CARD_CONFIG.companySubtitle}
          </p>

          {/* Subtle divider */}
          <div className="mt-3.5 mb-3.5 flex items-center justify-center gap-2 w-36" aria-hidden="true">
            <span className="h-px flex-1 bg-[#253554]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D65630]" />
            <span className="h-px flex-1 bg-[#253554]" />
          </div>

          <p className="text-sm sm:text-[15px] text-[#CBD5E1] font-normal leading-relaxed max-w-[290px] sm:max-w-[330px]">
            {DIGITAL_CARD_CONFIG.tagline}
          </p>
        </header>

        {/* Four Primary Navigation Cards */}
        <nav
          aria-label="Canais de contato e redes oficiais da Athena"
          className="w-full flex flex-col gap-3"
        >
          {NAVIGATION_CARDS.map((card) => {
            const IconComponent = card.icon;
            const isHighlightedProfile =
              activeProfile.key !== 'default' && card.profileMatch === activeProfile.key;

            return (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={card.ariaLabel}
                className={`group relative w-full min-h-[74px] px-4 py-3.5 rounded-2xl bg-[#152039]/95 border ${
                  isHighlightedProfile
                    ? 'border-[#D65630]/85 bg-[#182542]'
                    : 'border-[#263859]'
                } hover:border-[#D65630]/85 hover:bg-[#192642] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D65630] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172B] transition-all duration-150 motion-reduce:transition-none motion-reduce:active:scale-100 flex items-center justify-between gap-3.5 overflow-hidden`}
              >
                {/* Metallic Left Chassis Accent Bar */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-opacity duration-150 ${
                    isHighlightedProfile
                      ? 'bg-[#D65630] opacity-100'
                      : 'bg-[#D65630] opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Left Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl bg-[#0F172B] border ${
                    isHighlightedProfile
                      ? 'border-[#D65630]/60'
                      : 'border-[#263859] group-hover:border-[#D65630]/60'
                  } flex items-center justify-center shrink-0 transition-colors duration-150 motion-reduce:transition-none`}
                  aria-hidden="true"
                >
                  <IconComponent className="w-5 h-5 text-[#D65630]" strokeWidth={1.9} />
                </div>

                {/* Center Text */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="block text-[16px] sm:text-[17px] font-bold text-white leading-snug tracking-tight truncate">
                      {card.title}
                    </span>
                    {card.isWhatsApp && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#0F172B] border border-[#263859] text-[10px] font-semibold uppercase tracking-wider text-[#CBD5E1] shrink-0"
                        aria-hidden="true"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D65630]" />
                        WhatsApp
                      </span>
                    )}
                  </div>
                  <span className="block text-[13px] sm:text-sm text-[#94A3B8] group-hover:text-[#CBD5E1] leading-snug mt-0.5 truncate transition-colors duration-150 motion-reduce:transition-none">
                    {card.description}
                  </span>
                </div>

                {/* Right Chevron Indicator */}
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0 text-[#64748B] group-hover:text-[#D65630] group-hover:translate-x-0.5 transition-all duration-150 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  aria-hidden="true"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </div>
              </a>
            );
          })}
        </nav>

        {/* Discreet Utility Actions: Save Contact (vCard) + Showroom Location */}
        <div className="w-full mt-4 pt-3 border-t border-[#1E2D4A]/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <a
            href={vCardDataUri}
            download={activeProfile.fileName}
            aria-label={`${activeProfile.buttonLabel} na agenda do celular`}
            className="w-full sm:w-auto flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#131D33] hover:bg-[#192642] border border-[#263859] hover:border-[#D65630]/70 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D65630] transition-all duration-150 motion-reduce:transition-none flex items-center justify-center gap-2 text-xs font-semibold text-white"
          >
            <UserPlus className="w-4 h-4 text-[#D65630] shrink-0" strokeWidth={2} />
            <span>{activeProfile.buttonLabel}</span>
          </a>

          <a
            href={DIGITAL_CARD_CONFIG.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir localização da sede da Athena em Brasília no Google Maps"
            className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl bg-[#131D33]/60 hover:bg-[#192642] border border-[#1E2D4A] hover:border-[#293B5F] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D65630] transition-all duration-150 motion-reduce:transition-none flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#94A3B8] hover:text-white"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D65630] shrink-0" strokeWidth={2} />
            <span>{DIGITAL_CARD_CONFIG.locationLabel}</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-[420px] mx-auto pt-5 pb-1 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2.5 w-44 mb-2.5" aria-hidden="true">
          <span className="h-px flex-1 bg-[#1E2D4A]" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#D65630]" />
          <span className="h-px flex-1 bg-[#1E2D4A]" />
        </div>
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
          ATHENA <span className="text-[#D65630] mx-1">•</span> SEMPRE AO SEU LADO
        </p>
      </footer>
    </div>
  );
}
