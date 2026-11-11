import os
import re

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    
    # Inspect chart_dark.html where map_riginio.png is mentioned
    with open(os.path.join(base_dir, "chart_dark.html"), "r", encoding="utf-8") as fp:
        dark_html = fp.read()
    
    idx = dark_html.find("map_riginio.png")
    if idx != -1:
        print("=== Context of map_riginio.png ===")
        print(dark_html[max(0, idx-300):min(len(dark_html), idx+400)])

if __name__ == "__main__":
    main()
