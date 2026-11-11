import os
from bs4 import BeautifulSoup
import json
import re

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
charts = [
    ("chart_matter.html", "物質のプレーン", "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E7%89%A9%E8%B3%AA%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3"),
    ("chart_light.html", "光のプレーン", "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3"),
    ("chart_dark.html", "闇のプレーン", "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3"),
    ("chart_death.html", "死のプレーン", "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3"),
    ("chart_garam.html", "ガラムマサラ", "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A prospectus%E3%83%9E%E3%82%B5%E3%83%A9")
]

# 各チャートのテキストと構造を解析して、具体的な選択肢・会話・分岐イベントを抽出
for fname, plane, url in charts:
    fpath = os.path.join(cache_dir, fname)
    if not os.path.exists(fpath): continue
    with open(fpath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    print(f"\n==================== {plane} ====================")
    body = soup.find("div", id="body")
    if not body: continue
    
    # h2, h3などのセクションごとに選択肢関連の記述を収集
    curr_sec = "TOP"
    for elem in body.find_all(["h2", "h3", "h4", "p", "ul", "ol"]):
        if elem.name in ["h2", "h3", "h4"]:
            curr_sec = elem.get_text(strip=True)
        else:
            txt = elem.get_text(strip=True)
            if any(k in txt for k in ["選択肢", "選ぶ", "選択", "分岐", "仲間になる", "脱退", "バグ", "二度と"]):
                print(f"[{curr_sec}] {txt[:120]}")
