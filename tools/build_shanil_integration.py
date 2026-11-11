import os
import re
import json

# Define area to shanil mapping rules
AREA_MAPPING_RULES = {
    "キャンプ場（ウィルオウィスプ・ヴァレンシア海岸）": {
        "pages": ["chart_l_1.html", "chart_l_2.html"],
        "default_map": "map_willowisp.gif",
        "submaps": [
            {"name": "ウィルオウィスプ", "file": "map_willowisp.gif", "title": "ウィルオウィスプ ダンジョンマップ", "page": "chart_l_1.html", "page_title": "ウィルオウィスプ"},
            {"name": "ヴァレンシア海岸", "file": "map_varensia.gif", "title": "ヴァレンシア海岸 ダンジョンマップ", "page": "chart_l_2.html", "page_title": "ヴァレンシア海岸"}
        ]
    },
    "ミモレットの森": {
        "pages": ["chart_l_3.html"],
        "default_map": "map_mimorett.gif",
        "submaps": [
            {"name": "ミモレットの森〜森の洞窟", "file": "map_mimorett.gif", "title": "ミモレットの森〜森の洞窟 ダンジョンマップ", "page": "chart_l_3.html", "page_title": "ミモレットの森〜森の洞窟"}
        ]
    },
    "森の洞窟": {
        "pages": ["chart_l_3.html"],
        "default_map": "map_mimorett.gif",
        "submaps": [
            {"name": "ミモレットの森〜森の洞窟", "file": "map_mimorett.gif", "title": "森の洞窟 ダンジョンマップ", "page": "chart_l_3.html", "page_title": "ミモレットの森〜森の洞窟"}
        ]
    },
    "トルーナ村": {
        "pages": ["chart_l_4.html"],
        "default_map": "map_toruna.gif",
        "submaps": [
            {"name": "トルーナ村", "file": "map_toruna.gif", "title": "トルーナ村（地下洞窟） ダンジョンマップ", "page": "chart_l_4.html", "page_title": "トルーナ村"}
        ]
    },
    "ベナコンチャ遺跡": {
        "pages": ["chart_l_5.html"],
        "default_map": "map_benakoncha.gif",
        "submaps": [
            {"name": "ベナコンチャ遺跡", "file": "map_benakoncha.gif", "title": "ベナコンチャ遺跡 全域マップ", "page": "chart_l_5.html", "page_title": "ベナコンチャ遺跡"}
        ]
    },
    "レーミッツ宮殿外": {
        "pages": ["chart_l_7.html"],
        "default_map": "map_remitu.gif",
        "submaps": [
            {"name": "レーミッツ宮殿外・トピアリー", "file": "map_remitu.gif", "title": "レーミッツ 全域・宮殿マップ", "page": "chart_l_7.html", "page_title": "レーミッツ"}
        ]
    },
    "レーミッツ宮殿内": {
        "pages": ["chart_l_7.html"],
        "default_map": "map_remitu.gif",
        "submaps": [
            {"name": "レーミッツ宮殿内部", "file": "map_remitu.gif", "title": "レーミッツ 全域・宮殿内部マップ", "page": "chart_l_7.html", "page_title": "レーミッツ"}
        ]
    },
    "～ピップルスタウン": {
        "pages": ["chart_l_8.html"],
        "default_map": "map_ibense.gif",
        "submaps": [
            {"name": "イベンセ岩場〜ピップルスタウン", "file": "map_ibense.gif", "title": "イベンセ岩場〜ピップルスタウン ダンジョンマップ", "page": "chart_l_8.html", "page_title": "イベンセ岩場〜ピップルスタウン"}
        ]
    },
    "ラ・ロッシュの塔": {
        "pages": ["chart_l_9.html"],
        "default_map": "map_rosh.gif",
        "submaps": [
            {"name": "ラ・ロッシュの塔", "file": "map_rosh.gif", "title": "ラ・ロッシュの塔 ダンジョンマップ", "page": "chart_l_9.html", "page_title": "ラ・ロッシュの塔"}
        ]
    },
    "～ゲアラヴァ村": {
        "pages": ["chart_l_10.html"],
        "default_map": "map_gearava.gif",
        "submaps": [
            {"name": "ロッシュの一本橋〜ゲアラヴァ村", "file": "map_gearava.gif", "title": "ロッシュの一本橋〜ゲアラヴァ村 マップ", "page": "chart_l_10.html", "page_title": "ロッシュの１本橋〜ゲアラヴァ村"}
        ]
    },
    "キードモンガ": {
        "pages": ["chart_l_11.html"],
        "default_map": "map_kido.gif",
        "submaps": [
            {"name": "キード・モンガ", "file": "map_kido.gif", "title": "キード・モンガ ダンジョンマップ", "page": "chart_l_11.html", "page_title": "キード・モンガ"}
        ]
    },
    "氷の島・ジェラ風穴": {
        "pages": ["chart_d_2.html"],
        "default_map": "map_jyera.gif",
        "submaps": [
            {"name": "氷の島・ジェラ風穴", "file": "map_jyera.gif", "title": "氷の島・ジェラ風穴 マップ", "page": "chart_d_2.html", "page_title": "マサラティ村〜氷の島・ジェラ風穴"},
            {"name": "マサラティ村", "file": "map_masara.gif", "title": "マサラティ村 マップ", "page": "chart_d_2.html", "page_title": "マサラティ村〜氷の島・ジェラ風穴"}
        ]
    },
    "タピオカティ村": {
        "pages": ["chart_d_3.html"],
        "default_map": "map_rehi7.png",
        "submaps": [
            {"name": "レヒカフ沼周辺７", "file": "map_rehi7.png", "title": "レヒカフ沼周辺７ マップ", "page": "chart_d_3.html", "page_title": "レヒカフ沼周辺７〜タピオカティ村"},
            {"name": "タピオカティ村", "file": "map_tapioka.png", "title": "タピオカティ村 マップ", "page": "chart_d_3.html", "page_title": "レヒカフ沼周辺７〜タピオカティ村"}
        ]
    },
    "リギニオ密林": {
        "pages": ["chart_d_4.html"],
        "default_map": "map_riginio.png",
        "submaps": [
            {"name": "リギニオ密林", "file": "map_riginio.png", "title": "リギニオ密林 ダンジョンマップ", "page": "chart_d_4.html", "page_title": "リギニオ密林"}
        ]
    },
    "クムヤムト砂漠": {
        "pages": ["chart_d_5.html"],
        "default_map": "map_kumuyamuto.png",
        "submaps": [
            {"name": "クムヤムト砂漠", "file": "map_kumuyamuto.png", "title": "クムヤムト砂漠 ダンジョンマップ", "page": "chart_d_5.html", "page_title": "クムヤムト砂漠"}
        ]
    },
    "ずんどこ穴": {
        "pages": ["chart_d_5.html"],
        "default_map": "map_kumuyamuto.png",
        "submaps": [
            {"name": "クムヤムト砂漠（ずんどこ穴）", "file": "map_kumuyamuto.png", "title": "クムヤムト砂漠（ずんどこ穴） マップ", "page": "chart_d_5.html", "page_title": "クムヤムト砂漠"}
        ]
    },
    "アクアビット城": {
        "pages": ["chart_d_5.html"],
        "default_map": "map_aquabit.png",
        "submaps": [
            {"name": "アクアビット城", "file": "map_aquabit.png", "title": "アクアビット城 ダンジョンマップ", "page": "chart_d_5.html", "page_title": "クムヤムト砂漠"}
        ]
    },
    "エニグマの森": {
        "pages": ["chart_d_6.html"],
        "default_map": "map_eniguma.png",
        "submaps": [
            {"name": "エニグマの森", "file": "map_eniguma.png", "title": "エニグマの森 ダンジョンマップ", "page": "chart_d_6.html", "page_title": "エニグマの森"}
        ]
    },
    "東の森": {
        "pages": ["chart_d_7.html"],
        "default_map": "map_higasinomori.png",
        "submaps": [
            {"name": "東の森", "file": "map_higasinomori.png", "title": "東の森 ダンジョンマップ", "page": "chart_d_7.html", "page_title": "東の森"}
        ]
    },
    "モルビエ火山": {
        "pages": ["chart_d_8.html"],
        "default_map": "map_morubie.gif",
        "submaps": [
            {"name": "モルビエ火山", "file": "map_morubie.gif", "title": "モルビエ火山 ダンジョンマップ", "page": "chart_d_8.html", "page_title": "モルビエ火山"}
        ]
    },
    "バソリモ村": {
        "pages": ["chart_d_9.html"],
        "default_map": "map_basorimo.png",
        "submaps": [
            {"name": "バソリモ村", "file": "map_basorimo.png", "title": "バソリモ村 マップ", "page": "chart_d_9.html", "page_title": "バソリモ村〜ブラウニーの穴"}
        ]
    },
    "ブラウニーの穴": {
        "pages": ["chart_d_9.html"],
        "default_map": "map_brownie.png",
        "submaps": [
            {"name": "ブラウニーの穴", "file": "map_brownie.png", "title": "ブラウニーの穴 ダンジョンマップ", "page": "chart_d_9.html", "page_title": "バソリモ村〜ブラウニーの穴"}
        ]
    },
    "キスニカ鉱山": {
        "pages": ["chart_d_10.html"],
        "default_map": "map_kisunika.png",
        "submaps": [
            {"name": "キスニカ鉱山", "file": "map_kisunika.png", "title": "キスニカ鉱山 ダンジョンマップ", "page": "chart_d_10.html", "page_title": "キスニカ鉱山"}
        ]
    },
    "タンドーリ": {
        "pages": ["chart_e_2.html"],
        "default_map": "map_tandori.png",
        "submaps": [
            {"name": "タンドーリ", "file": "map_tandori.png", "title": "タンドーリ ダンジョンマップ", "page": "chart_e_2.html", "page_title": "タンドーリ"}
        ]
    },
    "荒廃の地(～モイロロト村)": {
        "pages": ["chart_e_3.html"],
        "default_map": "map_moiroroto.png",
        "submaps": [
            {"name": "荒廃の地〜モイロロト村", "file": "map_moiroroto.png", "title": "荒廃の地２〜モイロロト村 ダンジョンマップ", "page": "chart_e_3.html", "page_title": "荒廃の地２〜モイロロト村"}
        ]
    },
    "ピラミッド": {
        "pages": ["chart_e_4.html"],
        "default_map": "map_piramido.png",
        "submaps": [
            {"name": "ピラミッド", "file": "map_piramido.png", "title": "ピラミッド 全域・階層マップ", "page": "chart_e_4.html", "page_title": "ピラミッド"}
        ]
    },
    "荒廃の地(～ラキューオ)": {
        "pages": ["chart_e_5.html"],
        "default_map": "map_rakyuo.png",
        "submaps": [
            {"name": "ラキューオ周辺", "file": "map_rakyuo.png", "title": "ラキューオ ダンジョンマップ", "page": "chart_e_5.html", "page_title": "ラキューオ"}
        ]
    },
    "ラキューオ": {
        "pages": ["chart_e_5.html"],
        "default_map": "map_rakyuo.png",
        "submaps": [
            {"name": "ラキューオ", "file": "map_rakyuo.png", "title": "ラキューオ ダンジョンマップ", "page": "chart_e_5.html", "page_title": "ラキューオ"}
        ]
    },
    "死の回廊": {
        "pages": ["chart_e_6.html"],
        "default_map": "map_sinokairou.gif",
        "submaps": [
            {"name": "死の回廊", "file": "map_sinokairou.gif", "title": "死の回廊 ダンジョンマップ", "page": "chart_e_6.html", "page_title": "死の回廊"}
        ]
    },
    "暗闇の地": {
        "pages": ["chart_e_7.html"],
        "default_map": "map_kurayami.gif",
        "submaps": [
            {"name": "暗闇の地・失意の沼", "file": "map_kurayami.gif", "title": "暗闇の地・失意の沼 ダンジョンマップ", "page": "chart_e_7.html", "page_title": "暗闇の地・失意の沼"}
        ]
    },
    "失意の沼": {
        "pages": ["chart_e_7.html"],
        "default_map": "map_kurayami.gif",
        "submaps": [
            {"name": "暗闇の地・失意の沼", "file": "map_kurayami.gif", "title": "暗闇の地・失意の沼 ダンジョンマップ", "page": "chart_e_7.html", "page_title": "暗闇の地・失意の沼"}
        ]
    },
    "モギナス魔窟": {
        "pages": ["chart_e_8.html"],
        "default_map": "map_moginasu1.png",
        "submaps": [
            {"name": "モギナス魔窟1", "file": "map_moginasu1.png", "title": "モギナス魔窟 階層1 マップ", "page": "chart_e_8.html", "page_title": "モギナス魔窟"},
            {"name": "モギナス魔窟2", "file": "map_moginasu2.png", "title": "モギナス魔窟 階層2 マップ", "page": "chart_e_8.html", "page_title": "モギナス魔窟"},
            {"name": "モギナス魔窟3", "file": "map_moginasu3.png", "title": "モギナス魔窟 階層3 マップ", "page": "chart_e_8.html", "page_title": "モギナス魔窟"}
        ]
    }
}

def main():
    print(f"Total defined area mappings: {len(AREA_MAPPING_RULES)}")
    with open("tools/shanil_parsed_all.json", "r", encoding="utf-8") as f:
        shanil_parsed = json.load(f)
    shanil_by_file = {p["file"]: p for p in shanil_parsed}

    with open("tools/chests_extracted.json", "r", encoding="utf-8") as f:
        chests = json.load(f)

    # Validate each mapping
    total_chests_in_mapped = 0
    for area, rule in AREA_MAPPING_RULES.items():
        area_chests = [c for c in chests if c["area"] == area]
        total_chests_in_mapped += len(area_chests)
        print(f"\n==========================================")
        print(f"Area: {area} ({len(area_chests)} chests in Wiki)")
        for p in rule["pages"]:
            pdata = shanil_by_file.get(p)
            if not pdata:
                print(f"  ERROR: page {p} not found in shanil_parsed")
                continue
            print(f"  Shanil Page: {p} - {pdata['title']}")
            print(f"  Maps: {pdata['imgs']}")
            print(f"  Shanil Item rows: {len(pdata['item_rows'])}")
            
        for sm in rule["submaps"]:
            path = os.path.join("tools/shanil_maps", sm["file"])
            exists = os.path.exists(path)
            size = os.path.getsize(path) if exists else 0
            print(f"  Submap: {sm['name']} -> {sm['file']} (exists: {exists}, {size} bytes)")

    print(f"\nTotal chests in mapped areas: {total_chests_in_mapped} / 453")

if __name__ == "__main__":
    main()
