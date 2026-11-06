import pymupdf as fitz
from PIL import Image
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def generate_slug(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def ensure_dirs():
    for d in [
        'public/products/mahovi', 
        'public/products/delta', 
        'public/products/wolfcar', 
        'public/products/starkx', 
        'public/products/sigmatools'
    ]:
        os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# 1. WOLFCAR PRODUCTS
# -------------------------------------------------------------
def get_wolfcar_products(doc):
    items = [
        {
            "code": "W1058",
            "name": "Conjunto Modular de Armários de Oficina 4915mm Wolfcar W1058",
            "cat": "cat_ferramentas",
            "badge": "Linha Pesada",
            "desc": "Conjunto modular completo para organização profissional de oficinas e concessionárias. Com 4915mm de comprimento, conta com armários verticais duplos, 5 módulos inferiores, 4 armários aéreos e painéis perfurados em chapa 0.8mm com pintura epóxi.",
            "specs": [
                "Comprimento Total: 4.915 mm",
                "Altura Total: 2.000 mm",
                "Espessura da Chapa: 0.8 mm reforçada",
                "Opções de Tampo: Aço Inoxidável ou Madeira Naval",
                "Módulos: 2 Armários verticais, 5 módulos inferiores, 4 aéreos e 4 painéis",
                "Pintura: Eletrostática a pó anticorrosiva"
            ],
            "page": 4
        },
        {
            "code": "W1059",
            "name": "Conjunto Modular com Lixeira Embutida 4235mm Wolfcar W1059",
            "cat": "cat_ferramentas",
            "badge": "Mais Vendido",
            "desc": "Conjunto modular para centros automotivos com 4235mm de extensão. Inclui módulo inferior com lixeira basculante integrada para descarte limpo, gavetas telescópicas e armários aéreos com pistões a gás.",
            "specs": [
                "Comprimento Total: 4.235 mm",
                "Altura Total: 2.000 mm",
                "Espessura da Chapa: 0.8 mm",
                "Módulo de Lixeira: Basculante integrado",
                "Gavetas: Trilhos telescópicos com travas de segurança",
                "Tampo: Aço Inoxidável 304 ou Madeira Tratada"
            ],
            "page": 4
        },
        {
            "code": "W1081",
            "name": "Conjunto Modular com 3 Painéis de Ferramentas 2955mm Wolfcar W1081",
            "cat": "cat_ferramentas",
            "badge": "Alta Produtividade",
            "desc": "Conjunto modular versátil de 2955mm de largura, equipado com 3 painéis de ferramentas perfurados, 3 armários aéreos e armário vertical lateral para ferramentas pesadas.",
            "specs": [
                "Comprimento Total: 2.955 mm",
                "Altura Total: 2.000 mm",
                "Painéis Perfurados: 3 módulos para ganchos e suportes",
                "Armários Aéreos: 3 módulos superiores com amortecedores",
                "Espessura da Chapa: 0.8 mm industrial"
            ],
            "page": 5
        },
        {
            "code": "W1082",
            "name": "Conjunto Modular com Carrinho Móvel de 5 Gavetas 2640mm Wolfcar W1082",
            "cat": "cat_ferramentas",
            "badge": "Praticidade",
            "desc": "Conjunto modular de 2640mm com carrinho móvel embutido de 5 gavetas com rodízios reforçados e trava, permitindo levar ferramentas diretamente ao elevador no box.",
            "specs": [
                "Comprimento Total: 2.640 mm",
                "Altura Total: 2.000 mm",
                "Carrinho Móvel: Embutido sob bancada com 5 gavetas e rodízios",
                "Estrutura: Aço carbono 0.8mm de alta resistência",
                "Tampo: Madeira Naval ou Aço Inoxidável"
            ],
            "page": 5
        },
        {
            "code": "W1068",
            "name": "Armário Modular de Canto 90 Graus com Painel Wolfcar W1068",
            "cat": "cat_ferramentas",
            "badge": "Aproveitamento",
            "desc": "Módulo de canto para união em 'L' de bancadas modulares Wolfcar. Permite o aproveitamento de 100% das esquinas da oficina com painel de ferramentas e armário aéreo de canto.",
            "specs": [
                "Dimensões do Produto: 810 x 810 x 2.000 mm",
                "Peso Líquido: 37 kg",
                "Aplicação: União em 90 graus de bancadas e armários modulares",
                "Estrutura: Chapa de aço tratada com pintura epóxi"
            ],
            "page": 6
        },
        {
            "code": "W1083",
            "name": "Módulo Inferior com Lixeira e Gaveta Wolfcar W1083",
            "cat": "cat_ferramentas",
            "badge": "Organização",
            "desc": "Módulo inferior para integração em bancadas Wolfcar, equipado com gaveta superior para consumíveis e compartimento basculante com lixeira integrada para descarte limpo de panos e peças usadas.",
            "specs": [
                "Dimensões: 680 x 460 x 910 mm",
                "Compartimento: Lixeira basculante integrada",
                "Gaveta: 1 gaveta superior reforçada",
                "Pintura: Eletrostática a pó anticorrosiva"
            ],
            "page": 6
        },
        {
            "code": "W1067",
            "name": "Módulo com Cuba e Pia Integrada em Aço Inox Wolfcar W1067",
            "cat": "cat_ferramentas",
            "badge": "Higiene",
            "desc": "Módulo com pia em aço inoxidável e gabinete inferior de duas portas. Perfeito para higienização rápida de peças e mãos no ambiente de trabalho sem sair do box da oficina.",
            "specs": [
                "Dimensões: 680 x 460 x 910 mm",
                "Tampo: Aço Inoxidável 304 com cuba estampada",
                "Gabinete: 2 portas com prateleira interna",
                "Compatibilidade: 100% alinhado com a linha Wolfcar"
            ],
            "page": 6
        },
        {
            "code": "W1071",
            "name": "Armário Vertical de 2 Portas 915mm Wolfcar W1071",
            "cat": "cat_ferramentas",
            "badge": "Armazenamento",
            "desc": "Armário vertical alto de 2 portas com 4 prateleiras internas reforçadas e reguláveis, pés ajustáveis para pisos irregulares e fechadura central com chave.",
            "specs": [
                "Dimensões do Produto: 915 x 460 x 2.000 mm",
                "Peso Líquido: 80 kg",
                "Portas: 2 portas de abrir com reforço interno",
                "Prateleiras: 4 prateleiras reguláveis de alta capacidade",
                "Pés: Niveladores reguláveis em altura"
            ],
            "page": 7
        },
        {
            "code": "W1076",
            "name": "Armário Vertical Compacto de 1 Porta 600mm Wolfcar W1076",
            "cat": "cat_ferramentas",
            "badge": "Compacto",
            "desc": "Armário vertical estreito ideal para fechamento lateral de bancadas ou boxes de espaço reduzido. Conta com 4 prateleiras internas reforçadas e porta com trava com chave.",
            "specs": [
                "Dimensões do Produto: 600 x 460 x 2.000 mm",
                "Peso Líquido: 55 kg",
                "Porta: 1 porta com abertura reversível",
                "Prateleiras: Prateleiras internas com ajuste de altura",
                "Estrutura: Aço reforçado de 0.8mm"
            ],
            "page": 7
        }
    ]

    products = []
    for it in items:
        slug = generate_slug(it["name"])
        img_file = f"public/products/wolfcar/{generate_slug(it['code'])}.jpg"
        if doc and it["page"] <= len(doc):
            try:
                page = doc[it["page"] - 1]
                pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                pix.save(img_file)
                pub_img = f"/products/wolfcar/{generate_slug(it['code'])}.jpg"
            except Exception:
                pub_img = "/products/wolfcar/wolfcar_armarios_main.jpg"
        else:
            pub_img = "/products/wolfcar/wolfcar_armarios_main.jpg"

        products.append({
            "id": f"prod_wolfcar_{generate_slug(it['code'])}",
            "name": it["name"],
            "slug": slug,
            "categoryId": it["cat"],
            "brandId": "brand_wolfcar",
            "price": 0,
            "priceNegotiable": True,
            "badge": it["badge"],
            "status": "published",
            "isFeatured": True if "W1058" in it["code"] or "W1081" in it["code"] else False,
            "image": pub_img,
            "images": [pub_img],
            "altText": f"{it['name']} Athena Soluções Automotivas",
            "description": it["desc"],
            "specs": it["specs"],
            "attachments": [],
            "inStock": True
        })
    return products

# -------------------------------------------------------------
# 2. STÄRKX & THINKCAR PRODUCTS
# -------------------------------------------------------------
def get_starkx_products(doc):
    items = [
        {
            "code": "SKX-018",
            "name": "Auxiliar de Partida Portátil 10.000mAh 12V/6V Stärkx SKX-018",
            "cat": "cat_ferramentas",
            "badge": "Emergência",
            "desc": "Auxiliar de partida compacto de alta potência para veículos 12V e 6V. Bateria de lítio de 10.000mAh, lanterna LED integrada de emergência e portas USB para carregamento rápido de dispositivos.",
            "specs": [
                "Capacidade da Bateria: 10.000 mAh",
                "Tensão de Saída: 12V / 6V Automotivo",
                "Entrada de Carga: 5V-2A / 9V-2A / 14V-1A",
                "Portas USB: 5V-3A com carga rápida",
                "Temperatura de Operação: -30°C a 65°C",
                "Proteções: Contra inversão de polaridade, curto-circuito e sobrecarga"
            ],
            "page": 3
        },
        {
            "code": "SKX-028",
            "name": "Testador Digital de Baterias 12V/24V com Impressora Térmica Stärkx SKX-028",
            "cat": "cat_scanners",
            "badge": "Diagnóstico",
            "desc": "Testador de baterias digital profissional com impressora térmica embutida. Analisa estado de saúde (SOH), estado de carga (SOC), corrente de partida a frio (CCA), sistema de partida e alternador com laudo para o cliente.",
            "specs": [
                "Tensão de Teste: 12V e 24V (Baterias de 30 a 200 Ah)",
                "Display: LCD gráfico 128x64 iluminado",
                "Impressora: Térmica integrada para laudo instantâneo",
                "Normas Suportadas: CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB",
                "Faixa de CCA: 100 a 2.000 CCA",
                "Idioma: Português"
            ],
            "page": 5
        },
        {
            "code": "SKX-038",
            "name": "Carregador Inteligente de Baterias 12V/24V Sistema PWM Stärkx SKX-038",
            "cat": "cat_ferramentas",
            "badge": "Inteligente",
            "desc": "Carregador de baterias com microprocessador e modulação por largura de pulso (PWM). Aumenta a taxa de absorção da bateria sem estufamento e recupera baterias com leve sulfatação.",
            "specs": [
                "Tensão de Aplicação: 12V e 24V automático",
                "Tecnologia de Carga: Sistema Inteligente PWM multi-estágios",
                "Proteções: Curto-circuito, superaquecimento, inversão de polaridade e subtensão",
                "Construção: Compacto, portátil e de alta eficiência energética"
            ],
            "page": 7
        },
        {
            "code": "SKX-088",
            "name": "Detector de Continuidade e Rastreador de Fios e Chicotes Stärkx SKX-088",
            "cat": "cat_scanners",
            "badge": "Elétrica",
            "desc": "Kit profissional composto por Transmissor e Receptor para rastreamento de condutores simples e pares em chicotes elétricos automotivos complexos sem danificar o isolamento dos cabos.",
            "specs": [
                "Funções: Rastreia cabos, detecta curto-circuito e testa continuidade",
                "Componentes: Transmissor SKX-088 + Receptor SKX-088 com controle de sensibilidade",
                "Acessórios: Fone de ouvido para ambientes ruidosos e pontas de prova",
                "Alimentação: Baterias 9V inclusas"
            ],
            "page": 9
        },
        {
            "code": "SKX-108",
            "name": "Câmera de Inspeção Endoscópica Dupla Lente Tela 4.3\" Stärkx SKX-108",
            "cat": "cat_scanners",
            "badge": "Alta Resolução",
            "desc": "Videoscópio automotivo de alta resolução com câmera frontal e lateral simultâneas, iluminação LED ajustável e sonda semi-rígida à prova d'água para inspeção interna de cilindros, válvulas, câmbios e evaporadores.",
            "specs": [
                "Tela: LCD colorido de 4,3 polegadas HD",
                "Câmeras: Lente Frontal + Lente Lateral (visão simultânea ou individual)",
                "Iluminação: LEDs ultra-brilhantes com 3 níveis de intensidade",
                "Sonda: Flexível com proteção IP67 à prova d'água e óleo",
                "Recursos: Foto e gravação de vídeo em alta definição com cartão micro SD"
            ],
            "page": 11
        },
        {
            "code": "SKX-208",
            "name": "Analisador Eletrônico de Fluido de Freio DOT 3/4/5.1 Stärkx SKX-208",
            "cat": "cat_ferramentas",
            "badge": "Segurança",
            "desc": "Instrumento digital de alta precisão para medição do percentual de umidade em fluidos de freio sintéticos, garantindo a segurança do sistema de frenagem do veículo.",
            "specs": [
                "Fluidos Testados: DOT 3, DOT 4, DOT 5.1",
                "Sonda: Flexível de aço inox de alta sensibilidade",
                "Indicação: Display digital com escala percentual de água e alarme sonoro",
                "Alimentação: Bateria recarregável com desligamento automático"
            ],
            "page": 13
        },
        {
            "code": "VENU-90",
            "name": "Programador e Ativador de Sensores TPMS Thinkcar VENU 90",
            "cat": "cat_scanners",
            "badge": "TPMS Pro",
            "desc": "Ferramenta profissional especializada para diagnóstico, leitura de status, ativação e programação de sensores de pressão de pneus (TPMS) para veículos nacionais e importados.",
            "specs": [
                "Funções: Leitura de ID, pressão, temperatura, bateria do sensor e reaprendizado na ECU",
                "Programação: Ilimitada de sensores universais Thinkcar VENU 5",
                "Frequências: Suporta Dual Band 315 MHz e 433 MHz",
                "Atualizações: Wi-Fi integrado com atualizações de software gratuitas"
            ],
            "page": 15
        },
        {
            "code": "VENU-5",
            "name": "Sensor Universal de Pressão de Pneus TPMS Dual 315/433MHz Thinkcar VENU 5",
            "cat": "cat_ferramentas",
            "badge": "Universal",
            "desc": "Sensor TPMS universal programável de dupla frequência compatível com mais de 98% dos veículos equipados com TPMS de fábrica no mundo.",
            "specs": [
                "Frequência: Dual 315 MHz e 433 MHz no mesmo sensor",
                "Opções de Válvula: Válvula de Metal em alumínio ou Válvula de Borracha flexível",
                "Vida Útil da Bateria: Mais de 5 anos de durabilidade contínua",
                "Pressão Máxima: 900 kPa (130 PSI)"
            ],
            "page": 17
        },
        {
            "code": "THINKTOOL-LITE",
            "name": "Scanner Automotivo Multimarcas Thinkcar THINKTOOL LITE",
            "cat": "cat_scanners",
            "badge": "Lançamento",
            "desc": "Scanner de diagnóstico completo para linha leve, utilitários, híbridos e elétricos. Realiza diagnóstico completo de todos os sistemas, testes de atuadores, ajustes, programações e mais de 28 funções de reset.",
            "specs": [
                "Display: Touchscreen HD de 6 polegadas",
                "Conectividade: VCI Bluetooth sem fio de longo alcance",
                "Cobertura: Veículos Ciclo Otto, Diesel Leve, Híbridos e 100% Elétricos",
                "Funções Especiais: 28+ resets (óleo, SAS, freio elétrico, BMS, DPF, TPMS, sangria ABS, etc.)",
                "Suporte Remoto: TeamViewer integrado de fábrica",
                "Atualizações: 2 anos de atualizações online inclusas"
            ],
            "page": 19
        },
        {
            "code": "PLATINUM-S10-PRO",
            "name": "Scanner Automotivo Avançado J2534 com Topologia Thinkcar PLATINUM S10 PRO",
            "cat": "cat_scanners",
            "badge": "Topo de Linha",
            "desc": "O scanner topo de linha com interface J2534 PassThru, display de 10 polegadas e Topologia de Redes colorida. Suporta protocolos CAN-FD, DoIP e programação online de ECUs.",
            "specs": [
                "Display: 10 polegadas IPS Touchscreen de alta resolução",
                "Sistema & Hardware: Android 10, processador 8-Core, 4GB RAM + 64GB ROM",
                "Topologia de Rede: Mapeamento gráfico colorido de todos os módulos do veículo",
                "Protocolos Avançados: J2534 PassThru, CAN-FD, DoIP, ISO 14229",
                "Programação Online: Codificação e parametrização de módulos avançados",
                "Câmera: 13 MP traseira para laudos fotográficos",
                "Bateria: 6.000 mAh com alta autonomia"
            ],
            "page": 21
        }
    ]

    products = []
    for it in items:
        slug = generate_slug(it["name"])
        img_file = f"public/products/starkx/{generate_slug(it['code'])}.jpg"
        if doc and it["page"] <= len(doc):
            try:
                page = doc[it["page"] - 1]
                pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                pix.save(img_file)
                pub_img = f"/products/starkx/{generate_slug(it['code'])}.jpg"
            except Exception:
                pub_img = "/products/starkx/starkx_default.jpg"
        else:
            pub_img = "/products/starkx/starkx_default.jpg"

        products.append({
            "id": f"prod_starkx_{generate_slug(it['code'])}",
            "name": it["name"],
            "slug": slug,
            "categoryId": it["cat"],
            "brandId": "brand_starkx",
            "price": 0,
            "priceNegotiable": True,
            "badge": it["badge"],
            "status": "published",
            "isFeatured": True if "PLATINUM" in it["name"] or "THINKTOOL" in it["name"] or "SKX-028" in it["name"] else False,
            "image": pub_img,
            "images": [pub_img],
            "altText": f"{it['name']} Athena Soluções Automotivas",
            "description": it["desc"],
            "specs": it["specs"],
            "attachments": [],
            "inStock": True
        })
    return products

if __name__ == '__main__':
    ensure_dirs()
    w_doc = fitz.open("catalogos/Catálogo Wolfcar Armários-2.pdf")
    s_doc = fitz.open("catalogos/Portfolio_Digital_Stärkx.pdf")
    print(f"Wolfcar: {len(get_wolfcar_products(w_doc))}")
    print(f"Starkx: {len(get_starkx_products(s_doc))}")
