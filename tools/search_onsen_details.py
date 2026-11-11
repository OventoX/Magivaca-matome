import os
from bs4 import BeautifulSoup
import re

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
keywords = ["お風呂セット", "おふろセット", "お風呂", "おふろ", "温泉セット", "温泉", "入浴", "湯"]

files = ["onsen.html", "item_other.html", "trivia.html", "yasagashi.html", "urawaza.html", "guide_beginner.html"]

for fname in files:
    fpath = os.path.join(cache_dir, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    text = soup.get_text()
    print(f"\n==================== {fname} ====================")
    for kw in keywords:
        matches = [m.start() for m in re.finditer(kw, text)]
        if matches:
            print(f"Keyword '{kw}': {len(matches)} matches")
            for pos in matches[:5]:
                snippet = text[max(0, pos-40):min(len(text), pos+70)].replace('\n', ' ')
                print(f"   ...{snippet}...")
