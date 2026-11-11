import os
import re
import urllib.request
import urllib.parse
import ssl
from bs4 import BeautifulSoup

def main():
    base_url = "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/"
    cache_dir = "tools/shanil_cache"
    maps_dir = "tools/shanil_maps"
    os.makedirs(maps_dir, exist_ok=True)
    
    ctx = ssl._create_unverified_context()
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for f in sorted(os.listdir(cache_dir)):
        if not f.endswith(".html"):
            continue
        filepath = os.path.join(cache_dir, f)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as fp:
            html = fp.read()
            
        soup = BeautifulSoup(html, "html.parser")
        title = soup.find("title")
        title_text = title.get_text().strip() if title else f
        
        print(f"\n==================== {f}: {title_text} ====================")
        
        # Find map images
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "map_" in src:
                clean_src = src.replace("./", "")
                img_url = urllib.parse.urljoin(base_url, clean_src)
                local_path = os.path.join(maps_dir, clean_src)
                print(f"  MAP IMG: {clean_src} -> {img_url}")
                if not os.path.exists(local_path):
                    try:
                        req = urllib.request.Request(img_url, headers=headers)
                        with urllib.request.urlopen(req, context=ctx) as resp:
                            data = resp.read()
                        with open(local_path, "wb") as ifp:
                            ifp.write(data)
                        print(f"    Downloaded {clean_src} ({len(data)} bytes)")
                    except Exception as e:
                        print(f"    Failed to download {clean_src}: {e}")
                        
        # Find item tables (look for tables with "アイテム" or "場所")
        tables = soup.find_all("table")
        for tbl in tables:
            text = tbl.get_text()
            if "アイテム" in text or "場所" in text or "中身" in text:
                rows = []
                for tr in tbl.find_all("tr"):
                    cells = [td.get_text().strip() for td in tr.find_all(["td", "th"])]
                    if cells:
                        rows.append(cells)
                if len(rows) > 1:
                    print(f"  TABLE ({len(rows)} rows):")
                    for r in rows[:6]:
                        print("   ", r)

if __name__ == "__main__":
    main()
