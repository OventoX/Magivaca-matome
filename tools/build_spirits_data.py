import json
import re

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\parsed_spirits.json', 'r', encoding='utf-8') as f:
    raw_elements = json.load(f)

spirits = []

base_url = "https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A"

for elem in raw_elements:
    elem_name = elem['element']
    spirit_name = elem['spirit_name']
    anchor = elem['anchor']
    headers = elem['headers']
    
    for idx, row in enumerate(elem['rows'], 1):
        spirit_id = f"{elem_name}_{idx}"
        
        # Location & Plane
        raw_loc = row[0]
        # parse plane
        # Usually format is '光：森の洞窟・東' or '闇：ずんどこ穴' or '死：ピラミッド10'
        # Exception: '光：ゲアラヴァ村闇：レヒカフ沼周辺4'
        planes = []
        if '光：' in raw_loc:
            planes.append('光')
        if '闇：' in raw_loc:
            planes.append('闇')
        if '死：' in raw_loc:
            planes.append('死')
        
        location = raw_loc
        loc_detail = row[1]
        
        condition = ""
        requirement = ""
        remarks = ""
        missable = None
        
        # Check by element header structure
        if elem_name == '美': # 5 cols: 居場所, 場所詳細, 要求1, 要求2, 条件・備考
            req1 = row[2] # e.g. ミミズグミ所持数80以下 / なし
            req2 = row[3] # e.g. ガニック金貨3 / なし
            condition = req1 if req1 != 'なし' else ''
            requirement = req2 if req2 != 'なし' else ('なし' if req1 == 'なし' else '')
            remarks = row[4]
            
        elif elem_name == '木': # 5 cols: 居場所, 場所詳細, 出現条件(まつぼっくり獲得数), 要求(まつぼっくり譲渡数), 備考
            cond = row[2]
            req = row[3]
            condition = f"まつぼっくり獲得数: {cond}" if cond and cond != 'なし' else ''
            requirement = f"まつぼっくり譲渡数: {req}" if req else ''
            remarks = row[4]
            
        elif elem_name == '闇': # 5 cols: 居場所, 場所詳細, 出現条件(カエルグミ捕獲数), 要求, 備考
            cond = row[2]
            condition = f"カエルグミ捕獲数: {cond}" if cond and cond != 'なし' else ''
            requirement = row[3]
            remarks = row[4]
            
        elif elem_name == '光': # 5 cols: 居場所, 場所詳細, 出現条件, 要求, 備考
            cond = row[2]
            req = row[3]
            condition = cond if cond and cond != 'なし' else ''
            requirement = req if req and req != 'なし' else 'なし'
            remarks = row[4]
            
        elif elem_name == '愛': # 5 cols: 居場所, 場所詳細, 出現条件, 要求(カエルグミ捕獲数), 備考
            cond = row[2]
            req = row[3]
            condition = cond if cond and cond != 'なし' else ''
            requirement = f"カエルグミ捕獲数: {req}" if req and req != 'なし' else 'なし'
            remarks = row[4]
            
        else: # 4 cols: 居場所, 場所詳細, 要求, 条件・備考
            requirement = row[2]
            remarks = row[3]
            # special cases in remarks for condition
            if elem_name == '石' and 'ミミズグミ捕獲数' in remarks:
                condition = remarks
            elif elem_name == '虫' and '虫メガネ' in remarks:
                condition = '虫メガネ'
        
        # Check missable warnings
        # 火: ずんどこ穴
        if elem_name == '火' and 'ずんどこ穴' in raw_loc:
            missable = "【取り返しのつかない要素】ドワーフを一人でも説得すると消滅し、二度と仲良くなれません。"
        elif elem_name == '愛':
            if idx == 1:
                missable = "【取り返しのつかない要素】スノウヘア撃破直後にトルーナ村へ向かわないと二度と仲良くなれません。"
            elif idx == 4:
                missable = "【注意】ボス「バダブーン」にとどめを刺さず、アニキ/アネゴと呼ばせる必要があります（倒すと再挑戦不可になるリスクあり）。"
            elif idx == 6:
                missable = "【取り返しのつかない要素】タンドーリでクラインを割ってしまうと仲間になりません。"
            elif idx in [3, 7]:
                missable = "【厳格な条件】カエルグミ捕獲数0個（7体目は未購入も必須）。カエルグミを1度でも拾うと仲間にできなくなります。"
            else:
                missable = f"【捕獲数制限】カエルグミ捕獲数制限（{requirement}）あり。捕獲数を増やしすぎると仲間にできません。"
        elif elem_name == '光':
            if idx == 7:
                missable = "【重要警告】シサバレイ10にいる闇の精霊（ニルヴァ7）を仲間にする前に光の魔法使いになってはいけません（シサバレイ侵入不可になるため）。またニルヴァ1体以下の制限あり。"
            else:
                missable = f"【闇精霊制限】ニルヴァを仲間にしすぎると出現/加入しなくなります（条件: {requirement}）。愛・光コンプ前に闇精霊を集めないこと。"
        elif elem_name == '風' and idx == 1:
            if '文鳥' in remarks:
                remarks_note = remarks
        
        spirits.append({
            "id": spirit_id,
            "element": elem_name,
            "spiritName": spirit_name,
            "index": idx,
            "planes": planes,
            "locationRaw": raw_loc,
            "locationDetail": loc_detail,
            "condition": condition,
            "requirement": requirement,
            "remarks": remarks,
            "missable": missable,
            "sourceUrl": f"{base_url}{anchor}"
        })

print(f"Total structured spirits: {len(spirits)}")
# Check a few samples
for s in spirits[::15]:
    print(s)

with open(r'C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\spirits_data.json', 'w', encoding='utf-8') as f:
    json.dump(spirits, f, ensure_ascii=False, indent=2)
print("Saved spirits_data.json")
