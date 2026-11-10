from bs4 import BeautifulSoup
import re
import json

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\seirei.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("--- Headings in seirei.html ---")
headings = []
for h in soup.find_all(['h2', 'h3', 'h4']):
    text = h.get_text(strip=True)
    # find anchor if any
    anchor = ""
    a_tag = h.find('a', id=True) or h.find_previous('a', id=True)
    # In wikiwiki, often <a id="abc" class="anchor_super"></a> or h has id
    h_id = h.get('id', '')
    headings.append((h.name, text, h_id))
    print(f"{h.name}: {text} (id={h_id})")

print("\n--- Tables Summary ---")
tables = soup.find_all('table')
print(f"Total tables: {len(tables)}")

for idx, table in enumerate(tables):
    rows = table.find_all('tr')
    headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])] if rows else []
    # check preceding heading
    prev_h = table.find_previous(['h2', 'h3', 'h4'])
    prev_h_text = prev_h.get_text(strip=True) if prev_h else "None"
    print(f"Table {idx}: Preceded by '{prev_h_text}', Rows: {len(rows)}, Headers: {headers}")
