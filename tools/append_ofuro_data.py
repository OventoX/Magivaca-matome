import json

ofuro_chart_data = {
    "title": "お風呂セット＆おふろ装備一式 入手チャート",
    "source_yasagashi": "https://wikiwiki.jp/magivaca/%E3%82%84%E3%81%95%E3%81%8C%E3%81%97",
    "source_equip": "https://wikiwiki.jp/magivaca/%E8%A3%85%E5%82%99%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0",
    "source_beginner": "https://wikiwiki.jp/magivaca/%E5%88%9D%E5%BF%83%E8%80%85%E5%90%91%E3%81%91%E3%83%97%E3%83%AC%E3%82%A4%E3%82%AC%E3%82%A4%E3%83%89",
    "overview": {
        "item_name": "おふろセット（装飾品）",
        "description": "せっけんとシャンプー、リンス　トリートメントのセット。",
        "single_stat": "力0 / 守0 / 速0 / 精0 / MP 1%",
        "set_name": "おふろ装備一式",
        "set_bonus": "力 +51 / 守 +51 / 速 +51 / 精 +51 / MP +51%",
        "parts": [
            {"part": "あたま", "name": "せんめんき", "single": "力1 / 守0 / 速0 / 精0 / MP 0%", "equipped": "力51 / 守50 / 速50 / 精50 / MP 50%"},
            {"part": "からだ", "name": "ゆかた", "single": "力0 / 守0 / 速1 / 精0 / MP 0%", "equipped": "力50 / 守50 / 速51 / 精50 / MP 50%"},
            {"part": "あし", "name": "ゲタ", "single": "力0 / 守1 / 速0 / 精0 / MP 0%", "equipped": "力50 / 守51 / 速50 / 精50 / MP 50%"},
            {"part": "アクセサリー", "name": "おふろセット", "single": "力0 / 守0 / 速0 / 精0 / MP 1%", "equipped": "力50 / 守50 / 速50 / 精50 / MP 51%"}
        ],
        "summary": "各部位単体では『+1』程度と極めて貧弱ですが、4部位すべてを揃えて装備するとセット効果が発動し、全ステータスが一律+50（合計51/51/51/51/51%）という全ゲーム中屈指の強力装備に化けます。いずれも通常のショップ・宝箱ではなく『やさがし』でのみ入手可能です。"
    },
    "prerequisites": [
        "魔バスに乗車・プレーン間ワープが可能になっていること（ストーリー進行で魔バス修理後）。",
        "アイテム所持枠に十分な空きがあること（所持枠が満杯だと入手失敗で乱数同期がズレます）。",
        "通信要素（レッツ温泉等）は不要。1人プレイ・完全オフラインで入手可能。"
    ],
    "warnings": [
        {
            "title": "愛の精霊コンプリート後の実行を強く推奨",
            "desc": "愛の精霊（ウィッシュ3・7）には『カエルグミ捕獲数0個（未購入）』という極めて厳しい条件があります。やさがしでカエルグミが出た際のトラブルを避けるため、愛の精霊を7体仲間にし終えた後にやさがしを行うのが最も安全です。"
        },
        {
            "title": "途中で戦闘や徒歩マップ移動を挟まないこと",
            "desc": "乱数調整中は『魔バスのプレーン間ワープ』のみで移動してください。徒歩で別マップへ出たり、野生モンスターと戦闘すると乱数テーブルがリセットまたは大きく変動し、手順通りに出現しなくなります。"
        }
    ],
    "routes": [
        {
            "id": "route_loop",
            "name": "ルート1：光・闇ワープ増殖ループ（お風呂セット・ゲタ・ゆかた量産）",
            "summary": "最もメジャーで安定した乱数調整ループ。お風呂セット、ゲタ、ゆかたを確実に入手でき、手順を繰り返すことで何セットでも増殖可能です。",
            "steps": [
                {
                    "step": 1,
                    "location": "闇のプレーン（魔バス内）",
                    "action": "起点パターンの捕捉",
                    "detail": "闇のプレーンで『やさがし』を繰り返し、『まつぼっくり ➔ なし ➔ カエルグミ緑 ➔ なし ➔ ミミズグミ赤（または あなあきはっぱ）』が出た直後に、魔バスのワープで【光のプレーン】へ移動します。"
                },
                {
                    "step": 2,
                    "location": "光のプレーン（魔バス内）",
                    "action": "ゲタ ＆ お風呂セット の回収",
                    "detail": "光のプレーンに到着後、その場で『やさがし』を順番に実行します。\n・1回目：なし\n・2回目：1ブラー\n・3回目：★『ゲタ』入手！\n・4回目：カエルグミ緑\n・5回目：なし\n・6回目：ミミズグミ黄\n・7回目：まつぼっくり\n・8回目：なし\n・9回目：なし\n・10回目：カエルグミ緑\n・11回目：★『お風呂セット』入手！"
                },
                {
                    "step": 3,
                    "location": "闇のプレーンへワープ",
                    "action": "ゆかた の回収",
                    "detail": "11回目でお風呂セットを入手した直後、魔バスで【闇のプレーン】へワープし、やさがしを実行します。\n・1回目：21ブラー\n・2回目：1ブラー\n・3回目：なし\n・4回目：カエルグミ青\n・5回目：25ブラー\n・6回目：★『ゆかた』入手！"
                },
                {
                    "step": 4,
                    "location": "ループ継続（増殖可能）",
                    "action": "次の周回へ",
                    "detail": "ゆかた入手後、そのまま闇で『カエルグミ緑 ➔ なし ➔ まつぼっくり ➔ なし ➔ カエルグミ緑 ➔ なし ➔ ミミズグミ赤』まで進めると、再びステップ1の状態に戻ります。光へワープすれば2セット目以降を無限に入手可能です。"
                }
            ]
        },
        {
            "id": "route_fullset",
            "name": "ルート2：一式コンプリート特化最短手順（せんめんき・てぬぐい含む）",
            "summary": "死のプレーン到達後、全4部位（せんめんき、ゆかた、ゲタ、おふろセット）＋てぬぐいを順番に回収する一本道ルート。",
            "steps": [
                {
                    "step": 1,
                    "location": "闇のプレーン ➔ 光へワープ",
                    "action": "導入",
                    "detail": "【闇】で『カエルグミ緑 ➔ なし ➔ カエルグミ緑 ➔ なし ➔ ミミズグミ赤』を引いたら【光のプレーン】へワープ。"
                },
                {
                    "step": 2,
                    "location": "光 ➔ 闇",
                    "action": "『おふろセット』入手",
                    "detail": "【光】なし×4 ➔ カエルグミ赤 ➔ 【闇へワープ】なし×2 ➔ ★『おふろセット』入手！"
                },
                {
                    "step": 3,
                    "location": "光 ➔ 闇 ➔ 光",
                    "action": "『ゲタ』入手",
                    "detail": "【光へワープ】カエルグミ赤 ➔ 【闇へワープ】なし×2 ➔ ★『ゲタ』入手！ ➔ 【光へワープ】カエルグミ赤"
                },
                {
                    "step": 4,
                    "location": "死 ➔ 闇",
                    "action": "『せんめんき』入手",
                    "detail": "【死へワープ】カエルグミ青 ➔ カエルグミ緑 ➔ 【闇へワープ】なし×3 ➔ ★『せんめんき』入手！（これで一式4部位が完成）"
                },
                {
                    "step": 5,
                    "location": "死のプレーン",
                    "action": "『てぬぐい』入手（任意）",
                    "detail": "【死へワープ】カエルグミ青 ➔ カエルグミ緑 ➔ カエルグミ青 ➔ まつぼっくり ➔ なし ➔ カエルグミ緑 ➔ なし ➔ ★『てぬぐい』入手！"
                }
            ]
        }
    ]
}

# Load current js/data.js
data_path = r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\js\data.js'
with open(data_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Append OFURO_CHART_DATA
ofuro_json = json.dumps(ofuro_chart_data, ensure_ascii=False, indent=2)

new_code = f"""
var OFURO_CHART_DATA = {ofuro_json};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = {{ SPIRITS_DATA, ELEMENT_META, PIRANHA_DATA, LIFESPAN_GUIDE, COMP_GUIDE, LEVELING_DATA, CHART_DATA, SYSTEM_DATA, OFURO_CHART_DATA }};
}}
"""

# Replace the module.exports section
import re
updated_content = re.sub(r'if \(typeof module !== \'undefined\'[\s\S]*$', '', content).strip()
updated_content += "\n" + new_code

with open(data_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print(f"Updated {data_path} with OFURO_CHART_DATA successfully.")
