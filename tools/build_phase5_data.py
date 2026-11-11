import os
import json
import re
from bs4 import BeautifulSoup

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

# ==============================================================================
# 1. 回復アイテム (item_recovery.html)
# ==============================================================================
recovery_items = []
with open(os.path.join(cache_dir, "item_recovery.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
table = soup.find("table")
if table:
    for row in table.find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
        if len(cols) >= 4:
            recovery_items.append({
                "name": cols[0],
                "effect": cols[1],
                "location": cols[2],
                "price": cols[3],
                "category": "回復・補助"
            })

# ==============================================================================
# 2. その他アイテム (item_other.html)
# ==============================================================================
other_items = []
with open(os.path.join(cache_dir, "item_other.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
table = soup.find("table")
if table:
    for row in table.find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
        if len(cols) >= 2:
            other_items.append({
                "name": cols[0],
                "desc": cols[1],
                "category": "貴重品・その他"
            })

# ==============================================================================
# 3. MDパーツ (item_md.html)
# ==============================================================================
md_parts = []
with open(os.path.join(cache_dir, "item_md.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

# 各部位
md_categories = [
    ("シェル", 0, 1),
    ("ジェム", 2, 3),
    ("フルーツ", 4, 5),
    ("キララ", 6, 7),
    ("ガット", 8, 9)
]
tables = soup.find_all("table")
for cat, tbl_info_idx, tbl_desc_idx in md_categories:
    if tbl_info_idx < len(tables) and tbl_desc_idx < len(tables):
        t_info = tables[tbl_info_idx]
        t_desc = tables[tbl_desc_idx]
        
        info_rows = t_info.find_all("tr")
        desc_rows = t_desc.find_all("tr")
        
        # 1行目はサブヘッダーの場合あり
        # t_desc: [名称, 説明文]
        desc_map = {}
        for r in desc_rows:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) >= 2 and cols[0] != "名称":
                desc_map[cols[0]] = cols[1]
        
        for r in info_rows:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) >= 3 and cols[0] not in ["名称", "道具屋"]:
                name = cols[0]
                md_parts.append({
                    "name": name,
                    "type": cat,
                    "location": cols[1] if len(cols) > 1 else "",
                    "price": cols[2] if len(cols) > 2 else "",
                    "desc": desc_map.get(name, ""),
                    "category": "MDパーツ"
                })

# ==============================================================================
# 4. 装備アイテム (item_equip.html)
# ==============================================================================
equip_items = []
equip_sets = []
with open(os.path.join(cache_dir, "item_equip.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

equip_tables = soup.find_all("table")

# Table 0: セット効果
if len(equip_tables) > 0:
    for r in equip_tables[0].find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
        if len(cols) >= 7:
            equip_sets.append({
                "name": cols[0],
                "power": cols[1],
                "def": cols[2],
                "spd": cols[3],
                "spi": cols[4],
                "mp": cols[5],
                "location": cols[6]
            })

# 各装備部位: (部位名, 性能テーブルindex, 説明テーブルindex)
parts_map = [
    ("あたま", 1, 2),
    ("うで", 3, 4),
    ("からだ", 5, 6),
    ("あし", 7, 8),
    ("アクセサリー", 9, 10)
]

for slot, t_info_idx, t_desc_idx in parts_map:
    if t_info_idx < len(equip_tables) and t_desc_idx < len(equip_tables):
        t_info = equip_tables[t_info_idx]
        t_desc = equip_tables[t_desc_idx]
        
        desc_map = {}
        for r in t_desc.find_all("tr")[1:]:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) >= 2:
                desc_map[cols[0]] = cols[1]
        
        # 性能テーブル: 1行目: ['名称', '性能', '入手方法', '値段'], 2行目: ['力', '守', '速', '精', 'MP', '道具屋', '宝箱', '敵ドロップ']
        for r in t_info.find_all("tr")[2:]:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) >= 9:
                name = cols[0]
                equip_items.append({
                    "name": name,
                    "slot": slot,
                    "power": cols[1],
                    "def": cols[2],
                    "spd": cols[3],
                    "spi": cols[4],
                    "mp": cols[5],
                    "shop": cols[6],
                    "chest": cols[7],
                    "drop": cols[8],
                    "price": cols[9] if len(cols) > 9 else "",
                    "desc": desc_map.get(name, ""),
                    "category": "装備品"
                })

# シール (Table 11)
if len(equip_tables) > 11:
    for r in equip_tables[11].find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
        if len(cols) >= 3:
            equip_items.append({
                "name": cols[0],
                "slot": "シール",
                "power": "-",
                "def": "-",
                "spd": "-",
                "spi": "-",
                "mp": "-",
                "shop": "-",
                "chest": cols[2],
                "drop": "ドロップあり",
                "price": "非売品",
                "desc": cols[1],
                "category": "装備品"
            })

# ==============================================================================
# 5. アイテム別ドロップ確率一覧 (item_drop.html)
# ==============================================================================
# マップ別ドロップ確率の辞書: { item_name: [ { map: map_name, rate: rate_str, note: ... } ] }
drop_data_by_item = {}

with open(os.path.join(cache_dir, "item_drop.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

for t in soup.find_all("table"):
    prev_h = t.find_previous(["h2", "h3", "h4"])
    h_title = prev_h.get_text(strip=True) if prev_h else ""
    rows = t.find_all("tr")
    if len(rows) < 2:
        continue
    
    headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
    if not headers:
        continue
    
    # 形式1: ['マップ名', '確率'] -> 項目名は h_title
    if len(headers) == 2 and headers[0] == "マップ名" and headers[1] in ["確率", "期待値"]:
        item_name = h_title
        if item_name not in drop_data_by_item:
            drop_data_by_item[item_name] = []
        for r in rows[1:]:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) >= 2 and cols[1] not in ["-", ""]:
                drop_data_by_item[item_name].append({
                    "map": cols[0],
                    "rate": cols[1] + "%" if not cols[1].endswith("%") else cols[1]
                })
    # 形式2: ['マップ名', 'アイテム1', 'アイテム2', ...]
    elif headers[0] == "マップ名" and len(headers) > 1:
        for col_idx, item_label in enumerate(headers[1:], start=1):
            # item_label が '頭' などの場合は h_title と結合
            if h_title and any(k in h_title for k in ["装備", "パーツ", "カエルグミ", "ミミズグミ", "しっぽ", "ボム", "シール", "キララ", "ガット", "シェル", "ジェム", "フルーツ", "金貨"]):
                if item_label in ["頭", "腕", "体", "足", "アクセ"]:
                    full_item_name = f"{h_title}({item_label})"
                elif item_label in ["緑", "青", "黄", "赤"]:
                    full_item_name = f"{h_title}({item_label})"
                elif item_label in ["火", "風", "毒", "美", "刃", "音", "石", "虫", "木", "獣", "水", "雷", "古", "闇", "光", "愛"]:
                    full_item_name = f"{item_label}の{h_title}"
                elif any(h in h_title for h in ["シェル", "ジェム", "フルーツ", "キララ", "ガット"]):
                    full_item_name = f"{item_label}"
                elif "金貨" in h_title or "銀貨" in h_title:
                    full_item_name = f"{item_label}貨"
                else:
                    full_item_name = item_label
            else:
                full_item_name = item_label
            
            if full_item_name not in drop_data_by_item:
                drop_data_by_item[full_item_name] = []
            
            for r in rows[1:]:
                cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
                if len(cols) > col_idx:
                    map_name = cols[0]
                    val = cols[col_idx]
                    if val not in ["-", "", "可"]:
                        drop_data_by_item[full_item_name].append({
                            "map": map_name,
                            "rate": val + "%" if not val.endswith("%") else val
                        })

# ==============================================================================
# 6. 魔法の手帳 (magic_note.html)
# ==============================================================================
magic_notes = []
with open(os.path.join(cache_dir, "magic_note.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
table = soup.find("table")
if table:
    for row in table.find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
        if len(cols) >= 4 and cols[0].isdigit():
            magic_notes.append({
                "no": int(cols[0]),
                "title": cols[1],
                "content": cols[2],
                "condition": cols[3],
                "missable": "期間限定" in cols[3]
            })

# ==============================================================================
# 7. ハズレ宝箱コイン (mimic_coins.html)
# ==============================================================================
mimic_coins = []
with open(os.path.join(cache_dir, "mimic_coins.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

plane_tables = [
    ("闇のプレーン", 1),
    ("死のプレーン", 2),
    ("ガラムマサラ", 3)
]
tables = soup.find_all("table")
for plane_name, tbl_idx in plane_tables:
    if tbl_idx < len(tables):
        t = tables[tbl_idx]
        for r in t.find_all("tr")[1:]:
            cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if len(cols) >= 4 and cols[3].isdigit():
                mimic_coins.append({
                    "plane": plane_name,
                    "map": cols[0],
                    "coord": cols[1],
                    "coinName": cols[2] + "貨" if not cols[2].endswith("貨") else cols[2],
                    "id": int(cols[3]),
                    "altMaps": cols[4] if len(cols) > 4 else ""
                })

# ==============================================================================
# 8. 図鑑非掲載ボス (monster_list.html)
# ==============================================================================
boss_monsters = []
with open(os.path.join(cache_dir, "monster_list.html"), "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
tables = soup.find_all("table")
if len(tables) > 4:
    # Table 4: 図鑑非掲載のモンスター
    for r in tables[4].find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
        if len(cols) >= 5:
            boss_monsters.append({
                "name": cols[0],
                "level": cols[1],
                "element": cols[2],
                "location": cols[3],
                "rate": cols[4] + "%" if not cols[4].endswith("%") else cols[4]
            })

print(f"Loaded summary:")
print(f"  Recovery items: {len(recovery_items)}")
print(f"  Other items: {len(other_items)}")
print(f"  MD parts: {len(md_parts)}")
print(f"  Equip items: {len(equip_items)}")
print(f"  Equip sets: {len(equip_sets)}")
print(f"  Drop indexed items: {len(drop_data_by_item)}")
print(f"  Magic notes: {len(magic_notes)}")
print(f"  Mimic coins: {len(mimic_coins)}")
print(f"  Boss monsters: {len(boss_monsters)}")

output_data = {
    "recoveryItems": recovery_items,
    "otherItems": other_items,
    "mdParts": md_parts,
    "equipItems": equip_items,
    "equipSets": equip_sets,
    "dropData": drop_data_by_item,
    "magicNotes": magic_notes,
    "mimicCoins": mimic_coins,
    "bossMonsters": boss_monsters
}

with open(r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\tools\extracted_phase5.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print("Saved to extracted_phase5.json successfully.")
