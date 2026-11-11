import json

with open('tools/shanil_parsed_all.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    if p['imgs']:
        places = [r['place'] for r in p['item_rows']]
        print(f"[{p['file']}] {p['title']} (imgs: {len(p['imgs'])}) -> places ({len(places)}): {places[:6]}")
