from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

with open(os.path.join(cache_dir, "yasagashi.html"), 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("=== やさがしページ 全体構成 ===")
for h in soup.find_all(['h2', 'h3', 'h4']):
    print(f"{h.name}: {h.get_text(strip=True)}")

# Extract intro text
intro = soup.find('div', id='content') or soup.find('main') or soup.body
if intro:
    for p in intro.find_all('p')[:10]:
        print("P:", p.get_text(strip=True)[:100])
