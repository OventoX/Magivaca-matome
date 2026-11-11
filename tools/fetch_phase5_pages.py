import urllib.request
import urllib.parse
import os
import time

pages = [
    ("item_recovery", "回復アイテム"),
    ("item_md", "MDパーツ"),
    ("map_drop", "アイテムドロップ一覧"),
    ("item_drop", "アイテム別ドロップ確率一覧"),
    ("magic_note", "魔法の手帳"),
    ("field_items", "フィールド拾得物"),
    ("mimic_coins", "ハズレ宝箱のコイン一覧")
]

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
os.makedirs(cache_dir, exist_ok=True)

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
