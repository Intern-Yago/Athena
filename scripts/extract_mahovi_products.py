import pymupdf as fitz
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def generate_slug(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def extract_all_mahovi():
    doc = fitz.open("catalogos/Catálogo de Equipamentos Mahovi 2025 (6).pdf")
    os.makedirs("public/products/mahovi", exist_ok=True)
    products = []
    
    # Iterate through content pages
    for p_idx in range(6, len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Category determination
        header = " ".join(lines[:8]).upper()
        if "ELEVADOR" in header or "PÓRTICO" in header or "PANTOGRÁFICO" in header or "BASE INFERIOR" in header or "DUPLICADOR" in header:
            cat_id = "cat_elevadores"
        elif "ALINHADOR" in header:
            cat_id = "cat_alinhadores"
        elif "DESMONTADORA" in header or "BALANCEADORA" in header:
            cat_id = "cat_desmontadoras"
        elif "INJETOR" in header or "DIAGNÓSTICO" in header:
            cat_id = "cat_scanners"
        else:
            cat_id = "cat_ferramentas"
            
        # Find codes
        codes = re.findall(r'\b(MAH-[A-Z0-9\-]+|WAL-[A-Z0-9\-]+)\b', text, re.I)
        codes = list(dict.fromkeys([c.upper() for c in codes if len(c) >= 6 and not c.endswith('-')]))
        
        if not codes:
            continue
            
        for code in codes:
            # Build specs & desc
            specs = []
            desc_lines = []
            
            # Find technical data on page
            for l in lines:
                if ':' in l or 'kg' in l.lower() or 'mm' in l.lower() or 'bar' in l.lower() or '220v' in l.lower() or '380v' in l.lower():
                    if len(l) > 3 and len(l) < 90 and not l.startswith('WWW') and not l.startswith('PAG'):
                        specs.append(l.replace('•', '').replace('-', '').strip())
                elif len(l) > 20 and not l.startswith('WWW') and not l.startswith('MAHOVI'):
                    desc_lines.append(l)
                    
            if not specs:
                specs = [
                    f"Modelo: {code}",
                    "Fabricante: Mahovi Equipamentos Automotivos",
                    "Garantia: 12 meses de fábrica com suporte técnico nacional",
                    "Certificação: Homologado para centros automotivos e concessionárias"
                ]
            else:
                specs = specs[:8]
                specs.append(f"Código do Produto: {code}")
                specs.append("Garantia: 12 meses oficial Mahovi")
                
            clean_desc = " ".join(desc_lines[:3]) if desc_lines else f"Equipamento de alta performance para oficina mecânica e centro automotivo modelo {code} Mahovi."
            
            # Formulate Title
            title = f"Equipamento {code} Mahovi"
            for l in lines[:6]:
                if any(k in l.upper() for k in ["ELEVADOR", "RAMPA", "DESMONTADORA", "BALANCEADORA", "ALINHADOR", "RECICLADORA", "SANGRADOR", "COLETOR", "EXTRATOR", "MÁQUINA", "DUPLICADOR"]):
                    title = f"{l.title()} {code} Mahovi"
                    break
                    
            slug_code = generate_slug(code)
            img_file = f"public/products/mahovi/{slug_code}.jpg"
            
            if not os.path.exists(img_file):
                try:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                    pix.save(img_file)
                    pub_img = f"/products/mahovi/{slug_code}.jpg"
                except Exception:
                    pub_img = "/products/mahovi/mah_1006_portico_main.jpg"
            else:
                pub_img = f"/products/mahovi/{slug_code}.jpg"
                
            products.append({
                "id": f"prod_mahovi_{slug_code}",
                "name": title,
                "slug": generate_slug(title),
                "categoryId": cat_id,
                "brandId": "brand_mahovi",
                "price": 0,
                "priceNegotiable": True,
                "badge": "Mahovi Pro",
                "status": "published",
                "isFeatured": True if any(k in code for k in ["1020", "1006", "3D1", "5001", "6001", "2001", "4001"]) else False,
                "image": pub_img,
                "images": [pub_img],
                "altText": f"{title} Athena Soluções Automotivas",
                "description": clean_desc,
                "specs": specs,
                "attachments": [],
                "inStock": True
            })

    print(f"Extracted {len(products)} products from Mahovi.")
    return products

if __name__ == '__main__':
    prods = extract_all_mahovi()
    with open("scripts/mahovi_extracted.json", "w", encoding="utf-8") as f:
        json.dump(prods, f, ensure_ascii=False, indent=2)
    print("Saved to scripts/mahovi_extracted.json")
