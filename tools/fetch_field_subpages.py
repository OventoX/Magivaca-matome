import urllib.request
import time
import os

pages = {
    "field_items_0.html": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/0",
    "field_items_1.html": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1",
    "field_items_2.html": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2",
    "field_items_3.html": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3",
    "field_items_4.html": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/4",
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
}

os.makedirs('wiki_cache', exist_ok=True)

for fname, url in pages.items():
    out_path = os.path.join('wiki_cache', fname)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        print(f"Already exists: {fname} ({os.path.getsize(out_path)} bytes)")
        continue

    print(f"Fetching {url} -> {fname}...")
    success = False
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as res:
                content = res.read()
                with open(out_path, 'wb') as f:
                    f.write(content)
            print(f"  Successfully saved {fname} ({len(content)} bytes)")
            success = True
            break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}. Waiting 6 seconds...")
            time.sleep(6)
    
    if not success:
        print(f"Failed to fetch {url}")
    time.sleep(4)
