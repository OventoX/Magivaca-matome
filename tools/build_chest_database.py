from bs4 import BeautifulSoup
import json
import re

files = [
    {
        "plane": "物質のプレーン",
        "file": "wiki_cache/field_items.html",
        "url": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9"
    },
    {
        "plane": "光のプレーン",
        "file": "wiki_cache/field_items_1.html",
        "url": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
    },
    {
        "plane": "闇のプレーン",
        "file": "wiki_cache/field_items_2.html",
        "url": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
    },
    {
        "plane": "死のプレーン",
        "file": "wiki_cache/field_items_3.html",
        "url": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
    },
    {
        "plane": "ガラムマサラ",
        "file": "wiki_cache/field_items_4.html",
        "url": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/4"
    }
]

coord_pattern = re.compile(r'^\d+,\d+$')

chests = []
seen_keys = set()
chest_seq = 1

for info in files:
    plane_name = info["plane"]
    file_path = info["file"]
    url = info["url"]
    
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    body = soup.select_one("#body") or soup
    tables = body.find_all("table")
    
    for tbl in tables:
        rows = tbl.find_all("tr")
        if not rows:
            continue
        headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
        if not ("外見" in headers and "アイテム名" in headers):
            continue
            
        prev_h = tbl.find_previous(["h2", "h3"])
        area_text = prev_h.get_text(strip=True) if prev_h else "全体"
        
        # 除外するまとめ節
        if "全精霊コンプリート用メモ" in area_text or "概要" in area_text or "各ページへのリンク" in area_text:
            continue
            
        cur_map = ""
        for r in rows[1:]:
            cells = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            n = len(cells)
            if n < 4:
                continue
                
            parsed = None
            if n >= 6:
                cur_map = cells[0]
                parsed = (cur_map, cells[1], cells[2], cells[3], cells[4], cells[5])
            elif n == 5:
                if coord_pattern.match(cells[0]):
                    parsed = (cur_map, cells[0], cells[1], cells[2], cells[3], cells[4])
                else:
                    cur_map = cells[0]
                    parsed = (cur_map, cells[1], cells[2], cells[3], cells[4], "")
            elif n == 4:
                if coord_pattern.match(cells[0]):
                    parsed = (cur_map, cells[0], cells[1], cells[2], cells[3], "")
                    
            if not parsed:
                continue
                
            m_name, coord, look, num, item, note = parsed
            
            if "宝箱" in look:
                dedup_key = (m_name, coord, num, item)
                if dedup_key in seen_keys:
                    continue
                seen_keys.add(dedup_key)
                
                effective_plane = plane_name
                effective_area = area_text
                
                if area_text in ["シサバレイ", "リドナヒー"]:
                    effective_plane = area_text
                    effective_area = area_text
                elif area_text == "キャンプ場" and plane_name == "物質のプレーン":
                    effective_area = "キャンプ場（ウィルオウィスプ・ヴァレンシア海岸）"
                    
                # 期間限定判定
                is_missable = False
                missable_reason = ""
                
                if effective_plane == "物質のプレーン" or "キャンプ場" in area_text:
                    is_missable = True
                    if "ウィルオウィスプ" in m_name:
                        missable_reason = "ゲーム序盤の学校出発時に消滅（取り返しがつかない）"
                    elif "海岸" in m_name or "洞窟" in m_name:
                        missable_reason = "海岸の洞窟最奥のワープ進入時に消滅（取り返しがつかない）"
                    else:
                        missable_reason = "ゲーム序盤限定エリア（後から戻れない）"
                elif "レーミッツ宮殿門" in m_name or "開門からの時間経過で開封済になる" in note:
                    is_missable = True
                    missable_reason = "開門イベントの時間経過で自動開封され消滅（数秒〜十数秒の猶予のみ）"
                elif "消滅してしまう" in note or "消滅" in note:
                    is_missable = True
                    missable_reason = note
                elif "後から取れない" in note or "戻れない" in note:
                    is_missable = True
                    missable_reason = note
                    
                # noteの補足
                if "レーミッツ宮殿門" in m_name and not note:
                    if num == "041": note = "開門時左下の宝箱（猶予 6.3秒で自動開封）"
                    elif num == "042": note = "開門時左上の宝箱（猶予 11.5秒で自動開封）"
                    elif num == "043": note = "開門時右上の宝箱（猶予 13.8秒で自動開封）"
                    
                chest_obj = {
                    "id": f"chest_{chest_seq:03d}",
                    "plane": effective_plane,
                    "area": effective_area,
                    "mapName": m_name,
                    "coord": coord,
                    "type": look,
                    "number": num,
                    "item": item,
                    "note": note,
                    "missable": is_missable,
                    "missableReason": missable_reason,
                    "sourceUrl": url
                }
                chests.append(chest_obj)
                chest_seq += 1

print(f"Total extracted chests: {len(chests)}")

plane_summary = {}
area_summary = {}
missable_count = 0
star_count = 0

for c in chests:
    p = c["plane"]
    a = c["area"]
    plane_summary[p] = plane_summary.get(p, 0) + 1
    area_summary[a] = area_summary.get(a, 0) + 1
    if c["missable"]:
        missable_count += 1
    if "宝箱*" in c["type"]:
        star_count += 1

print("\n--- プレーン別集計 ---")
for p, cnt in plane_summary.items():
    print(f"  {p}: {cnt} 個")

print(f"\n総エリア数: {len(area_summary)}")
print(f"特殊宝箱 (宝箱*): {star_count} 個")
print(f"期間限定 (missable): {missable_count} 個")

with open("tools/chests_extracted.json", "w", encoding="utf-8") as f:
    json.dump(chests, f, ensure_ascii=False, indent=2)

print("\nSaved to tools/chests_extracted.json successfully!")
