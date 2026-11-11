from bs4 import BeautifulSoup
import re

files = [
    ("wiki_cache/field_items.html", "物質のプレーン (キャンプ場)"),
    ("wiki_cache/field_items_1.html", "光のプレーン"),
    ("wiki_cache/field_items_2.html", "闇のプレーン"),
    ("wiki_cache/field_items_3.html", "死のプレーン"),
    ("wiki_cache/field_items_4.html", "ガラムマサラ / シサバレイ / リドナヒー"),
]

total_all_chests = 0

for file_path, plane_label in files:
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    body = soup.select_one("#body") or soup
    tables = body.find_all("table")
    print(f"\n========================================================")
    print(f"=== {plane_label} ({file_path}) ===")
    print(f"========================================================")
    
    file_chests_count = 0
    for idx, tbl in enumerate(tables, 1):
        rows = tbl.find_all("tr")
        if not rows:
            continue
        headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
        if not ("外見" in headers and "アイテム名" in headers):
            continue
            
        prev_h = tbl.find_previous(["h2", "h3", "h4"])
        prev_h_text = prev_h.get_text(strip=True) if prev_h else "なし"
        
        current_map = ""
        table_chests = []
        for r in rows[1:]:
            cells = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cells) == 6:
                current_map = cells[0]
                coord = cells[1]
                look = cells[2]
                num = cells[3]
                item = cells[4]
                note = cells[5]
            elif len(cells) == 5:
                coord = cells[0]
                look = cells[1]
                num = cells[2]
                item = cells[3]
                note = cells[4]
            else:
                continue
                
            if "宝箱" in look:
                table_chests.append({
                    "map": current_map,
                    "coord": coord,
                    "look": look,
                    "num": num,
                    "item": item,
                    "note": note
                })
        if table_chests:
            print(f"Table {idx:2d} | エリア: [{prev_h_text}] | 宝箱: {len(table_chests)} 個")
            file_chests_count += len(table_chests)
            # サンプル表示
            for c in table_chests[:2]:
                print(f"    [{c['look']}] #{c['num']} {c['map']} ({c['coord']}): {c['item']} (備考: {c['note']})")
    print(f"--> {plane_label} 宝箱小計: {file_chests_count} 個")
    total_all_chests += file_chests_count

print(f"\n🎉 全プレーン 宝箱総数: {total_all_chests} 個")
