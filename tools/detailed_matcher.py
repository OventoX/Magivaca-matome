import os
import re
import json
from bs4 import BeautifulSoup

def clean_item_text(text):
    text = text.replace("（宝）", "").replace("(宝)", "").replace("（貰）", "").replace("（落）", "").replace("（貼）", "").replace("（ガ）", "")
    text = text.replace("　", " ").strip()
    return text

def parse_all_shanil():
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
                        # split items by line or whatever
                        for line in item_raw.split("\n"):
                            line = line.strip()
                            if not line: continue
                            items.append({
                                "place": place,
                                "raw": line,
                                "clean": clean_item_text(line),
                                "is_chest": ("（宝）" in line or "(宝)" in line)
                            })
                        
        shanil_pages[f] = {
            "title": title,
            "imgs": imgs,
            "items": items,
            "url": f"https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/{f.replace('chart_', '')}"
        }
    return shanil_pages

def main():
    shanil = parse_all_shanil()
    with open('tools/chests_extracted.json', 'r', encoding='utf-8') as f:
        chests = json.load(f)

    # test sample: benakoncha (l_5.html)
    l5 = shanil['chart_l_5.html']
    print("=== L_5 Benakoncha Items in Shanil ===")
    for it in l5['items']:
        print(f"  [{it['place']}] {it['raw']} -> chest={it['is_chest']}")

    bena_chests = [c for c in chests if c['area'] == 'ベナコンチャ遺跡']
    print(f"\n=== Wiki Benakoncha Chests ({len(bena_chests)}) ===")
    for c in bena_chests:
        print(f"  id={c['id']} [{c['location']}] {c['item']}")

if __name__ == "__main__":
    main()
