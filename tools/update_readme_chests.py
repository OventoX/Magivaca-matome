with open("README.md", "r", encoding="utf-8") as f:
    text = f.read()

# 宝箱マップの表への追加
old_table_row = "| **精霊コンプリート手順** | **完全収録 (6大ルール)** | [精霊コンプリート](https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A#k55e4a54) |"
new_table_row = """| **精霊コンプリート手順** | **完全収録 (6大ルール)** | [精霊コンプリート](https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A#k55e4a54) |
| **宝箱マップ＆チェック** | **全453個・35エリア (100%)** | [フィールド拾得物](https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9) 各プレーン |"""

if old_table_row in text:
    text = text.replace(old_table_row, new_table_row, 1)

# ストレージキーの説明に追加
old_key_sec = "  - 精霊進捗: `magivaca_spirit_checklist_v1`"
new_key_sec = """  - 精霊進捗: `magivaca_spirit_checklist_v1`
  - 宝箱開封進捗: `magivaca_chest_checklist_v1`"""

if old_key_sec in text:
    text = text.replace(old_key_sec, new_key_sec, 1)

# 番号重複の解消
text = text.replace("### 8. 🗺️ シナリオ攻略チャート", "### 9. 🗺️ シナリオ攻略チャート")
text = text.replace("### 9. ♨️ お風呂セット入手チャート", "### 10. ♨️ お風呂セット入手チャート")
text = text.replace("### 10. ⚙️ システム解説", "### 11. ⚙️ システム解説")
text = text.replace("### 11. 🐟 稼ぎ・寿命ガイド", "### 12. 🐟 稼ぎ・寿命ガイド")

with open("README.md", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated README.md successfully!")
