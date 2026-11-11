import urllib.request
import urllib.parse
import re
import os
import ssl
import time

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
    chart_pages = [
        "s_stance.html",
        "chart/l_1.html", "chart/l_2.html", "chart/l_3.html", "chart/l_4.html", "chart/l_5.html",
        "chart/l_6.html", "chart/l_7.html", "chart/l_8.html", "chart/l_9.html", "chart/l_10.html", "chart/l_11.html",
        "chart/d_1.html", "chart/d_2.html", "chart/d_3.html", "chart/d_4.html", "chart/d_5.html",
        "chart/d_6.html", "chart/d_7.html", "chart/d_8.html", "chart/d_9.html", "chart/d_10.html",
        "chart/e_1.html", "chart/e_2.html", "chart/e_3.html", "chart/e_4.html", "chart/e_5.html",
        "chart/e_6.html", "chart/e_7.html", "chart/e_8.html",
        "chart/g_1.html"
    ]

    out_cache = "tools/shanil_cache"
    os.makedirs(out_cache, exist_ok=True)
    
    results = []
    for cp in chart_pages:
        full_url = urllib.parse.urljoin(base_url, cp)
        cache_file = os.path.join(out_cache, cp.replace("/", "_"))
        if not os.path.exists(cache_file):
            print(f"Fetching {cp}...")
            html = fetch_url(full_url)
            if html:
                with open(cache_file, "w", encoding="utf-8") as f:
                    f.write(html)
            time.sleep(0.2)
        else:
            with open(cache_file, "r", encoding="utf-8") as f:
                html = f.read()

        if not html:
            continue

        # Extract title
        title_m = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
        page_title = title_m.group(1).strip() if title_m else "No title"

        # Find map images (map_*.gif, *.gif, *.jpg)
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
        map_imgs = [i for i in imgs if not any(x in i.lower() for x in ["line", "icon", "arrow", "dot", "counter", "title", "b_", "back", "top"])]

        results.append({
            "page": cp,
            "url": full_url,
            "title": page_title,
            "map_imgs": map_imgs
        })

    print("\n=== SUMMARY OF SHANIL CHART PAGES ===")
    for r in results:
        imgs_str = ", ".join(r["map_imgs"]) if r["map_imgs"] else "none"
        print(f"[{r['page']}] {r['title']} -> MAPS: {imgs_str}")

if __name__ == "__main__":
    main()
