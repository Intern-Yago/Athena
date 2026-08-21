import pymupdf as fitz
import os, sys, json

sys.stdout.reconfigure(encoding='utf-8')

catalogs = [
    ("Wolfcar", "Catálogo Wolfcar Armários-2.pdf"),
    ("Stärkx", "Portfolio_Digital_Stärkx.pdf"),
    ("Delta", "CATALOGO DELTA.pdf"),
    ("Mahovi", "Catálogo de Equipamentos Mahovi 2025 (6).pdf"),
    ("Sigma", "CATÁLOGO SIGMA TOOLS - 2026 (2).pdf")
]

for brand, filename in catalogs:
    filepath = os.path.join("catalogos", filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    doc = fitz.open(filepath)
    print(f"\n{'='*50}\nBRAND: {brand} | File: {filename} ({len(doc)} pages)\n{'='*50}")
    
    # Sample first 5 pages with text
    for p_num in range(min(5, len(doc))):
        page = doc[p_num]
        text = page.get_text()
        print(f"\n--- Page {p_num+1} ({len(text)} chars, {len(page.get_images())} images) ---")
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines[:10]:
            print(f"  {line}")
