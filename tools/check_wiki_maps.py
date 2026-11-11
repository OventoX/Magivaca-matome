import os
import glob
import re
import urllib.parse

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    cache_dir = os.path.join(base_dir, "wiki_cache")
    
    print("Checking wiki_cache HTML files for images/maps...")
    found_any = False
    for f in sorted(glob.glob(os.path.join(cache_dir, "*.html"))):
        with open(f, "r", encoding="utf-8", errors="ignore") as fp:
            content = fp.read()
        
        # Look for img tags, ref attachments, map mentions
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
        meaningful_imgs = [
            img for img in imgs 
            if not any(k in img.lower() for k in ["face", "plugin", "smile", "pukiwiki", "skin", "tracker", "counter", "p_dot"])
        ]
        if meaningful_imgs:
            found_any = True
            print(f"\n[FILE] {os.path.basename(f)}:")
            for img in meaningful_imgs:
                print("  IMG:", img)
        
        # Also check for links to attachments or images (.png, .jpg, .gif)
        attachments = re.findall(r'href=["\']([^"\']+\.(?:png|jpg|jpeg|gif))["\']', content, re.IGNORECASE)
        if attachments:
            found_any = True
            print(f"\n[ATTACHMENT IN {os.path.basename(f)}]:")
            for att in attachments:
                print("  ATT:", att)

    if not found_any:
        print("No image attachments found in existing cache.")

if __name__ == "__main__":
    main()
