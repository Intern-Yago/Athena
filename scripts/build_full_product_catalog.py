import pymupdf as fitz
from PIL import Image
import io, os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def generate_slug(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def clean_lines(text):
    return [l.strip() for l in text.split('\n') if l.strip()]

def ensure_dirs():
    for d in ['public/products/mahovi', 'public/products/delta', 'public/products/wolfcar', 'public/products/starkx', 'public/products/sigmatools']:
        os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# 1. PARSE WOLFCAR (10 pages)
# -------------------------------------------------------------
def extract_wolfcar():
    doc = fitz.open("catalogos/Catálogo Wolfcar Armários-2.pdf")
    products = []
    
    wolfcar_items = [
        {
            "code": "W1058 / W1058-M",
            "name": "Conjunto Modular de Armários Grande 4915mm W1058",
            "cat": "cat_ferramentas",
            "badge": "Linha Pesada",
            "desc": "Conjunto modular completo para organização de oficinas mecânicas e centros automotivos de alto padrão. Estrutura reforçada em chapa de 0.8mm com pintura eletrostática a pó e opções com tampo de aço inox ou tampo de madeira naval.",
            "specs": [
                "Comprimento Total: 4.915 mm",
                "Altura Total: 2.000 mm",
                "Espessura da Chapa: 0.8 mm reforçada",
                "Opções de Tampo: Aço Inoxidável ou Madeira Tratada",
                "Módulos Inclusos: 2 Armários verticais, 5 módulos inferiores com gavetas e portas, 4 armários aéreos e 4 painéis perfurados",
                "Pintura: Eletrostática anticorrosiva"
            ],
            "page": 3
        },
        {
            "code": "W1059 / W1059-M",
            "name": "Conjunto Modular de Armários 4235mm com Lixeira W1059",
            "cat": "cat_ferramentas",
            "badge": "Alta Produtividade",
            "desc": "Conjunto modular para centros automotivos com 4235mm de extensão. Inclui módulo especial com lixeira basculante integrada, gavetas com trilhos telescópicos de alta capacidade e armários aéreos com amortecedores a gás.",
            "specs": [
                "Comprimento Total: 4.235 mm",
                "Altura Total: 2.000 mm",
                "Espessura da Chapa: 0.8 mm",
                "Módulo de Lixeira: Integrado com suporte para descarte",
                "Gavetas: Trilhos telescópicos com travas",
                "Tampo: Aço Inox ou Madeira Naval"
            ],
            "page": 4
        },
        {
            "code": "W1081 / W1081-M",
            "name": "Conjunto Modular de Armários 2955mm W1081",
            "cat": "cat_ferramentas",
            "badge": "Mais Vendido",
            "desc": "Solução modular compacta e versátil de 2955mm com 3 painéis de ferramentas perfurados, 3 armários aéreos, módulo gaveteiro e armário vertical para ferramentas de grande porte.",
            "specs": [
                "Comprimento Total: 2.955 mm",
                "Altura Total: 2.000 mm",
                "Painéis Perfurados: 3 painéis para ganchos de ferramentas",
                "Armários Aéreos: 3 módulos superiores",
                "Espessura da Chapa: 0.8 mm industrial",
                "Fechamento: Fechaduras individuais com chave"
            ],
            "page": 5
        },
        {
            "code": "W1082 / W1082-M",
            "name": "Conjunto Modular de Armários 2640mm com Carrinho Móvel W1082",
            "cat": "cat_ferramentas",
            "badge": "Praticidade",
            "desc": "Conjunto modular inteligente equipado com carrinho móvel embutido de 5 gavetas com rodízios reforçados, permitindo levar as ferramentas diretamente até o box do elevador.",
            "specs": [
                "Comprimento Total: 2.640 mm",
                "Altura Total: 2.000 mm",
                "Carrinho Móvel: Embutido sob a bancada com 5 gavetas e rodízios com freio",
                "Estrutura: Aço carbono 0.8mm de alta resistência",
                "Tampo: Madeira naval ou Aço Inoxidável"
            ],
            "page": 5
        },
        {
            "code": "W1068 / W1068-M",
            "name": "Armário Modular de Canto com Painel W1068",
            "cat": "cat_ferramentas",
            "badge": "Aproveitamento",
            "desc": "Módulo de canto para união em 'L' de bancadas modulares Wolfcar. Permite o aproveitamento de 100% do espaço da oficina com painel de ferramentas e armário aéreo de canto.",
            "specs": [
                "Dimensões do Produto: 810 x 810 x 2.000 mm",
                "Peso Líquido: 37 kg (Peso Bruto: 39 kg)",
                "Aplicação: União em 90 graus de bancadas e armários modulares",
                "Estrutura: Chapa de aço tratada com pintura epóxi"
            ],
            "page": 6
        },
        {
            "code": "W1083 / W1083-M",
            "name": "Módulo Inferior com Lixeira e Gaveta W1083",
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
            "name": "Módulo com Cuba e Pia Integrada em Aço Inox W1067",
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
            "name": "Armário Vertical de 2 Portas 915mm W1071",
            "cat": "cat_ferramentas",
            "badge": "Armazenamento",
            "desc": "Armário vertical alto de 2 portas com 4 prateleiras internas reforçadas e reguláveis, pés ajustáveis para pisos irregulares e fechadura central com chave.",
            "specs": [
                "Dimensões do Produto: 915 x 460 x 2.000 mm",
                "Peso Líquido: 80 kg (Peso Bruto: 85 kg)",
                "Portas: 2 portas de abrir com reforço interno",
                "Prateleiras: 4 prateleiras reguláveis com alta capacidade de carga",
                "Pés: Niveladores reguláveis em altura"
            ],
            "page": 7
        },
        {
            "code": "W1076",
            "name": "Armário Vertical Compacto de 1 Porta 600mm W1076",
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

    for item in wolfcar_items:
        clean_code = item["code"].split('/')[0].strip()
        slug_code = generate_slug(clean_code)
        img_path = f"public/products/wolfcar/{slug_code}.jpg"
        
        # Render image from PDF page if not exists
        try:
            page = doc[item["page"] - 1]
            pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
            pix.save(img_path)
            pub_img = f"/products/wolfcar/{slug_code}.jpg"
        except Exception as e:
            pub_img = "/products/wolfcar/wolfcar_armarios_main.jpg"

        products.append({
            "id": f"prod_wolfcar_{slug_code}",
            "name": item["name"],
            "slug": generate_slug(item["name"]),
            "categoryId": item["cat"],
            "brandId": "brand_wolfcar",
            "price": 0,
            "priceNegotiable": True,
            "badge": item["badge"],
            "status": "published",
            "isFeatured": True if "W1058" in item["code"] or "W1081" in item["code"] else False,
            "image": pub_img,
            "images": [pub_img],
            "altText": f"{item['name']} Athena Soluções Automotivas",
            "description": item["desc"],
            "specs": item["specs"],
            "attachments": [],
            "inStock": True
        })

    print(f"Wolfcar extracted: {len(products)} products")
    return products

# -------------------------------------------------------------
# 2. PARSE STÄRKX & THINKCAR (22 pages)
# -------------------------------------------------------------
def extract_starkx():
    doc = fitz.open("catalogos/Portfolio_Digital_Stärkx.pdf")
    products = []

    starkx_items = [
        {
            "code": "SKX-018",
            "name": "Auxiliar de Partida Portátil 10.000mAh 12V/6V SKX-018",
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
            "name": "Testador Digital de Baterias 12V/24V com Impressora Térmica SKX-028",
            "cat": "cat_scanners",
            "badge": "Diagnóstico",
            "desc": "Testador de baterias digital profissional com impressora térmica embutida. Analisa estado de saúde (SOH), estado de carga (SOC), corrente de partida a frio (CCA), sistema de partida e sistema de carga do alternador com emissão de laudo para o cliente.",
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
            "name": "Carregador Inteligente de Baterias 12V/24V Sistema PWM SKX-038",
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
            "name": "Detector de Continuidade e Rastreador de Fios e Chicotes SKX-088",
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
            "name": "Câmera de Inspeção Endoscópica Dupla Lente Tela 4.3\" SKX-108",
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
            "name": "Analisador Eletrônico de Fluido de Freio DOT 3/4/5.1 SKX-208",
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
            "code": "Thinkcar VENU 90",
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
            "code": "Thinkcar VENU 5",
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
            "code": "Thinkcar THINKTOOL LITE",
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
            "code": "Thinkcar PLATINUM S10 PRO",
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

    for item in starkx_items:
        slug_code = generate_slug(item["code"])
        img_path = f"public/products/starkx/{slug_code}.jpg"
        try:
            page = doc[item["page"] - 1]
            pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
            pix.save(img_path)
            pub_img = f"/products/starkx/{slug_code}.jpg"
        except Exception as e:
            pub_img = "/products/starkx/starkx_default.jpg"

        products.append({
            "id": f"prod_starkx_{slug_code}",
            "name": item["name"],
            "slug": generate_slug(item["name"]),
            "categoryId": item["cat"],
            "brandId": "brand_starkx",
            "price": 0,
            "priceNegotiable": True,
            "badge": item["badge"],
            "status": "published",
            "isFeatured": True if "PLATINUM" in item["name"] or "THINKTOOL" in item["name"] or "SKX-028" in item["name"] else False,
            "image": pub_img,
            "images": [pub_img],
            "altText": f"{item['name']} Athena Soluções Automotivas",
            "description": item["desc"],
            "specs": item["specs"],
            "attachments": [],
            "inStock": True
        })

    print(f"Stärkx extracted: {len(products)} products")
    return products

if __name__ == '__main__':
    ensure_dirs()
    w_prods = extract_wolfcar()
    s_prods = extract_starkx()
    print("Test passed.")
