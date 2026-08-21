import pymupdf as fitz
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def generate_slug(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def extract_all_delta():
    doc = fitz.open("catalogos/CATALOGO DELTA.pdf")
    os.makedirs("public/products/delta", exist_ok=True)
    products = []
    
    # Delta Page by page extraction
    # We iterate pages 3 to 36 (index 2 to 35)
    for p_idx in range(2, len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Categorize
        header_text = " ".join(lines[:6]).upper()
        if "INJEÇÃO" in header_text or "ELÉTRICA" in header_text:
            cat_id = "cat_scanners"
        elif "AR CONDICIONADO" in header_text:
            cat_id = "cat_ferramentas"
        else:
            cat_id = "cat_ferramentas"
            
        # Find product code markers
        # Patterns: DT-XXXX, ALIXX, SACXX, JEP-XX, CAN-XX, FRA-XX, SGF-XX
        code_matches = re.findall(r'\b(DT-[A-Z0-9\.\-]+|ALI\d{2}|SAC\d{2}|JEP-\d{2}|CAN-\d{2}|FRA-\d{2}|DT-SGF[\w\.]*)\b', text)
        code_matches = list(dict.fromkeys([c for c in code_matches if not c.startswith('PAG') and not c.startswith('CAT') and len(c) >= 4]))
        
        # Extract blocks
        for code in code_matches:
            # Find title following code in lines
            title = code
            desc_lines = []
            specs = []
            
            found_idx = -1
            for i, l in enumerate(lines):
                if code in l:
                    found_idx = i
                    break
                    
            if found_idx != -1:
                # Next line is usually product title
                if found_idx + 1 < len(lines):
                    next_line = lines[found_idx + 1]
                    if not re.match(r'^(DT-|ALI|SAC|JEP|CAN|FRA|@)', next_line):
                        title = f"{next_line} ({code})"
                        # Subsequent lines are description / specs
                        for j in range(found_idx + 2, min(found_idx + 8, len(lines))):
                            cand = lines[j]
                            if re.match(r'^(DT-|ALI|SAC|JEP|CAN|FRA|@|As características)', cand):
                                break
                            if cand.startswith('-') or cand.startswith('•') or ':' in cand:
                                clean_s = cand.replace('-', '').replace('•', '').strip()
                                if len(clean_s) > 3:
                                    specs.append(clean_s)
                            else:
                                if len(cand) > 10:
                                    desc_lines.append(cand)
            
            clean_desc = " ".join(desc_lines) if desc_lines else f"Equipamento e ferramenta profissional para centro automotivo Delta Ferramentas modelo {code}."
            if not specs:
                specs = [
                    f"Código de Referência: {code}",
                    "Fabricante: Delta Ferramentas Automotivas",
                    "Garantia: 6 meses oficial de fábrica com assistência técnica permanente"
                ]
            else:
                specs.append(f"Código: {code}")
                specs.append("Garantia: 6 meses oficial de fábrica")

            slug_code = generate_slug(code)
            img_file = f"public/products/delta/{slug_code}.jpg"
            
            if not os.path.exists(img_file):
                try:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                    pix.save(img_file)
                    pub_img = f"/products/delta/{slug_code}.jpg"
                except Exception:
                    pub_img = "/products/delta/delta_ferramentas_main.jpg"
            else:
                pub_img = f"/products/delta/{slug_code}.jpg"

            full_name = f"{title} Delta" if "Delta" not in title else title
            # Ensure name starts clean
            if full_name.startswith(code):
                full_name = f"Ferramenta Especial {title} Delta"

            products.append({
                "id": f"prod_delta_{slug_code}",
                "name": full_name,
                "slug": generate_slug(full_name),
                "categoryId": cat_id,
                "brandId": "brand_delta",
                "price": 0,
                "priceNegotiable": True,
                "badge": "Delta Pro",
                "status": "published",
                "isFeatured": True if "CAN03" in code or "TBD01" in code or "FSM01" in code else False,
                "image": pub_img,
                "images": [pub_img],
                "altText": f"{full_name} Athena Soluções Automotivas",
                "description": clean_desc,
                "specs": specs,
                "attachments": [],
                "inStock": True
            })

    print(f"Extracted {len(products)} products from Delta.")
    return products

if __name__ == '__main__':
    prods = extract_all_delta()
    with open("scripts/delta_extracted.json", "w", encoding="utf-8") as f:
        json.dump(prods, f, ensure_ascii=False, indent=2)
    print("Saved to scripts/delta_extracted.json")
