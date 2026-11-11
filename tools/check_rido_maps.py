import os
from bs4 import BeautifulSoup

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    with open(os.path.join(base_dir, "chart_garam.html"), "r", encoding="utf-8", errors="ignore") as fp:
        html = fp.read()
    soup = BeautifulSoup(html, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "map-rido" in src:
            h = img.find_previous(["h2", "h3", "h4", "p"])
            print("rido map:", src, "prev:", h.get_text() if h else "none")

if __name__ == "__main__":
    main()
