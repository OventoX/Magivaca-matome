import json
import os
import re

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    
    with open(os.path.join(base_dir, "tools", "chests_extracted.json"), "r", encoding="utf-8") as fp:
        chests = json.load(fp)
        
    with open(os.path.join(base_dir, "tools", "wiki_schematics_extracted.json"), "r", encoding="utf-8") as fp:
        wiki_schematics = json.load(fp)
        
    # Group chests by area and by mapName
    chests_by_area = {}
    for c in chests:
        p = c["plane"]
        a = c["area"]
        m = c["mapName"]
        key = (p, a)
        if key not in chests_by_area:
            chests_by_area[key] = {}
        if m not in chests_by_area[key]:
            chests_by_area[key][m] = []
        chests_by_area[key][m].append(c)
        
    print(f"Total areas with chests: {len(chests_by_area)}")
    
    # Check matching with wiki schematics
    for (p, a), room_dict in sorted(chests_by_area.items()):
        total_c = sum(len(cl) for cl in room_dict.values())
        print(f"\n[{p}] {a} (Total: {total_c} chests, {len(room_dict)} chest rooms):")
        for m, cl in sorted(room_dict.items()):
            print(f"   Room: '{m}' -> {len(cl)} chests")

if __name__ == "__main__":
    main()
