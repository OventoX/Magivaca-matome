import os
import re
import time
import urllib.request

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    cache_dir = os.path.join(base_dir, "wiki_cache")
    out_dir = os.path.join(base_dir, "img", "maps")
    os.makedirs(out_dir, exist_ok=True)
    
    with open(os.path.join(cache_dir, "chart_garam.html"), "r", encoding="utf-8") as fp:
        garam_html = fp.read()
    with open(os.path.join(cache_dir, "chart_dark.html"), "r", encoding="utf-8") as fp:
        dark_html = fp.read()
        
    imgs = {}
    m = re.search(r'(https://cdn\.wikiwiki\.jp/to/w/magivaca/[^"\']+map_riginio\.png[^"\']*)', dark_html)
    if m:
        imgs["map_riginio.png"] = m.group(1).replace("&amp;", "&")
        
    for m in re.finditer(r'(https://cdn\.wikiwiki\.jp/to/w/magivaca/[^"\']+(map-garam\d+-\d+\.png|map-rido\d+-\d+\.png)[^"\']*)', garam_html):
        url = m.group(1).replace("&amp;", "&")
        fname = m.group(2)
        imgs[fname] = url

    headers = {"User-Agent": "Mozilla/5.0"}
    print(f"Downloading {len(imgs)} maps to {out_dir}...")
    success = 0
    total_bytes = 0
    for fname, url in sorted(imgs.items()):
        out_path = os.path.join(out_dir, fname)
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            success += 1
            total_bytes += os.path.getsize(out_path)
            continue
            
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
            with open(out_path, "wb") as fp:
                fp.write(data)
            success += 1
            total_bytes += len(data)
            print(f"  [OK] {fname} ({len(data)} bytes)")
            time.sleep(0.15)
        except Exception as e:
            print(f"  [ERR] {fname}: {e}")

    print(f"Finished downloading {success}/{len(imgs)} images. Total size: {total_bytes / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
