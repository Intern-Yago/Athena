import urllib.request
import re

urls = [
    "https://www.deltaferramentas.com",
    "https://www.deltaferramentas.com/injecao",
    "https://www.deltaferramentas.com/obd2",
    "https://www.deltaferramentas.com/manuais",
    "https://www.deltaferramentas.com/download",
    "https://www.deltaferramentas.com/vendas",
    "https://www.deltaferramentas.com/atf-br",
    "https://www.deltaferramentas.com/tabela-ac",
    "https://www.deltaferramentas.com/copia-dt-sca01",
    "https://www.deltaferramentas.com/blank-2",
    "https://www.deltaferramentas.com/videos"
]

all_ugd_files = set()
for u in urls:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")
        files = re.findall(r"/_files/[a-zA-Z0-9_\-\.\?&=]+", html)
        for f in files:
            all_ugd_files.add(f)
    except Exception as e:
        print(f"Error {u}: {e}")

print("All files found under /_files/:")
for f in sorted(all_ugd_files):
    print(" ", f)
