import json
import os
import re
from bs4 import BeautifulSoup

def main():
    with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
        chests = json.load(fp)

    # All unique areas in chest DB
    areas_by_plane = {}
    for c in chests:
        p = c["plane"]
        a = c["area"]
        if p not in areas_by_plane:
            areas_by_plane[p] = set()
        areas_by_plane[p].add(a)

    print("Existing chest database areas:")
    for p, alist in areas_by_plane.items():
        print(f"[{p}]")
        for a in sorted(list(alist)):
            chests_in_a = [c for c in chests if c["plane"] == p and c["area"] == a]
            print(f"  - {a} ({len(chests_in_a)} chests)")

if __name__ == "__main__":
    main()
