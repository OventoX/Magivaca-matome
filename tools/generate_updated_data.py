import os
import re
import json

def normalize_text(t):
    if not t: return ""
    t = t.replace("（宝）", "").replace("(宝)", "").replace("（貰）", "").replace("（落）", "").replace("（貼）", "")
    t = t.replace("×", "x").replace(" ", "").replace("　", "")
    zen = "０１２３４５６７８９"
    han = "0123456789"
    for z, h in zip(zen, han):
        t = t.replace(z, h)
    return t.lower()

# Area definitions with full metadata
SHANIL_AREAS = {
    "キャンプ場（ウィルオウィスプ・ヴァレンシア海岸）": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_1.html",
        "submaps": [
            {
                "id": "willowisp",
                "label": "ウィルオウィスプ",
                "file": "img/maps/shanil/map_willowisp.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_1.html",
                "desc": "キャンプ場・ウィルオウィスプ周辺マップ（①ヴァレンシア海岸方面、②学校）"
            },
            {
                "id": "varensia",
                "label": "ヴァレンシア海岸",
                "file": "img/maps/shanil/map_varensia.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_2.html",
                "desc": "ヴァレンシア海岸マップ（①ウィルオウィスプ方面、②海岸洞窟）"
            }
        ]
    },
    "ミモレットの森": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_3.html",
        "submaps": [
            {
                "id": "mimorett",
                "label": "ミモレットの森〜森の洞窟",
                "file": "img/maps/shanil/map_mimorett.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_3.html",
                "desc": "ミモレットの森・森の洞窟ダンジョンマップ（①〜③ミモレットの森、④森の洞窟入口）"
            }
        ]
    },
    "森の洞窟": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_3.html",
        "submaps": [
            {
                "id": "mimorett_cave",
                "label": "森の洞窟",
                "file": "img/maps/shanil/map_mimorett.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_3.html",
                "desc": "森の洞窟ダンジョンマップ（⑤森の洞窟西、⑥小部屋、⑦森の洞窟東）"
            }
        ]
    },
    "トルーナ村": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_4.html",
        "submaps": [
            {
                "id": "toruna",
                "label": "トルーナ村（地下洞窟）",
                "file": "img/maps/shanil/map_toruna.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_4.html",
                "desc": "トルーナ村地下洞窟マップ（①森の洞窟東出口、②トルーナ村入口、③村地下小部屋）"
            }
        ]
    },
    "ベナコンチャ遺跡": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_5.html",
        "submaps": [
            {
                "id": "benakoncha",
                "label": "ベナコンチャ遺跡 全域",
                "file": "img/maps/shanil/map_benakoncha.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_5.html",
                "desc": "ベナコンチャ遺跡全域マップ（①遺跡中央、②東、③西、④北、⑤南西、⑥南、⑦南東）"
            }
        ]
    },
    "レーミッツ宮殿外": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_7.html",
        "submaps": [
            {
                "id": "remitu_outer",
                "label": "レーミッツ宮殿外・トピアリー",
                "file": "img/maps/shanil/map_remitu.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_7.html",
                "desc": "レーミッツ全域マップ（①北東、②東、③南東、④宮殿門、⑤西、⑥南西、⑦トピアリーの迷宮）"
            }
        ]
    },
    "レーミッツ宮殿内": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_7.html",
        "submaps": [
            {
                "id": "remitu_inner",
                "label": "レーミッツ宮殿内部",
                "file": "img/maps/shanil/map_remitu.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_7.html",
                "desc": "レーミッツ宮殿内部マップ（⑧入口、⑨応接間、⑩小部屋、⑪客間、⑫廊下、⑬西階段、⑭東階段、⑮東階段下、⑯西階段下、⑰西広場、⑱鳥の間、⑲地下入口、⑳休憩所、㉑地下）"
            }
        ]
    },
    "～ピップルスタウン": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_8.html",
        "submaps": [
            {
                "id": "ibense",
                "label": "イベンセ岩場〜ピップルスタウン",
                "file": "img/maps/shanil/map_ibense.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_8.html",
                "desc": "イベンセ岩場〜ピップルスタウン道中マップ（①イベンセ岩場1、②ロッシュの川べり、③ロッシュの1本橋）"
            }
        ]
    },
    "ラ・ロッシュの塔": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_9.html",
        "submaps": [
            {
                "id": "rosh",
                "label": "ラ・ロッシュの塔",
                "file": "img/maps/shanil/map_rosh.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_9.html",
                "desc": "ラ・ロッシュの塔マップ（①1F〜2F、②3F〜5F、③6F最上階）"
            }
        ]
    },
    "～ゲアラヴァ村": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_10.html",
        "submaps": [
            {
                "id": "gearava",
                "label": "ロッシュの1本橋〜ゲアラヴァ村",
                "file": "img/maps/shanil/map_gearava.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_10.html",
                "desc": "ロッシュの1本橋〜ゲアラヴァ村マップ（①ロッシュの1本橋、②イベンセ岩場1、③ゲアラヴァ村）"
            }
        ]
    },
    "キードモンガ": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_11.html",
        "submaps": [
            {
                "id": "kido",
                "label": "キード・モンガ",
                "file": "img/maps/shanil/map_kido.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_11.html",
                "desc": "キード・モンガダンジョンマップ（①〜⑫各フロア・洞穴）"
            }
        ]
    },
    "氷の島・ジェラ風穴": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_2.html",
        "submaps": [
            {
                "id": "jyera",
                "label": "ジェラ風穴",
                "file": "img/maps/shanil/map_jyera.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_2.html",
                "desc": "ジェラ風穴マップ（①〜⑤風穴各層）"
            },
            {
                "id": "masara",
                "label": "マサラティ村・氷の島",
                "file": "img/maps/shanil/map_masara.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_2.html",
                "desc": "マサラティ村〜氷の島周辺マップ"
            }
        ]
    },
    "タピオカティ村": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_3.html",
        "submaps": [
            {
                "id": "rehi7",
                "label": "レヒカフ沼周辺７",
                "file": "img/maps/shanil/map_rehi7.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_3.html",
                "desc": "レヒカフ沼周辺７マップ（タピオカティ村手前）"
            },
            {
                "id": "tapioka",
                "label": "タピオカティ村",
                "file": "img/maps/shanil/map_tapioka.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_3.html",
                "desc": "タピオカティ村集落マップ"
            }
        ]
    },
    "リギニオ密林": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_4.html",
        "submaps": [
            {
                "id": "riginio_shanil",
                "label": "リギニオ密林（相川ともき氏マップ）",
                "file": "img/maps/shanil/map_riginio.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_4.html",
                "desc": "リギニオ密林ダンジョンマップ（①〜⑧各ルートと宝箱配置）"
            },
            {
                "id": "riginio_wiki",
                "label": "リギニオ密林（Wikiマップ）",
                "file": "img/maps/map_riginio.png",
                "sourceUrl": "https://wikiwiki.jp/magivaca/%E3%83%AA%E3%82%AE%E3%83%8B%E3%82%AA%E5%AF%86%E6%9E%97",
                "desc": "Wiki掲載のリギニオ密林フロア図"
            }
        ]
    },
    "クムヤムト砂漠": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
        "submaps": [
            {
                "id": "kumuyamuto",
                "label": "クムヤムト砂漠",
                "file": "img/maps/shanil/map_kumuyamuto.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
                "desc": "クムヤムト砂漠全域マップ（①〜③砂漠各所、ずんどこ穴入口）"
            }
        ]
    },
    "ずんどこ穴": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
        "submaps": [
            {
                "id": "zundoko",
                "label": "クムヤムト砂漠（ずんどこ穴）",
                "file": "img/maps/shanil/map_kumuyamuto.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
                "desc": "クムヤムト砂漠マップ（ずんどこ穴は砂漠内地下洞穴、ドワーフの救出人数で宝箱入手）"
            }
        ]
    },
    "アクアビット城": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
        "submaps": [
            {
                "id": "aquabit",
                "label": "アクアビット城",
                "file": "img/maps/shanil/map_aquabit.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
                "desc": "アクアビット城ダンジョンマップ（①〜④各フロア）"
            }
        ]
    },
    "エニグマの森": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_6.html",
        "submaps": [
            {
                "id": "eniguma",
                "label": "エニグマの森",
                "file": "img/maps/shanil/map_eniguma.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_6.html",
                "desc": "エニグマの森全域マップ（①カエル沼、②森北、③森沼、ツリーマン集落）"
            }
        ]
    },
    "東の森": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_7.html",
        "submaps": [
            {
                "id": "higasinomori",
                "label": "東の森",
                "file": "img/maps/shanil/map_higasinomori.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_7.html",
                "desc": "東の森ダンジョンマップ（①クガンテ村南、②ヒトデ花の原っぱ、③文鳥の里、④東の森2、⑤謎の遺跡、⑥モルビエ火山手前）"
            }
        ]
    },
    "モルビエ火山": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_8.html",
        "submaps": [
            {
                "id": "morubie",
                "label": "モルビエ火山",
                "file": "img/maps/shanil/map_morubie.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_8.html",
                "desc": "モルビエ火山ダンジョンマップ（①火口入口、②〜④火道各層）"
            }
        ]
    },
    "バソリモ村": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_9.html",
        "submaps": [
            {
                "id": "basorimo",
                "label": "バソリモ村",
                "file": "img/maps/shanil/map_basorimo.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_9.html",
                "desc": "バソリモ村集落マップ（①村入口、②村広場、③民家、④キスニカ鉱山入口）"
            }
        ]
    },
    "ブラウニーの穴": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_9.html",
        "submaps": [
            {
                "id": "brownie",
                "label": "ブラウニーの穴",
                "file": "img/maps/shanil/map_brownie.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_9.html",
                "desc": "ブラウニーの穴ダンジョンマップ（①〜⑥各層）"
            }
        ]
    },
    "キスニカ鉱山": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_10.html",
        "submaps": [
            {
                "id": "kisunika",
                "label": "キスニカ鉱山",
                "file": "img/maps/shanil/map_kisunika.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_10.html",
                "desc": "キスニカ鉱山ダンジョンマップ（①〜⑪各坑道）"
            }
        ]
    },
    "タンドーリ": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_2.html",
        "submaps": [
            {
                "id": "tandori",
                "label": "タンドーリ",
                "file": "img/maps/shanil/map_tandori.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_2.html",
                "desc": "タンドーリ集落・周辺マップ（①〜⑤各区画）"
            }
        ]
    },
    "荒廃の地(～モイロロト村)": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_3.html",
        "submaps": [
            {
                "id": "moiroroto",
                "label": "荒廃の地２〜モイロロト村",
                "file": "img/maps/shanil/map_moiroroto.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_3.html",
                "desc": "荒廃の地２〜モイロロト村マップ（①荒廃の地2、②荒廃の地3、③モイロロト村、④荒廃の地4）"
            }
        ]
    },
    "ピラミッド": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_4.html",
        "submaps": [
            {
                "id": "piramido",
                "label": "ピラミッド 全域",
                "file": "img/maps/shanil/map_piramido.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_4.html",
                "desc": "ピラミッド階層マップ（①〜⑭各フロア・迷宮）"
            }
        ]
    },
    "荒廃の地(～ラキューオ)": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_5.html",
        "submaps": [
            {
                "id": "rakyuo_ruins",
                "label": "ラキューオ周辺",
                "file": "img/maps/shanil/map_rakyuo.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_5.html",
                "desc": "ラキューオ周辺荒廃の地マップ"
            }
        ]
    },
    "ラキューオ": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_5.html",
        "submaps": [
            {
                "id": "rakyuo",
                "label": "ラキューオ",
                "file": "img/maps/shanil/map_rakyuo.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_5.html",
                "desc": "ラキューオ集落マップ（①〜⑤各フロア・施設）"
            }
        ]
    },
    "死の回廊": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_6.html",
        "submaps": [
            {
                "id": "sinokairou",
                "label": "死の回廊",
                "file": "img/maps/shanil/map_sinokairou.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_6.html",
                "desc": "死の回廊マップ（①〜③回廊各階、出口）"
            }
        ]
    },
    "暗闇の地": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_7.html",
        "submaps": [
            {
                "id": "kurayami_land",
                "label": "暗闇の地・失意の沼",
                "file": "img/maps/shanil/map_kurayami.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_7.html",
                "desc": "暗闇の地・失意の沼マップ（①〜⑤暗闇の地各所、⑥〜⑦失意の沼）"
            }
        ]
    },
    "失意の沼": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_7.html",
        "submaps": [
            {
                "id": "situi_swamp",
                "label": "失意の沼",
                "file": "img/maps/shanil/map_kurayami.gif",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_7.html",
                "desc": "失意の沼マップ（⑥〜⑦沼各所）"
            }
        ]
    },
    "モギナス魔窟": {
        "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_8.html",
        "submaps": [
            {
                "id": "moginasu1",
                "label": "モギナス魔窟 階層1",
                "file": "img/maps/shanil/map_moginasu1.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_8.html",
                "desc": "モギナス魔窟 第1フロアマップ"
            },
            {
                "id": "moginasu2",
                "label": "モギナス魔窟 階層2",
                "file": "img/maps/shanil/map_moginasu2.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_8.html",
                "desc": "モギナス魔窟 第2フロアマップ"
            },
            {
                "id": "moginasu3",
                "label": "モギナス魔窟 階層3",
                "file": "img/maps/shanil/map_moginasu3.png",
                "sourceUrl": "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_8.html",
                "desc": "モギナス魔窟 第3フロアマップ（最奥）"
            }
        ]
    }
}

# Special mapping overrides for corner cases
SPECIAL_CHEST_MAPS = {
    "chest_061": {
        "shanilPlace": "宮殿内部・客間",
        "shanilMark": "⑪",
        "shanilItem": "ラシモフ銀貨×２（宝）",
        "diffNote": "Wikiでは「ラシモフ金貨 x2」と記載、相川氏チャートでは「ラシモフ銀貨×２」と記載（Wiki優先）"
    },
    "chest_089": {
        "shanilPlace": "トピアリーの迷宮 / レーミッツ・南東",
        "shanilMark": "⑦ / ③",
        "shanilItem": "アルティ銀貨（宝/落）",
        "diffNote": "Wikiのエリア分類は「～ピップルスタウン」だが場所は「レーミッツ・西(宮殿外)」、相川氏ではレーミッツ全域マップに該当"
    },
    "chest_118": {
        "shanilPlace": "レヒカフ沼周辺７",
        "shanilMark": "①",
        "shanilItem": "鉄のゲタ(宝)",
        "diffNote": "相川氏チャートではリギニオ密林編（d_4.html）の表に「レヒカフ沼周辺７: 鉄のゲタ(宝)」として掲載"
    },
    "chest_146": {
        "shanilPlace": "ツリーマンの集落",
        "shanilMark": "④",
        "shanilItem": "アンテナ(宝)",
        "diffNote": "Wikiでは「東の森」分類だがツリーマン集落はエニグマの森奥にあり、相川氏ではエニグマの森マップ（d_6.html）に対応"
    },
    "chest_147": {
        "shanilPlace": "ツリーマンの集落",
        "shanilMark": "④",
        "shanilItem": "鉄のゲタ(宝)",
        "diffNote": "Wikiでは「東の森」分類だがツリーマン集落はエニグマの森奥にあり、相川氏ではエニグマの森マップ（d_6.html）に対応"
    },
    "chest_148": {
        "shanilPlace": "ツリーマンの集落",
        "shanilMark": "④",
        "shanilItem": "ドクロのリボン(宝)",
        "diffNote": "Wikiでは「東の森」分類だがツリーマン集落はエニグマの森奥にあり、相川氏ではエニグマの森マップ（d_6.html）に対応"
    },
    "chest_181": {
        "shanilPlace": "キスニカ鉱山入口",
        "shanilMark": "④",
        "shanilItem": "ウィングピアス（宝）",
        "diffNote": "相川氏チャートではバソリモ村編（d_9.html）の表に「キスニカ鉱山入口: ウィングピアス（宝）」として掲載"
    },
    "chest_216": {
        "shanilPlace": "荒廃の地６",
        "shanilMark": None,
        "shanilItem": None,
        "diffNote": "相川氏チャートには未記載（Wikiのみ掲載の宝箱のため無理に対応させずWiki表記を維持）"
    },
    "chest_225": {
        "shanilPlace": "ピラミッド３",
        "shanilMark": "③",
        "shanilItem": "カエルグミ青×８(宝)",
        "diffNote": "Wikiでは「カエルグミ緑 x8」と記載、相川氏チャートでは「カエルグミ青×８」と記載（Wiki優先）"
    },
    "chest_247": {
        "shanilPlace": "ピラミッド９",
        "shanilMark": "⑨",
        "shanilItem": "りゅうのヒゲ(宝)",
        "diffNote": "アイテム名表記ゆれ（Wiki: りゅうのひげ / 相川氏: りゅうのヒゲ）"
    },
    "chest_261": {
        "shanilPlace": "※ずんどこ穴（2人目救出）",
        "shanilMark": "④",
        "shanilItem": "やさぐれたドワーフ二人・フォースブーツ(宝)",
        "diffNote": "Wikiでは「荒廃の地(～ラキューオ)」に分類されているが実際はずんどこ穴の宝箱。相川氏ではクムヤムト砂漠編に掲載"
    },
    "chest_267": {
        "shanilPlace": "死の回廊・出口",
        "shanilMark": "③",
        "shanilItem": "皮ひも(宝)",
        "diffNote": "Wikiでは「暗闇の地」に分類されているが場所は「死の回廊・出口」。相川氏では死の回廊編（e_6.html）に掲載"
    }
}

def main():
    print("Testing generate_updated_data configuration...")
    print(f"SHANIL_AREAS defined: {len(SHANIL_AREAS)}")
    print(f"SPECIAL_CHEST_MAPS defined: {len(SPECIAL_CHEST_MAPS)}")

if __name__ == "__main__":
    main()
