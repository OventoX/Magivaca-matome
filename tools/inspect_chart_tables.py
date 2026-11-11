import os
import re
from bs4 import BeautifulSoup

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    
    files = ["chart_matter.html", "chart_light.html", "chart_dark.html", "chart_death.html", "chart_garam.html"]
    for fname in files:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as fp:
            html = fp.read()
            
        soup = BeautifulSoup(html, "html.parser")
        print(f"\n================ {fname} ================")
        
        # find headings that might contain maps
        for h in soup.find_all(["h2", "h3", "h4"]):
            h_text = h.get_text().strip()
            # check siblings
            next_elem = h.find_next_sibling()
            tables = []
            while next_elem and next_elem.name not in ["h2", "h3", "h4"]:
                if next_elem.name == "table" or (next_elem.name == "div" and next_elem.find("table")):
                    tables.append(next_elem)
                next_elem = next_elem.find_next_sibling()
                
            # check if any table looks like a floor map (e.g. grid of cells or connection table)
            for t in tables:
                t_text = t.get_text()
                if any(k in t_text for k in ["マップ", "階", "宝箱", "順路", "フロア", "北", "南", "東", "西"]) or len(t.find_all("td")) > 6:
                    print(f"[{h_text}] table cells: {len(t.find_all('td'))}, text snippet: {t_text[:120].strip()}")

if __name__ == "__main__":
    main()
