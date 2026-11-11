import urllib.request
import urllib.parse
import re
import os

pages_to_check = [
    "ガラムマサラ",
    "ガラムマサラ/0",
    "ガラムマサラ/1",
    "ガラムマサラ/2",
    "ガラムマサラ/3",
    "ガラムマサラ/4",
    "ガラムマサラ/5",
    "物質のプレーン",
    "光のプレーン",
    "闇のプレーン",
    "死のプレーン",
    "フィールド拾得物",
    "フィールド拾得物/0",
    "フィールド拾得物/1",
    "フィールド拾得物/2",
    "フィールド拾得物/3",
    "フィールド拾得物/4",
    "ベナコンチャ回収チャート",
    "レーミッツ回収チャート",
    "ハズレ宝箱のコイン一覧"
]

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    print("Checking wiki pages for map images...")
    for p in pages_to_check:
        safe_p = p.replace("/", "_")
        cache_path = os.path.join(base_dir, f"check_{safe_p}.html")
        if not os.path.exists(cache_path):
            encoded = urllib.parse.quote(p)
            url = f"https://wikiwiki.jp/magivaca/{encoded}"
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as resp:
                    html = resp.read().decode("utf-8", errors="ignore")
                with open(cache_path, "w", encoding="utf-8") as fp:
                    fp.write(html)
            except Exception as e:
                print(f"Error fetching {p}: {e}")
                continue
        else:
            with open(cache_path, "r", encoding="utf-8") as fp:
                html = fp.read()
                
        # inspect images
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
        meaningful = [i for i in imgs if not any(x in i.lower() for x in ["face", "plugin", "smile", "pukiwiki", "skin", "tracker", "counter", "p_dot"])]
        
        # also check for .png/.jpg links
        links = re.findall(r'href=["\']([^"\']+\.(?:png|jpg|jpeg|gif))["\']', html)
        
        if meaningful or links:
            print(f"\n[PAGE: {p}] imgs={len(meaningful)}, file_links={len(links)}")
            for img in meaningful:
                print("  IMG:", img)
            for l in links:
                print("  LINK:", l)
        else:
            print(f"[PAGE: {p}] no images found.")

if __name__ == "__main__":
    main()
