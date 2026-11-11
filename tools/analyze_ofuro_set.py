from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

with open(os.path.join(cache_dir, "item_equip.html"), 'r', encoding='utf-8') as f:
    soup_equip = BeautifulSoup(f.read(), 'html.parser')

print("=== 装備アイテム: セット効果テーブル ===")
for t in soup_equip.find_all('table'):
    rows = t.find_all('tr')
    for r in rows:
        text = r.get_text(strip=True)
        if any(k in text for k in ['おふろ', 'お風呂', 'ゆかた', 'ゲタ', 'せんめんき', 'セット']):
            cells = [td.get_text(strip=True) for td in r.find_all(['th', 'td'])]
            print("  ", cells)

print("\n=== やさがし: お風呂セット入手方法 ===")
with open(os.path.join(cache_dir, "yasagashi.html"), 'r', encoding='utf-8') as f:
    soup_yasa = BeautifulSoup(f.read(), 'html.parser')

# Print headings and paragraphs in yasagashi
for el in soup_yasa.find_all(['h2', 'h3', 'h4', 'p', 'pre']):
    text = el.get_text(strip=True)
    if any(k in text for k in ['お風呂', 'おふろ', '方法', '手順', '乱数', '魔バス', 'ループ']):
        if 'メニュー' not in text:
            print(f"[{el.name}] {text[:150]}...")
