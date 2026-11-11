import os
import json
from bs4 import BeautifulSoup

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    
    files = {
        "物質のプレーン": "chart_matter.html",
        "光のプレーン": "chart_light.html",
        "闇のプレーン": "chart_dark.html",
        "死のプレーン": "chart_death.html",
        "ガラムマサラ": "chart_garam.html"
    }
    
    schematics = {}
    for plane, fname in files.items():
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as fp:
            soup = BeautifulSoup(fp.read(), "html.parser")
            
        for t in soup.find_all("table"):
            if "マップ位置 概略" in t.get_text() or "宮殿内部概略図" in t.get_text():
                # find heading
                h = t.find_previous(["h2", "h3", "h4"])
                h_name = h.get_text().strip() if h else "Unknown"
                # extract grid rows
                grid = []
                for tr in t.find_all("tr"):
                    cells = [td.get_text().strip() for td in tr.find_all(["td", "th"])]
                    if cells and cells != ["マップ位置 概略"] and cells != ["宮殿内部概略図"]:
                        grid.append(cells)
                if grid:
                    schematics[f"{plane}::{h_name}"] = grid

    print(f"Extracted {len(schematics)} wiki schematic grids:")
    for k, g in schematics.items():
        print(f"\n{k} (rows: {len(g)}):")
        for r in g:
            print("  ", r)

    with open("tools/wiki_schematics_extracted.json", "w", encoding="utf-8") as fp:
        json.dump(schematics, fp, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
