import os
from bs4 import BeautifulSoup

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
with open(os.path.join(cache_dir, "mimic_coins.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

print("Tables in mimic_coins:", len(soup.find_all("table")))
for idx, t in enumerate(soup.find_all("table")):
    rows = t.find_all("tr")
    headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])] if rows else []
    print(f"Table {idx} ({len(rows)} rows): {headers}")
    if len(rows) > 1:
        print("  Sample:", [td.get_text(strip=True) for td in rows[1].find_all(["th", "td"])])

# 見出しも見る
for h in soup.find_all(["h2", "h3"]):
    print(h.get_text(strip=True))
