import os
from bs4 import BeautifulSoup
import re

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

def parse_chart(fname, plane_name):
    fpath = os.path.join(cache_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n==================== {plane_name} ({fname}) ====================")
    sections = []
    for h2 in soup.find_all('h2'):
        title = h2.get_text(strip=True)
        if 'メニュー' in title:
            break
        
        # gather content under h2
        content = []
        curr = h2.next_sibling
        while curr and curr.name != 'h2':
            if curr.name in ['p', 'ul', 'ol', 'table']:
                t = curr.get_text(strip=True)
                if t:
                    content.append(t)
            curr = curr.next_sibling
        full_text = " ".join(content)
        sections.append((title, full_text))
        print(f"[{title}] Length: {len(full_text)}")
        # print keywords
        for kw in ['ボス', '仲間', '取り返し', '注意', '警告', '消滅', '期限']:
            if kw in full_text:
                # print a small match
                idx = full_text.find(kw)
                print(f"   ({kw}): {full_text[idx:idx+80]}")

parse_chart("chart_matter.html", "物質のプレーン")
parse_chart("chart_light.html", "光のプレーン")
parse_chart("chart_dark.html", "闇のプレーン")
parse_chart("chart_death.html", "死のプレーン")
parse_chart("chart_garam.html", "ガラムマサラ")
