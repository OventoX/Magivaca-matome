import urllib.request
import urllib.parse
import re
import os
import ssl

def fetch_url(url):
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            raw = resp.read()
            for enc in ["shift_jis", "cp932", "euc-jp", "utf-8"]:
                try:
                    return raw.decode(enc)
                except UnicodeDecodeError:
                    continue
            return raw.decode("latin1", errors="ignore")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    base_url = "https://www5f.biglobe.ne.jp/~shanil/mv/data/"
    index_url = base_url + "index.html"
    print(f"Fetching {index_url}...")
    html = fetch_url(index_url)
    if not html:
        print("Failed to fetch index.")
        return

    links = re.findall(r'href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    print(f"Found {len(links)} links on index.html:")
    for l in links:
        print("  ", l)

if __name__ == "__main__":
    main()
