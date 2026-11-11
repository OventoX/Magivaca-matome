import json

with open("tools/chests_extracted.json", "r", encoding="utf-8") as f:
    chests = json.load(f)

print(f"Loaded {len(chests)} chests.")

# メタデータ
planes_order = ["物質のプレーン", "光のプレーン", "闇のプレーン", "死のプレーン", "ガラムマサラ", "シサバレイ", "リドナヒー"]
plane_counts = {}
for c in chests:
    p = c["plane"]
    plane_counts[p] = plane_counts.get(p, 0) + 1

plane_id_map = {
    "物質のプレーン": "matter",
    "光のプレーン": "light",
    "闇のプレーン": "dark",
    "死のプレーン": "death",
    "ガラムマサラ": "garam",
    "シサバレイ": "shisabarei",
    "リドナヒー": "ridonahi"
}

planes_list = [{"name": "すべて", "id": "all", "count": len(chests)}]
for p in planes_order:
    planes_list.append({
        "name": p,
        "id": plane_id_map.get(p, p),
        "count": plane_counts.get(p, 0)
    })

meta = {
    "totalCount": len(chests),
    "missableCount": sum(1 for c in chests if c["missable"]),
    "planes": planes_list,
    "sourceUrls": {
        "物質のプレーン": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9",
        "光のプレーン": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1",
        "闇のプレーン": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2",
        "死のプレーン": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3",
        "ガラムマサラ": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/4",
        "シサバレイ": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/4",
        "リドナヒー": "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/4"
    }
}

js_code = []
js_code.append("\n// ============================================================================")
js_code.append("// 宝箱データベース (CHESTS_DATA) - 全453件")
js_code.append("// 出典: Wiki フィールド拾得物 各ページ")
js_code.append("// ============================================================================")
js_code.append("var CHESTS_DATA = " + json.dumps(chests, ensure_ascii=False, indent=2) + ";\n")
js_code.append("var CHESTS_META = " + json.dumps(meta, ensure_ascii=False, indent=2) + ";\n")
js_code.append("""
if (typeof window !== 'undefined') {
  window.CHESTS_DATA = CHESTS_DATA;
  window.CHESTS_META = CHESTS_META;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports.CHESTS_DATA = CHESTS_DATA;
  module.exports.CHESTS_META = CHESTS_META;
}
""")

append_content = "\n".join(js_code)

with open("js/data.js", "a", encoding="utf-8") as f:
    f.write(append_content)

print(f"Successfully appended {len(append_content)} characters to js/data.js!")
