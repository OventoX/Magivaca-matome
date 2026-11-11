import json

with open('tools/chests_extracted.json', encoding='utf-8') as f:
    chests = json.load(f)

for c in chests:
    if c['missable']:
        print(f"[{c['plane']} / {c['area']}] #{c['number']} {c['mapName']} ({c['coord']}): {c['item']}")
        print(f"   理由: {c['missableReason']}\n")
