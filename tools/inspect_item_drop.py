import os
from bs4 import BeautifulSoup

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

with open(os.path.join(cache_dir, "item_drop.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

print("item_drop tables:", len(soup.find_all("table")))
for idx, t in enumerate(soup.find_all("table")):
    prev_h = t.find_previous(["h2", "h3", "h4"])
    h_title = prev_h.get_text(strip=True) if prev_h else "None"
    rows = t.find_all("tr")
    headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])] if rows else []
    print(f"Table {idx} ({h_title}): {len(rows)} rows, H: {headers[:10]}")
    if len(rows) > 1:
        sample = [td.get_text(strip=True) for td in rows[1].find_all(["th", "td"])]
        print(f"  Row 1: {sample[:10]}")
