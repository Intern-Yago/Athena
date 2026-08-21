import pymupdf as fitz
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def parse_mahovi():
    doc = fitz.open("catalogos/Catálogo de Equipamentos Mahovi 2025 (6).pdf")
    print(f"Parsing Mahovi: {len(doc)} pages")
    
    products = []
    
    for p_idx in range(4, len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Look for model codes
        codes = re.findall(r'\b(MAH-[A-Z0-9\-]+|WAL-[A-Z0-9\-]+)\b', text, re.I)
        codes = list(set([c.upper() for c in codes]))
        
        if codes:
            # First few lines usually have title
            first_lines = lines[:6]
            print(f"Page {p_idx+1}: Codes {codes} -> {first_lines[:3]}")

if __name__ == '__main__':
    parse_mahovi()
