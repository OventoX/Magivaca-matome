import os

data_path = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\js\data.js"
append_path = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\tools\phase5_append.js"

with open(data_path, "r", encoding="utf-8") as f:
    orig_content = f.read()

with open(append_path, "r", encoding="utf-8") as f:
    append_content = f.read()

# module.exports の行を探す
target_export = "if (typeof module !== 'undefined' && module.exports) {"
if target_export not in orig_content:
    raise Exception("module.exports block not found in js/data.js")

parts = orig_content.split(target_export)
prefix = parts[0]

new_exports = """if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SPIRITS_DATA, ELEMENT_META, PIRANHA_DATA, LIFESPAN_GUIDE, COMP_GUIDE, LEVELING_DATA, CHART_DATA, SYSTEM_DATA, OFURO_CHART_DATA,
    ITEM_RECOVERY_DATA, ITEM_OTHER_DATA, ITEM_MD_DATA, ITEM_EQUIP_DATA, ITEM_EQUIP_SETS, ITEM_DROP_INDEX,
    MAGIC_NOTES_DATA, MIMIC_COINS_DATA, BOSS_MONSTERS_DATA, STORY_CHOICES_DATA, RECORD_CRITERIA_DATA
  };
}
"""

new_data_content = prefix + "\n" + append_content + "\n" + new_exports

with open(data_path, "w", encoding="utf-8") as f:
    f.write(new_data_content)

print(f"data.js updated successfully! New size: {os.path.getsize(data_path)} bytes")
