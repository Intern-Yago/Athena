import pymupdf as fitz
import os, sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

def inspect_delta():
    doc = fitz.open("catalogos/CATALOGO DELTA.pdf")
    print(f"\n{'='*50}\nDELTA ({len(doc)} pages)\n{'='*50}")
    products = []
    for p_idx in range(len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        # Find product codes like DT-XXX, ALIXX, SACXX, JEP-XX, CAN-XX, FRA-XX
        codes = re.findall(r'\b(DT-[A-Z0-9\.\-]+|[A-Z]{3,4}-?\d{2,3}(?:\.[A-Z0-9]+)?)\b', text)
        codes = [c for c in set(codes) if not c.startswith('DOT') and not c.startswith('CAT') and not c.startswith('PAG')]
        if codes:
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            print(f"Page {p_idx+1}: Codes {codes} | First 4 lines: {lines[:4]}")

def inspect_mahovi():
    doc = fitz.open("catalogos/Catálogo de Equipamentos Mahovi 2025 (6).pdf")
    print(f"\n{'='*50}\nMAHOVI ({len(doc)} pages)\n{'='*50}")
    for p_idx in range(len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        # Look for MAH-XXXX or WAL-XXXX
        codes = re.findall(r'\b(MAH-[A-Z0-9\-]+|WAL-[A-Z0-9\-]+)\b', text, re.I)
        if codes:
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            print(f"Page {p_idx+1}: Codes {set(codes)} | First 4 lines: {lines[:4]}")

def inspect_sigma():
    doc = fitz.open("catalogos/CATÁLOGO SIGMA TOOLS - 2026 (2).pdf")
    print(f"\n{'='*50}\nSIGMA TOOLS ({len(doc)} pages)\n{'='*50}")
    for p_idx in range(len(doc)):
        page = doc[p_idx]
        text = page.get_text()
        # Look for SGT-XXXX, MXT-XXXX, PWR-XXXX, CAR-XX
        codes = re.findall(r'\b(SGT-[A-Z0-9\.\-]+|MXT-[A-Z0-9\.\-]+|PWR-[A-Z0-9\.\-]+|CAR-\d{2})\b', text, re.I)
        if codes:
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            print(f"Page {p_idx+1}: Codes {set(codes)} | First 4 lines: {lines[:4]}")

if __name__ == '__main__':
    inspect_delta()
    inspect_mahovi()
    inspect_sigma()
