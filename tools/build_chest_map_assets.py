import json
import os

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide"
    
    with open(os.path.join(base_dir, "tools", "refined_schematics.json"), "r", encoding="utf-8") as fp:
        schematics = json.load(fp)
        
    assets = {
        "real": {
            "ガラムマサラ": {
                "type": "real",
                "area": "ガラムマサラ",
                "plane": "ガラムマサラ",
                "title": "ガラムマサラ 1F〜50F 実マップ画像",
                "desc": "Wiki有志作成の全50フロア実マップ画像。フロアごとの宝箱配置と順路を確認できます。",
                "sourceUrl": "https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9",
                "credit": "一次情報出典: マジカルバケーション攻略Wiki ガラムマサラ (画像: Wiki有志作成フロアマップ)",
                "totalFloors": 50,
                "floorMaps": {}
            },
            "リドナヒー": {
                "type": "real",
                "area": "リドナヒー",
                "plane": "リドナヒー",
                "title": "リドナヒー 実マップ画像",
                "desc": "Wiki有志作成のリドナヒー4〜6（ボス側・宝箱側ルート分岐）実マップ画像。",
                "sourceUrl": "https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9",
                "credit": "一次情報出典: マジカルバケーション攻略Wiki ガラムマサラ (リドナヒー節)",
                "submaps": [
                    {"name": "リドナヒー4", "file": "img/maps/map-rido04-0.png", "desc": "右上: リドナヒー2に戻る / 右下: リドナヒー8(宝箱側)へ / 左下: リドナヒー7(ボス側)へ"},
                    {"name": "リドナヒー5", "file": "img/maps/map-rido05-0.png", "desc": "左下: リドナヒー3に戻る / 左上: リドナヒー9(宝箱側)へ / 右下: リドナヒー7(ボス側)へ"},
                    {"name": "リドナヒー6", "file": "img/maps/map-rido06-0.png", "desc": "右下: リドナヒー1に戻る / 右上: リドナヒー10(宝箱側)へ / 左上: リドナヒー7(ボス側)へ"}
                ]
            },
            "リギニオ密林": {
                "type": "real",
                "area": "リギニオ密林",
                "plane": "闇のプレーン",
                "title": "リギニオ密林・沼 実マップ概略図",
                "desc": "Wiki有志作成のリギニオ密林・沼の全体ルート概略図（赤丸数字は順路）。",
                "sourceUrl": "https://wikiwiki.jp/magivaca/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3",
                "credit": "一次情報出典: マジカルバケーション攻略Wiki 闇のプレーン (リギニオ密林節 概略図)",
                "file": "img/maps/map_riginio.png"
            }
        },
        "schematic": schematics
    }
    
    # Fill in Garam Masala 50 floor map files
    # Note: map-garam01-0.png ... map-garam50-0.png (with special rev suffixes if any)
    # Let's inspect exact file names in img/maps
    map_files = sorted(os.listdir(os.path.join(base_dir, "img", "maps")))
    garam_files = [f for f in map_files if f.startswith("map-garam")]
    
    for i in range(1, 51):
        # find matching file
        prefix = f"map-garam{i:02d}-"
        match = [f for f in garam_files if f.startswith(prefix)]
        if match:
            assets["real"]["ガラムマサラ"]["floorMaps"][str(i)] = f"img/maps/{match[0]}"
        else:
            print(f"Warning: no image found for floor {i}")
            
    print(f"Garam Masala mapped floors: {len(assets['real']['ガラムマサラ']['floorMaps'])}")
    
    out_js = "const CHEST_MAP_ASSETS = " + json.dumps(assets, ensure_ascii=False, indent=2) + ";\n"
    
    with open("tools/chest_map_assets.json", "w", encoding="utf-8") as fp:
        json.dump(assets, fp, ensure_ascii=False, indent=2)
        
    with open("tools/chest_map_assets.js", "w", encoding="utf-8") as fp:
        fp.write(out_js)
        
    print("Saved chest_map_assets.js successfully!")

if __name__ == "__main__":
    main()
