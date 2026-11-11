from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

for fname in ["exp_table.html", "magic_exp_table.html"]:
    with open(os.path.join(cache_dir, fname), 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n==================== {fname} ====================")
    for p in soup.find_all(['p', 'div', 'table']):
        if p.name == 'p':
            txt = p.get_text(strip=True)
            if txt:
                print(f"P: {txt}")
        elif p.name == 'table':
            rows = p.find_all('tr')
            print(f"Table ({len(rows)} rows):")
            for r in rows[:6]:
                print("  ", [td.get_text(strip=True) for td in r.find_all(['th', 'td'])])
