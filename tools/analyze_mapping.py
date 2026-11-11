import os
import re
import json
from bs4 import BeautifulSoup

def main():
    # 1. Load CHESTS_DATA from tools/chests_extracted.json
    with open('tools/chests_extracted.json', 'r', encoding='utf-8') as f:
        chests = json.load(f)
    
    # group chests by area
    chests_by_area = {}
    for c in chests:
        area = c['area']
        chests_by_area.setdefault(area, []).append(c)

    # 2. Load Shanil pages and maps
    cache_dir = "tools/shanil_cache"
    shanil_pages = {}
    
    for f in sorted(os.listdir(cache_dir)):
        if not f.endswith(".html"):
            continue
        filepath = os.path.join(cache_dir, f)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as fp:
            html = fp.read()
            
        soup = BeautifulSoup(html, "html.parser")
        title_el = soup.find("title")
        title = title_el.get_text().strip() if title_el else f
        
        # map images
        imgs = [img.get("src", "").replace("./", "") for img in soup.find_all("img") if "map_" in img.get("src", "")]
        
        # items table
        items = []
        tables = soup.find_all("table")
        for tbl in tables:
            rows = tbl.find_all("tr")
            if not rows: continue
            hdr = [c.get_text().strip() for c in rows[0].find_all(["th", "td"])]
            if "場所" in hdr and "アイテム" in hdr:
                p_idx = hdr.index("場所")
                i_idx = hdr.index("アイテム")
                for r in rows[1:]:
                    cells = [c.get_text().strip() for c in r.find_all(["th", "td"])]
                    if len(cells) > max(p_idx, i_idx):
                        place = cells[p_idx]
                        item_raw = cells[i_idx]
                        items.append({
                            "place": place,
                            "item_raw": item_raw
                        })
                        
        shanil_pages[f] = {
            "title": title,
            "imgs": imgs,
            "items": items
        }

    # Print summary of matching
    print("=== Wiki Areas vs Shanil Pages & Maps ===")
    for area, c_list in sorted(chests_by_area.items()):
        items_summary = [c['item'] for c in c_list]
        print(f"\n[Area: {area}] ({len(c_list)} chests)")
        print(f"  Wiki items: {items_summary[:5]} ... (total {len(items_summary)})")
        
        # find matching shanil page
        matches = []
        for pf, pdata in shanil_pages.items():
            # simple check
            p_text = pdata["title"] + " " + " ".join(pdata["imgs"]) + " " + " ".join(it["place"] for it in pdata["items"])
            match_score = 0
            if area in p_text or area.replace("～", "") in p_text:
                match_score += 10
            for it in items_summary:
                if it in p_text:
                    match_score += 1
            if match_score >= 3 or (len(items_summary) <= 2 and match_score >= 1):
                matches.append((pf, pdata["title"], pdata["imgs"], match_score))
                
        matches.sort(key=lambda x: x[3], reverse=True)
        for m in matches[:2]:
            print(f"  -> Shanil Match: {m[0]} '{m[1]}' maps={m[2]} score={m[3]}")

if __name__ == "__main__":
    main()
