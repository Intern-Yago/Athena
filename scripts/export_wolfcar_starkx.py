import pymupdf as fitz
import json, os, sys
from generate_all_catalog_products import get_wolfcar_products, get_starkx_products, ensure_dirs

sys.stdout.reconfigure(encoding='utf-8')

ensure_dirs()
w_doc = fitz.open("catalogos/Catálogo Wolfcar Armários-2.pdf")
s_doc = fitz.open("catalogos/Portfolio_Digital_Stärkx.pdf")

wolfcar_prods = get_wolfcar_products(w_doc)
starkx_prods = get_starkx_products(s_doc)

with open("scripts/wolfcar_starkx_data.json", "w", encoding="utf-8") as f:
    json.dump({"wolfcar": wolfcar_prods, "starkx": starkx_prods}, f, ensure_ascii=False, indent=2)

print("Exported wolfcar and starkx data.")
