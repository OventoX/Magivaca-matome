import os
from bs4 import BeautifulSoup
import re

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
charts = [
    ("chart_matter.html", "物質のプレーン"),
    ("chart_light.html", "光のプレーン"),
    ("chart_dark.html", "闇のプレーン"),
    ("chart_death.html", "死のプレーン"),
    ("chart_garam.html", "ガラムマサラ")
]

for fname, plane in charts:
    fpath = os.path.join(cache_dir, fname)
    if not os.path.exists(fpath): continue
    with open(fpath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    print(f"\n==================== {plane} ({fname}) ====================")
    body = soup.find("div", id="body")
    if not body: continue
    
    # 選択肢、分岐、会話、イベントに関連するテキストを探す
    text = body.get_text()
    # 行ごとにチェック
    for line in text.split("\n"):
        line = line.strip()
        if any(keyword in line for keyword in ["選択肢", "選ぶ", "分岐", "はい／いいえ", "「はい」", "「いいえ」", "仲間に", "どちら", "ルート"]):
            if len(line) > 5 and len(line) < 150:
                print(f"  * {line}")
