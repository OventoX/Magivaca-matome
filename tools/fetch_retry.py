import urllib.request
import urllib.parse
import os
import time

pages = [
    ("chart_dark", "闇のプレーン"),
    ("chart_death", "死のプレーン"),
    ("chart_garam", "ガラムマサラ"),
    ("system_party", "仲間"),
    ("system_magic", "魔法"),
    ("system_record", "成績"),
    ("system_amigo", "アミーゴ"),
    ("system_konnyaku", "こんにゃくいも"),
    ("system_dwarf", "やさぐれドワーフ"),
    ("system_general", "システム")
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
    time.sleep(3.0)

print("Batch fetch finished.")
