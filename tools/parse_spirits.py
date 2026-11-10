from bs4 import BeautifulSoup
import json
import re

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\seirei.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

element_info = [
    {"name": "火", "spirit": "トースト", "anchor": "#q524a13d"},
    {"name": "風", "spirit": "エア", "anchor": "#dbfb1e30"},
    {"name": "毒", "spirit": "ブー", "anchor": "#ka07bb17"},
    {"name": "美", "spirit": "パウダー", "anchor": "#j66c7aa7"},
    {"name": "刃", "spirit": "スラッシュ", "anchor": "#s456a1dd"},
    {"name": "音", "spirit": "ハミング", "anchor": "#xe785233"},
    {"name": "石", "spirit": "フリント", "anchor": "#xad63487"},
    {"name": "虫", "spirit": "バズ", "anchor": "#r32d5514"},
    {"name": "木", "spirit": "スティック", "anchor": "#g37a546f"},
    {"name": "獣", "spirit": "ガル", "anchor": "#hf2c0f2d"},
    {"name": "水", "spirit": "フロー", "anchor": "#h429d284"},
    {"name": "雷", "spirit": "テスラ", "anchor": "#qf966dd1"},
    {"name": "古", "spirit": "クロック", "anchor": "#de5c0f08"},
    {"name": "闇", "spirit": "ニルヴァ", "anchor": "#n270c9c1"},
    {"name": "光", "spirit": "ルクス", "anchor": "#q615b8e0"},
    {"name": "愛", "spirit": "ウィッシュ", "anchor": "#ea3eb1e7"},
]

results = []

for elem in element_info:
    # Find h2 matching element name
    h2 = None
    for h in soup.find_all('h2'):
        if f"{elem['name']}の精霊" in h.get_text():
            h2 = h
            break
    if not h2:
        print(f"H2 not found for {elem['name']}")
        continue

    # Find the main spirit table (must have '居場所' in header) before the next h2
    target_table = None
    for el in h2.find_all_next():
        if el.name == 'h2':
            break
        if el.name == 'table':
            rows = el.find_all('tr')
            if rows:
                headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                if any('居場所' in h for h in headers):
                    target_table = el
                    break

    if not target_table:
        print(f"Table not found for {elem['name']}")
        continue

    rows = target_table.find_all('tr')
    headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
    print(f"\n=== {elem['name']} ({elem['spirit']}) Headers: {headers} ===")
    
    elem_spirits = []
    for r_idx, row in enumerate(rows[1:], 1):
        cells = [td.get_text(strip=True) for td in row.find_all(['th', 'td'])]
        print(f"  [{r_idx}] {cells}")
        elem_spirits.append(cells)
    
    results.append({
        "element": elem['name'],
        "spirit_name": elem['spirit'],
        "anchor": elem['anchor'],
        "headers": headers,
        "rows": elem_spirits
    })

print(f"\nTotal elements parsed: {len(results)}")
print(f"Total spirits parsed: {sum(len(r['rows']) for r in results)}")

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\parsed_spirits.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved parsed_spirits.json")
