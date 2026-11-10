from bs4 import BeautifulSoup
import json

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\seirei.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Check text under each heading
for h2 in soup.find_all('h2'):
    title = h2.get_text(strip=True)
    if 'メニュー' in title:
        break
    print(f"\n==================== {title} ====================")
    # Print direct anchor ID
    # In wikiwiki, often <a id="ja6e4485"></a> precedes or is inside h2
    prev_a = h2.find_previous('a', id=True)
    curr_a = h2.find('a', id=True)
    print(f"Anchor ID: {curr_a.get('id') if curr_a else (prev_a.get('id') if prev_a else 'none')}")
    
    # iterate siblings until next h2
    curr = h2.next_sibling
    texts = []
    while curr and (curr.name != 'h2' or curr == h2):
        if curr.name in ['p', 'div', 'ul', 'ol', 'h3', 'table']:
            if curr.name == 'table':
                # summarize table
                rows = curr.find_all('tr')
                headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])] if rows else []
                print(f"[TABLE: {headers}] ({len(rows)-1} data rows)")
                # print first row as example
                if len(rows) > 1:
                    cells = [td.get_text(strip=True) for td in rows[1].find_all(['th', 'td'])]
                    print(f"  Ex: {cells}")
            elif curr.name == 'h3':
                h3_a = curr.find('a', id=True) or curr.find_previous('a', id=True)
                print(f"--- H3: {curr.get_text(strip=True)} (anchor: {h3_a.get('id') if h3_a else 'none'}) ---")
            else:
                txt = curr.get_text(strip=True)
                if txt:
                    print(f"  TXT: {txt[:120]}...")
        curr = curr.next_sibling
