import os
import json
import re
from bs4 import BeautifulSoup

def clean_item_text(text):
    text = text.replace("（宝）", "").replace("(宝)", "").replace("（貰）", "").replace("（落）", "").replace("（貼）", "")
    text = text.replace("　", " ").strip()
    return text

def parse_shanil_items():
    cache_dir = "tools/shanil_cache"
    all_shanil_data = {}
    
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
                        # split by lines or (宝)
                        raw_lines = item_raw.split("\n")
                        for line in raw_lines:
                            line = line.strip()
                            if not line: continue
                            # check if it has (宝)
                            is_chest = "（宝）" in line or "(宝)" in line
                            clean_name = clean_item_text(line)
                            items.append({
                                "place": place,
                                "raw": line,
                                "clean": clean_name,
                                "is_chest": is_chest
                            })
                            
        all_shanil_data[f] = {
            "title": title,
            "imgs": imgs,
            "items": items
        }
        
    return all_shanil_data

def main():
    shanil = parse_shanil_items()
    with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
        chests = json.load(fp)
        
    print(f"Parsed {len(shanil)} pages from Shanil site.")
    for page, pdata in sorted(shanil.items()):
        chest_items = [i for i in pdata["items"] if i["is_chest"]]
        print(f"[{page}] {pdata['title']}: {len(pdata['imgs'])} maps, {len(chest_items)} chest items -> IMGS: {pdata['imgs']}")

if __name__ == "__main__":
    main()
