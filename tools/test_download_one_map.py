import urllib.request
import os

def main():
    url = "https://cdn.wikiwiki.jp/to/w/magivaca/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3/::ref/map_riginio.png?rev=200550fb99340b9434a688c0f45b26ba&t=20190708042619"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    out_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\img\maps"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "map_riginio.png")
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    with open(out_file, "wb") as fp:
        fp.write(data)
    print(f"Downloaded map_riginio.png: {len(data)} bytes")

if __name__ == "__main__":
    main()
