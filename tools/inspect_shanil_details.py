import os
from bs4 import BeautifulSoup
import re

def inspect_page(fname):
    fpath = os.path.join("tools/shanil_cache", fname)
    if not os.path.exists(fpath):
        return
    with open(fpath, "r", encoding="utf-8") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")
    
    print(f"\n==================== {fname} ====================")
    # Check text around map images
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "map_" in src:
            print(f"Image: {src}")
            # print previous/next elements
            p = img.parent
            print("Parent text:", p.get_text()[:150])

    # Check item table
    tables = soup.find_all("table")
    for t in tables:
        rows = t.find_all("tr")
        if not rows: continue
        hdr = [c.get_text().strip() for c in rows[0].find_all(["th", "td"])]
        if "場所" in hdr or "アイテム" in hdr:
            print(f"Item Table Headers: {hdr}")
            for r in rows[1:10]:
                cells = [c.get_text().strip() for c in r.find_all(["th", "td"])]
                print("  ROW:", cells)

def main():
    inspect_page("chart_l_5.html") # Benakoncha
    inspect_page("chart_l_3.html") # Mimorett & cave
    inspect_page("chart_d_10.html") # Kisunika
    inspect_page("chart_e_4.html") # Pyramid

if __name__ == "__main__":
    main()
