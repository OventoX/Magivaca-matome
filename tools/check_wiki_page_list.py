import urllib.request
import re
import urllib.parse

def main():
    url = "https://wikiwiki.jp/magivaca/?cmd=list"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print("Error fetching list:", e)
        # try main page
        url = "https://wikiwiki.jp/magivaca/"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

    # Extract all wiki links
    links = re.findall(r'href=["\'](?:https://wikiwiki\.jp/magivaca/|/magivaca/)([^"\'#?]+)["\']', html)
    unique_pages = sorted(list(set(urllib.parse.unquote(p) for p in links)))
    print(f"Found {len(unique_pages)} pages:")
    for p in unique_pages:
        print(" ", p)

if __name__ == "__main__":
    main()
