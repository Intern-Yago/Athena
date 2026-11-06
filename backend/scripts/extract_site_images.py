import urllib.request
from bs4 import BeautifulSoup
import re
import os

os.makedirs("/tmp/delta/site_images", exist_ok=True)

urls = [
    "https://www.deltaferramentas.com",
    "https://www.deltaferramentas.com/injecao",
    "https://www.deltaferramentas.com/vendas",
    "https://www.deltaferramentas.com/manuais",
    "https://www.deltaferramentas.com/download",
    "https://www.deltaferramentas.com/videos",
    "https://www.deltaferramentas.com/obd2",
    "https://www.deltaferramentas.com/tabela-ac"
]

all_img_sources = set()

for u in urls:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")
        
        # Look for wix image uri patterns
        # e.g. b9ec42_...~mv2.png or .jpg
        tokens = re.findall(r"([a-f0-9]+_[a-f0-9]+~mv2\.[a-z0-9]+)", html, re.IGNORECASE)
        for t in tokens:
            all_img_sources.add(t)
            
        # Also static.wixstatic.com/media/...
        wix_links = re.findall(r"https://static\.wixstatic\.com/media/([a-zA-Z0-9_\~\.]+)", html)
        for wl in wix_links:
            clean = wl.split("/")[0].split("?")[0].split("#")[0]
            if "~mv2" in clean:
                all_img_sources.add(clean)
                
    except Exception as e:
        print(f"Error {u}: {e}")

print(f"Found {len(all_img_sources)} unique product media files on Delta site:")
for s in sorted(all_img_sources):
    print(" ", s)

# Download each one in original quality
for s in all_img_sources:
    url = f"https://static.wixstatic.com/media/{s}"
    dest = f"/tmp/delta/site_images/{s}"
    if not os.path.exists(dest):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            data = urllib.request.urlopen(req, timeout=10).read()
            with open(dest, "wb") as f:
                f.write(data)
            print(f"Downloaded {s} ({len(data)} bytes)")
        except Exception as e:
            print(f"Failed {s}: {e}")
