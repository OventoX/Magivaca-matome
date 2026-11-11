import json

with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
    chests = json.load(fp)

for a in ["ガラムマサラ", "リドナヒー", "リギニオ密林"]:
    ac = [c for c in chests if c.get("area") == a]
    print(f"\nArea: {a} ({len(ac)} chests)")
    for c in ac[:5]:
        print(f"  ID: {c['id']}, mapName: {c.get('mapName')}, coord: {c.get('coord')}, item: {c.get('item')}")
