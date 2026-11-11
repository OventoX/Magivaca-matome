from bs4 import BeautifulSoup

def inspect_page_tables(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    body = soup.select_one("#body") or soup
    tables = body.find_all("table")
    print(f"File: {file_path}, Tables: {len(tables)}")
    
    total_chests = 0
    for idx, tbl in enumerate(tables, 1):
        rows = tbl.find_all("tr")
        if not rows:
            continue
        headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
        chests_in_tbl = 0
        for r in rows[1:]:
            txt = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
            if any("宝箱" in c for c in txt):
                chests_in_tbl += 1
        if chests_in_tbl > 0:
            print(f"  Table {idx} has {chests_in_tbl} chests. Header: {headers}")
            total_chests += chests_in_tbl
    print(f"  Total chests found in file: {total_chests}\n")

inspect_page_tables("wiki_cache/field_items.html")
inspect_page_tables("wiki_cache/field_items_1.html")
inspect_page_tables("wiki_cache/field_items_4.html")
