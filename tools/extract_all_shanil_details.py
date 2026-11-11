import os
import re
import json
from bs4 import BeautifulSoup

def clean_item(text):
    text = text.replace("（宝）", "").replace("(宝)", "").replace("（貰）", "").replace("（落）", "").replace("（貼）", "").replace("（ガ）", "")
    text = text.replace("　", " ").strip()
    return text

def parse_page(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    title_el = soup.find("title")
    title = title_el.get_text().strip() if title_el else os.path.basename(filepath)

    imgs = []
    for img in soup.find_all("img"):
        src = img.get("src", "").replace("./", "")
        if "map_" in src:
            imgs.append(src)

    # find items table
    item_rows = []
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
                    item_cell = cells[i_idx]
                    lines = [l.strip() for l in item_cell.split("\n") if l.strip()]
                    item_rows.append({
                        "place": place,
                        "raw_lines": lines
                    })

    # check spirit info
    spirits = []
    spirit_ul = soup.find("ul", class_="spirit")
    if spirit_ul:
        for li in spirit_ul.find_all("li"):
            spirits.append(li.get_text().strip())

    return {
        "file": os.path.basename(filepath),
        "title": title,
        "imgs": imgs,
        "item_rows": item_rows,
        "spirits": spirits
    }

def main():
    cache_dir = "tools/shanil_cache"
    all_pages = []
    for f in sorted(os.listdir(cache_dir)):
        if f.endswith(".html"):
            pdata = parse_page(os.path.join(cache_dir, f))
            all_pages.append(pdata)

    print(f"Parsed {len(all_pages)} pages.")
    
    with open("tools/shanil_parsed_all.json", "w", encoding="utf-8") as out:
        json.dump(all_pages, out, ensure_ascii=False, indent=2)

    for p in all_pages:
        print(f"\n[{p['file']}] {p['title']}")
        print(f"  Maps: {p['imgs']}")
        print(f"  Item rows ({len(p['item_rows'])}):")
        for r in p['item_rows']:
            chests = [l for l in r['raw_lines'] if '（宝）' in l or '(宝)' in l]
            other = [l for l in r['raw_lines'] if '（宝）' not in l and '(宝)' not in l]
            c_str = ", ".join(chests) if chests else "(none)"
            print(f"    - {r['place']}: chests=[{c_str}]")

if __name__ == "__main__":
    main()
