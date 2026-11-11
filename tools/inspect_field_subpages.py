from bs4 import BeautifulSoup
import os

files = [
    ("wiki_cache/field_items.html", "フィールド拾得物 (親/キャンプ場)"),
    ("wiki_cache/field_items_0.html", "フィールド拾得物/0"),
    ("wiki_cache/field_items_1.html", "フィールド拾得物/1 (光のプレーン)"),
    ("wiki_cache/field_items_2.html", "フィールド拾得物/2 (闇のプレーン)"),
    ("wiki_cache/field_items_3.html", "フィールド拾得物/3 (死のプレーン)"),
    ("wiki_cache/field_items_4.html", "フィールド拾得物/4 (ガラムマサラ)"),
]

for path, label in files:
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
    with open(path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    body = soup.select_one("#body") or soup
    h2s = [h.get_text(strip=True) for h in body.find_all(["h2", "h3"])]
    tables = body.find_all("table")
    print(f"=== {label} ({path}) ===")
    print(f"  Headings ({len(h2s)}): {h2s[:10]}")
    print(f"  Tables count: {len(tables)}")
    for idx, tbl in enumerate(tables[:3], 1):
        rows = tbl.find_all("tr")
        header = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])] if rows else []
        print(f"    Table {idx}: {len(rows)} rows, Header: {header}")
        if len(rows) > 1:
            first_row = [td.get_text(strip=True) for td in rows[1].find_all(["th", "td"])]
            print(f"      First row: {first_row}")
