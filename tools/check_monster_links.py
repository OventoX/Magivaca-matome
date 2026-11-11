from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
with open(os.path.join(cache_dir, "monster_list.html"), 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("=== MonsterList Links ===")
for a in soup.find_all('a'):
    text = a.get_text(strip=True)
    href = a.get('href', '')
    if any(k in text for k in ['モンスター', '図鑑', 'レベル', 'No', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']):
        if not href.startswith('#') and 'diff' not in href and 'cmd' not in href:
            print(f"{text}: {href}")

print("\n=== MonsterList Text Preview ===")
content_div = soup.find('div', id='content') or soup.find('main') or soup.body
if content_div:
    for p in content_div.find_all(['p', 'h2', 'h3']):
        txt = p.get_text(strip=True)
        if len(txt) > 0 and 'メニュー' not in txt:
            print(f"[{p.name}] {txt[:100]}")
