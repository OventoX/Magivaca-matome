import os
import glob
import re

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    cache_dir = os.path.join(base_dir, "wiki_cache")
    
    for f in sorted(glob.glob(os.path.join(cache_dir, "*.html"))):
        with open(f, "r", encoding="utf-8", errors="ignore") as fp:
            content = fp.read()
        
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
        imgs = [i for i in imgs if not any(x in i.lower() for x in ["face", "plugin", "smile", "pukiwiki", "skin", "tracker", "counter", "p_dot"])]
        
        # also search for keywords like map, マップ, 画像, フロア
        has_map_kw = bool(re.search(r'map|マップ|フロア|見取図|見取り図', content, re.IGNORECASE))
        
        if imgs or has_map_kw:
            print(f"{os.path.basename(f)}: imgs={len(imgs)}, has_map_kw={has_map_kw}")
            if imgs:
                for img in imgs[:5]: # show first 5
                    print("  ", img)

if __name__ == "__main__":
    main()
