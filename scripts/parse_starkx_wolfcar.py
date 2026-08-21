import pymupdf as fitz
import os, sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

def parse_wolfcar():
    doc = fitz.open("catalogos/Catálogo Wolfcar Armários-2.pdf")
    products = []
    print(f"Parsing Wolfcar: {len(doc)} pages")
    
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Look for model codes like W1058, W1059, W1081, W1082, W1068, W1083, W1067, W1071, W1076
        model_matches = re.findall(r'\b(W\d{4}(?:-[A-Z0-9]+)?)\b', text)
        if model_matches:
            print(f"Page {page_idx+1}: Models {set(model_matches)}")
            print("Lines:", lines[:15])

def parse_starkx():
    doc = fitz.open("catalogos/Portfolio_Digital_Stärkx.pdf")
    products = []
    print(f"\nParsing Stärkx: {len(doc)} pages")
    
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        model_matches = re.findall(r'\b(SKX-\d{3}|Thinkcar\s+[\w\s]+|THINKTOOL\s+[\w\s]+|VENU\s+\d+|PLATINUM\s+[\w\s]+)\b', text, re.I)
        if model_matches:
            print(f"Page {page_idx+1}: Models {set(model_matches)}")
            print("Lines:", lines[:10])

if __name__ == '__main__':
    parse_wolfcar()
    parse_starkx()
