from bs4 import BeautifulSoup
import os
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

all_chests = []
plane_counts = {}

for info in files:
    plane_name = info["plane"]
    file_path = info["file"]
    url = info["url"]
    
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        
    body = soup.select_one("#body") or soup
    
    # ページ内の各セクション（エリア）を特定
    # h2 や h3 がエリア名になっている
    current_area = "全体"
    
    # ノードを走査
    elements = body.find_all(["h2", "h3", "h4", "table"])
    
    for el in elements:
        if el.name in ["h2", "h3", "h4"]:
            text = el.get_text(strip=True)
            # 各ページへのリンクや概要はスキップ
            if any(skip in text for skip in ["各ページへのリンク", "概要", "メニュー", "チャート", "通信要素", "システム", "全精霊コンプリート用メモ"]):
                continue
            current_area = text
        elif el.name == "table":
            rows = el.find_all("tr")
            if not rows:
                continue
            headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
            
            # 宝箱テーブルかどうか判定 ('外見' と 'マップ名' と 'アイテム名' がある)
            if "外見" in headers and "アイテム名" in headers:
                map_idx = headers.index("マップ名") if "マップ名" in headers else 0
                coord_idx = headers.index("座標") if "座標" in headers else -1
                look_idx = headers.index("外見")
                num_idx = headers.index("#") if "#" in headers else -1
                item_idx = headers.index("アイテム名")
                note_idx = headers.index("備考") if "備考" in headers else -1
                
                for row in rows[1:]:
                    cols = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
                    if len(cols) <= look_idx:
                        continue
                    look = cols[look_idx]
                    
                    # 宝箱のみ抽出 ('宝箱' または '宝箱*' または '宝箱'で始まる)
                    if "宝箱" in look:
                        map_name = cols[map_idx] if map_idx < len(cols) else ""
                        coord = cols[coord_idx] if coord_idx >= 0 and coord_idx < len(cols) else ""
                        num = cols[num_idx] if num_idx >= 0 and num_idx < len(cols) else ""
                        item = cols[item_idx] if item_idx < len(cols) else ""
                        note = cols[note_idx] if note_idx >= 0 and note_idx < len(cols) else ""
                        
                        # 期間限定（missable）判定
                        # 物質のプレーン（キャンプ場）の宝箱はすべて期間限定
                        # その他、note に「期間限定」や消滅等の記載があるかチェック
                        is_missable = False
                        missable_reason = ""
                        if plane_name == "物質のプレーン" or "キャンプ場" in current_area:
                            is_missable = True
                            missable_reason = "ゲーム序盤のキャンプ場限定（学校出発または洞窟ワープ進入で消滅）"
                        elif "期間限定" in note or "後から取れない" in note or "戻れない" in note:
                            is_missable = True
                            missable_reason = note
                            
                        # エリア名のクリーンアップ
                        # 例: 'シサバレイ' や 'リドナヒー' の場合、plane を更新するかエリアを明確にする
                        effective_plane = plane_name
                        if current_area in ["シサバレイ", "リドナヒー"]:
                            effective_plane = current_area
                            
                        chest_obj = {
                            "id": f"chest_{len(all_chests) + 1}",
                            "plane": effective_plane,
                            "area": current_area,
                            "mapName": map_name,
                            "coord": coord,
                            "type": look, # '宝箱' or '宝箱*'
                            "number": num,
                            "item": item,
                            "note": note,
                            "missable": is_missable,
                            "missableReason": missable_reason,
                            "sourceUrl": url
                        }
                        all_chests.append(chest_obj)
                        plane_counts[effective_plane] = plane_counts.get(effective_plane, 0) + 1

print(f"Total chests extracted: {len(all_chests)}")
for p, c in plane_counts.items():
    print(f"  {p}: {c} 個")
