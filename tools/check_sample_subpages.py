import urllib.request
import urllib.parse
import re
import time

test_pages = [
    "MonsterList/MapDark/01",
    "MonsterList/MapLight/01",
    "MonsterList/MapDeath/01",
    "MonsterList/MapGaram/01",
    "ベナコンチャ回収チャート",
    "レーミッツ回収チャート"
]

def main():
    headers = {"User-Agent": "Mozilla/5.0"}
    for p in test_pages:
        time.sleep(1.0)
        encoded = urllib.parse.quote(p)
        url = f"https://wikiwiki.jp/magivaca/{encoded}"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
            imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
            meaningful = [i for i in imgs if not any(x in i.lower() for x in ["face", "plugin", "smile", "pukiwiki", "skin", "tracker", "counter", "p_dot"])]
            print(f"[PAGE {p}]: imgs={len(meaningful)}")
            for img in meaningful[:5]:
                print("  ", img)
        except Exception as e:
            print(f"[PAGE {p}]: error: {e}")

if __name__ == "__main__":
    main()
