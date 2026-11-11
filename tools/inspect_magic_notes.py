import os
from bs4 import BeautifulSoup
import json

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
with open(os.path.join(cache_dir, "magic_note.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

table = soup.find("table")
notes = []
for row in table.find_all("tr")[1:]:
    cols = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
    if len(cols) >= 4 and cols[0].isdigit():
        notes.append({
            "no": int(cols[0]),
            "title": cols[1],
            "content": cols[2],
            "condition": cols[3]
        })

print(f"Total magic notes: {len(notes)}")
for n in notes[:5]:
    print(n)
