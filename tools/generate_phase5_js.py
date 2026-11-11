import json
import os

with open(r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\tools\extracted_phase5.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# ストーリー選択肢データ
story_choices_data = [
    {
        "plane": "物質のプレーン",
        "events": [
            {
                "scene": "教室・洞窟探検の準備",
                "location": "魔法学校・教室 ～ ヴァレンシア海岸",
                "choices": [
                    {
                        "action": "セサミに話しかける",
                        "options": "洞窟探検の同行者を最大4人選択（ショコラ、キャンディ、キルシュなど）",
                        "result": "選んだ仲間と洞窟探検へ出発。探検中の仲間ごとの固有会話を楽しめる。"
                    }
                ],
                "notes": "洞窟探検終了後、先生やクラスメイトとの会話で「魔法の手帳」の期間限定項目が埋まるので忘れずに話しかけること。",
                "missable": True,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E7%89%A9%E8%B3%AA%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3"
            },
            {
                "scene": "マドレーヌ先生・カシスとの基礎知識会話",
                "location": "ヴァレンシア海岸",
                "choices": [
                    {
                        "action": "マドレーヌ先生に話しかける",
                        "options": "「HPについて知らない」「MPについて知らない」と答える",
                        "result": "魔法の手帳 No.2（HPについて）および No.3（MPについて）が登録される。"
                    },
                    {
                        "action": "カシスに話しかける",
                        "options": "「力について聞く」「守りについて聞く」",
                        "result": "魔法の手帳 No.4（力について）および No.5（守りについて）が登録される。"
                    }
                ],
                "notes": "【期間限定・取り返しのつかない要素】エニグマ襲撃イベントが始まると二度と入手できなくなる。知っていても「知らない」と答えること。",
                "missable": True,
                "url": "https://wikiwiki.jp/magivaca/%E9%AD%94%E6%B3%95%E3%81%AE%E6%89%8B%E5%B8%B3"
            }
        ]
    },
    {
        "plane": "光のプレーン",
        "events": [
            {
                "scene": "ミモレットの森・ピスカプーク戦",
                "location": "ミモレットの森（小川の丸太橋）",
                "choices": [
                    {
                        "action": "デミッスス戦前のピスタチオとの会話",
                        "options": "どちらの選択肢を選んでも結果は同じ",
                        "result": "イベント戦闘後にピスタチオが正式に仲間になる。"
                    }
                ],
                "notes": "光のプレーンで最初に加入する仲間。光のプレーンではモンスターは出現しない。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#piscabook"
            },
            {
                "scene": "ベナコンチャ遺跡・スノウヘア戦後の移動分岐",
                "location": "ベナコンチャ遺跡・南東",
                "choices": [
                    {
                        "action": "戦闘後の移動方向",
                        "options": "【ルートA】左下へ進みトルーナ村へ戻る ／ 【ルートB】左上へ進み遺跡出口へ直行",
                        "result": "ルートAに進むとイベントが自然に進行し、トルーナ村の宿屋が開放され、遺跡に愛の精霊が出現する。ルートBだと出口で足止めされ追加の会話が発生。"
                    }
                ],
                "notes": "戦闘後にガナッシュが永久脱退する。ガナッシュは今後二度と仲間にならない。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#snowhare"
            },
            {
                "scene": "ピップルスタウン・サーディン加入とフリーズバグ",
                "location": "ピップルスタウン",
                "choices": [
                    {
                        "action": "MD-005 サーディンに話しかける",
                        "options": "「はい」を選ぶと仲間にできる",
                        "result": "【重大バグ警告】PT人数が5人の状態で「はい」を選ぶと、GBAの処理速度が1/150に超低速化するバグが発生する！"
                    }
                ],
                "notes": "【危険】バグが発生するとSTARTメニューを開くまでに最速約45分かかる。回避策：はっぱを拾うかどーどーイベント後、必ずSTARTメニューを開いてから話しかけるか、PT人数を4人以下にしておくこと。",
                "missable": True,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#sardine"
            },
            {
                "scene": "文鳥ケ原・文鳥の合唱",
                "location": "文鳥ケ原",
                "choices": [
                    {
                        "action": "文鳥に話しかける",
                        "options": "話しかけるごとに「ちゅん！」「じゅいー」と鳴き声が変化",
                        "result": "12羽すべてを「ちゅん！」に揃えると12羽目が赤文字になり、ミモレットの森に隠し要素（文鳥）が出現する。"
                    }
                ],
                "notes": "奇数回は「ちゅん！」、偶数回は「じゅいー」と鳴く規則性がある。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#bunchou"
            },
            {
                "scene": "キードモンガ・タルタルちゃん戦前の選択肢",
                "location": "キードモンガ",
                "choices": [
                    {
                        "action": "タルタルちゃんとの対峙",
                        "options": "「はい」を選ぶ",
                        "result": "一時的に所持カエルグミをすべて失うが、戦闘勝利後にすべて返還される。戦闘に突入。"
                    }
                ],
                "notes": "カエルグミを失っても慌てる必要はない。戦闘後に全快＋返還される。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#tartar"
            },
            {
                "scene": "魔バス発進（闇のプレーンへ）",
                "location": "キードモンガ・バス停",
                "choices": [
                    {
                        "action": "魔バスに話しかける",
                        "options": "「はい」を選ぶと闇のプレーンへ移動 ／ 「いいえ」で通常の魔バス操作",
                        "result": "「はい」を選ぶと物語が進行し、闇のプレーンへ突入する。"
                    }
                ],
                "notes": "闇のプレーンへ進むと当面の間は光のプレーンに戻れない。精霊集めやアイテム回収のやり残しがないか確認すること。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#magicbus"
            }
        ]
    },
    {
        "plane": "闇のプレーン",
        "events": [
            {
                "scene": "バソリモ村・こんにゃくイモの譲渡",
                "location": "バソリモ村・民家",
                "choices": [
                    {
                        "action": "メースに話しかける（こんにゃくイモ所持時）",
                        "options": "「はい」を選ぶ ／ 「いいえ」を選ぶ",
                        "result": "「はい」でこんにゃくイモを渡しストーリーが進行。「いいえ」を選んでも何度でも再選択可能。"
                    }
                ],
                "notes": "メースの横にいるマジックドールに話しかけると、そのMDを再びPTに加入させることができる。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#konnyaku"
            },
            {
                "scene": "MD-003 マッケレル加入（超重要取り返しのつかない要素）",
                "location": "モギナス魔窟・イベント戦闘後",
                "choices": [
                    {
                        "action": "戦闘後の加入選択肢",
                        "options": "PT人数5人以下で選択肢「はい」を選ぶ",
                        "result": "MD-003 マッケレルが仲間になる。"
                    }
                ],
                "notes": "【取り返しのつかない要素】PTが6人満員だったり、「いいえ」を選んでしまうと二度と仲間にならない！必ず事前にPTを5人以下にして挑むこと。",
                "missable": True,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#mackerel"
            },
            {
                "scene": "ショコラ加入のPT人数制限",
                "location": "暗闇の地",
                "choices": [
                    {
                        "action": "ショコラに話しかける",
                        "options": "PT人数5人以下で話しかける",
                        "result": "ショコラが仲間に加わる。PTが6人だと加入しないが、こちらは人数を減らせば再挑戦可能。"
                    }
                ],
                "notes": "マッケレルと異なり取り返しはつくが、二度手間を防ぐためPT枠を空けておこう。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#chocolat"
            }
        ]
    },
    {
        "plane": "死のプレーン",
        "events": [
            {
                "scene": "死の地図入手",
                "location": "死者の村",
                "choices": [
                    {
                        "action": "村長との会話",
                        "options": "どの選択肢を選んでも結果は同じ",
                        "result": "自動的に「死の地図」を入手する。"
                    }
                ],
                "notes": "死のプレーンの広大なマップを探索するための必須アイテム。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#death_map"
            },
            {
                "scene": "クライン破壊イベント",
                "location": "死のプレーン各所",
                "choices": [
                    {
                        "action": "戦闘後にクラインを割るかどうかの選択",
                        "options": "「はい」を選ぶ ／ 「いいえ」を選ぶ",
                        "result": "「いいえ」を選ぶとその後のショートカット選択肢が発生する。"
                    }
                ],
                "notes": "進行上の悪影響はないのでプレイスタイルに合わせて選択可能。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#cline"
            }
        ]
    },
    {
        "plane": "ガラムマサラ",
        "events": [
            {
                "scene": "ダンジョン難易度選択（ヌル・ナミ・オニ）",
                "location": "ずんどこ穴・入口",
                "choices": [
                    {
                        "action": "ギュウヒ・オグラに話しかける",
                        "options": "【ヌル】易しい冒険 ／ 【ナミ】標準的な試練 ／ 【オニ】過酷な最深部",
                        "result": "難易度に応じてツボの要求カエルグミ数や出現モンスター、最深部ボスが変化する。"
                    }
                ],
                "notes": "一度難易度を決めると外に出るまで変更できない。再選択時は1階層目からやり直しとなる。",
                "missable": False,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#difficulty"
            },
            {
                "scene": "ディニレンドゥ図鑑消滅警告（超重要取り返しのつかない要素）",
                "location": "ガラムマサラ 50F",
                "choices": [
                    {
                        "action": "難易度「オニ」での文鳥加入",
                        "options": "オニで文鳥を仲間にする前に、必ずヌルかナミで50Fボス#1（ディニレンドゥ）を撃破する",
                        "result": "オニで文鳥を仲間にした瞬間、ボス#1（ディニレンドゥ）が難易度問わず二度と出現しなくなる。"
                    }
                ],
                "notes": "【取り返しのつかない要素】モンスター図鑑コンプリートを目指す場合、1周目は必ず「ヌル」または「ナミ」で50Fまで進めてディニレンドゥを倒すこと！",
                "missable": True,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#boss_warning"
            },
            {
                "scene": "ターニィ加入条件",
                "location": "ガラムマサラ 50F",
                "choices": [
                    {
                        "action": "ボス#2（土偶）撃破後の選択肢",
                        "options": "PT人数5人以下で倒し、選択肢「はい」を選ぶ",
                        "result": "ターニィが仲間になる。"
                    }
                ],
                "notes": "【注意】難易度「ナミ」または「オニ」限定。ボス#2は1度でも倒すと二度と出現しないため、PT枠を空けて挑むこと。",
                "missable": True,
                "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#tahnee"
            }
        ]
    }
]

# 成績項目データ (system_record.html)
record_data = [
    { "category": "勝率", "target": "100%", "weight": "×5", "maxPts": 25, "desc": "全戦闘における逃走なし・全勝を維持" },
    { "category": "気絶回数", "target": "0回", "weight": "×1", "maxPts": 10, "desc": "味方が1人も戦闘不能（HP0）にならない" },
    { "category": "精霊コンボ", "target": "多数達成", "weight": "×1", "maxPts": 10, "desc": "戦闘中の精霊コンボ発動回数" },
    { "category": "仲良くなった精霊", "target": "全112体", "weight": "×2", "maxPts": 10, "desc": "16属性×7体すべての精霊と契約する" },
    { "category": "おぼえた魔法", "target": "全魔法習得", "weight": "×2", "maxPts": 10, "desc": "各属性レベルアップで全7段階の魔法を習得" },
    { "category": "カエルグミ捕獲数", "target": "大量捕獲", "weight": "×2", "maxPts": 10, "desc": "フィールド・ツボ等で捕獲したカエルグミ累計" },
    { "category": "ミミズグミ捕獲数", "target": "大量捕獲", "weight": "×2", "maxPts": 10, "desc": "フィールド等で捕獲したミミズグミ累計" },
    { "category": "まつぼっくり獲得数", "target": "多数獲得", "weight": "×2", "maxPts": 5, "desc": "木を揺らして獲得したまつぼっくりの累計" },
    { "category": "通信対戦勝率", "target": "高勝率", "weight": "×2", "maxPts": 5, "desc": "通信対戦における勝利数・勝率" }
]

output_all = {
    "recoveryItems": data["recoveryItems"],
    "otherItems": data["otherItems"],
    "mdParts": data["mdParts"],
    "equipItems": data["equipItems"],
    "equipSets": data["equipSets"],
    "dropData": data["dropData"],
    "magicNotes": data["magicNotes"],
    "mimicCoins": data["mimicCoins"],
    "bossMonsters": data["bossMonsters"],
    "storyChoices": story_choices_data,
    "recordCriteria": record_data
}

# JSコード生成
js_lines = []
js_lines.append("// Phase 5 Expanded Game Database")
js_lines.append(f"const ITEM_RECOVERY_DATA = {json.dumps(data['recoveryItems'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const ITEM_OTHER_DATA = {json.dumps(data['otherItems'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const ITEM_MD_DATA = {json.dumps(data['mdParts'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const ITEM_EQUIP_DATA = {json.dumps(data['equipItems'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const ITEM_EQUIP_SETS = {json.dumps(data['equipSets'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const ITEM_DROP_INDEX = {json.dumps(data['dropData'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const MAGIC_NOTES_DATA = {json.dumps(data['magicNotes'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const MIMIC_COINS_DATA = {json.dumps(data['mimicCoins'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const BOSS_MONSTERS_DATA = {json.dumps(data['bossMonsters'], ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const STORY_CHOICES_DATA = {json.dumps(story_choices_data, ensure_ascii=False, indent=2)};\n")
js_lines.append(f"const RECORD_CRITERIA_DATA = {json.dumps(record_data, ensure_ascii=False, indent=2)};\n")

with open(r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\tools\phase5_append.js", "w", encoding="utf-8") as f:
    f.write("\n".join(js_lines))

print("phase5_append.js generated successfully. File size:", os.path.getsize(r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\tools\phase5_append.js"))
