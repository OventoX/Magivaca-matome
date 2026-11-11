from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

def inspect_file(filename):
    path = os.path.join(cache_dir, filename)
    if not os.path.exists(path):
        print(f"Not found: {filename}")
        return
    with open(path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n==================== {filename} ====================")
    for h in soup.find_all(['h2', 'h3']):
        print(f"{h.name}: {h.get_text(strip=True)}")
    
    tables = soup.find_all('table')
    print(f"Total tables: {len(tables)}")
    for idx, t in enumerate(tables):
        rows = t.find_all('tr')
        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])] if rows else []
        print(f"  Table {idx} ({len(rows)} rows): {headers}")

inspect_file("exp_table.html")
inspect_file("magic_exp_table.html")
inspect_file("monster_list.html")
