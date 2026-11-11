import os
import re
from bs4 import BeautifulSoup

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    
    # Check chart_dark.html
    with open(os.path.join(base_dir, "chart_dark.html"), "r", encoding="utf-8", errors="ignore") as fp:
        html = fp.read()
    
    soup = BeautifulSoup(html, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "map_riginio" in src:
            parent = img.parent
            print("Dark plane map found:", src)
            print("Surrounding text:", parent.get_text()[:200])

    # Check chart_garam.html
    with open(os.path.join(base_dir, "chart_garam.html"), "r", encoding="utf-8", errors="ignore") as fp:
        html = fp.read()
    soup = BeautifulSoup(html, "html.parser")
    garam_maps = []
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "map-" in src or "map_" in src:
            # find heading or preceding text
            h = img.find_previous(["h2", "h3", "h4"])
            h_text = h.get_text().strip() if h else "Unknown"
            garam_maps.append((src, h_text))
            
    print(f"\nGaram maps count: {len(garam_maps)}")
    for src, h in garam_maps[:15]:
        print(f"  Heading: {h} -> {src}")

if __name__ == "__main__":
    main()
