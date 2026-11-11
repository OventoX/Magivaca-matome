import json
import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.join(base_dir, '..')
data_js_path = os.path.join(project_dir, 'js', 'data.js')
extracted_monsters_path = os.path.join(base_dir, 'extracted_monsters.json')

with open(extracted_monsters_path, 'r', encoding='utf-8') as f:
    monsters_288 = json.load(f)

print(f"Loaded {len(monsters_288)} regular monsters.")

# Expanded Story Choices Data (28 events across 5 planes)
STORY_CHOICES_EXPANDED = [
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
      },
      {
        "scene": "図書室・教室での装備回収と仲間会話",
        "location": "魔法学校（図書室・教室・音楽室）",
        "choices": [
          {
            "action": "図書室の本棚や宝箱を探索し、教室でカベルネに話しかける",
            "options": "校舎を出る前に図書室をくまなく探索する ／ 探索せずに出発する",
            "result": "バンダナ、マジックリスト、ビニールシャツ、木のくつ、愛のシールなど序盤限定の装備品を回収可能。カベルネを仲間に迎えて出発する。"
          }
        ],
        "notes": "校舎から一度外に出ると二度と学校には戻れないため、出発前のアイテム回収は必須。",
        "missable": True,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E7%89%A9%E8%B3%AA%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#classroom"
      },
      {
        "scene": "カエルの林・カエルグミ捕獲と成績表リセット",
        "location": "ヴァレンシア海岸・カエルの林",
        "choices": [
          {
            "action": "捕獲したカエルグミをレモンに渡すかどうか",
            "options": "【選択肢A】レモンに渡す ／ 【選択肢B】渡さずに所持する",
            "result": "レモンに渡すと成績表上のカエルグミ取得数が0にリセットされる。「カエルグミ取得数0クリア」を目指すやりこみプレイにおける必須分岐。"
          }
        ],
        "notes": "カエルグミ0個クリアを目指す場合、ここでカエルグミをレモンに渡して取得数を0に戻しておくこと。",
        "missable": True,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E7%89%A9%E8%B3%AA%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#frog_wood"
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
        "scene": "森の洞窟・ヴァルカネイラ戦とアランシア加入",
        "location": "森の洞窟・入口 ～ 東",
        "choices": [
          {
            "action": "洞窟入口手前の選択肢、およびマップ右下でのキルシュ・アランシア共闘",
            "options": "入口での会話選択肢（どちらを選んでも戦闘へ）",
            "result": "ヴァルカネイラ撃破後にアランシアが正式加入し、メニュー機能「モンスター図鑑」を入手。キルシュは一旦別行動となる。"
          }
        ],
        "notes": "戦闘後にトルーナ村へ進む。キルシュは後ほどトルーナ村のイベントで再加入する。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#forest_cave"
      },
      {
        "scene": "トルーナ村・キルシュ再加入と村長イベント",
        "location": "トルーナ村（左上の民家・森の洞窟小部屋）",
        "choices": [
          {
            "action": "村長からウークルの羽を入手後、森の洞窟・小部屋へ向かう",
            "options": "森の洞窟・小部屋へ寄り道してキルシュを仲間にする ／ そのままベナコンチャ遺跡へ直行",
            "result": "森の洞窟小部屋でキルシュに話しかけると戦闘なしで再加入。村の右上で加入したガナッシュと共に強固な前衛が揃う。"
          }
        ],
        "notes": "キルシュを回収せずに遺跡を進めることも可能だが、物理火力が大きく低下するため必ず立ち寄って回収推奨。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#toluna"
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
            "action": "文鳥の合唱を聴いた後の会話",
            "options": "「はい」「いいえ」のいずれかを選択",
            "result": "選択肢によるストーリーの分岐はなし。「ラシモフ金貨」または「ラシモフ銀貨」を入手できる。"
          }
        ],
        "notes": "文鳥温泉への道が開く。温泉に入ることでHP・MPが全回復する。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#buncho"
      },
      {
        "scene": "ラ・ロッシュの塔・カベルネ加入",
        "location": "ラ・ロッシュの塔",
        "choices": [
          {
            "action": "塔内にいるカベルネに話しかける",
            "options": "話しかけて「はい」を選択",
            "result": "カベルネが正式加入。カベルネはカエルグミを食べない（戦闘不能回復アイテムを受け付けない）固有仕様を持つため編成・回復に注意。"
          }
        ],
        "notes": "カベルネ加入後は全体回復魔法や精霊魔法でのHP管理が重要となる。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E5%85%89%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#laroche"
      }
    ]
  },
  {
    "plane": "闇のプレーン",
    "events": [
      {
        "scene": "レヒカフ沼・オリーブとの再会と会話",
        "location": "レヒカフ沼（沼地・中央部）",
        "choices": [
          {
            "action": "沼地でオリーブを発見した際の会話",
            "options": "「助ける」「話を聞く」など",
            "result": "オリーブが一時的に同行状態になる。泥沼の歩行ギミックを教わり、謎の遺跡方面への移動が可能になる。"
          }
        ],
        "notes": "沼地の毒地形を通過する前に回復アイテム（どくドクナ）を補充しておくこと。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#lehikaf"
      },
      {
        "scene": "マサラティ村・カフェオレ救出と再加入",
        "location": "マサラティ村",
        "choices": [
          {
            "action": "村のイベントを進めてカフェオレに話しかける",
            "options": "イベント進行後に話しかけて仲間に加える",
            "result": "カフェオレが正式にパーティ復帰。単体・全体高火力の雷魔法使いとして加入し、水属性モンスターが多い闇のプレーンで主力となる。"
          }
        ],
        "notes": "カフェオレ加入により属性相性での戦闘難易度が大幅に緩和される。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#masalati"
      },
      {
        "scene": "タピオカティ村・宿屋とキャンディ合流",
        "location": "タピオカティ村",
        "choices": [
          {
            "action": "村長・村人に話しかけ、宿屋イベントを進行",
            "options": "村の探索後に宿屋で休む",
            "result": "イベントを経てキャンディと合流。風属性魔法と回復サポートが強化される。"
          }
        ],
        "notes": "村周辺の湖・水辺エリアの探索フラグが開放される。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#tapiokati"
      },
      {
        "scene": "クムヤムト砂漠・オアシスの選択",
        "location": "クムヤムト砂漠",
        "choices": [
          {
            "action": "砂漠でオアシスを発見した際の行動",
            "options": "オアシスで水を飲む ／ そのまま砂漠を進む",
            "result": "オアシスで水を飲むとPTのHP・MPが回復し、砂漠特有の熱気によるHP減少ペナルティが解除される。"
          }
        ],
        "notes": "砂漠を歩くと歩数に応じてダメージを受けるため、定期的にオアシスを利用することが推奨される。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#kumyamt"
      },
      {
        "scene": "エニグマの森・シードルとの合流",
        "location": "エニグマの森",
        "choices": [
          {
            "action": "迷いの森の分岐進行",
            "options": "【ルートA】左上へ進む ／ 【ルートB】右下へ進む",
            "result": "ルートAへ進むとシードルと合流でき、森の出口への正しい道順を教えてもらえる。ルートBだと同じエリアをループする。"
          }
        ],
        "notes": "シードルがパーティに加入。木属性の魔法使いとして活躍する。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#enigma_forest"
      },
      {
        "scene": "キスニカ鉱山・トロッコ切り替えとブッチーネ3世戦",
        "location": "キスニカ鉱山（5〜8F, 9〜12F）",
        "choices": [
          {
            "action": "トロッコの進路切り替えスイッチを操作する",
            "options": "直進ルート ／ 分岐ルート（宝箱・精霊回収）",
            "result": "スイッチ操作により隠しエリアの宝箱や精霊を回収可能。最深部でブッチーネ3世＋マジックドール4体とのボス戦。"
          }
        ],
        "notes": "ボス戦では取り巻きのマジックドールを全体魔法で素早く掃討するのがセオリー。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E9%97%87%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#kisnika"
      }
    ]
  },
  {
    "plane": "死のプレーン",
    "events": [
      {
        "scene": "大岩・ガスパチョ村への道",
        "location": "大岩（死のプレーン・入口）",
        "choices": [
          {
            "action": "大岩を押して道を切り開く",
            "options": "キルシュの力を借りて岩を押す",
            "result": "大岩を排除してガスパチョ村への道が開通。村で回復アイテムの補充やセーブが可能になる。"
          }
        ],
        "notes": "死のプレーンは敵の攻撃力が高いため、ガスパチョ村での装備確認が重要。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#oiwa"
      },
      {
        "scene": "タンドーリ・オリーブ救出イベント",
        "location": "タンドーリ",
        "choices": [
          {
            "action": "タンドーリの街の地下牢・イベントを進める",
            "options": "見張りとの戦闘を経て救出",
            "result": "捕らわれていたオリーブを救出してパーティに再加入。植物魔法での状態異常・サポートが復帰。"
          }
        ],
        "notes": "死のプレーンの過酷な環境下での重要戦力となる。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#tandoori"
      },
      {
        "scene": "ピラミッド・石の棺と謎解き",
        "location": "ピラミッド（中央の玄室）",
        "choices": [
          {
            "action": "4つの石の棺を調べる順序",
            "options": "【順序A】左上→右下→左下→右上 ／ 【順序B】その他の順序",
            "result": "正しい順序で棺を開けると中央の隠し扉が開き、石の精霊や強力な古代装備を入手できる。間違えるとモンスターが出現。"
          }
        ],
        "notes": "ピラミッド内部は落とし穴が多いので慎重に探索すること。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#pyramid"
      },
      {
        "scene": "ラキューオ・セサミとの再会",
        "location": "ラキューオ（廃墟）",
        "choices": [
          {
            "action": "変わり果てたセサミとの会話",
            "options": "セサミの問いかけに「はい」「いいえ」で回答",
            "result": "選択肢によるストーリーの分岐はなし。セサミの心情やエニグマの真相が語られ、物語の核心へと迫る。"
          }
        ],
        "notes": "会話イベント後、モギナス魔窟への道が解放される。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#laqoo"
      },
      {
        "scene": "モギナス魔窟・最深部突入前の準備",
        "location": "モギナス魔窟（入口 ～ 最深部）",
        "choices": [
          {
            "action": "最深部の扉を開ける前の確認",
            "options": "扉を開けて突入する ／ 引き返して準備を整える",
            "result": "扉の奥へ進むとボス戦が連続し、しばらく街へ戻れなくなる。装備・回復アイテムを万全にして挑む必要がある。"
          }
        ],
        "notes": "【警告】セーブデータを分けることが推奨される難所。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#moginas"
      },
      {
        "scene": "死の回廊・光の魔法使い覚醒と闇ダンジョン閉鎖",
        "location": "死の回廊 ～ 暗闇の地",
        "choices": [
          {
            "action": "ストーリーを進めて光の魔法使いに覚醒する",
            "options": "ストーリー進行を受け入れる",
            "result": "主人公が闇属性から光属性へと変化し、光属性魔法を習得。同時に「闇の魔法使い限定」のダンジョン（リドナヒー等）に二度と入れなくなる。"
          }
        ],
        "notes": "【重大注意】覚醒前にリドナヒーの宝箱・図鑑・精霊回収を必ず完了させておくこと。事前セーブ必須。",
        "missable": True,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E6%AD%BB%E3%81%AE%E3%83%97%E3%83%AC%E3%83%BC%E3%83%B3#corridor_of_death"
      }
    ]
  },
  {
    "plane": "ガラムマサラ",
    "events": [
      {
        "scene": "キヤシカゥアのツボ・カエルグミ要求数の増減ルール",
        "location": "ガラムマサラ各階（キヤシカゥアのツボ）",
        "choices": [
          {
            "action": "ツボにカエルグミを投入する",
            "options": "要求数どおりにカエルグミを投入 ／ 投入せずに通り過ぎる",
            "result": "投入するとツボの封印が解け、次の階層への階段やアイテムが出現。戦闘後にカエルグミ擬態と接触することで要求数が増減する。"
          }
        ],
        "notes": "ツボの要求カエルグミ数を減らすには、カエルグミ擬態を倒してツボの要求カウントを調整することが有効。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#tsubo"
      },
      {
        "scene": "カエルグミ擬態・消滅バグ回避手順",
        "location": "ガラムマサラ 5F, 7F, 9F, 14F, 15F",
        "choices": [
          {
            "action": "カエルグミ擬態への接触方法",
            "options": "【推奨】後ろから追突・Aボタン連打 ／ 正面から近づく（バグ発生リスク）",
            "result": "擬態が壁から浮いた状態で接触すると、マップ下端の「バグ壁」をすり抜けて画面外へ消失してしまうバグを回避できる。"
          }
        ],
        "notes": "【攻略本言及の仕様】ガラムマサラ14Fではマップ進入から約15秒後に擬態同士のすれ違いで1体が画面外へ消失する。進入後15秒以内に片方と接触することで回避可能。",
        "missable": True,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#frog_mimic"
      },
      {
        "scene": "50Fボス#1「ディニレンドゥ」図鑑登録の絶対ルール",
        "location": "ガラムマサラ 50F",
        "choices": [
          {
            "action": "難易度選択とクリア順序",
            "options": "【必須】1周目に「ヌル」または「ナミ」で50Fをクリア ／ 1周目から「オニ」で文鳥を仲間にする",
            "result": "難易度「オニ」で文鳥を仲間にした時点で、ディニレンドゥは難易度に関わらず二度とフィールドに出現しなくなる。図鑑をコンプリートできなくなる重大な罠。"
          }
        ],
        "notes": "【最重要警告】モンスター図鑑コンプリートを目指す場合、必ずオニに挑む前にヌルまたはナミで50階まで進め、ディニレンドゥを倒して図鑑登録すること。",
        "missable": True,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#dinilendu"
      },
      {
        "scene": "シサバレイ・精霊石像と目玉石像による特殊PT操作",
        "location": "シサバレイ（1F〜5F）",
        "choices": [
          {
            "action": "フロア内の石像を調べる",
            "options": "精霊の石像（対応属性の仲間を追加） ／ 目玉の石像（目玉の数だけPT後方から仲間を除外）",
            "result": "シサバレイ内では通常メニューからのPT編成が不可。石像のギミックを使って仲間を入れ替え、ボス戦に向けた最適な陣形を構築する。"
          }
        ],
        "notes": "PT上限6人の状態で精霊石像を調べても何も起きないため、目玉石像で人数を減らしてから目当ての仲間を加えること。",
        "missable": False,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#sisavalley"
      },
      {
        "scene": "リドナヒー・闇魔法使い限定突入とニルヴァ",
        "location": "リドナヒー（10F）",
        "choices": [
          {
            "action": "闇の魔法使いの状態で10Fまで登頂しニルヴァに話しかける",
            "options": "光の魔法使いに覚醒する前に突入・クリアする",
            "result": "10Fのニルヴァとの会話イベントおよびモンスター図鑑登録を達成。光の魔法使いになってしまうと二度と進入できない。"
          }
        ],
        "notes": "【取り返しのつかない要素】ゲームクリアや光の魔法使い覚醒前に必ず10Fまで踏破すること。",
        "missable": True,
        "url": "https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#lidonahy"
      }
    ]
  }
]

print(f"Total expanded story events: {sum(len(p['events']) for p in STORY_CHOICES_EXPANDED)} across 5 planes.")

# Update data.js
with open(data_js_path, 'r', encoding='utf-8') as f:
    data_js = f.read()

# 1. Update STORY_CHOICES_DATA
story_json = json.dumps(STORY_CHOICES_EXPANDED, ensure_ascii=False, indent=2)
data_js = re.sub(r'const STORY_CHOICES_DATA = \[.*?\];\n\nconst RECORD_CRITERIA_DATA', f"const STORY_CHOICES_DATA = {story_json};\n\nconst RECORD_CRITERIA_DATA", data_js, flags=re.DOTALL)

# 2. Add REGULAR_MONSTERS_DATA right after BOSS_MONSTERS_DATA
monsters_json = json.dumps(monsters_288, ensure_ascii=False, indent=2)
boss_pattern = re.search(r'const BOSS_MONSTERS_DATA = \[.*?\];', data_js, re.DOTALL)
if not boss_pattern:
    raise Exception("Could not find BOSS_MONSTERS_DATA in data.js")

insertion = f"\n\nconst REGULAR_MONSTERS_DATA = {monsters_json};"
# Check if REGULAR_MONSTERS_DATA is already there
if 'const REGULAR_MONSTERS_DATA' not in data_js:
    data_js = data_js[:boss_pattern.end()] + insertion + data_js[boss_pattern.end():]
else:
    data_js = re.sub(r'const REGULAR_MONSTERS_DATA = \[.*?\];', f"const REGULAR_MONSTERS_DATA = {monsters_json};", data_js, flags=re.DOTALL)

# 3. Update module.exports at bottom if needed
if 'REGULAR_MONSTERS_DATA' not in data_js[data_js.find('if (typeof module !== \'undefined\''):]:
    data_js = data_js.replace('BOSS_MONSTERS_DATA, STORY_CHOICES_DATA', 'BOSS_MONSTERS_DATA, REGULAR_MONSTERS_DATA, STORY_CHOICES_DATA')

with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write(data_js)

print("data.js successfully updated with REGULAR_MONSTERS_DATA (288) and expanded STORY_CHOICES_DATA (28)!")
