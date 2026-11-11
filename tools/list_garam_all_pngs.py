import os
import re

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    with open(os.path.join(base_dir, "chart_garam.html"), "r", encoding="utf-8", errors="ignore") as fp:
        html = fp.read()
    
    matches = re.findall(r'src=["\']([^"\']+\.png[^"\']*)["\']', html)
    print("All pngs in chart_garam.html:")
    for m in matches:
        print(" ", m.split("?")[0].split("/")[-1], "->", m)

if __name__ == "__main__":
    main()
