import os
import re

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    with open(os.path.join(base_dir, "chart_garam.html"), "r", encoding="utf-8") as fp:
        garam_html = fp.read()
    with open(os.path.join(base_dir, "chart_dark.html"), "r", encoding="utf-8") as fp:
        dark_html = fp.read()
        
    imgs = {}
    
    # riginio
    m = re.search(r'(https://cdn\.wikiwiki\.jp/to/w/magivaca/[^"\']+map_riginio\.png[^"\']*)', dark_html)
    if m:
        imgs["map_riginio.png"] = m.group(1).replace("&amp;", "&")
        
    # garam
    for m in re.finditer(r'(https://cdn\.wikiwiki\.jp/to/w/magivaca/[^"\']+(map-garam\d+-\d+\.png|map-rido\d+-\d+\.png)[^"\']*)', garam_html):
        url = m.group(1).replace("&amp;", "&")
        fname = m.group(2)
        imgs[fname] = url
        
    print(f"Extracted {len(imgs)} map image URLs:")
    for k, v in sorted(imgs.items()):
        print(f"  {k} -> {v[:80]}...")

if __name__ == "__main__":
    main()
