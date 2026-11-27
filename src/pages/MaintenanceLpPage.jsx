import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Check,
  ShieldCheck,
  Wrench,
  Star
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';
import { trackMetaCustom, trackMetaEvent } from '../utils/metaPixel';

const WHATSAPP_TECH_NUMBER = '5561984884099';
const PHONE_DISPLAY = '(61) 98488-4099';
const PHONE_TEL_HREF = 'tel:+5561984884099';

function WhatsAppMark({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

const SERVICE_LINES = [
  {
    name: 'Elevadores automotivos',
    scope: '2 colunas, 4 colunas, pórticos e pantográficos (tesoura) Mahovi e linha Undercar Sigma Tools.',
    interventions: 'Troca de cabos de aço e roldanas, equalização de braços, revisão de travas de segurança, troca de óleo hidráulico, retentores e regulagem elétrica.'
  },
  {
    name: 'Rampas de alinhamento',
    scope: 'Rampas pneumáticas, hidráulicas e pantográficas de alinhamento 3D.',
    interventions: 'Nivelamento fino de plataformas, revisão de pistões e válvulas pneumáticas, ajuste de pratos traseiros e vedação de linha de ar.'
  },
  {
    name: 'Desmontadoras de pneus e balanceadoras',
    scope: 'Desmontadoras pneumáticas com braço auxiliar e balanceadoras computadorizadas.',
    interventions: 'Calibração de sensores e eixo, troca de válvulas rotativas e pedais, regulagem de garras, substituição de correias e manutenção de cilindro destalonador.'
  },
  {
    name: 'Máquinas de troca de fluido ATF',
    scope: 'Estações automáticas para câmbio automático e transmissões CVT/DSG.',
    interventions: 'Limpeza do circuito hidráulico interno, troca de filtros e vedações, calibração de balança eletrônica e diagnóstico de bombas e solenoides.'
  },
  {
    name: 'Recicladoras de ar-condicionado',
    scope: 'Estações de recolhimento e carga para gases R134a e R1234yf.',
    interventions: 'Teste de estanqueidade, troca de óleo da bomba de vácuo, calibração de balança, manutenção de registros e aferição de manômetros.'
  },
  {
    name: 'Limpeza de bicos e equipamentos de bancada',
    scope: 'Máquinas de teste e limpeza ultrassônica para injeção convencional e GDI.',
    interventions: 'Manutenção de bomba de pressão, cuba ultrassônica, provetas, vedações de flauta e revisão do painel eletrônico de comando.'
  }
];

const PROCESS_STEPS = [
  {
    step: '1',
    title: 'Triagem técnica pelo WhatsApp',
    body: 'Você envia foto da plaqueta do equipamento, um vídeo curto do defeito e a cidade da oficina. Nosso técnico avalia o sintoma antes mesmo do deslocamento.'
  },
  {
    step: '2',
    title: 'Definição clara de peças e mão de obra',
    body: 'Passamos a lista exata de peças necessárias (cabos, retentores, válvulas ou sensores) para aquisição e aprovamos o valor da mão de obra especializada sem surpresas.'
  },
  {
    step: '3',
    title: 'Visita na oficina e teste em operação',
    body: 'O técnico vai até o seu box no DF ou Entorno, executa o reparo ou montagem, nivela o equipamento e libera a máquina somente após teste funcional.'
  }
];

const WORKSHOP_REVIEWS = [
  {
    author: 'Fernando Junior',
    context: 'Proprietário de oficina no DF',
    quote: 'A Athena veio para trazer soluções: se o problema é treinamento técnico ela traz, se o problema é manutenção de equipamentos ela resolve. Sou cliente, sou fã e indico a todos.'
  },
  {
    author: 'Eldinei',
    context: 'Oficina mecânica no DF',
    quote: 'Empresa parceira para toda hora. Atendimento rápido, peças de procedência e suporte técnico nota 10. Recomendo de olhos fechados.'
  },
  {
    author: 'Jeferson Muniz',
    context: 'Auto center especializado',
    quote: 'Excelente atendimento, resolveu todas as minhas demandas. Pronta-entrega de equipamentos e agilidade que faz toda a diferença no dia a dia da oficina.'
  }
];

const COVERAGE_REGIONS = [
  'Taguatinga e Águas Claras',
  'Ceilândia e Samambaia',
  'SIA, Guará e Vicente Pires',
  'Plano Piloto, Lago Sul e Norte',
  'Sobradinho, Planaltina e Gama',
  'Recanto das Emas e Riacho Fundo',
  'Valparaíso, Luziânia e Ocidental',
  'Águas Lindas, Formosa e Entorno'
];

const FAQ_ITEMS = [
  {
    question: 'Qual o prazo de atendimento quando o elevador ou máquina para?',
    answer: 'Para chamados emergenciais de equipamento parado em Brasília e regiões próximas, trabalhamos com janela técnica de 24h a 48h úteis conforme rota e disponibilidade das peças.'
  },
  {
    question: 'Como funciona a questão das peças de reposição?',
    answer: 'Nosso serviço cobre o diagnóstico e a mão de obra técnica especializada no local. Após a triagem inicial, indicamos exatamente qual peça precisa ser trocada para que o cliente forneça o componente ou adquira conosco quando disponível em estoque.'
  },
  {
    question: 'Vocês atendem somente equipamentos Mahovi e Sigma Tools?',
    answer: 'Somos especialistas de fábrica em toda a linha Mahovi e na linha Undercar da Sigma Tools (elevadores, desmontadoras, balanceadoras e rampas). Se você possui outro equipamento pesado na oficina, envie a foto do modelo no WhatsApp para verificarmos viabilidade técnica.'
  },
  {
    question: 'É possível contratar manutenção preventiva periódica para todos os boxes?',
    answer: 'Sim. Atendemos tanto chamados corretivos avulsos quanto planos preventivos recorrentes para auto centers e oficinas com múltiplos elevadores, reduzindo paradas inesperadas e desgaste prematuro de cabos e vedações.'
  }
];

const URGENCY_OPTIONS = [
  {
    value: 'emergencia',
    label: 'Máquina parada (urgente)',
    hint: 'Prioridade na rota técnica de 24h a 48h úteis'
  },
  {
    value: 'preventiva',
    label: 'Manutenção preventiva',
    hint: 'Revisão, nivelamento, troca de cabos ou óleo'
  },
  {
    value: 'instalacao',
    label: 'Instalação ou contrato periódico',
    hint: 'Montagem de equipamento ou plano para vários boxes'
  }
];

const EQUIPMENT_OPTIONS = [
  'Elevador automotivo 2 colunas ou pórtico',
  'Elevador pantográfico (tesoura)',
  'Rampa de alinhamento',
  'Desmontadora de pneus',
  'Balanceadora de rodas',
  'Máquina de troca de fluido ATF',
  'Recicladora de ar-condicionado',
  'Máquina de limpeza de bicos / injeção',
  'Outro equipamento de oficina'
];

export default function MaintenanceLpPage({ onNavigate }) {
  const [equipment, setEquipment] = useState('');
  const [urgency, setUrgency] = useState('emergencia');
  const [city, setCity] = useState('');
  const [symptom, setSymptom] = useState('');
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const equipmentRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    setPageSeo({
      title: 'Assistência Técnica de Elevadores e Equipamentos no DF | Athena',
      description: 'Manutenção preventiva e corretiva de elevadores automotivos, rampas, desmontadoras e equipamentos Mahovi e Sigma Tools em Brasília e Entorno. Plantão (61) 98488-4099.',
      canonicalPath: '/assistencia-tecnica',
      type: 'service',
      schemaId: 'lp-assistencia-tecnica-json-ld',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Athena Soluções Automotivas — Assistência Técnica',
        image: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp',
        telephone: '+55-61-98488-4099',
        areaServed: ['Brasília', 'Distrito Federal', 'Entorno do DF'],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ST SHA Conjunto 6 Chácara 517, Loja 05',
          addressLocality: 'Arniqueira, Brasília',
          addressRegion: 'DF',
          postalCode: '71996-413',
          addressCountry: 'BR'
        },
        description: 'Assistência técnica presencial e manutenção de elevadores automotivos, desmontadoras, balanceadoras e linha pesada Mahovi e Sigma Tools Undercar no DF.'
      }
    });
  }, []);

  const openWhatsApp = (message, originLabel = 'Geral', selectedEquip = equipment) => {
    try {
      trackMetaCustom('LeadAssistenciaTecnica', {
        machine: selectedEquip || 'Geral',
        urgency,
        location: city || 'DF/Entorno',
        origin: originLabel
      });
      trackMetaEvent('Contact', {
        content_category: 'AssistenciaTecnica',
        content_name: selectedEquip || originLabel
      });
    } catch (_) {}

    window.open(
      `https://wa.me/${WHATSAPP_TECH_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!equipment) {
      nextErrors.equipment = 'Selecione o equipamento que precisa de atendimento.';
    }
    if (!city.trim()) {
      nextErrors.city = 'Informe a cidade ou região da oficina no DF/Entorno.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.equipment) {
        equipmentRef.current?.focus();
      } else if (nextErrors.city) {
        cityRef.current?.focus();
      }
      return;
    }

    const urgencyLabel =
      URGENCY_OPTIONS.find((item) => item.value === urgency)?.label || 'Atendimento técnico';

    const lines = [
      'Olá, equipe técnica da Athena! Preciso de assistência técnica na minha oficina.',
      `Equipamento: ${equipment}`,
      `Tipo de atendimento: ${urgencyLabel}`,
      `Localização: ${city.trim()}`
    ];

    if (symptom.trim()) {
      lines.push(`Relato do defeito: ${symptom.trim()}`);
    }

    setStatusMessage('Abrindo atendimento técnico no WhatsApp (61) 98488-4099.');
    openWhatsApp(lines.join('\n'), 'FormularioHero', equipment);
  };

  const handleDirectEquipmentClick = (equipmentName) => {
    const msg =
      `Olá, equipe técnica da Athena! Preciso de assistência técnica para ${equipmentName.toLowerCase()} na minha oficina no DF.` +
      (city.trim() ? ` Região: ${city.trim()}.` : '');
    openWhatsApp(msg, `Lista-${equipmentName}`, equipmentName);
  };

  return (
    <div className="lp-maintenance-page min-h-screen bg-white text-[#111827] antialiased selection:bg-amber-200 selection:text-[#111827]">
      {/* Compact single-row sticky header (under 12% viewport height) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#D1D5DB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/athena-consultoria-logo-df.jpg"
              alt="Athena Soluções Automotivas"
              width="40"
              height="40"
              className="w-10 h-10 rounded-lg object-contain border border-[#E5E7EB] shrink-0"
            />
            <div className="min-w-0">
              <span className="font-display font-bold text-base sm:text-lg text-[#111827] block leading-tight truncate">
                Athena Assistência Técnica
              </span>
              <span className="text-xs text-[#4B5563] block truncate">
                Arniqueira, Brasília e Entorno do DF
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a
              href={PHONE_TEL_HREF}
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:text-[#D97706] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>

            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  'Olá, equipe técnica da Athena! Gostaria de agendar uma visita técnica ou manutenção na minha oficina.',
                  'HeaderCTA'
                )
              }
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              <WhatsAppMark className="w-4 h-4 shrink-0" />
              <span>Chamar técnico</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO: Asymmetric editorial left + Ficha de Chamado Técnico right */}
      <section className="border-b border-[#D1D5DB] bg-[#F3F4F6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left column: Direct industrial value prop + real facility proof */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[#B45309]">
                  Atendimento presencial no Distrito Federal e Entorno
                </p>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#111827] leading-[1.12] tracking-[-0.03em] max-w-2xl">
                  Manutenção e conserto de elevadores e equipamentos de oficina no DF.
                </h1>

                <p className="text-base sm:text-lg text-[#374151] leading-relaxed max-w-xl">
                  Equipe técnica própria para toda a linha Mahovi e linha Undercar da Sigma Tools. Vamos até a sua oficina para destravar máquina parada em 24h a 48h úteis, fazer preventivas ou instalar equipamentos novos.
                </p>
              </div>

              {/* Direct scannable operational facts */}
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#D1D5DB]">
                <div>
                  <dt className="text-xs font-medium text-[#4B5563]">Prazo emergencial</dt>
                  <dd className="font-display text-lg font-bold text-[#111827] mt-0.5">
                    24h a 48h úteis
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[#4B5563]">Atendimento</dt>
                  <dd className="font-display text-lg font-bold text-[#111827] mt-0.5">
                    Presencial no box
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[#4B5563]">Modalidades</dt>
                  <dd className="font-display text-lg font-bold text-[#111827] mt-0.5">
                    Avulso ou contrato
                  </dd>
                </div>
              </dl>

              {/* Real showroom & equipment photo (LCP candidate, fetchpriority high) */}
              <figure className="bg-white border border-[#D1D5DB] rounded-xl overflow-hidden">
                <img
                  src="https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/athena-04-ffdac6cbd374.webp"
                  alt="Base técnica e showroom da Athena Soluções Automotivas em Arniqueira, Brasília DF, com elevadores montados"
                  width="960"
                  height="540"
                  fetchPriority="high"
                  className="w-full h-56 sm:h-64 object-cover block"
                  onError={(e) => {
                    e.currentTarget.src = '/athena-showroom-distribuidora-df.jpg';
                  }}
                />
                <figcaption className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-t border-[#E5E7EB]">
                  <span className="text-xs sm:text-sm text-[#374151] font-medium">
                    Base técnica física em Arniqueira, Brasília — especialistas homologados:
                  </span>
                  <div className="flex items-center gap-4 shrink-0">
                    <img
                      src="https://mahovi.com.br/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2025/01/logomahov.png.webp"
                      alt="Mahovi Equipamentos"
                      width="84"
                      height="24"
                      className="h-5 w-auto object-contain"
                    />
                    <img
                      src="https://www.sigmatools.com.br/site/wp-content/uploads/2020/01/logo-sgt-home-03.png"
                      alt="Sigma Tools"
                      width="84"
                      height="24"
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                </figcaption>
              </figure>
            </div>

            {/* Right column: Ficha de Chamado Técnico (single memorable focal card) */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#D1D5DB] border-t-4 border-t-[#D97706] rounded-xl p-6 sm:p-7 shadow-sm">
                <div className="mb-5">
                  <h2 id="dispatch-form-heading" className="font-display text-xl sm:text-2xl font-bold text-[#111827] leading-snug">
                    Abrir chamado técnico
                  </h2>
                  <p className="text-sm text-[#4B5563] mt-1">
                    Preencha os dados do equipamento para falar direto com a equipe técnica no WhatsApp.
                  </p>
                </div>

                <form
                  onSubmit={handleDispatchSubmit}
                  aria-labelledby="dispatch-form-heading"
                  noValidate
                  className="space-y-4"
                >
                  {/* Equipment select (9 options -> <select> per decision matrix) */}
                  <div>
                    <label
                      htmlFor="tech-equipment"
                      className="block text-sm font-semibold text-[#111827] mb-1.5"
                    >
                      Equipamento <span aria-hidden="true" className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      ref={equipmentRef}
                      id="tech-equipment"
                      name="equipment"
                      required
                      value={equipment}
                      aria-invalid={Boolean(errors.equipment)}
                      aria-describedby={errors.equipment ? 'tech-equipment-error' : undefined}
                      onChange={(e) => {
                        setEquipment(e.target.value);
                        if (errors.equipment) {
                          setErrors((prev) => ({ ...prev, equipment: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (!equipment) {
                          setErrors((prev) => ({
                            ...prev,
                            equipment: 'Selecione o equipamento que precisa de atendimento.'
                          }));
                        }
                      }}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border text-[#111827] text-base transition-colors ${
                        errors.equipment ? 'border-[#DC2626]' : 'border-[#9CA3AF]'
                      }`}
                    >
                      <option value="">Selecione o tipo de máquina</option>
                      {EQUIPMENT_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {errors.equipment && (
                      <p id="tech-equipment-error" className="text-xs font-medium text-[#DC2626] mt-1">
                        {errors.equipment}
                      </p>
                    )}
                  </div>

                  {/* Urgency radios (3 options -> visible radio buttons inside fieldset/legend) */}
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold text-[#111827] mb-1.5">
                      Situação atual
                    </legend>
                    {URGENCY_OPTIONS.map((opt) => {
                      const radioId = `urgency-${opt.value}`;
                      const isSelected = urgency === opt.value;
                      return (
                        <label
                          key={opt.value}
                          htmlFor={radioId}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-[#111827] bg-[#F9FAFB]'
                              : 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF]'
                          }`}
                        >
                          <input
                            type="radio"
                            id={radioId}
                            name="urgency"
                            value={opt.value}
                            checked={isSelected}
                            onChange={(e) => setUrgency(e.target.value)}
                            className="mt-1 w-4 h-4 shrink-0"
                          />
                          <span className="block">
                            <span className="block text-sm font-semibold text-[#111827] leading-snug">
                              {opt.label}
                            </span>
                            <span className="block text-xs text-[#4B5563] mt-0.5">
                              {opt.hint}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>

                  {/* City / region input */}
                  <div>
                    <label
                      htmlFor="tech-city"
                      className="block text-sm font-semibold text-[#111827] mb-1.5"
                    >
                      Cidade ou região da oficina <span aria-hidden="true" className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      ref={cityRef}
                      id="tech-city"
                      name="city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      enterKeyHint="next"
                      placeholder="Ex.: Taguatinga, SIA, Ceilândia, Valparaíso"
                      value={city}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'tech-city-error' : undefined}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) {
                          setErrors((prev) => ({ ...prev, city: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (!city.trim()) {
                          setErrors((prev) => ({
                            ...prev,
                            city: 'Informe a cidade ou região da oficina no DF/Entorno.'
                          }));
                        }
                      }}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border text-[#111827] placeholder:text-[#6B7280] text-base transition-colors ${
                        errors.city ? 'border-[#DC2626]' : 'border-[#9CA3AF]'
                      }`}
                    />
                    {errors.city && (
                      <p id="tech-city-error" className="text-xs font-medium text-[#DC2626] mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* Optional short symptom description */}
                  <div>
                    <label
                      htmlFor="tech-symptom"
                      className="block text-sm font-semibold text-[#111827] mb-1.5"
                    >
                      O que está acontecendo? <span className="font-normal text-[#6B7280]">(opcional)</span>
                    </label>
                    <input
                      id="tech-symptom"
                      name="symptom"
                      type="text"
                      enterKeyHint="send"
                      placeholder="Ex.: elevador desnivelado, vazamento no pistão"
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}
                      className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border border-[#9CA3AF] text-[#111827] placeholder:text-[#6B7280] text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[52px] px-5 py-3 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white font-bold text-base inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <WhatsAppMark className="w-5 h-5 shrink-0" />
                    <span>Abrir chamado no WhatsApp</span>
                  </button>

                  {statusMessage && (
                    <p role="status" aria-live="polite" className="text-xs font-semibold text-[#15803D]">
                      {statusMessage}
                    </p>
                  )}
                </form>

                <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#4B5563]">Prefere ligar agora?</span>
                  <a
                    href={PHONE_TEL_HREF}
                    className="font-bold text-[#111827] hover:text-[#D97706] inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                    <span>{PHONE_DISPLAY}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL SERVICE DIRECTORY (Structured specification rows instead of generic card grid) */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#D1D5DB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left sticky summary column */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827] leading-tight tracking-[-0.02em]">
                Equipamentos que colocamos de volta em operação
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                Atendimento técnico dedicado a toda a linha pesada Mahovi e à linha Undercar da Sigma Tools, com conhecimento direto de fábrica sobre circuitos hidráulicos, pneumáticos e mecânicos.
              </p>
              <div className="p-4 rounded-lg bg-[#F3F4F6] border border-[#D1D5DB] space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                  <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
                  <span>Transparência em peças e mão de obra</span>
                </div>
                <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
                  Você contrata a mão de obra especializada da Athena e recebe a especificação exata das peças de reposição necessárias antes do reparo.
                </p>
              </div>
            </div>

            {/* Right structured specification table/rows */}
            <div className="lg:col-span-8 divide-y divide-[#D1D5DB] border-t border-b border-[#D1D5DB]">
              {SERVICE_LINES.map((service) => (
                <div
                  key={service.name}
                  className="py-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <h3 className="font-display text-lg font-bold text-[#111827]">
                      {service.name}
                    </h3>
                    <p className="text-sm font-medium text-[#374151]">
                      {service.scope}
                    </p>
                    <p className="text-sm text-[#4B5563] leading-relaxed">
                      {service.interventions}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDirectEquipmentClick(service.name)}
                    className="self-start shrink-0 min-h-[44px] px-4 py-2 rounded-lg border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Pedir visita
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUE SEQUENTIAL PROCESS (Dark industrial carbon band for visual contrast) */}
      <section className="py-16 sm:py-20 bg-[#111827] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight tracking-[-0.02em]">
              Como funciona a visita técnica na sua oficina
            </h2>
            <p className="text-base text-[#D1D5DB] leading-relaxed">
              Sem burocracia de abertura de ticket ou espera por resposta de fábrica em outro estado. O processo é direto com quem vai mexer na máquina.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-[#374151] border-t border-[#374151] pt-8">
            {PROCESS_STEPS.map((item) => (
              <li key={item.step} className="md:px-8 first:md:pl-0 last:md:pr-0 space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#D97706] text-[#111827] font-display font-bold text-sm">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-[#D1D5DB] leading-relaxed">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 pt-8 border-t border-[#374151] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-[#E5E7EB] max-w-xl">
              Tem elevador travado ou vazando óleo hoje? Envie um vídeo curto pelo WhatsApp para agilizarmos o pré-diagnóstico.
            </p>
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  'Olá, equipe técnica da Athena! Vou enviar foto/vídeo de um equipamento da minha oficina para pré-diagnóstico.',
                  'SecaoPassoAPasso'
                )
              }
              className="shrink-0 min-h-[48px] px-5 py-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <WhatsAppMark className="w-4 h-4 shrink-0" />
              <span>Enviar vídeo para diagnóstico</span>
            </button>
          </div>
        </div>
      </section>

      {/* REAL GOOGLE REVIEWS FROM DF WORKSHOPS */}
      <section className="py-16 sm:py-20 bg-[#F3F4F6] border-b border-[#D1D5DB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em]">
                Quem mantém a oficina rodando com a Athena
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563]">
                Avaliações públicas no Google feitas por donos de oficinas e centros automotivos do Distrito Federal.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]">
              <div className="flex text-[#D97706]" aria-label="Nota 5 de 5 estrelas">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Star key={idx} className="w-4 h-4 fill-[#D97706]" aria-hidden="true" />
                ))}
              </div>
              <span>Nota 5,0 no Google</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKSHOP_REVIEWS.map((review) => (
              <blockquote
                key={review.author}
                className="bg-white border border-[#D1D5DB] rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <p className="text-sm sm:text-base text-[#1F2937] leading-relaxed">
                  “{review.quote}”
                </p>
                <footer className="pt-4 border-t border-[#E5E7EB]">
                  <cite className="not-italic font-display font-bold text-sm text-[#111827] block">
                    {review.author}
                  </cite>
                  <span className="text-xs text-[#4B5563]">{review.context}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE & DIRECT TECHNICAL CONTACT */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#D1D5DB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em]">
                Regiões atendidas a partir da nossa base em Arniqueira
              </h2>
              <p className="text-base text-[#4B5563] leading-relaxed max-w-xl">
                Deslocamento técnico para todo o Distrito Federal e cidades do Entorno, tanto para reparos emergenciais quanto para instalações agendadas e manutenção preventiva.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2">
                {COVERAGE_REGIONS.map((region) => (
                  <li key={region} className="flex items-center gap-2.5 text-sm font-medium text-[#111827]">
                    <Check className="w-4 h-4 text-[#15803D] shrink-0" aria-hidden="true" />
                    <span>{region}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-[#111827]">
                  Central de Assistência Técnica
                </h3>
              </div>

              <div className="space-y-3 text-sm text-[#374151]">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <a
                      href={PHONE_TEL_HREF}
                      className="font-display text-lg font-bold text-[#111827] hover:text-[#D97706] block leading-none"
                    >
                      {PHONE_DISPLAY}
                    </a>
                    <span className="text-xs text-[#4B5563]">WhatsApp e telefone direto do plantão técnico</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Segunda a sexta-feira, das 8h às 18h</span>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>ST SHA Conjunto 6 Chácara 517, Loja 05, Arniqueira, Brasília - DF</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openWhatsApp(
                    'Olá, equipe técnica da Athena! Quero verificar a disponibilidade de rota técnica para a minha oficina.',
                    'CardBaseTecnica'
                  )
                }
                className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <WhatsAppMark className="w-4 h-4 shrink-0" />
                <span>Consultar agenda técnica no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STRAIGHTFORWARD TECHNICAL FAQ (Native <details>/<summary> per modern-web-guidance) */}
      <section
        aria-labelledby="faq-maintenance-heading"
        className="lp-maintenance-accordion py-16 sm:py-20 bg-[#F3F4F6] border-b border-[#D1D5DB]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2
            id="faq-maintenance-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em] mb-8"
          >
            Dúvidas frequentes sobre o atendimento
          </h2>

          <div className="bg-white border border-[#D1D5DB] rounded-xl divide-y divide-[#D1D5DB]">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group">
                <summary className="px-5 sm:px-6 py-4 text-base font-semibold text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                  <span>{item.question}</span>
                </summary>
                <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* RESTRAINED FOOTER */}
      <footer className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#4B5563]">
          <p>
            © 2026 Athena Soluções Automotivas. Assistência técnica especializada no DF. Telefone: {PHONE_DISPLAY}.
          </p>
          <div className="flex items-center gap-5 font-semibold">
            <button
              type="button"
              onClick={() => onNavigate?.('catalog')}
              className="text-[#111827] hover:text-[#D97706] transition-colors cursor-pointer"
            >
              Catálogo de equipamentos
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
            >
              Página inicial
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
