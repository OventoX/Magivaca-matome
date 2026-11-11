from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

for fname in ["chart_matter.html", "chart_light.html"]:
    with open(os.path.join(cache_dir, fname), 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n==================== {fname} ====================")
    for h in soup.find_all(['h2', 'h3', 'h4']):
        print(f"{h.name}: {h.get_text(strip=True)}")
    
    tables = soup.find_all('table')
    print(f"Total tables: {len(tables)}")
    for idx, t in enumerate(tables[:4]):
        rows = t.find_all('tr')
        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])] if rows else []
        print(f"  Table {idx} ({len(rows)} rows): {headers}")
