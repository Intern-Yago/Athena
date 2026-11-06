import pymupdf as fitz
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def parse_sigma():
    doc = fitz.open("catalogos/CATÁLOGO SIGMA TOOLS - 2026 (2).pdf")
    print(f"Parsing Sigma Tools: {len(doc)} pages")
    
    total_found = 0
    
    for p_idx in range(4, len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Look for SGT-XXXX, MXT-XXXX, PWR-XXXX, CAR-XX
        codes = re.findall(r'\b(SGT-[A-Z0-9\.\-]+|MXT-[A-Z0-9\.\-]+|PWR-[A-Z0-9\.\-]+|CAR-\d{2})\b', text, re.I)
        # filter noise
        clean_codes = []
        for c in set([c.upper() for c in codes]):
            if len(c) >= 6 and not c.endswith('-') and not c.startswith('SGT-PRO'):
                clean_codes.append(c)
                
        if clean_codes:
            total_found += len(clean_codes)
            if p_idx < 30 or p_idx % 10 == 0:
                print(f"Page {p_idx+1}: ({len(clean_codes)} codes) -> {clean_codes}")
                
    print(f"Total Sigma items identified: {total_found}")

if __name__ == '__main__':
    parse_sigma()
