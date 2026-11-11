import os
import re
import json

def normalize_text(t):
    if not t: return ""
    t = t.replace("（宝）", "").replace("(宝)", "").replace("（貰）", "").replace("（落）", "").replace("（貼）", "")
    t = t.replace("×", "x").replace(" ", "").replace("　", "")
    # zenkaku to hankaku
    zen = "０１２３４５６７８９"
    han = "0123456789"
    for z, h in zip(zen, han):
        t = t.replace(z, h)
    return t.lower()

def correlate():
    with open("tools/build_shanil_integration.py", "r", encoding="utf-8") as f:
        code = f.read()
    
    import sys
    sys.path.append(os.path.dirname(__file__))
    import build_shanil_integration as bsi
    rules = bsi.AREA_MAPPING_RULES

    with open("tools/shanil_parsed_all.json", "r", encoding="utf-8") as f:
        shanil_parsed = json.load(f)
    shanil_by_file = {p["file"]: p for p in shanil_parsed}

    with open("tools/chests_extracted.json", "r", encoding="utf-8") as f:
        chests = json.load(f)

    # analyze each area
    results = {}
    differences = []

    for area, rule in rules.items():
        area_chests = [c for c in chests if c["area"] == area]
        
        # gather all shanil item rows for this area's pages
        shanil_rows = []
        for p in rule["pages"]:
            pdata = shanil_by_file[p]
            for r_idx, r in enumerate(pdata["item_rows"]):
                # check if there's any chest
                for raw_line in r["raw_lines"]:
                    shanil_rows.append({
                        "page": p,
                        "page_title": pdata["title"],
                        "place": r["place"],
                        "raw_line": raw_line,
                        "norm_line": normalize_text(raw_line),
                        "is_chest": ("（宝）" in raw_line or "(宝)" in raw_line),
                        "row_num": r_idx + 1
                    })

        # Match area_chests with shanil_rows
        matched_chests = []
        unmatched_chests = []

        used_rows = set()

        for c in area_chests:
            c_norm = normalize_text(c["item"])
            c_loc = c.get("mapName", "")
            
            # find best matching shanil row
            best_match = None
            best_score = -1

            for idx, sr in enumerate(shanil_rows):
                score = 0
                sr_norm = sr["norm_line"]
                # item name match
                if c_norm == sr_norm:
                    score += 10
                elif c_norm in sr_norm or sr_norm in c_norm:
                    score += 6
                else:
                    # check if base item matches without count
                    c_base = re.sub(r'x\d+', '', c_norm)
                    sr_base = re.sub(r'x\d+', '', sr_norm)
                    if c_base and c_base == sr_base:
                        score += 5
                    elif c_base and (c_base in sr_base or sr_base in c_base):
                        score += 3

                # location match
                if c_loc and c_loc in sr["place"]:
                    score += 4
                elif sr["place"] in c_loc:
                    score += 3

                # chest type match
                if sr["is_chest"]:
                    score += 2

                # avoid reusing the same row if possible
                if idx in used_rows:
                    score -= 5

                if score > best_score:
                    best_score = score
                    best_match = (idx, sr)

            if best_match and best_score >= 3:
                used_rows.add(best_match[0])
                sr = best_match[1]
                
                # Check for difference
                diff_note = None
                if c["item"] != sr["raw_line"].replace("（宝）", "").replace("(宝)", "").strip():
                    diff_note = f"Wiki: '{c['item']}' vs 相川氏: '{sr['raw_line']}'"
                    differences.append({
                        "area": area,
                        "chest_id": c["id"],
                        "wiki_item": c["item"],
                        "shanil_item": sr["raw_line"],
                        "place": sr["place"]
                    })

                matched_chests.append({
                    "chest": c,
                    "shanil_place": sr["place"],
                    "shanil_raw": sr["raw_line"],
                    "shanil_row_num": sr["row_num"],
                    "shanil_page": sr["page"],
                    "diff": diff_note
                })
            else:
                unmatched_chests.append(c)

        results[area] = {
            "total_chests": len(area_chests),
            "matched_count": len(matched_chests),
            "unmatched_count": len(unmatched_chests),
            "matched": matched_chests,
            "unmatched": unmatched_chests
        }

    print("=== SUMMARY OF CORRELATION ===")
    total_m = sum(r["matched_count"] for r in results.values())
    total_u = sum(r["unmatched_count"] for r in results.values())
    print(f"Total matched chests: {total_m} / {total_m + total_u} ({total_m/(total_m+total_u)*100:.1f}%)")
    print(f"Total unmatched chests: {total_u}")
    print(f"Total differences noted: {len(differences)}")

    for area, r in results.items():
        if r["unmatched_count"] > 0:
            print(f"\n[Area: {area}] Matched: {r['matched_count']}, Unmatched: {r['unmatched_count']}")
            for u in r["unmatched"]:
                print(f"   Unmatched: {u['id']} [{u['mapName']}] {u['item']}")

    with open("tools/correlation_results.json", "w", encoding="utf-8") as out:
        json.dump(results, out, ensure_ascii=False, indent=2)

    with open("tools/differences.json", "w", encoding="utf-8") as out:
        json.dump(differences, out, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    correlate()
