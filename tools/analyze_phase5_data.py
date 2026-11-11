import os
from bs4 import BeautifulSoup

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

for fname in ["item_recovery.html", "item_md.html", "item_drop.html", "magic_note.html"]:
    fpath = os.path.join(cache_dir, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n==================== {fname} ====================")
    tables = soup.find_all('table')
    print(f"Total tables: {len(tables)}")
    for idx, t in enumerate(tables[:4]):
        rows = t.find_all('tr')
        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])] if rows else []
        print(f"  Table {idx} ({len(rows)} rows): {headers}")
        if len(rows) > 1:
            cells = [td.get_text(strip=True) for td in rows[1].find_all(['th', 'td'])]
            print(f"    Sample: {cells}")
