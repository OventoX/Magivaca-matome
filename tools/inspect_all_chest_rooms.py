import json
import os
import re
from bs4 import BeautifulSoup

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    
    with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
        chests = json.load(fp)
        
    area_map_names = {}
    for c in chests:
        p = c["plane"]
        a = c["area"]
        m = c["mapName"]
        key = (p, a)
        if key not in area_map_names:
            area_map_names[key] = set()
        area_map_names[key].add(m)
        
    print(f"Total areas in chest DB: {len(area_map_names)}")
    for (p, a), maps in sorted(area_map_names.items()):
        print(f"\n[{p}] {a}: {len(maps)} rooms -> {sorted(list(maps))}")

if __name__ == "__main__":
    main()
