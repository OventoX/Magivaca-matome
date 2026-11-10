import json

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\parsed_spirits.json', 'r', encoding='utf-8') as f:
    raw_elements = json.load(f)

base_wiki_url = "https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A"

element_meta = {
    "火": {"spirit": "トースト", "color": "#e74c3c", "symbol": "炎", "desc": "燭台とロウソクの姿"},
    "風": {"spirit": "エア", "color": "#2ecc71", "symbol": "風", "desc": "渦巻く風の姿"},
    "毒": {"spirit": "ブー", "color": "#9b59b6", "symbol": "毒", "desc": "毒キノコ/ドクロの姿"},
    "美": {"spirit": "パウダー", "color": "#e91e63", "symbol": "美", "desc": "鏡/パフの姿"},
    "刃": {"spirit": "スラッシュ", "color": "#95a5a6", "symbol": "刃", "desc": "交差した剣の姿"},
    "音": {"spirit": "ハミング", "color": "#f39c12", "symbol": "音", "desc": "音符の姿"},
    "石": {"spirit": "フリント", "color": "#795548", "symbol": "石", "desc": "鉱石/岩の姿"},
    "虫": {"spirit": "バズ", "color": "#8bc34a", "symbol": "虫", "desc": "蜂/昆虫の姿"},
    "木": {"spirit": "スティック", "color": "#4caf50", "symbol": "木", "desc": "木の枝の姿"},
    "獣": {"spirit": "ガル", "color": "#ff9800", "symbol": "獣", "desc": "牙/肉球の姿"},
    "水": {"spirit": "フロー", "color": "#3498db", "symbol": "水", "desc": "水滴の姿"},
    "雷": {"spirit": "テスラ", "color": "#f1c40f", "symbol": "雷", "desc": "稲妻の姿"},
    "古": {"spirit": "クロック", "color": "#607d8b", "symbol": "古", "desc": "歯車の姿"},
    "闇": {"spirit": "ニルヴァ", "color": "#34495e", "symbol": "闇", "desc": "回転するドクロの姿"},
    "光": {"spirit": "ルクス", "color": "#ffeb3b", "symbol": "光", "desc": "キラキラ光る姿"},
    "愛": {"spirit": "ウィッシュ", "color": "#ff4081", "symbol": "愛", "desc": "点滅するハートの姿"}
}

spirits = []

for elem in raw_elements:
    elem_name = elem['element']
    spirit_name = elem['spirit_name']
    anchor = elem['anchor']
    
    for idx, row in enumerate(elem['rows'], 1):
        spirit_id = f"{elem_name}_{idx}"
        raw_loc = row[0]
        
        planes = []
        if '光：' in raw_loc:
            planes.append('光')
        if '闇：' in raw_loc:
            planes.append('闇')
        if '死：' in raw_loc:
            planes.append('死')
        
        loc_clean = raw_loc.replace('光：', '').replace('闇：', ' / ').replace('死：', '').strip()
        if loc_clean.startswith('/ '):
            loc_clean = loc_clean[2:]
            
        loc_detail = row[1]
        
        if elem_name == '火' and idx == 3:
            loc_detail = "ずんどこ穴内部"
            
        condition = ""
        requirement = ""
        remarks = ""
        missable = None
        req_tags = []
        
        if elem_name == '美':
            req1 = row[2]
            req2 = row[3]
            condition = req1 if req1 != 'なし' else ''
            requirement = req2 if req2 != 'なし' else ('なし' if req1 == 'なし' else '')
            remarks = row[4]
            if 'ガニック金貨' in requirement:
                req_tags.append('金貨・銀貨')
            if 'ミミズグミ' in condition:
                req_tags.append('グミ関連')
                
        elif elem_name == '木':
            cond = row[2]
            req = row[3]
            condition = f"まつぼっくり獲得数: {cond}" if cond and cond != 'なし' else ''
            requirement = f"まつぼっくり譲渡数: {req}" if req else ''
            remarks = row[4]
            req_tags.append('まつぼっくり')
            
        elif elem_name == '闇':
            cond = row[2]
            condition = f"カエルグミ捕獲数: {cond}" if cond and cond != 'なし' else ''
            req_text = "戦闘に勝利" if row[3] in ['〃', '戦闘に勝利'] else row[3]
            requirement = req_text
            remarks = row[4]
            req_tags.append('戦闘')
            if condition:
                req_tags.append('グミ関連')
                
        elif elem_name == '光':
            cond = row[2]
            req = row[3]
            condition = cond if cond and cond != 'なし' else ''
            requirement = req if req and req != 'なし' else 'なし'
            remarks = row[4]
            req_tags.append('特殊条件')
            
        elif elem_name == '愛':
            cond = row[2]
            req = row[3]
            condition = cond if cond and cond != 'なし' else ''
            requirement = f"カエルグミ捕獲数: {req}" if req and req != 'なし' else 'なし'
            remarks = row[4]
            req_tags.append('グミ関連')
            
        else:
            requirement = row[2]
            remarks = row[3]
            if elem_name == '石' and 'ミミズグミ捕獲数' in remarks:
                condition = remarks
            elif elem_name == '虫' and '虫メガネ' in remarks:
                condition = '虫メガネ所持'
                
            if any(c in requirement for c in ['金貨', '銀貨']):
                req_tags.append('金貨・銀貨')
            if 'しっぽ' in requirement:
                req_tags.append('しっぽ')
            if 'グミ' in requirement:
                req_tags.append('グミ関連')
            if requirement == '-' or requirement == 'なし':
                req_tags.append('なし')

        if not req_tags:
            req_tags.append('その他')

        if elem_name == '火' and 'ずんどこ穴' in raw_loc:
            missable = "【取り返しのつかない要素】ドワーフを一人でも説得すると消滅し、二度と仲良くなれません。"
        elif elem_name == '愛':
            if idx == 1:
                missable = "【取り返しのつかない要素】スノウヘア撃破直後にトルーナ村へ向かわないと二度と仲良くなれません。"
            elif idx == 4:
                missable = "【注意】ボス「バダブーン」にとどめを刺さず、アニキ/アネゴと呼ばせる必要があります。"
            elif idx == 6:
                missable = "【取り返しのつかない要素】タンドーリでクラインを割ってしまうと仲間になりません。"
            elif idx in [3, 7]:
                missable = f"【厳格な制限】カエルグミ捕獲数0個（{idx}体目は未購入も必須）。拾う/買うと加入不可になります。"
            else:
                missable = f"【捕獲数制限】カエルグミ捕獲数制限（{requirement}）。捕獲しすぎると加入不可になります。"
        elif elem_name == '光':
            if idx == 7:
                missable = "【重要警告】シサバレイ10にいる闇の精霊（ニルヴァ7）を仲間にする前に光の魔法使いになってはいけません（シサバレイ侵入不可になるため）。またニルヴァ1体以下の制限あり。"
            else:
                missable = f"【闇精霊制限】ニルヴァを仲間にしすぎると出現/加入しなくなります（条件: {requirement}）。愛・光コンプ前に闇精霊を集めないこと。"

        spirits.append({
            "id": spirit_id,
            "element": elem_name,
            "spiritName": spirit_name,
            "index": idx,
            "planes": planes,
            "locationRaw": raw_loc,
            "locationClean": loc_clean,
            "locationDetail": loc_detail,
            "condition": condition,
            "requirement": requirement,
            "remarks": remarks,
            "reqTags": req_tags,
            "missable": missable,
            "sourceUrl": f"{base_wiki_url}{anchor}"
        })

piranha_data = {
    "title": "ピラニアの金貨銀貨法則",
    "summary": "各地のピラニアにお金を渡すと、累計金額に応じた周期で金貨銀貨が貰える。渡す金額により貰えるコインの種類（余り）をコントロール可能。",
    "location": "ベナコンチャ遺跡出口付近が安全ですぐ会える（各地のピラニアは全て共通データ）。",
    "mod_table": [
        {"rem": 0, "coin": "ミーロリ銀貨"},
        {"rem": 1, "coin": "アルティ銀貨"},
        {"rem": 2, "coin": "ラシモフ銀貨"},
        {"rem": 3, "coin": "クレセント銀貨"},
        {"rem": 4, "coin": "ハモニック金貨"},
        {"rem": 5, "coin": "ヘリオン金貨"},
        {"rem": 6, "coin": "キャムティ金貨"},
        {"rem": 7, "coin": "ガニック金貨"}
    ],
    "amount_table": [
        {"amount": "10ブラー", "shift": "1つ下、7つ上"},
        {"amount": "20ブラー", "shift": "2つ下、6つ上"},
        {"amount": "50ブラー", "shift": "5つ下、3つ上"},
        {"amount": "100ブラー", "shift": "2つ下、6つ上"},
        {"amount": "200ブラー", "shift": "4つ下、4つ上"},
        {"amount": "500ブラー", "shift": "2つ下、6つ上"},
        {"amount": "1,000ブラー", "shift": "4つ下、4つ上"},
        {"amount": "2,000ブラー", "shift": "同じ（余り変化なし）★おすすめ"},
        {"amount": "5,000ブラー", "shift": "4つ下、4つ上"},
        {"amount": "10,000ブラー", "shift": "同じ（余り変化なし）"}
    ],
    "tips": "任意の金貨銀貨を大量に集めたい場合、目的のコインが出た後に『2,000ブラー連打』をするのが最速です。"
}

lifespan_guide = {
    "title": "ミミズグミ・カエルグミ・まつぼっくりの「寿命」の仕組み",
    "summary": "フィールド上に配置されたグミやまつぼっくりには個体ごとに『寿命（捕獲可能上限回数）』が設定されている。",
    "details": [
        {"name": "ミミズグミ", "rule": "拾って消えても通常はマップ移動で再出現するが、捕獲数が寿命を超えると消滅。ペシュがPTにいれば穴でコインを落とす場合がある。美の精霊（パウダー）の加入条件（所持数制限）に注意。"},
        {"name": "カエルグミ", "rule": "愛の精霊（ウィッシュ）の加入条件に直結するため最重要。寿命を超えると消滅。カベルネがPTにいるか、所持数99の時は捕獲失敗扱いになり、捕獲数を増やさずカエルを移動させられる。"},
        {"name": "まつぼっくり", "rule": "木の精霊（スティック）の出現・要求に関わる。寿命を超えると再出現しなくなる。"}
    ]
}

comp_guide = {
    "order": ["愛の精霊コンプリート", "光の精霊コンプリート", "闇の精霊コンプリート"],
    "critical_rules": [
        {
            "title": "愛 → 光 → 闇 の順で集める（鉄則）",
            "desc": "愛の精霊はカエルグミ捕獲数制限（0個〜少数）があり、光の精霊は闇の精霊（ニルヴァ）加入数制限（1体以下〜6体以下）があるため、闇を先に集めると光と愛が詰みます。"
        },
        {
            "title": "カエルグミは愛コンプまで捕獲・購入禁止",
            "desc": "アクアビット城4とピラミッド9のウィッシュは『捕獲数0個（ピラミッドは未購入も）』が条件です。1匹でも拾う・買うとコンプ不可能になります。"
        },
        {
            "title": "ずんどこ穴の火の精霊（トースト3）は最優先で仲間にする",
            "desc": "ドワーフを一人でも説得すると消滅し、二度と仲良くなれません。説得前に必ずミーロリ銀貨4枚を渡して仲間にすること。"
        },
        {
            "title": "シサバレイ10の闇精霊（ニルヴァ7）まで光の魔法使いにならない",
            "desc": "シサバレイは闇の魔法使いでなければ侵入できません。光の魔法使いになると二度と入れなくなるため、必ずシサバレイ10のニルヴァを仲間にした後に光へ転向すること。アミーゴ100人が必要。"
        },
        {
            "title": "タンドーリでクラインを割らない",
            "desc": "死のプレーンのタンドーリでクラインを割ってしまうと、ガスパチョ村の愛の精霊（ウィッシュ6）が出現しなくなります。"
        },
        {
            "title": "スノウヘア撃破直後にトルーナ村へ向かう",
            "desc": "ベナコンチャ遺跡の愛の精霊（ウィッシュ1）は、ボス「スノウヘア」撃破直後の移動時のみ出現します。"
        }
    ]
}

data_js_content = f"""// マジカルバケーション 攻略サポート - 精霊データベース
// 一次情報出典: マジカルバケーション攻略Wiki (https://wikiwiki.jp/magivaca/)
// 本データはゲームプレイ支援のための事実情報（場所・条件・要求）を構造化したものです。

var SPIRITS_DATA = {json.dumps(spirits, ensure_ascii=False, indent=2)};

var ELEMENT_META = {json.dumps(element_meta, ensure_ascii=False, indent=2)};

var PIRANHA_DATA = {json.dumps(piranha_data, ensure_ascii=False, indent=2)};

var LIFESPAN_GUIDE = {json.dumps(lifespan_guide, ensure_ascii=False, indent=2)};

var COMP_GUIDE = {json.dumps(comp_guide, ensure_ascii=False, indent=2)};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = {{ SPIRITS_DATA, ELEMENT_META, PIRANHA_DATA, LIFESPAN_GUIDE, COMP_GUIDE }};
}}
"""

for target_path in [
    r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\data.js',
    r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\js\data.js'
]:
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(data_js_content)
    print(f"Updated {target_path}")
