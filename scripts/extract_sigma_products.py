import pymupdf as fitz
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def generate_slug(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def extract_all_sigma():
    doc = fitz.open("catalogos/CATÁLOGO SIGMA TOOLS - 2026 (2).pdf")
    os.makedirs("public/products/sigmatools", exist_ok=True)
    products = []
    seen_codes = set()
    
    # Iterate through content pages
    for p_idx in range(4, len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Category determination
        header = " ".join(lines[:8]).upper()
        if "ELEVAÇÃO" in header or "MACACO" in header:
            cat_id = "cat_elevadores"
        elif "PINTURA" in header or "POLITRIZ" in header or "ESTÉTICA" in header or "SNOW FOAM" in header or "HIGIENIZAÇÃO" in header:
            cat_id = "cat_ferramentas"
        elif "BORRACHARIA" in header or "DESTALONADOR" in header or "BALANCEAMENTO" in header:
            cat_id = "cat_desmontadoras"
        elif "DIAGNÓSTICO" in header or "BOROSCÓPIO" in header or "LANTERNA" in header:
            cat_id = "cat_scanners"
        else:
            cat_id = "cat_ferramentas"
            
        # Find all SGT / MXT / PWR / CAR codes on this page
        codes = re.findall(r'\b(SGT-[A-Z0-9\.\-]+|MXT-[A-Z0-9\.\-]+|PWR-[A-Z0-9\.\-]+|CAR-\d{2})\b', text, re.I)
        clean_codes = []
        for c in codes:
            c_up = c.upper()
            if len(c_up) >= 5 and not c_up.endswith('-') and not c_up.startswith('SGT-PRO') and c_up not in seen_codes:
                seen_codes.add(c_up)
                clean_codes.append(c_up)
                
        if not clean_codes:
            continue
            
        for code in clean_codes:
            # Build specs & desc from page lines
            specs = []
            desc_lines = []
            
            for l in lines:
                if ':' in l or 'rpm' in l.lower() or 'nm' in l.lower() or 'bar' in l.lower() or 'psi' in l.lower() or 'pcm' in l.lower() or 'kg' in l.lower() or 'pol' in l.lower() or '"' in l or 'w' in l.lower() or 'v' in l.lower():
                    if len(l) > 3 and len(l) < 90 and not l.startswith('WWW') and not l.startswith('PAG') and not l.startswith('CÓD'):
                        specs.append(l.replace('•', '').replace('-', '').strip())
                elif len(l) > 20 and not l.startswith('WWW') and not l.startswith('SIGMA'):
                    desc_lines.append(l)
                    
            if not specs:
                specs = [
                    f"Modelo: {code}",
                    "Fabricante: Sigma Tools Linha Profissional & Industrial",
                    "Garantia: 6 meses oficial de fábrica com assistência técnica em todo o Brasil",
                    "Aplicação: Alta performance para oficinas e centros automotivos"
                ]
            else:
                specs = specs[:8]
                specs.append(f"Código do Produto: {code}")
                specs.append("Garantia: 6 meses oficial de fábrica")
                
            clean_desc = " ".join(desc_lines[:3]) if desc_lines else f"Ferramenta profissional e equipamento industrial modelo {code} Sigma Tools."
            
            # Formulate Title
            title = f"Ferramenta {code} Sigma Tools"
            for l in lines[:6]:
                if any(k in l.upper() for k in ["CHAVE DE IMPACTO", "PISTOLA", "POLITRIZ", "LIXADEIRA", "ESMERILHADEIRA", "FURADEIRA", "PARAFUSADEIRA", "MACACO", "TORNADOR", "SNOW FOAM", "LANTERNA", "SOPRADOR", "AIRLESS", "CALAFETADOR", "TALHA", "BALANCIM"]):
                    title = f"{l.title()} {code} Sigma Tools"
                    break
                    
            slug_code = generate_slug(code)
            img_file = f"public/products/sigmatools/{slug_code}.jpg"
            
            if not os.path.exists(img_file):
                try:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                    pix.save(img_file)
                    pub_img = f"/products/sigmatools/{slug_code}.jpg"
                except Exception:
                    pub_img = "/products/sigmatools/sigma_sgt_0528_impacto_main.jpg"
            else:
                pub_img = f"/products/sigmatools/{slug_code}.jpg"
                
            products.append({
                "id": f"prod_sigma_{slug_code}",
                "name": title,
                "slug": generate_slug(title),
                "categoryId": cat_id,
                "brandId": "brand_sigmatools",
                "price": 0,
                "priceNegotiable": True,
                "badge": "Sigma Pro",
                "status": "published",
                "isFeatured": True if any(k in code for k in ["0528A", "7502", "3010A", "5116", "6001", "2025", "3040", "8501"]) else False,
                "image": pub_img,
                "images": [pub_img],
                "altText": f"{title} Athena Soluções Automotivas",
                "description": clean_desc,
                "specs": specs,
                "attachments": [],
                "inStock": True
            })

    print(f"Extracted {len(products)} products from Sigma Tools.")
    return products

if __name__ == '__main__':
    prods = extract_all_sigma()
    with open("scripts/sigma_extracted.json", "w", encoding="utf-8") as f:
        json.dump(prods, f, ensure_ascii=False, indent=2)
    print("Saved to scripts/sigma_extracted.json")
