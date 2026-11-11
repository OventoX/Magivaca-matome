import os
import re
import json

def main():
    print("Loading updated_chests.json and shanil_assets.json...")
    with open("tools/updated_chests.json", "r", encoding="utf-8") as f:
        updated_chests = json.load(f)
    with open("tools/shanil_assets.json", "r", encoding="utf-8") as f:
        shanil_assets = json.load(f)

    with open("js/data.js", "r", encoding="utf-8") as f:
        data_js = f.read()

    # 1. Replace CHESTS_DATA
    idx = data_js.find('var CHESTS_DATA = [')
    end_marker = '// === CHEST MAP ASSETS ==='
    end_idx = data_js.find(end_marker)

    if idx == -1 or end_idx == -1:
        print("ERROR: CHESTS_DATA boundaries not found!")
        return

    chests_json_str = json.dumps(updated_chests, ensure_ascii=False, indent=2)
    chests_replacement = (
        f"var CHESTS_DATA = {chests_json_str};\n\n"
        "if (typeof window !== 'undefined') {\n"
        "  window.CHESTS_DATA = CHESTS_DATA;\n"
        "}\n"
        "if (typeof module !== 'undefined' && module.exports) {\n"
        "  module.exports.CHESTS_DATA = CHESTS_DATA;\n"
        "  module.exports.CHESTS_META = CHESTS_META;\n"
        "}\n\n\n"
    )

    data_js = data_js[:idx] + chests_replacement + data_js[end_idx:]
    print("Successfully replaced CHESTS_DATA.")

    # 2. Update CHEST_MAP_ASSETS to include "shanil": shanil_assets
    # We can inject "shanil": { ... } right after const CHEST_MAP_ASSETS = {
    shanil_json_str = json.dumps(shanil_assets, ensure_ascii=False, indent=4)
    # indent shanil_json_str
    indented_shanil = "\n".join("  " + line if line else "" for line in shanil_json_str.split("\n"))

    target_str = "const CHEST_MAP_ASSETS = {\n  \"real\": {"
    replacement_str = f"const CHEST_MAP_ASSETS = {{\n  \"shanil\": {shanil_json_str},\n  \"real\": {{"

    if target_str not in data_js:
        print("ERROR: CHEST_MAP_ASSETS pattern not matched!")
        return

    data_js = data_js.replace(target_str, replacement_str, 1)
    print("Successfully updated CHEST_MAP_ASSETS with shanil maps.")

    with open("js/data.js", "w", encoding="utf-8") as f:
        f.write(data_js)

    print("Wrote updated js/data.js successfully.")

if __name__ == "__main__":
    main()
