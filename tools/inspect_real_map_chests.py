import json

def main():
    with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
        chests = json.load(fp)
        
    for area_name in ["ガラムマサラ", "リドナヒー", "リギニオ密林"]:
        area_chests = [c for c in chests if c.get("area") == area_name]
        print(f"\n=== Area: {area_name} ({len(area_chests)} chests) ===")
        for c in area_chests[:10]:
            print(f"  ID: {c.get('id')}, Item: {c.get('item')}, Loc: {c.get('locationDetail')}, Coords: {c.get('coordinates')}")

if __name__ == "__main__":
    main()
