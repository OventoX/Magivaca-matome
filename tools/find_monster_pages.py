import os
from bs4 import BeautifulSoup
import re

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

# guide_beginner や trivia や index などのリンクを探す
pages_to_check = ["monster_list.html", "trivia.html", "map_drop.html"]
for p in pages_to_check:
    fpath = os.path.join(cache_dir, p)
    if not os.path.exists(fpath): continue
    with open(fpath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    links = soup.find_all("a", href=True)
    monster_links = [a.get_text(strip=True) + " -> " + a["href"] for a in links if "モンスター" in a.get_text() or "図鑑" in a.get_text() or "種族" in a.get_text()]
    print(f"Links in {p}:")
    for ml in monster_links[:10]:
        print(" ", ml)
