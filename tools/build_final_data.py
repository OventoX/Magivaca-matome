import os
import re
import json

def normalize_text(t):
    if not t: return ""
    t = t.replace("（宝）", "").replace("(宝)", "").replace("（貰）", "").replace("（落）", "").replace("（貼）", "")
    t = t.replace("×", "x").replace(" ", "").replace("　", "")
    zen = "０１２３４５６７８９"
    han = "0123456789"
    for z, h in zip(zen, han):
        t = t.replace(z, h)
    return t.lower()

# Circled numbers helper
def get_circle_num(n):
    circles = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩",
               "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳",
               "㉑", "㉒", "㉓", "㉔", "㉕", "㉖", "㉗", "㉘", "㉙", "㉚"]
    if 0 <= n < len(circles):
        return circles[n]
    return f"({n})"

def main():
    import sys
    sys.path.append(os.path.dirname(__file__))
    import generate_updated_data as gud

    with open("tools/shanil_parsed_all.json", "r", encoding="utf-8") as f:
        shanil_parsed = json.load(f)
    shanil_by_file = {p["file"]: p for p in shanil_parsed}

    with open("tools/chests_extracted.json", "r", encoding="utf-8") as f:
        chests = json.load(f)

    area_rules = gud.SHANIL_AREAS
    specials = gud.SPECIAL_CHEST_MAPS

    # Prepare Shanil rows by page
    page_rows_map = {}
    for p in shanil_parsed:
        rows = []
        for r_idx, r in enumerate(p["item_rows"]):
            # extract number from place name if present, e.g. "キスニカ鉱山1" -> 1
            m_num = re.search(r'(\d+)', r["place"])
            mark_num = int(m_num.group(1)) if m_num else (r_idx + 1)
            mark = get_circle_num(mark_num)
            
            for line in r["raw_lines"]:
                rows.append({
                    "place": r["place"],
                    "mark": mark,
                    "mark_num": mark_num,
                    "raw_line": line,
                    "norm_line": normalize_text(line),
                    "is_chest": ("（宝）" in line or "(宝)" in line),
                    "page_url": f"https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/{p['file'].replace('chart_', '')}",
                    "page_file": p["file"]
                })
        page_rows_map[p["file"]] = rows

    # Process each chest
    updated_chests = []
    used_rows_per_area = {}

    for c in chests:
        c_copy = dict(c)
        cid = c["id"]
        area = c["area"]

        # Check special overrides first
        if cid in specials:
            sp = specials[cid]
            c_copy["shanilPlace"] = sp["shanilPlace"]
            c_copy["shanilMark"] = sp["shanilMark"]
            c_copy["shanilItem"] = sp["shanilItem"]
            c_copy["diffNote"] = sp["diffNote"]
            if area in area_rules:
                c_copy["shanilUrl"] = area_rules[area]["sourceUrl"]
            updated_chests.append(c_copy)
            continue

        # If area is in area_rules (one of the 32 Shanil areas)
        if area in area_rules:
            rule = area_rules[area]
            c_copy["shanilUrl"] = rule["sourceUrl"]

            # gather candidates across this area's submaps
            submap_files = [sm["sourceUrl"].split("/")[-1] for sm in rule["submaps"]]
            chart_files = [f"chart_{sf}" if not sf.startswith("chart_") else sf for sf in submap_files]
            # fallback to rule.pages if any
            chart_files = list(set(chart_files + rule.get("pages", [])))

            candidates = []
            for cf in chart_files:
                if cf in page_rows_map:
                    candidates.extend(page_rows_map[cf])

            # match with best score
            c_norm = normalize_text(c["item"])
            c_loc = c.get("mapName", "")
            
            best_cand = None
            best_score = -1

            used_set = used_rows_per_area.setdefault(area, set())

            for idx, cand in enumerate(candidates):
                score = 0
                cand_norm = cand["norm_line"]
                if c_norm == cand_norm:
                    score += 10
                elif c_norm in cand_norm or cand_norm in c_norm:
                    score += 6
                else:
                    c_base = re.sub(r'x\d+', '', c_norm)
                    cand_base = re.sub(r'x\d+', '', cand_norm)
                    if c_base and c_base == cand_base:
                        score += 5
                    elif c_base and (c_base in cand_base or cand_base in c_base):
                        score += 3

                # location match
                if c_loc and (c_loc in cand["place"] or cand["place"] in c_loc):
                    score += 4

                if cand["is_chest"]:
                    score += 2

                if idx in used_set:
                    score -= 4

                if score > best_score:
                    best_score = score
                    best_cand = (idx, cand)

            if best_cand and best_score >= 3:
                used_set.add(best_cand[0])
                matched = best_cand[1]
                c_copy["shanilPlace"] = matched["place"]
                c_copy["shanilMark"] = matched["mark"]
                c_copy["shanilItem"] = matched["raw_line"]
                c_copy["shanilUrl"] = matched["page_url"]

                # check difference
                clean_matched = matched["raw_line"].replace("（宝）", "").replace("(宝)", "").replace("（落）", "").replace("（貰）", "").strip()
                if c["item"] != clean_matched:
                    c_copy["diffNote"] = f"相川氏サイト表記:「{matched['raw_line']}」"
                else:
                    c_copy["diffNote"] = None
            else:
                c_copy["shanilPlace"] = c_loc or area
                c_copy["shanilMark"] = None
                c_copy["shanilItem"] = None
                c_copy["diffNote"] = "相川氏チャートには個別記載なし"
        else:
            # Garam masala, Ridonahi, Sisabarei
            c_copy["shanilPlace"] = None
            c_copy["shanilMark"] = None
            c_copy["shanilItem"] = None
            c_copy["diffNote"] = None
            c_copy["shanilUrl"] = None

        updated_chests.append(c_copy)

    print(f"Total processed chests: {len(updated_chests)}")
    with_shanil_mark = sum(1 for c in updated_chests if c.get("shanilMark") is not None)
    with_shanil_url = sum(1 for c in updated_chests if c.get("shanilUrl") is not None)
    with_diff_note = sum(1 for c in updated_chests if c.get("diffNote") is not None)
    print(f"Chests with Shanil mark: {with_shanil_mark} / 293 in Shanil areas")
    print(f"Chests with Shanil URL: {with_shanil_url}")
    print(f"Chests with diff note: {with_diff_note}")

    # Build CHEST_MAP_ASSETS
    # Load existing CHEST_MAP_ASSETS from js/data.js
    with open("js/data.js", "r", encoding="utf-8") as f:
        js_code = f.read()

    # extract existing real and schematic
    m_assets = re.search(r'const CHEST_MAP_ASSETS = (\{.*?\});\s*(?:window\.CHESTS_DATA|const|\n)', js_code, re.DOTALL)
    old_assets = {}
    if m_assets:
        try:
            # evaluate in node or extract
            pass
        except Exception:
            pass

    # Build complete CHEST_MAP_ASSETS object
    # We will build shanil map assets dictionary
    shanil_assets = {}
    for area, rule in area_rules.items():
        shanil_assets[area] = {
            "sourceType": "shanil",
            "sourceName": "相川ともき氏のマジカルバケーション攻略サイト",
            "sourceUrl": rule["sourceUrl"],
            "credit": "相川ともき氏のマジカルバケーション攻略サイト（許諾/情報提供に基づく攻略マップ引用）",
            "maps": rule["submaps"]
        }

    # Save intermediate JSON files
    with open("tools/updated_chests.json", "w", encoding="utf-8") as f:
        json.dump(updated_chests, f, ensure_ascii=False, indent=2)

    with open("tools/shanil_assets.json", "w", encoding="utf-8") as f:
        json.dump(shanil_assets, f, ensure_ascii=False, indent=2)

    print("Successfully generated updated_chests.json and shanil_assets.json")

if __name__ == "__main__":
    main()
