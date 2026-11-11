import os
import time
import json
import urllib.request
from bs4 import BeautifulSoup

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'wiki_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

def fetch_page(url, cache_path):
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 1000:
        print(f"Loading from cache: {cache_path}")
        with open(cache_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    headers = {'User-Agent': USER_AGENT}
    for attempt in range(5):
        try:
            print(f"Fetching {url} (attempt {attempt+1})...")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read().decode('utf-8', errors='ignore')
                if len(content) > 1000 and "Too Many Requests" not in content and "Cloudflare" not in content:
                    with open(cache_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Saved to cache: {cache_path} ({len(content)} bytes)")
                    return content
                else:
                    print(f"Response seems invalid or blocked ({len(content)} bytes)")
        except urllib.error.HTTPError as e:
            print(f"HTTP Error {e.code}: {e.reason}")
            if e.code == 429:
                wait_time = 10 * (attempt + 1)
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                time.sleep(3)
        except Exception as e:
            print(f"Error fetching: {e}")
            time.sleep(3)
    return None

def parse_monster_table(html, page_num):
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.find('div', id='body') or soup
    table = body.find('table')
    if not table:
        print(f"No table found for page {page_num}")
        return []

    rows = table.find_all('tr')
    if not rows:
        return []

    monsters = []
    current_monster = None

    url = f"https://wikiwiki.jp/magivaca/MonsterList/{page_num:02d}"

    for r in rows[1:]:
        cells = [td.get_text(strip=True) for td in r.find_all(['th', 'td'])]
        if not cells:
            continue

        # If starts with a number like "001", "002"
        # Table headers: ['番号', 'モンスター名', 'LV', '属性', '出現場所', '出現確率', '', '身長体重', '説明文']
        # Length varies if there are continuation rows
        if cells[0].isdigit() and len(cells) >= 6:
            # Save previous monster
            if current_monster:
                monsters.append(current_monster)

            num = cells[0]
            name = cells[1]
            level = cells[2]
            element = cells[3]
            loc = cells[4]
            rate = cells[5]

            # size & desc
            size = ""
            desc = ""
            if len(cells) >= 8:
                size = cells[7]
            if len(cells) >= 9:
                desc = cells[8]
            elif len(cells) == 8 and len(cells[7]) > 15:
                # sometimes size is omitted or merged
                desc = cells[7]

            locations = [{"location": loc, "rate": rate}]
            current_monster = {
                "id": f"mon_{num}",
                "number": num,
                "name": name,
                "level": level,
                "element": element,
                "locations": locations,
                "size": size,
                "description": desc,
                "url": url,
                "isBoss": False
            }
        elif len(cells) >= 2 and current_monster:
            # Continuation row for additional locations: ['レーミッツ宮殿(内)', '17.10']
            loc = cells[0]
            rate = cells[1]
            # Avoid garbage rows like header repeats
            if loc != "出現場所" and loc != "番号" and not loc.isdigit():
                current_monster["locations"].append({"location": loc, "rate": rate})

    if current_monster:
        monsters.append(current_monster)

    return monsters

def main():
    all_monsters = []
    failed_pages = []

    for p in range(1, 18):
        sub = f"{p:02d}"
        url = f"https://wikiwiki.jp/magivaca/MonsterList/{sub}"
        cache_path = os.path.join(CACHE_DIR, f"monster_page_{sub}.html")
        html = fetch_page(url, cache_path)
        if html:
            monsters = parse_monster_table(html, p)
            print(f"Page {sub}: Extracted {len(monsters)} monsters")
            all_monsters.extend(monsters)
        else:
            print(f"Page {sub}: Failed to fetch")
            failed_pages.append(p)
        time.sleep(2)

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'extracted_monsters.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_monsters, f, ensure_ascii=False, indent=2)

    print(f"\nTotal extracted monsters: {len(all_monsters)} / 288")
    print(f"Failed pages: {failed_pages}")

if __name__ == '__main__':
    main()
