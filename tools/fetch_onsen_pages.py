import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import os
import time

pages = [
    ("onsen", "温泉"),
    ("item_other", "その他アイテム"),
    ("trivia", "小ネタ"),
    ("yasagashi", "やさがし"),
    ("urawaza", "裏ワザ"),
    ("guide_beginner", "初心者向けプレイガイド")
]

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

for key, title in pages:
    fpath = os.path.join(cache_dir, f"{key}.html")
    if os.path.exists(fpath):
        print(f"Already cached: {key}")
        continue
    
    url = f"https://wikiwiki.jp/magivaca/{urllib.parse.quote(title)}"
    print(f"Fetching {title} ({url})...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='replace')
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Success {key}: {len(content)} bytes")
    except Exception as e:
        print(f"  Failed {key}: {e}")
    time.sleep(2.5)

print("Fetch completed.")
