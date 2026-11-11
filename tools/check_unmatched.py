import json

def main():
    with open('tools/shanil_parsed_all.json', 'r', encoding='utf-8') as f:
        pages = json.load(f)

    with open('tools/correlation_results.json', 'r', encoding='utf-8') as f:
        results = json.load(f)

    unmatched = []
    for a, r in results.items():
        for u in r['unmatched']:
            unmatched.append((a, u))

    print(f"Total unmatched: {len(unmatched)}")
    for a, u in unmatched:
        print(f"\nTarget: Area='{a}', id='{u['id']}', item='{u['item']}', mapName='{u['mapName']}'")
        found = []
        for p in pages:
            for r in p['item_rows']:
                for l in r['raw_lines']:
                    if u['item'] in l or u['mapName'] in r['place']:
                        found.append((p['file'], p['title'], r['place'], l))
        if found:
            for pf, pt, pl, l in found[:5]:
                print(f"   Candidate in [{pf} {pt}]: place='{pl}' item='{l}'")
        else:
            print("   -> No exact candidate found in Shanil tables.")

if __name__ == "__main__":
    main()
