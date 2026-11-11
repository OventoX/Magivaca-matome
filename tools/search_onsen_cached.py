import os
from bs4 import BeautifulSoup
import re

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
keywords = ["お風呂", "おふろ", "温泉", "風呂", "ふろ"]

for fname in os.listdir(cache_dir):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(cache_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    text = soup.get_text()
    for kw in keywords:
        matches = [m.start() for m in re.finditer(kw, text)]
        if matches:
            print(f"[{fname}] '{kw}' found {len(matches)} times:")
            for pos in matches[:4]:
                snippet = text[max(0, pos-30):min(len(text), pos+60)].replace('\n', ' ')
                print(f"   ...{snippet}...")
