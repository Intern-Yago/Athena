import pymupdf as fitz
import os, sys, json, re, unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def parse_delta():
    doc = fitz.open("catalogos/CATALOGO DELTA.pdf")
    products = []
    print(f"Parsing Delta: {len(doc)} pages")
    
    # Delta code patterns: DT-XXXX, ALIXX, SACXX, JEP-XX, CAN-XX, FRA-XX, SGF-XX
    pattern = re.compile(r'^(DT-[A-Z0-9\.\-]+|[A-Z]{3,4}-?\d{2,3}(?:\.[A-Z0-9]+)?)$')
    
    for p_idx in range(2, len(doc)): # skip cover and index
        page = doc[p_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Determine category from header
        cat_name = "cat_ferramentas"
        header = " ".join(lines[:4]).upper()
        if "INJEÇÃO" in header or "ELÉTRICA" in header:
            cat_name = "cat_scanners"
        elif "FREIO" in header:
            cat_name = "cat_ferramentas"
        elif "AR CONDICIONADO" in header:
            cat_name = "cat_ferramentas"
        elif "MECÂNICA" in header:
            cat_name = "cat_ferramentas"
            
        # Extract product blocks on page
        # Find lines that match product code
        code_indices = []
        for idx, line in enumerate(lines):
            # check if line looks like code
            clean = line.replace(' ', '')
            if pattern.match(clean) and not clean.startswith('PAG') and not clean.startswith('CAT'):
                code_indices.append((idx, clean))
                
        if not code_indices:
            # check for codes inside lines
            for idx, line in enumerate(lines):
                matches = re.findall(r'\b(DT-[A-Z0-9\.\-]+|ALI\d{2}|SAC\d{2}|JEP-\d{2}|CAN-\d{2}|FRA-\d{2})\b', line)
                if matches:
                    code_indices.append((idx, matches[0]))
                    
        print(f"Page {p_idx+1}: Found {len(code_indices)} items -> {[c[1] for c in code_indices]}")

if __name__ == '__main__':
    parse_delta()
