import React, { useState, useMemo, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  MessageCircle, 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  Phone,
  Store
} from 'lucide-react';
import { setPageSeo } from '../utils/seoManager';

const FAQ_DATA = [
  {
    id: 1,
    category: 'localizacao',
    categoryLabel: 'Localização & Showroom',
    question: 'Onde encontrar equipamentos automotivos no Distrito Federal?',
    answer: 'A Athena Consultoria oferece equipamentos automotivos no Distrito Federal, atendendo oficinas mecânicas, centros de estética automotiva, empresas de lanternagem e pintura e lava-jatos. Entre em contato para conhecer as opções disponíveis.'
  },
  {
    id: 2,
    category: 'localizacao',
    categoryLabel: 'Localização & Showroom',
    question: 'A Athena vende ferramentas para oficinas mecânicas em Brasília?',
    answer: 'Sim! Trabalhamos com ferramentas e equipamentos para oficinas mecânicas em Brasília e região, buscando oferecer soluções adequadas às necessidades de cada profissional.'
  },
  {
    id: 3,
    category: 'marcas',
    categoryLabel: 'Equipamentos & Marcas',
    question: 'Quais marcas de equipamentos automotivos vocês comercializam?',
    answer: 'Trabalhamos com marcas homologadas e líderes de mercado como Lapek, Lupus, Wolfcar, eWolf, Mahovi, EAATA, GT Eagle, Sigma Tools, Delta e StarkX. Consulte nossa equipe para verificar os produtos disponíveis a pronta-entrega ou sob encomenda.'
  },
  {
    id: 4,
    category: 'assistencia',
    categoryLabel: 'Assistência & Garantia',
    question: 'A Athena oferece assistência técnica de equipamentos automotivos?',
    answer: 'Sim! Um dos nossos diferenciais fundamentais é oferecer assistência técnica dos produtos comercializados, além de suporte técnico especializado e acompanhamento pós-venda direto com nossos especialistas.'
  },
  {
    id: 5,
    category: 'localizacao',
    categoryLabel: 'Localização & Showroom',
    question: 'Vocês atendem oficinas mecânicas fora de Águas Claras?',
    answer: 'Sim! Atendemos todo o Distrito Federal e cidades próximas no entorno de Goiás, incluindo atendimento presencial nas oficinas mecânicas e empresas automotivas.'
  },
  {
    id: 6,
    category: 'localizacao',
    categoryLabel: 'Localização & Showroom',
    question: 'Posso visitar o showroom da Athena Consultoria?',
    answer: 'Sim! Temos showroom em Águas Claras, Brasília-DF, onde você pode conhecer de perto nossas soluções em equipamentos automotivos, scanners de diagnóstico e mobiliário técnico. Entre em contato pelo WhatsApp (61) 98348-5671 para combinar seu atendimento.'
  },
  {
    id: 7,
    category: 'assistencia',
    categoryLabel: 'Assistência & Garantia',
    question: 'Os equipamentos automotivos vendidos possuem suporte técnico?',
    answer: 'Sim! Oferecemos suporte técnico contínuo e acompanhamento dos equipamentos comercializados, ajudando nossos clientes e seus técnicos a utilizarem o máximo potencial das soluções.'
  },
  {
    id: 8,
    category: 'consultoria',
    categoryLabel: 'Consultoria & Treinamentos',
    question: 'Como saber qual equipamento é ideal para minha oficina?',
    answer: 'Nossa equipe oferece atendimento consultivo e humanizado para identificar equipamentos automotivos perfeitamente adequados à estrutura física, aos serviços realizados e ao fluxo de clientes da sua oficina.'
  },
  {
    id: 9,
    category: 'marcas',
    categoryLabel: 'Equipamentos & Marcas',
    question: 'A Athena trabalha com equipamentos para estética automotiva?',
    answer: 'Sim! Comercializamos soluções completas para profissionais e centros de estética automotiva, detalhamento (detailer), polimento, higienização e cuidados de alto padrão com veículos.'
  },
  {
    id: 10,
    category: 'consultoria',
    categoryLabel: 'Consultoria & Treinamentos',
    question: 'Vocês oferecem cursos para profissionais automotivos?',
    answer: 'Sim! A Athena também promove cursos práticos e palestras sobre equipamentos automotivos, diagnóstico por rede CAN, injeção eletrônica e desenvolvimento de oficinas, contribuindo ativamente para a capacitação profissional no DF.'
  },
  {
    id: 11,
    category: 'assistencia',
    categoryLabel: 'Assistência & Garantia',
    question: 'Os equipamentos automotivos possuem garantia?',
    answer: 'Sim! Todos os equipamentos possuem garantia. As condições e prazos específicos de garantia dependem do fabricante e do modelo do produto. Nossa equipe orienta detalhadamente você sobre os termos e garantias antes da compra.'
  },
  {
    id: 12,
    category: 'consultoria',
    categoryLabel: 'Consultoria & Treinamentos',
    question: 'Como saber se vale a pena investir em um equipamento para minha oficina?',
    answer: 'A escolha de equipamentos automotivos deve considerar o retorno sobre o investimento (ROI), os serviços mais procurados, a agilidade do processo e o aumento do ticket médio. Nossa equipe realiza uma análise consultiva para apoiar sua tomada de decisão.'
  },
  {
    id: 13,
    category: 'localizacao',
    categoryLabel: 'Localização & Showroom',
    question: 'A Athena realiza atendimento presencial nas oficinas?',
    answer: 'Sim! Além do atendimento personalizado em nosso showroom, nossos consultores realizam visitas técnicas e comerciais presenciais às oficinas e empresas dentro de nossa área de cobertura no DF e Entorno.'
  },
  {
    id: 14,
    category: 'geral',
    categoryLabel: 'Contato & Atendimento',
    question: 'Como entrar em contato com a Athena Consultoria?',
    answer: 'Você pode falar diretamente com nossa equipe pelo WhatsApp ou telefone no número (61) 98348-5671, pelo e-mail contato@athenaconsultoria.com.br ou explorando nosso catálogo online em athenaconsultoria.com.br.'
  },
  {
    id: 15,
    category: 'geral',
    categoryLabel: 'Contato & Atendimento',
    question: 'Por que comprar equipamentos automotivos com a Athena Consultoria?',
    answer: 'Porque unimos pronta-entrega, atendimento humanizado, suporte técnico especializado, assistência técnica e pós-venda ativo. Nosso objetivo não é apenas vender, mas construir parcerias duradouras que impulsionam o lucro e a eficiência das oficinas mecânicas.'
  }
];

export default function FaqPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState([1]); // Primeiro aberto por padrão

  useEffect(() => {
    // SEO Completo com Schema FAQPage para Google Snippets
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQ_DATA.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    setPageSeo({
      title: 'Perguntas Frequentes (FAQ) | Equipamentos Automotivos em Brasília e DF - Athena',
      description: 'Tire suas dúvidas sobre venda de elevadores, scanners automotivos, assistência técnica, garantia e visitas presenciais no Distrito Federal e Brasília.',
      canonicalUrl: 'https://www.athenaconsultoria.com.br/faq',
      structuredData
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleItem = (id) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaq = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.question.toLowerCase().includes(q) || 
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-6">
      {/* Container Principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-800 transition-colors">Início</button>
          <span>/</span>
          <span className="text-slate-800 font-bold">Perguntas Frequentes (FAQ)</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="max-w-3xl relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Central de Dúvidas & Atendimento
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-3">
              Perguntas Frequentes sobre Equipamentos Automotivos no DF
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Tudo o que você precisa saber sobre compras, ferramentas, assistência técnica, visitas presenciais e atendimento no showroom em Águas Claras, Brasília e região.
            </p>

            {/* Barra de Busca */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Busque por dúvida, marca (ex: EAATA, Mahovi), endereço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-slate-400 pl-12 pr-4 py-3.5 rounded-xl border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Todas as Dúvidas', count: FAQ_DATA.length },
            { id: 'localizacao', label: 'Localização & Showroom', icon: MapPin },
            { id: 'marcas', label: 'Marcas & Ferramentas', icon: Wrench },
            { id: 'assistencia', label: 'Assistência & Garantia', icon: ShieldCheck },
            { id: 'consultoria', label: 'Cursos & Consultoria', icon: GraduationCap }
          ].map(tab => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-amber-800 text-white shadow-md shadow-amber-900/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de Acordeões */}
        <div className="space-y-3 mb-14">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item) => {
              const isOpen = openItems.includes(item.id);
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-amber-300"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-amber-800 font-black text-sm sm:text-base mt-0.5 shrink-0">
                        {item.id.toString().padStart(2, '0')}.
                      </span>
                      <span className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                        {item.question}
                      </span>
                    </div>
                    <div className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 bg-amber-50 text-amber-800' : 'text-slate-400 bg-slate-50'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      <p className="pl-7">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">Nenhuma pergunta encontrada para sua busca.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                className="mt-3 text-xs text-amber-800 font-bold hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          )}
        </div>

        {/* Card de Fale Conosco / Suporte Humanizado */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Não encontrou o que precisava?
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              Fale direto com nossos consultores técnicos no WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Nossa equipe está disponível em horário comercial para tirar dúvidas sobre especificações, agendar visitas na sua oficina ou demonstrar equipamentos no showroom de Águas Claras.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a 
              href="https://wa.me/5561983485671?text=Ol%C3%A1%2C+estava+no+site+e+gostaria+de+tirar+uma+d%C3%BAvida+sobre+equipamentos+automotivos"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs sm:text-sm py-3 px-6 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Chamar no WhatsApp</span>
            </a>

            <button
              onClick={() => onNavigate('catalog')}
              className="btn-secondary text-xs sm:text-sm py-3 px-5 font-bold flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-slate-600" />
              <span>Ver Catálogo Completo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
