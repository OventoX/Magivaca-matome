import json

def normalize_name(s):
    if not s: return ""
    # remove brackets, spaces, parenthesis for fuzzy matching
    s = s.replace(" ", "").replace("　", "")
    return s

def main():
    with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
        chests = json.load(fp)
    with open("tools/schematics_definitions.json", "r", encoding="utf-8") as fp:
        schematics = json.load(fp)
        
    for area, defn in schematics.items():
        area_chests = [c for c in chests if c.get("area") == area]
        grid = defn["grid"]
        
        # Collect all cells in grid
        cells = []
        for r in grid:
            for cell in r:
                if cell:
                    cells.append(cell)
                    
        # Check every chest room
        chest_rooms = {}
        for c in area_chests:
            m = c["mapName"]
            chest_rooms[m] = chest_rooms.get(m, 0) + 1
            
        unmatched = []
        for m, count in chest_rooms.items():
            # Check if m is in cells or partially matches
            matched_cell = None
            for cell in cells:
                if m == cell or m in cell or cell in m:
                    matched_cell = cell
                    break
            if not matched_cell:
                # try normalized matching
                norm_m = normalize_name(m)
                for cell in cells:
                    norm_c = normalize_name(cell)
                    if norm_m in norm_c or norm_c in norm_m:
                        matched_cell = cell
                        break
            if not matched_cell:
                unmatched.append((m, count))
                
        if unmatched:
            print(f"[UNMATCHED IN {area}]:")
            for m, count in unmatched:
                print(f"   Chests in '{m}' ({count} chests) not found in cells: {cells}")

if __name__ == "__main__":
    main()
