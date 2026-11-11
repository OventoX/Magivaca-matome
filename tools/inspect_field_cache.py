from bs4 import BeautifulSoup

with open('wiki_cache/field_items.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

body = soup.select_one('#body') or soup
for heading in body.find_all(['h2', 'h3', 'h4']):
    htext = heading.get_text(strip=True)
    print(f'H: {htext}')
    nxt = heading.find_next_sibling()
    while nxt and nxt.name not in ['h2', 'h3', 'h4']:
        if nxt.name == 'table':
            rows = nxt.find_all('tr')
            print(f'   Table rows: {len(rows)}')
            for row in rows[:3]:
                print('     ', [td.get_text(strip=True) for td in row.find_all(['th', 'td'])])
            break
        nxt = nxt.find_next_sibling()
