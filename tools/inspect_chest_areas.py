import json
import re

def main():
    # Read js/data.js and find CHEST_DATA
    with open("js/data.js", "r", encoding="utf-8") as fp:
        content = fp.read()
    
    # find const CHESTS_DATA = ... or CHEST_DATA
    m = re.search(r'const\s+CHESTS_DATA\s*=\s*(\[\s*\{.*?\}\s*\]);', content, re.DOTALL)
    if not m:
        # try reading tools/chests_extracted.json
        with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
            data = json.load(fp)
    else:
        data = json.loads(m.group(1))
        
    print(f"Total chests: {len(data)}")
    planes = {}
    for c in data:
        p = c.get("plane", "Unknown")
        a = c.get("area", "Unknown")
        if p not in planes:
            planes[p] = {}
        if a not in planes[p]:
            planes[p][a] = []
        planes[p][a].append(c)
        
    for p, areas in planes.items():
        print(f"\n=== Plane: {p} ({len(areas)} areas) ===")
        for a, clist in areas.items():
            print(f"  Area: {a} ({len(clist)} chests) - sample location: {clist[0].get('locationDetail', '')[:50]}")

if __name__ == "__main__":
    main()
