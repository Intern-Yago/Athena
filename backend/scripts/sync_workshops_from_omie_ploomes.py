#!/usr/bin/env python3
"""
sync_workshops_from_omie_ploomes.py

Cruza automaticamente a base de clientes do Omie ERP e do Ploomes CRM
com a base de Oficinas do Radar de Expansão DF (radar_workshops.json).

Todas as oficinas encontradas que estavam com status "Não Visitado" / "A Visitar"
são automaticamente promovidas para "Cliente Athena" (Estágio "Parceria Fechada").
"""

import sys
import os
import json
import csv
import re
from pathlib import Path

# Adiciona path para scripts do athena-hermes se disponível
HERMES_SCRIPTS = Path('/home/yago/Documentos/athena-hermes/scripts')
if HERMES_SCRIPTS.exists():
    sys.path.insert(0, str(HERMES_SCRIPTS))

from omie_client import OmieClient
from ploomes_client import PloomesClient

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

def clean_doc(doc):
    if not doc:
        return ''
    return re.sub(r'\D', '', str(doc)).strip()

def main():
    print('========================================================')
    print('  Athena CRM - Sincronização Omie ERP + Ploomes CRM     ')
    print('========================================================')

    # 1. Omie ERP
    print('\n[1/4] Consultando clientes no Omie ERP...')
    omie_client = OmieClient()
    omie_all = omie_client.paginate_all('geral/clientes/', 'ListarClientes', records_key='clientes_cadastro')
    omie_map = {}
    for c in omie_all:
        doc = clean_doc(c.get('cnpj_cpf'))
        if len(doc) == 14:
            name = c.get('nome_fantasia') or c.get('razao_social') or 'Cliente Omie'
            omie_map[doc] = name
    print(f' -> {len(omie_all)} cadastros no Omie ({len(omie_map)} CNPJs válidos)')

    # 2. Ploomes CRM
    print('\n[2/4] Consultando contatos no Ploomes CRM...')
    ploomes_client = PloomesClient()
    ploomes_all = ploomes_client.paginate_all('Contacts', select_fields='Id,Name,LegalName,CNPJ,CPF', batch_size=100)
    ploomes_map = {}
    for c in ploomes_all:
        doc = clean_doc(c.get('CNPJ') or c.get('CPF'))
        if len(doc) == 14:
            name = c.get('Name') or c.get('LegalName') or 'Contato Ploomes'
            ploomes_map[doc] = name
    print(f' -> {len(ploomes_all)} contatos no Ploomes ({len(ploomes_map)} CNPJs válidos)')

    # Consolidado
    all_client_cnpjs = set(omie_map.keys()).union(set(ploomes_map.keys()))
    print(f'\nTotal consolidado de CNPJs únicos de clientes: {len(all_client_cnpjs)}')

    # 3. Atualizar radar_workshops.json
    print('\n[3/4] Cruzando com a base de Oficinas do Radar DF...')
    json_paths = [
        REPO_ROOT / 'crm' / 'public' / 'radar_workshops.json',
        REPO_ROOT / 'crm' / 'dist' / 'radar_workshops.json'
    ]

    updated_count = 0
    matched_records = []

    for jpath in json_paths:
        if not jpath.exists():
            continue

        with open(jpath, 'r', encoding='utf-8') as f:
            workshops = json.load(f)

        current_updated = 0
        for w in workshops:
            cnpj = clean_doc(w.get('cnpj'))
            if cnpj and cnpj in all_client_cnpjs:
                old_status = w.get('st') or 'Não Visitado'
                if old_status in ('Não Visitado', 'A Visitar', '', None):
                    w['st'] = 'Cliente Athena'
                    
                    sources = []
                    if cnpj in omie_map:
                        sources.append(f'Omie: {omie_map[cnpj]}')
                    if cnpj in ploomes_map:
                        sources.append(f'Ploomes: {ploomes_map[cnpj]}')
                    
                    tag = ' • '.join(sources)
                    obs = w.get('obs') or ''
                    nota_auto = f'[Cliente Ativo Athena • Sincronizado via {tag}]'
                    if nota_auto not in obs:
                        w['obs'] = (obs + ' ' + nota_auto).strip()

                    current_updated += 1
                    if jpath == json_paths[0]:
                        matched_records.append({
                            'id': w.get('id'),
                            'nome': w.get('nome'),
                            'cnpj': cnpj,
                            'ra': w.get('ra'),
                            'origem': tag
                        })

        with open(jpath, 'w', encoding='utf-8') as f:
            json.dump(workshops, f, ensure_ascii=False, indent=2)

        print(f' -> Atualizado arquivo {jpath.name}: {current_updated} oficinas movidas para "Cliente Athena" (Parceria Fechada)')
        if current_updated > updated_count:
            updated_count = current_updated

    # 4. Atualizar oficinas_df_por_ra_athena.csv se existir
    csv_path = Path('/home/yago/Documentos/clientes/oficinas_df_por_ra_athena.csv')
    if csv_path.exists():
        print(f'\n[4/4] Atualizando planilha CSV {csv_path.name}...')
        rows = []
        csv_updated = 0
        with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                cnpj = clean_doc(row.get('cnpj'))
                if cnpj and cnpj in all_client_cnpjs:
                    status = row.get('status_visita') or 'Não Visitado'
                    if status in ('Não Visitado', 'A Visitar', '', None):
                        row['status_visita'] = 'Cliente Athena'
                        csv_updated += 1
                rows.append(row)

        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f' -> CSV {csv_path.name} atualizado com {csv_updated} registros em "Cliente Athena"')

    print('\n========================================================')
    print(f'  CONCLUÍDO! Total de {updated_count} oficinas movidas para')
    print('  "Parceria Fechada / Cliente Athena" com sucesso!')
    print('========================================================')
    
    print('\nAmostra das oficinas atualizadas:')
    for r in matched_records[:15]:
        print(f" - [{r['id']}] {r['nome']} ({r['ra']}) | CNPJ: {r['cnpj']} | {r['origem']}")

if __name__ == '__main__':
    main()
