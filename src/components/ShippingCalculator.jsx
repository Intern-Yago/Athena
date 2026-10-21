import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Search, Loader2, CheckCircle2, AlertCircle, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { getFallbackShippingOptions } from '../utils/fallbackShipping';
import { trackMetaCustom, trackMetaEvent } from '../utils/metaPixel';

const API_BASE_URL = (typeof window !== 'undefined' && window.location.origin)
  ? `${window.location.origin}/api`
  : (import.meta.env.VITE_API_URL || 'https://athena-backend-hu1m.onrender.com/api');

const STORAGE_CEP_KEY = 'athena_shipping_cep';
const STORAGE_PREF_ID_KEY = 'athena_shipping_pref_id';

/**
 * ShippingCalculator
 * 
 * Componente oficial de cálculo de frete via Melhor Envio para o Athena OS.
 * Suporta cotação unitária (página de produto) ou múltipla (carrinho de compras).
 * 
 * @param {Object} props
 * @param {Object} [props.product] - Produto atual
 * @param {number} [props.quantity] - Quantidade selecionada
 * @param {Array} [props.items] - Itens consolidados do carrinho
 * @param {Function} [props.onSelectShipping] - Callback ao selecionar uma transportadora ou informar CEP
 * @param {string} [props.className] - Classes CSS extras
 */
export function ShippingCalculator({
  product,
  quantity = 1,
  items = null,
  onSelectShipping = null,
  className = ''
}) {
  const [cep, setCep] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_CEP_KEY) || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);
  const [shippingOptions, setShippingOptions] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_PREF_ID_KEY) || null;
    } catch {
      return null;
    }
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);
  const hasAutoCalculatedOnMount = useRef(false);
  const onSelectShippingRef = useRef(onSelectShipping);

  useEffect(() => {
    onSelectShippingRef.current = onSelectShipping;
  }, [onSelectShipping]);

  // Sincroniza a seleção atual (opção + CEP + endereço) com o componente pai (Página do Produto ou Carrinho)
  useEffect(() => {
    if (!onSelectShippingRef.current) return;

    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      onSelectShippingRef.current(null);
      return;
    }

    const formattedCep = `${rawCep.slice(0, 5)}-${rawCep.slice(5)}`;

    if (Array.isArray(shippingOptions) && shippingOptions.length > 0 && selectedOptionId != null) {
      const selectedOpt = shippingOptions.find(o => String(o.id) === String(selectedOptionId)) || shippingOptions[0];
      if (selectedOpt) {
        onSelectShippingRef.current({
          ...selectedOpt,
          cep: formattedCep,
          rawCep,
          addressInfo: addressInfo || null,
          isSimulated,
          onlyCep: false
        });
        return;
      }
    }

    // Se o usuário digitou um CEP válido de 8 dígitos mas ainda não clicou em Calcular
    onSelectShippingRef.current({
      cep: formattedCep,
      rawCep,
      addressInfo: addressInfo || null,
      onlyCep: true
    });
  }, [cep, shippingOptions, selectedOptionId, addressInfo, isSimulated]);

  // Formata o CEP com máscara 00000-000
  const handleCepChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCep(val);
    setErrorMessage('');

    const raw = val.replace(/\D/g, '');
    if (raw.length === 8) {
      try {
        sessionStorage.setItem(STORAGE_CEP_KEY, val);
      } catch {}
    } else {
      setShippingOptions(null);
      setAddressInfo(null);
    }
  };

  const executeCalculation = async (targetRawCep) => {
    if (!targetRawCep || targetRawCep.length !== 8) return;

    setLoading(true);
    setErrorMessage('');

    const formattedCep = `${targetRawCep.slice(0, 5)}-${targetRawCep.slice(5)}`;
    try {
      sessionStorage.setItem(STORAGE_CEP_KEY, formattedCep);
    } catch {}

    // Prepara payload de produtos
    let payloadProducts = [];
    if (Array.isArray(items) && items.length > 0) {
      payloadProducts = items.map(it => ({
        id: it.id,
        sku: it.sku,
        name: it.name,
        specs: it.specs,
        weight: it.weight,
        height: it.height,
        width: it.width,
        length: it.length,
        price: Number(it.price) || 50,
        quantity: Number(it.quantity) || 1
      }));
    } else if (product) {
      payloadProducts = [
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          specs: product.specs,
          weight: product.weight,
          height: product.height,
          width: product.width,
          length: product.length,
          price: Number(product.price) || 50,
          quantity: Number(quantity) || 1
        }
      ];
    }

    let resolvedAddress = addressInfo || '';
    let finalOptions = [];

    try {
      // 1. Busca dados do endereço via ViaCEP em paralelo para feedback instantâneo de localização
      const viaCepPromise = fetch(`https://viacep.com.br/ws/${targetRawCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.erro) {
            const loc = `${data.bairro ? data.bairro + ', ' : ''}${data.localidade} - ${data.uf}`;
            resolvedAddress = loc;
            setAddressInfo(loc);
          }
        })
        .catch(() => {});

      // 2. Dispara requisição para o backend do Athena OS (Melhor Envio) com fallback de contingência
      let calculatedOptions = null;
      let isSimulatedResult = false;

      try {
        const res = await fetch(`${API_BASE_URL}/shipping/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            toCep: targetRawCep,
            products: payloadProducts
          })
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.options) && data.options.length > 0) {
            calculatedOptions = data.options;
            isSimulatedResult = Boolean(data.is_simulated);
          }
        }
      } catch (networkErr) {
        console.warn('Backend de frete indisponível no momento, acionando estimador resiliente:', networkErr);
      }

      await viaCepPromise;

      const pickPreferredOption = (optionsList) => {
        if (!Array.isArray(optionsList) || optionsList.length === 0) return null;
        let savedPrefId = selectedOptionId;
        try {
          if (!savedPrefId) savedPrefId = sessionStorage.getItem(STORAGE_PREF_ID_KEY);
        } catch {}
        if (savedPrefId != null) {
          const match = optionsList.find(o => String(o.id) === String(savedPrefId));
          if (match) return match;
        }
        return optionsList[0];
      };

      // 3. Se o backend respondeu com sucesso, usa as cotações calculadas
      if (calculatedOptions && calculatedOptions.length > 0) {
        finalOptions = calculatedOptions;
        const chosen = pickPreferredOption(calculatedOptions);
        setShippingOptions(calculatedOptions);
        setIsSimulated(isSimulatedResult);
        setSelectedOptionId(chosen.id);
      } else {
        // Fallback resiliente: calcula estimativa offline instantânea com base no CEP e cubagem/peso
        const fallbackOptions = getFallbackShippingOptions(targetRawCep, payloadProducts);
        if (fallbackOptions && fallbackOptions.length > 0) {
          finalOptions = fallbackOptions;
          const chosen = pickPreferredOption(fallbackOptions);
          setShippingOptions(fallbackOptions);
          setIsSimulated(true);
          setSelectedOptionId(chosen.id);
        } else {
          setShippingOptions(null);
          setErrorMessage('Não foi possível calcular o frete para este CEP no momento.');
        }
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      // Fallback em caso de erro inesperado
      try {
        const fallbackOptions = getFallbackShippingOptions(targetRawCep, payloadProducts);
        finalOptions = fallbackOptions || [];
        setShippingOptions(fallbackOptions);
        setIsSimulated(true);
        if (fallbackOptions.length > 0) {
          setSelectedOptionId(fallbackOptions[0].id);
        }
      } catch {
        setErrorMessage('Não foi possível calcular o frete. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }

    return { finalOptions, resolvedAddress };
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();

    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      setErrorMessage('Digite um CEP válido com 8 dígitos.');
      return;
    }

    const result = await executeCalculation(rawCep);
    const finalOptions = result?.finalOptions || [];
    const resolvedLocation = result?.resolvedAddress || addressInfo || 'Brasil';
    const bestOpt = finalOptions[0] || null;
    const bestCarrierName = bestOpt
      ? `${bestOpt.company?.name || 'Transportadora'}${bestOpt.name ? ` (${bestOpt.name})` : ''}`
      : '';
    const bestPrice = bestOpt?.price != null ? Number(bestOpt.price) : null;
    const bestDays = bestOpt?.delivery_time != null ? Number(bestOpt.delivery_time) : null;

    // Telemetria Comercial: Registra cálculo de frete (CEP consultado, cidade/UF, transportadora e equipamento) no Meta Pixel & GA4
    const formattedCep = `${rawCep.slice(0, 5)}-${rawCep.slice(5)}`;
    const prodId = String(product?.sku || product?.id || 'cart');
    const prodName = product?.name
      ? `${product.name} [${prodId}]`
      : (Array.isArray(items) && items.length > 0
          ? `Carrinho (${items.length} itens: ${items.map(i => i.name).slice(0, 2).join(', ')})`
          : 'Carrinho de Orçamento');

    const descFrete = `Calculou frete p/ CEP ${formattedCep} (${resolvedLocation}) no item: ${prodName}${bestCarrierName ? ` | Menor opção: ${bestCarrierName} R$ ${bestPrice?.toFixed(2) || '0.00'} (${bestDays || '?'} dias úteis)` : ''}`;

    const shippingPayload = {
      descricao: descFrete,
      shipping_cep: formattedCep,
      postal_code: formattedCep,
      shipping_location: resolvedLocation,
      destino_cidade_uf: resolvedLocation,
      shipping_carrier: bestCarrierName,
      shipping_price: bestPrice,
      delivery_days: bestDays,
      options_count: finalOptions.length,
      product_id: prodId,
      product_name: prodName,
      content_ids: [prodId],
      content_name: prodName,
      content_type: 'product',
      quantity: Number(quantity) || 1
    };

    trackMetaCustom('CalculateShipping', shippingPayload);

    // Também dispara o evento padrão 'FindLocation' ("Encontrar localização" no Gerenciador de Eventos da Meta)
    trackMetaEvent('FindLocation', shippingPayload);
  };

  // Se já houver um CEP salvo na sessão (ex: calculou na página do produto e abriu o carrinho), calcula automaticamente ao montar
  useEffect(() => {
    if (hasAutoCalculatedOnMount.current) return;
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length === 8) {
      hasAutoCalculatedOnMount.current = true;
      executeCalculation(rawCep);
    }
  }, []);

  // Recalcula automaticamente quando a quantidade ou itens do carrinho mudam e já existe uma cotação ativa
  const itemsSignature = Array.isArray(items)
    ? items.map(it => `${it.id}:${it.quantity}`).join('|')
    : `${product?.id || ''}:${quantity}`;

  useEffect(() => {
    if (!shippingOptions) return;
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length !== 8) return;

    const timer = setTimeout(() => {
      executeCalculation(rawCep);
    }, 350);

    return () => clearTimeout(timer);
  }, [itemsSignature]);

  const handleSelect = (option) => {
    setSelectedOptionId(option.id);
    try {
      sessionStorage.setItem(STORAGE_PREF_ID_KEY, String(option.id));
    } catch {}
  };

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className={`bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              Calcular Frete & Prazo de Entrega
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Cotação integrada com as melhores transportadoras do Brasil
            </p>
          </div>
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleCalculate} className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            maxLength={9}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-2xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading || cep.replace(/\D/g, '').length !== 8}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Calculando...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Calcular</span>
            </>
          )}
        </button>
      </form>

      {/* Links de auxílio */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Não sei meu CEP</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>

        {addressInfo && (
          <span className="text-slate-600 font-medium truncate max-w-[200px] sm:max-w-xs">
            📍 {addressInfo}
          </span>
        )}
      </div>

      {/* Erro */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resultados da Cotação */}
      {shippingOptions && shippingOptions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
            <span>Opções disponíveis para o seu CEP:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Seguro de Carga Incluso
            </span>
          </div>

          <div className="space-y-2">
            {shippingOptions.map((opt) => {
              const isSelected = String(selectedOptionId) === String(opt.id);
              const carrierName = opt.company?.name || 'Transportadora';
              const serviceName = opt.name;
              const deliveryDays = opt.delivery_time;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-400/50 shadow-2xs'
                      : 'bg-white hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          {carrierName} — {serviceName}
                        </span>
                        {opt.id === shippingOptions[0]?.id && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Mais Econômico
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-950 border border-amber-300">
                            ✓ Selecionado p/ Cotação
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Previsão de entrega: <strong className="text-slate-700">{deliveryDays} {deliveryDays === 1 ? 'dia útil' : 'dias úteis'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatBRL(opt.price)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      com rastreamento
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {isSimulated && (
            <p className="text-[10px] text-slate-400 text-center pt-1 italic">
              * Valores e prazos são estimativas de referência para o seu estado/região.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ShippingCalculator;
