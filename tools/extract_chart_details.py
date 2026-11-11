from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

for plane_name, fname in [
    ("物質のプレーン", "chart_matter.html"),
    ("光のプレーン", "chart_light.html"),
    ("闇のプレーン", "chart_dark.html"),
    ("死のプレーン", "chart_death.html")
]:
    with open(os.path.join(cache_dir, fname), 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n==================== {plane_name} ====================")
    for h2 in soup.find_all('h2'):
        title = h2.get_text(strip=True)
        if 'メニュー' in title:
            break
        # print text and tables under this h2
        print(f"\n--- {title} ---")
        curr = h2.next_sibling
        while curr and curr.name != 'h2':
            if curr.name == 'p':
                txt = curr.get_text(strip=True)
                if any(k in txt for k in ['ボス', '敵', 'LV', '仲間', '注意', '出現', '取り返し']):
                    print(f"  P: {txt[:120]}")
            elif curr.name == 'table':
                rows = curr.find_all('tr')
                headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                if any(k in "".join(headers) for k in ['ボス', '敵', 'LV', '仲間', 'マップ']):
                    print(f"  Table: {headers} ({len(rows)} rows)")
            curr = curr.next_sibling
