import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
url = "https://wikiwiki.jp/magivaca/%E8%A3%85%E5%82%99%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0"
fpath = os.path.join(cache_dir, "item_equip.html")

if not os.path.exists(fpath):
    print("Fetching item_equip...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8', errors='replace')
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Saved item_equip.html")
else:
    print("Already cached item_equip.html")
