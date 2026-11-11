import os
from bs4 import BeautifulSoup

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

print("--- monster_list_all.html ---")
with open(os.path.join(cache_dir, "monster_list_all.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
tables = soup.find_all("table")
print("Tables count:", len(tables))
for idx, t in enumerate(tables[:5]):
    rows = t.find_all("tr")
    headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])] if rows else []
    print(f"Table {idx}: {len(rows)} rows, H: {headers[:10]}")
    if len(rows) > 1:
        sample = [td.get_text(strip=True) for td in rows[1].find_all(["th", "td"])]
        print(f"  Row 1: {sample[:10]}")
