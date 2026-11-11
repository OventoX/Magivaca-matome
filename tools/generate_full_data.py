import json

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\docs\data\parsed_spirits.json', 'r', encoding='utf-8') as f:
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

leveling_data = {
    "title": "経験値稼ぎ（レベリング）ガイド",
    "source_url": "https://wikiwiki.jp/magivaca/%E7%B5%8C%E9%A8%93%E5%80%A4%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB",
    "magic_source_url": "https://wikiwiki.jp/magivaca/%E9%AD%94%E6%B3%95%E7%B5%8C%E9%A8%93%E5%80%A4%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB",
    "garam_source_url": "https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9",
    "mechanics": [
        {
            "title": "経験値の分配法則（頭数割り勘）",
            "desc": "戦闘終了時の獲得経験値は、戦闘不能者やマジックドール（人形）も含めたパーティ全員で均等に割り勘されます。特定の仲間を集中的に育成したい場合は、パーティ人数を絞る（主人公1人など）ことで1人あたりの獲得経験値が最大（6人PTの6倍）になります。"
        },
        {
            "title": "レベル上限と必要経験値の推移",
            "desc": "キャラのレベル上限はLV999です。LV1からLV87まではレベルが上がるごとに必要経験値が増加しますが、LV88以降はLV999まで各レベル間の必要経験値が『99,999』で完全に一定となります。"
        },
        {
            "title": "魔法経験値の仕様と連打稼ぎ",
            "desc": "魔法レベルはLV1〜100まで。魔法経験値は魔法の使用回数に応じて蓄積されます。消費MPの軽い魔法や補助・回復魔法を毎ターン連打することで効率的にレベルを上げることができます（例: 風『マッハライン』、石『カテナ』、美『ホワイトローズ』、愛『天使のチャージ』連打）。"
        }
    ],
    "spots": [
        {
            "phase": "序盤",
            "plane": "光のプレーン",
            "location": "森の洞窟（東/西）～ ベナコンチャ遺跡周辺",
            "recommended_lv": "LV 1 ～ 15",
            "monsters": "ボイリン (LV3・火・EXP 6)、マンドラ (LV5・風・EXP 10) など",
            "basis": "【データ算出】最序盤の安全地帯。トルーナ村の宿屋が近いため、MP枯渇やHP消耗時にノーリスクで全回復して即座に狩りに復帰可能。",
            "caution": "序盤は回復手段が限られるため、無理にダンジョン深部へ進まず宿屋のすぐ近くで往復すること。"
        },
        {
            "phase": "序盤～中盤",
            "plane": "光のプレーン",
            "location": "ラ・ロッシュの塔（下層～上層）",
            "recommended_lv": "LV 15 ～ 25",
            "monsters": "ピップルス系、塔内の中型モンスター (LV15～20前後)",
            "basis": "【データ算出】光のプレーン後半ダンジョン。敵の出現密度が高く、階層ごとにレベルが段階的に上昇するため育成しやすい。",
            "caution": "最上階のボス『ブラッド』戦前に十分なレベルを確保すること。カエルグミの誤購入に注意。"
        },
        {
            "phase": "中盤",
            "plane": "闇のプレーン",
            "location": "リギニオ密林 ～ クムヤムト砂漠",
            "recommended_lv": "LV 25 ～ 40",
            "monsters": "リギニオ密林・砂漠の野生モンスター群 (LV25～35前後)",
            "basis": "【データ算出】マサラティ村・タピオカティ村を拠点に狩りが可能。弱点属性を突いた全体魔法で一掃しやすい。",
            "caution": "ずんどこ穴ではドワーフを説得すると火の精霊トーストが消滅するため、育成戦闘中に誤って説得イベントを進めないこと。"
        },
        {
            "phase": "中盤～終盤",
            "plane": "闇のプレーン",
            "location": "キスニカ鉱山 ～ アクアビット城",
            "recommended_lv": "LV 40 ～ 55",
            "monsters": "鉱山・城内のモンスター (LV35～50前後)",
            "basis": "【データ算出】アクアビット城合流後、仲間が揃い戦力が充実する時期。魔バスを活用した補給が可能。",
            "caution": "状態異常（毒、マヒ、石化）を持つ敵が増えるため、対応アイテムや回復魔法の準備が必須。"
        },
        {
            "phase": "終盤",
            "plane": "死のプレーン",
            "location": "荒廃の地 ～ 死の回廊 ～ モギナス魔窟（道中）",
            "recommended_lv": "LV 55 ～ 75",
            "monsters": "強力なアンデッド・闇系モンスター (LV55～70前後)",
            "basis": "【データ算出】本編クリアに向けた最終調整エリア。経験値単価の高い敵が群れで出現する。",
            "caution": "モギナス魔窟最深部のラスボスを倒すとエンディングとなりセーブ不可（クリア後はセーブポイント再開で経験値持ち越し不可）となるため、本編クリア前の育成は魔窟突入前〜道中で完了させること。"
        },
        {
            "phase": "クリア後・最高効率",
            "plane": "ガラムマサラ",
            "location": "ガラムマサラ（5の倍数階のボスフロア往復）★Wiki推奨",
            "recommended_lv": "LV 80 ～ 200+",
            "monsters": "階層ボス（5階: 風、10階: 闇、15階: 石、20階: 古、25階: 水、30階: 雷、35階: 獣、40階: 火、45階: 美、50階: 古）",
            "basis": "【Wiki直接明記】『ガラムマサラでレベル上げをする場合、ボス戦闘→次の階層へ進む→すぐに前の階層へ戻る→復活したボスと再戦闘 を繰り返すのが基本となる』。マップ切替だけで確実に復活する高経験値ボスを無限に狩れるため、全編通して圧倒的最高効率。",
            "caution": "26階以降の闇属性モンスターは魔法防御が非常に高く、威力5の全体攻撃でも一掃が困難。弱点属性の物理攻撃や単体高火力魔法を用意すること。"
        },
        {
            "phase": "エンドコンテンツ",
            "plane": "ガラムマサラ（裏ダンジョン）",
            "location": "シサバレイ（闇・1～10階）/ リドナヒー（光・1～10階）",
            "recommended_lv": "LV 190 ～ 200+",
            "monsters": "最深部エリートモンスター群 (LV 190～200)",
            "basis": "【データ算出】アミーゴ100人達成者のみが進入できる裏ダンジョン。全ゲーム中最高LVの敵が出現し、カンスト育成（LV999）を目指す最終狩り場。",
            "caution": "シサバレイは闇の魔法使い、リドナヒーは光の魔法使い限定。敵の攻撃力・魔法威力が極めて高いため、万全の装備と耐性対策が必須。"
        }
    ],
    "exp_table_sample": [
        {"lv": 1, "next": "-", "total": 0},
        {"lv": 5, "next": 45, "total": 159},
        {"lv": 10, "next": 72, "total": 451},
        {"lv": 15, "next": 116, "total": 919},
        {"lv": 20, "next": 187, "total": 1673},
        {"lv": 25, "next": 302, "total": 2886},
        {"lv": 30, "next": 433, "total": 4564},
        {"lv": 40, "next": 1152, "total": 11843},
        {"lv": 50, "next": 3067, "total": 31278},
        {"lv": 60, "next": 7484, "total": 82271},
        {"lv": 70, "next": 19934, "total": 218080},
        {"lv": 80, "next": 53093, "total": 579808},
        {"lv": 88, "next": 99999, "total": 1178829},
        {"lv": 100, "next": 99999, "total": 2378817},
        {"lv": 200, "next": 99999, "total": 12378717},
        {"lv": 999, "next": "-", "total": "カンスト"}
    ]
}

chart_data = {
    "title": "プレーン別 シナリオチャート攻略",
    "source_base_url": "https://wikiwiki.jp/magivaca/",
    "planes": [
        {
            "id": "matter",
            "name": "物質のプレーン",
            "url": "https://wikiwiki.jp/magivaca/%E7%89%A9%E8%B3%AA%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3",
            "condition": "ゲーム開始直後（プロローグ）",
            "summary": "魔法学校ウィルオウィスプからヴァレンシア海岸への臨海学校。異変が発生し光のプレーンへと飛ばされる。",
            "events": [
                "ウィルオウィスプ：音楽室で全員と会話し、教室でカベルネを仲間にする（図書室の初期装備回収を忘れずに）。",
                "ヴァレンシア海岸（夕）：セサミと会話し、洞窟探検の仲間を最大4人選ぶ（直後に解散するため好みで選んでOK）。",
                "ヴァレンシア海岸（夜）：イベント発生。謎の怪物（エニグマ）の襲撃を受け、生徒たちが各プレーンへ散り散りに飛ばされる。"
            ],
            "missable": "図書室の宝箱（バンダナ、マジックリスト、ビニールシャツ、木のくつ、ぱっちんどめ、愛のシール）は学校を離れると後から戻れないため必ず回収すること。",
            "bosses": "なし（イベントのみ）"
        },
        {
            "id": "light",
            "name": "光のプレーン",
            "url": "https://wikiwiki.jp/magivaca/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3",
            "condition": "オープニング終了後、自動的に転移",
            "summary": "最初に訪れるプレーン。クラスメイトを集めながら、魔バスの行方と散り散りになった仲間を探す旅が始まる。",
            "events": [
                "ミモレットの森：アランシア加入。最序盤限定で主人公属性の精霊が出現（森の洞窟ボス前まで）。",
                "森の洞窟：ピスタチオ加入、モンスター図鑑入手。ボス『グリフォン』戦。",
                "トルーナ村：ガナッシュ、キルシュ加入。",
                "ベナコンチャ遺跡：ボス『スノウヘア』戦。撃破後の移動分岐あり。",
                "ワクティ村 ～ レーミッツ宮殿：ペシュ、ブルーベリー加入。地下ボス『ダブハスネル』戦。",
                "ラ・ロッシュの塔：カフェオレ加入。最上階でボス『ブラッド』戦。",
                "キードモンガ：ボス『ドワーフ長老』戦。クリア後、同行するクラスメイトを1人選んで闇のプレーンへ。"
            ],
            "missable": "【最重要】ベナコンチャ遺跡のスノウヘア撃破直後にトルーナ村へ戻らないと、愛の精霊ウィッシュ1が消滅します。\nまた、イベンセ岩場1では特定条件下（5人PTでサーディン勧誘）で動作超遅延バグがあるため注意。",
            "bosses": "グリフォン（森の洞窟）、スノウヘア（ベナコンチャ遺跡）、ダブハスネル（レーミッツ宮殿）、ブラッド（ラ・ロッシュの塔）、ドワーフ長老（キードモンガ）"
        },
        {
            "id": "dark",
            "name": "闇のプレーン",
            "url": "https://wikiwiki.jp/magivaca/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3",
            "condition": "キードモンガクリア後、転移",
            "summary": "薄暗い湿地や砂漠、火山が広がるプレーン。行方不明だった魔バスを発見・修理し、散り散りだった仲間たちと合流する。",
            "events": [
                "レヒカフ沼 ～ マサラティ村：ショコラ加入。",
                "タピオカティ村 ～ 氷の島（ジェラ風穴）：キャンディ加入。ボス『アイスドール』戦。",
                "リギニオ密林：ボス『バダブーン』戦。",
                "ずんどこ穴：ドワーフたちの説得イベント。",
                "アクアビット城：カベルネ再加入。ボス『エニグマ』戦。",
                "エニグマの森 ～ 東の森 ～ モルビエ火山：オリーブ、セサミ加入。",
                "キスニカ鉱山：シードル加入。地下ボス『モルビエ』戦。魔バスを修理して死のプレーンへ向かう。"
            ],
            "missable": "【最重要】ずんどこ穴のドワーフを1人でも説得すると、火の精霊トースト3が消滅します。説得前に必ずミーロリ銀貨4枚を渡すこと！\nまたリギニオ密林のバダブーンにとどめを刺さず『アニキ/アネゴ』と呼ばせないと愛の精霊条件を落とす恐れあり。",
            "bosses": "アイスドール（ジェラ風穴）、バダブーン（リギニオ密林）、エニグマ（アクアビット城）、モルビエ（キスニカ鉱山）"
        },
        {
            "id": "death",
            "name": "死のプレーン",
            "url": "https://wikiwiki.jp/magivaca/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3",
            "condition": "魔バス修理後、転移",
            "summary": "滅びた世界が広がる終盤のプレーン。ガナッシュの運命、校長先生の真意、そして黒幕との決戦へ挑む。",
            "events": [
                "ガスパチョ村 ～ タンドーリ：クライン割りイベント。",
                "ピラミッド：カエルグミのツボを解きながら進む。ボス『オムザネイル』戦。",
                "死の回廊：運命のカエルを追いながら回廊を突破。",
                "暗闇の地：ガナッシュとの再会・一時加入イベント。",
                "モギナス魔窟：本編最終ダンジョン。最深部にてラストバトル。"
            ],
            "missable": "【最重要】タンドーリでクラインを割ってしまうと、ガスパチョ村の愛の精霊ウィッシュ6が出現しなくなります。\nまたラスボス戦後はセーブ不可で経験値・ドロップを持ち越せないため、最終決戦前に全てのやり残しを消化すること。",
            "bosses": "オムザネイル（ピラミッド）、モギナス魔窟の各ボス群、ラストボス"
        },
        {
            "id": "garam",
            "name": "ガラムマサラ（クリア後）",
            "url": "https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9",
            "condition": "ゲームクリア後、魔バスで進入可能",
            "summary": "全50階層からなる高難易度やりこみダンジョン。さらにアミーゴ100人を達成することで『シサバレイ』『リドナヒー』へ到達できる。",
            "events": [
                "入口で難易度選択（ヌル・ナミ・オニ）。途中変更不可。",
                "5階層ごとにボス戦（マップ切替で即復活するため無限レベリングが可能）。",
                "特定階層でマッドマンに話しかけることでパーティメンバーの入れ替えが可能。",
                "50階ボス撃破で制覇。オニ制覇などで特別な仲間や報酬あり。",
                "シサバレイ（闇の魔法使い限定、全10階、LV190～200、闇精霊7体目ニルヴァ出現）。",
                "リドナヒー（光の魔法使い限定、全10階、LV190～200、光精霊7体目ルクス出現）。"
            ],
            "missable": "シサバレイ10の闇精霊を仲間にする前に主人公が光の魔法使いになってしまうと、二度とシサバレイに入れなくなり精霊コンプリートが詰みます。必ずシサバレイ制覇後に光へ転向すること。",
            "bosses": "各5階層ボス、50階ボス（ディニレンドゥ）、シサバレイ10ボス、リドナヒー10ボス"
        }
    ]
}

system_data = {
    "title": "システム解説",
    "party_url": "https://wikiwiki.jp/magivaca/%E4%BB%B2%E9%96%93",
    "magic_url": "https://wikiwiki.jp/magivaca/%E9%AD%94%E6%B3%95",
    "record_url": "https://wikiwiki.jp/magivaca/%E6%88%90%E7%B8%BE",
    "sections": [
        {
            "title": "仲間システム（クラスメイト全16名）",
            "url": "https://wikiwiki.jp/magivaca/%E4%BB%B2%E9%96%93",
            "content": "主人公（男女選択可能）＋クラスメイト15名の計16属性を網羅。各キャラは独自の成長タイプ（早熟・晩成等）と固有の特殊能力を持っています。\n・アランシア（風）：ハズレ宝箱での戦闘勝利時にコインを必ず1枚獲得（全53枚回収可能）。\n・ペシュ（水）：ミミズグミ穴での戦闘勝利時にコインを獲得することがある。\n・カベルネ（闇）：所持数99またはカベルネPT時、カエルグミ捕獲に失敗扱いとなり、捕獲数を増やさずカエルを移動可能（愛の精霊集めで超重要）。\n・ピスタチオ（木）：木の精霊1体目で魔法の手帳19番が出現。\n・カフェオレ（雷）：キードモンガ進入や愛の精霊2体目の必須条件。\n※戦闘終了時の獲得経験値はパーティ全員（戦闘不能者・人形含む）で均等分割されます。"
        },
        {
            "title": "魔法システムとコンボ",
            "url": "https://wikiwiki.jp/magivaca/%E9%AD%94%E6%B3%95",
            "content": "全16属性の魔法が存在し、各属性ごとに『すくみ関係（弱点・耐性）』『反発属性（ダメージ半減）』が存在します。\n・魔法レベルはLV1～100。使用回数によって成長し、威力や範囲が拡大。\n・コンボ攻撃：同属性の魔法を連続発動、またはボム（アイテム）を起点に属性をつなぐことで威力が飛躍的に跳ね上がります。\n・稼ぎテクニック：風のマッハライン連打、石のカテナ連打、美のホワイトローズ、愛の天使のチャージ連打など、低コスト・回復技を回して魔法経験値を高速蓄積できます。"
        },
        {
            "title": "成績システム（やりこみ評価）",
            "url": "https://wikiwiki.jp/magivaca/%E6%88%90%E7%B8%BE",
            "content": "ゲームクリア時に、プレイヤーの行動（プレイ時間、歩数、戦闘回数、逃走回数、気絶回数、宝箱回収数、精霊数、図鑑コンプ率など）が集計され、総合評価と称号が与えられます。精霊コンプリートや低歩数クリアなど、多彩なプレイスタイルに対応したやりこみ要素です。"
        },
        {
            "title": "アミーゴシステム（通信要素）",
            "url": "https://wikiwiki.jp/magivaca/%E3%82%A2%E3%83%9F%E3%83%BC%E3%82%B4",
            "content": "GBA通信ケーブルを用いた通信要素。他のプレイヤーと『アミーゴ』になることで、人数に応じて主人公の属性変化、特別魔法の習得、限定称号の獲得などが解禁されます。\n★特に『アミーゴ100人』は、クリア後の裏ダンジョン『シサバレイ』および『リドナヒー』に進入するための必須フラグとなっており、精霊全112体コンプリートの前提条件となっています。"
        },
        {
            "title": "こんにゃくいも・やさぐれドワーフ・ピラニア",
            "url": "https://wikiwiki.jp/magivaca/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0",
            "content": "・こんにゃくいも：プレーン間の自由移動を可能にする重要アイテム。メースのイベント等に関与。\n・やさぐれドワーフ：各地に隠れており、話しかけることでアイテムや情報を得られる。\n・ピラニア：各地の川や水場におり、ブラーを渡すことで金貨・銀貨を周期的に入手可能（稼ぎガイド参照）。"
        }
    ]
}

data_js_content = f"""// マジカルバケーション 攻略サポート - 総合攻略データベース
// 一次情報出典: マジカルバケーション攻略Wiki (https://wikiwiki.jp/magivaca/)
// 本データはゲームプレイ支援のための事実情報（場所・条件・要求・仕様）を構造化したものです。

var SPIRITS_DATA = {json.dumps(spirits, ensure_ascii=False, indent=2)};

var ELEMENT_META = {json.dumps(element_meta, ensure_ascii=False, indent=2)};

var PIRANHA_DATA = {json.dumps(piranha_data, ensure_ascii=False, indent=2)};

var LIFESPAN_GUIDE = {json.dumps(lifespan_guide, ensure_ascii=False, indent=2)};

var COMP_GUIDE = {json.dumps(comp_guide, ensure_ascii=False, indent=2)};

var LEVELING_DATA = {json.dumps(leveling_data, ensure_ascii=False, indent=2)};

var CHART_DATA = {json.dumps(chart_data, ensure_ascii=False, indent=2)};

var SYSTEM_DATA = {json.dumps(system_data, ensure_ascii=False, indent=2)};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = {{ SPIRITS_DATA, ELEMENT_META, PIRANHA_DATA, LIFESPAN_GUIDE, COMP_GUIDE, LEVELING_DATA, CHART_DATA, SYSTEM_DATA }};
}}
"""

target_path = r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\js\data.js'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(data_js_content)
print(f"Updated {target_path} successfully. Size: {len(data_js_content)} bytes")
