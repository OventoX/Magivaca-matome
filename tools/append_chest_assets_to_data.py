import os

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    data_js_path = os.path.join(base_dir, "js", "data.js")
    assets_js_path = os.path.join(base_dir, "tools", "chest_map_assets.js")
    
    with open(data_js_path, "r", encoding="utf-8") as fp:
        content = fp.read()
        
    if "CHEST_MAP_ASSETS" in content:
        # already appended once, replace it
        idx = content.find("// === CHEST MAP ASSETS ===")
        if idx != -1:
            content = content[:idx]
            
    with open(assets_js_path, "r", encoding="utf-8") as fp:
        assets_code = fp.read()
        
    append_block = f"""

// === CHEST MAP ASSETS ===
{assets_code}

if (typeof window !== 'undefined') {{
  window.CHEST_MAP_ASSETS = CHEST_MAP_ASSETS;
}}
if (typeof module !== 'undefined' && module.exports) {{
  module.exports.CHEST_MAP_ASSETS = CHEST_MAP_ASSETS;
}}
"""
    new_content = content + append_block
    with open(data_js_path, "w", encoding="utf-8") as fp:
        fp.write(new_content)
        
    print(f"Appended CHEST_MAP_ASSETS to {data_js_path}. Total lines: {len(new_content.splitlines())}")

if __name__ == "__main__":
    main()
