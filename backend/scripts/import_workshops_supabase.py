import os, csv, hashlib
from urllib.parse import urlparse
import psycopg2

CENTROIDES_DF = {
    'SCIA Estrutural': (-15.7760, -47.9940, 0.010),
    'Ceilândia': (-15.8180, -48.1100, 0.025),
    'Taguatinga': (-15.8330, -48.0560, 0.022),
    'Samambaia': (-15.8750, -48.0850, 0.020),
    'Guará': (-15.8230, -47.9780, 0.012),
    'Gama': (-16.0150, -48.0650, 0.020),
    'Sobradinho': (-15.6500, -47.7900, 0.015),
    'Sobradinho II': (-15.6300, -47.8100, 0.012),
    'Planaltina': (-15.6200, -47.6550, 0.022),
    'Santa Maria': (-16.0150, -47.9950, 0.018),
    'Recanto das Emas': (-15.9050, -48.0650, 0.015),
    'Vicente Pires': (-15.8050, -48.0300, 0.015),
    'Águas Claras': (-15.8380, -48.0280, 0.012),
    'Plano Piloto': (-15.7900, -47.8950, 0.025),
    'São Sebastião': (-15.9050, -47.7700, 0.015),
    'Núcleo Bandeirante': (-15.8700, -47.9650, 0.008),
    'Candangolândia': (-15.8550, -47.9500, 0.006),
    'Riacho Fundo I': (-15.8800, -48.0150, 0.010),
    'Riacho Fundo II': (-15.8950, -48.0350, 0.012),
    'Paranoá': (-15.7700, -47.7800, 0.012),
    'Itapoã': (-15.7500, -47.7700, 0.010),
    'Brazlândia': (-15.6750, -48.2000, 0.015),
    'Cruzeiro / Sudoeste': (-15.7950, -47.9250, 0.010),
    'Sol Nascente/Pôr do Sol': (-15.8200, -48.1400, 0.015),
    'Arniqueira': (-15.8400, -48.0100, 0.010),
    'Arapoanga': (-15.6100, -47.6200, 0.012),
    'Jardim Botânico': (-15.8700, -47.8200, 0.015),
    'Lago Norte / Varjão': (-15.7350, -47.8650, 0.015),
    'Lago Sul': (-15.8400, -47.8700, 0.018),
    'Park Way': (-15.8900, -47.9400, 0.015),
    'Fercal': (-15.5800, -47.8700, 0.020),
    'SIG': (-15.7950, -47.9100, 0.006),
    'Água Quente': (-15.9800, -48.1800, 0.015),
    'Zona Rural / Outros': (-15.7900, -47.9000, 0.050)
}

def get_lat_lng(ra, cnpj, endereco):
    lat, lng, raio = CENTROIDES_DF.get(ra, (-15.7900, -47.9000, 0.030))
    h = int(hashlib.md5(f'{cnpj}{endereco}'.encode('utf-8')).hexdigest()[:8], 16)
    dx = ((h % 1000) / 500.0 - 1.0) * raio
    dy = (((h // 1000) % 1000) / 500.0 - 1.0) * raio
    return round(lat + dy, 5), round(lng + dx, 5)

db_url = 'postgresql://postgres:NUtT9F8tiOUqx4of@db.knfeuaarnkctzbfpicxo.supabase.co:5432/postgres'
conn = psycopg2.connect(db_url)
cur = conn.cursor()

csv_path = '../clientes/oficinas_df_por_ra_athena.csv'
batch = []
total = 0

with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        ra = (r.get('regiao_administrativa') or '').strip()
        cat = (r.get('categoria_oficina') or '').strip()
        nome = (r.get('nome_fantasia') or '').strip()
        razao = (r.get('razao_social') or '').strip()
        cnpj = (r.get('cnpj') or '').strip()
        tel1 = (r.get('telefone_principal') or '').strip()
        tel2 = (r.get('telefone_secundario') or '').strip()
        email = (r.get('email') or '').strip()
        end = (r.get('endereco_completo') or '').strip()
        bairro = (r.get('bairro_original') or '').strip()
        cep = (r.get('cep') or '').strip()
        status = (r.get('status_visita') or 'Não Visitado').strip()
        obs = (r.get('observacoes') or '').strip()

        lat, lng = get_lat_lng(ra, cnpj, end)

        batch.append((ra, cat, nome, razao, cnpj, tel1, tel2, email, end, bairro, cep, status, obs, lat, lng))

        if len(batch) >= 500:
            query = """
                INSERT INTO crm_workshops (
                    regiao_administrativa, categoria, nome_fantasia, razao_social, cnpj,
                    telefone_principal, telefone_secundario, email, endereco_completo, bairro,
                    cep, status_visita, observacoes, latitude, longitude
                ) VALUES %s
            """
            from psycopg2.extras import execute_values
            execute_values(cur, query, batch)
            conn.commit()
            total += len(batch)
            print(f'Inseridos {total} registros...')
            batch = []

    if batch:
        from psycopg2.extras import execute_values
        query = """
            INSERT INTO crm_workshops (
                regiao_administrativa, categoria, nome_fantasia, razao_social, cnpj,
                telefone_principal, telefone_secundario, email, endereco_completo, bairro,
                cep, status_visita, observacoes, latitude, longitude
            ) VALUES %s
        """
        execute_values(cur, query, batch)
        conn.commit()
        total += len(batch)

print(f'SUCESSO TOTAL! {total} oficinas importadas para a tabela crm_workshops no Supabase!')
cur.close()
conn.close()
