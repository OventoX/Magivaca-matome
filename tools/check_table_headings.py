from bs4 import BeautifulSoup
import re

files = [
    ("wiki_cache/field_items.html", "物質のプレーン (キャンプ場)"),
    ("wiki_cache/field_items_1.html", "光のプレーン"),
    ("wiki_cache/field_items_2.html", "闇のプレーン"),
    ("wiki_cache/field_items_3.html", "死のプレーン"),
    ("wiki_cache/field_items_4.html", "ガラムマサラ / シサバレイ / リドナヒー"),
]

for file_path, plane_label in files:
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    body = soup.select_one("#body") or soup
    tables = body.find_all("table")
    print(f"\n========================================================")
    print(f"=== {plane_label} ({file_path}) ===")
    print(f"========================================================")
    
    for idx, tbl in enumerate(tables, 1):
        rows = tbl.find_all("tr")
        if not rows:
            continue
        headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
        if not ("外見" in headers and "アイテム名" in headers):
            continue
            
        # 直前の見出しを取得
        prev_h = tbl.find_previous(["h2", "h3", "h4"])
        prev_h_text = prev_h.get_text(strip=True) if prev_h else "なし"
        
        # さらにその上の大見出し (h2)
        h2 = tbl.find_previous("h2")
        h2_text = h2.get_text(strip=True) if h2 else ""
        
        chests = []
        look_idx = headers.index("外見")
        map_idx = headers.index("マップ名") if "マップ名" in headers else 0
        item_idx = headers.index("アイテム名")
        
        for r in rows[1:]:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) > look_idx and "宝箱" in cols[look_idx]:
                chests.append(cols)
                
        if chests:
            print(f"Table {idx:2d} | エリア: [{prev_h_text}] (親: {h2_text}) | 宝箱: {len(chests)} 個")
            for c in chests[:2]:
                mname = c[map_idx] if map_idx < len(c) else ""
                iname = c[item_idx] if item_idx < len(c) else ""
                print(f"    - {mname}: {iname} ({c[look_idx]})")
