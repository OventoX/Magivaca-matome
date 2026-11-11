import os
from bs4 import BeautifulSoup

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    for fname in ["chart_matter.html", "chart_light.html", "chart_dark.html", "chart_death.html"]:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as fp:
            soup = BeautifulSoup(fp.read(), "html.parser")
        
        print(f"\n================ {fname} ================")
        # search for any table whose header or content contains "マップ" or "概略"
        for t in soup.find_all("table"):
            th_list = [th.get_text().strip() for th in t.find_all("th")]
            caption = t.find_previous(["h2", "h3", "h4"])
            cap_text = caption.get_text().strip() if caption else "None"
            if any("マップ" in th or "概略" in th for th in th_list) or "マップ位置" in t.get_text():
                # print table structure
                rows = []
                for tr in t.find_all("tr"):
                    cells = [td.get_text().strip() for td in tr.find_all(["td", "th"])]
                    if cells:
                        rows.append(cells)
                print(f"[{cap_text}] {rows[0] if rows else ''} (rows: {len(rows)})")
                for r in rows[:4]:
                    print("   ", r)

if __name__ == "__main__":
    main()
