# -*- coding: utf-8 -*-
import os
import re
import json
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(BASE_DIR, 'wiki_cache')
DATA_JS_PATH = os.path.join(BASE_DIR, 'js', 'data.js')

def parse_garam_tsubo_data():
    with open(os.path.join(CACHE_DIR, 'chart_garam.html'), 'r', encoding='utf-8') as f:
        main_soup = BeautifulSoup(f.read(), 'html.parser')

    group_anchors = [
        (range(1, 6), 'h3_content_1_12', '5.06%', '13.89%', '5Fボス: 緑19.53% / 青23.44%'),
        (range(6, 11), 'h3_content_1_13', '15.05%', '2.41%', '10Fボス: 緑97.66% / 青0%'),
        (range(11, 16), 'h3_content_1_14', '1.30%', '4.38%', '15Fボス: 緑19.53% / 青0%'),
        (range(16, 21), 'h3_content_1_15', '8.35%', '4.53%', '20Fボス: 緑19.53% / 青0%'),
        (range(21, 26), 'h3_content_1_16', '9.40%', '2.63%', '25Fボス: 緑19.53% / 青0%'),
        (range(26, 31), 'h3_content_1_17', '11.50%', '7.27%', '30Fボス: 緑19.53% / 青0%'),
        (range(31, 36), 'h3_content_1_18', '5.94%', '0%', '35Fボス: 緑19.53% / 青0%'),
        (range(36, 41), 'h3_content_1_19', '0%', '3.90%', '40Fボス: 緑19.53% / 青0%'),
        (range(41, 46), 'h3_content_1_20', '0%', '0%', '45Fボス: 緑39.06% / 青0%'),
        (range(46, 50), 'h3_content_1_21', '2.23%', '8.57%', '-'),
        (range(50, 51), 'h3_content_1_22', '69.34%', '0%', '50Fボス#1: 緑58.59% / 50Fボス#2: 緑78.13%')
    ]

    floor_overview = {}
    for rng, hid, dg, db, boss_drop in group_anchors:
        h3 = main_soup.find('h3', id=hid)
        tbl = None
        for sib in h3.find_next_siblings():
            if sib.name in ['h2', 'h3']:
                break
            for t in sib.find_all('table'):
                if 'マップにいるカエルグミ' in t.get_text():
                    tbl = t
                    break
            if tbl:
                break
        rows = tbl.find_all('tr')
        equip_cells, k_cells, map_gummy_cells = [], [], []
        for r in rows:
            cells = [c.get_text(' ', strip=True) for c in r.find_all(['th', 'td'])]
            if not cells:
                continue
            if '装備/消費アイテム' in cells[0]:
                equip_cells = cells[1:]
            elif 'カエルグミ3個' in cells[0]:
                k_cells = cells[1:]
            elif 'マップにいるカエルグミ' in cells[0]:
                map_gummy_cells = cells[1:]
        for idx, fnum in enumerate(rng):
            eq = equip_cells[idx] if idx < len(equip_cells) else '-'
            kc = k_cells[idx] if idx < len(k_cells) else '-'
            mg = map_gummy_cells[idx] if idx < len(map_gummy_cells) else '-'
            if fnum == 49 and mg == '擬態(緑)':
                mg = '擬態(緑) / カエルグミ赤'
            chests = []
            if 'カエルグミ' in eq:
                chests.append(eq)
            if 'カエルグミ' in kc:
                chests.append(kc)
            floor_overview[fnum] = {
                'overviewUrl': f'https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#{hid}',
                'gummyChests': ' / '.join(chests) if chests else 'なし',
                'fieldGummyOrMimic': mg,
                'dropRateGreen': dg,
                'dropRateBlue': db,
                'bossDropNote': boss_drop
            }

    seen_tsubos = set()
    floors = []
    cum_pots = 0

    for page_idx in range(1, 6):
        path = os.path.join(CACHE_DIR, f'check_ガラムマサラ_{page_idx}.html')
        with open(path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        body = soup.select_one('#body') or soup
        for h3 in body.find_all('h3'):
            title = h3.get_text(strip=True)
            if not title.startswith('ガラムマサラ'):
                continue
            fnum_str = title.replace('ガラムマサラ', '').translate(str.maketrans('０１２３４５６７８９', '0123456789'))
            fnum = int(fnum_str)
            hid = h3.get('id', '')
            new_tsubos = []
            mimic_color = 'なし'
            mimic_count = 0
            wild_color = 'なし'
            wild_count = 0
            stopped_initial_pass = False

            for sib in h3.find_next_siblings():
                if sib.name in ['h2', 'h3']:
                    break
                for tr in sib.find_all('tr'):
                    cells = [c.get_text(' ', strip=True) for c in tr.find_all(['th', 'td'])]
                    if not cells:
                        continue
                    row_txt = ' | '.join(cells)
                    for m in re.findall(r'ツボ#(\d+)', row_txt):
                        tid = int(m)
                        if tid not in seen_tsubos:
                            seen_tsubos.add(tid)
                            new_tsubos.append(tid)
                    if not stopped_initial_pass:
                        if 'へ戻る' in row_txt or 'へ進む' in row_txt:
                            stopped_initial_pass = True
                        else:
                            if cells[0] == '擬態' and len(cells) >= 3 and cells[2].isdigit():
                                mimic_color = cells[1]
                                mimic_count += int(cells[2])
                            elif cells[0] == 'カエルグミ' and len(cells) >= 3 and cells[2].isdigit():
                                wild_color = cells[1]
                                wild_count += int(cells[2])

            # 24F has カエルグミ青 x12 before 23へ戻る and x2 after 24へ進む (total 14)
            if fnum == 24 and wild_count == 12:
                wild_count = 14
            # 5F has 2 additional green mimics behind ツボ#13/#14 (total 16 non-bugged green mimics on 5F)
            if fnum == 5 and mimic_count == 12:
                mimic_count = 16

            pot_count = len(new_tsubos)
            cum_pots += pot_count
            if pot_count > 1:
                pot_range = f'ツボ#{min(new_tsubos)}〜#{max(new_tsubos)}'
            elif pot_count == 1:
                pot_range = f'ツボ#{new_tsubos[0]}'
            else:
                pot_range = 'なし（0個）'

            ov = floor_overview.get(fnum, {})
            floors.append({
                'floor': fnum,
                'potCount': pot_count,
                'potRange': pot_range,
                'cumulativePots': cum_pots,
                'minReqGummies': pot_count,
                'shortestPathPotCount': '未確認（全宝箱回収時のツボ数のみWiki記載）',
                'mimicColor': mimic_color,
                'mimicCount': mimic_count,
                'wildGummyColor': wild_color,
                'wildGummyCount': wild_count,
                'fieldGummyOrMimic': ov.get('fieldGummyOrMimic', '-'),
                'gummyChests': ov.get('gummyChests', 'なし'),
                'dropRateGreen': ov.get('dropRateGreen', '0%'),
                'dropRateBlue': ov.get('dropRateBlue', '0%'),
                'bossDropNote': ov.get('bossDropNote', '-'),
                'sourceUrl': f'https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9/{page_idx}#{hid}',
                'overviewUrl': ov.get('overviewUrl', 'https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9')
            })

    return {
        'title': 'キヤシカゥアのツボ・カエルグミ必要数＆周回データ（ガラムマサラ全50階）',
        'rulesSourceUrl': 'https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#h3_content_1_2',
        'mimicSourceUrl': 'https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9#h3_content_1_3',
        'chartIndexSourceUrl': 'https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9/0',
        'minRequirement': 1,
        'maxRequirement': 20,
        'initialRequirement': 1,
        'totalPotsAllChests': cum_pots,
        'feedDelta': {
            'ヌル': {'green': 1, 'blue': 1, 'red': 'reset_to_1', 'label': '緑:+1 / 青:+1 / 赤:=1(次回1にリセット)'},
            'ナミ': {'green': 2, 'blue': 1, 'red': -1, 'label': '緑:+2 / 青:+1 / 赤:-1'},
            'オニ': {'green': 2, 'blue': 1, 'red': 0, 'label': '緑:+2 / 青:+1 / 赤:±0（開始時に所持グミ全没収）'}
        },
        'mimicDefeatDelta': {
            'ヌル': {'green': -2, 'blue': -1, 'label': '擬態(緑):-2 / 擬態(青):-1（撃破で該当色グミ+1個入手）'},
            'ナミ': {'green': -2, 'blue': -1, 'label': '擬態(緑):-2 / 擬態(青):-1（撃破で該当色グミ+1個入手）'},
            'オニ': {'green': -1, 'blue': 0, 'label': '擬態(緑):-1 / 擬態(青):±0（撃破で該当色グミ+1個入手）'}
        },
        'unconfirmedRangeNote': 'Wiki『ガラムマサラ/1〜5』にて全50階（1F〜50F）の「全宝箱を開ける場合」の消去ツボ通し番号（ツボ#1〜#173、50Fはツボ0個）が確認済みです。一方、「宝箱を無視して最短ルートで通過する場合にスルー可能なツボの階層別内訳」はWikiテキスト表に明記がないため、推測で埋めず「未確認」と明示しています。',
        'redGummyDropNote': 'カエルグミ(赤)はモンスターからはドロップしません（ITEM_DROP_INDEXに該当なし）。主な入手手段はガラムマサラ内の宝箱、ガラムマサラ49Fのシンボル、またはリドナヒー8F（ワープパッド切替で無限復活）での捕獲となります。',
        'floors': floors
    }

if __name__ == '__main__':
    garam_data = parse_garam_tsubo_data()
    print(f"Total floors: {len(garam_data['floors'])}, total pots: {garam_data['totalPotsAllChests']}")

    with open(DATA_JS_PATH, 'r', encoding='utf-8') as f:
        js_code = f.read()

    garam_json_str = json.dumps(garam_data, ensure_ascii=False, indent=2)
    block = f"\n// ==========================================================================\n// Phase 11: キヤシカゥアのツボ・カエルグミ必要数＆周回データ (GARAM_TSUBO_DATA)\n// ==========================================================================\nconst GARAM_TSUBO_DATA = {garam_json_str};\n"

    if 'const GARAM_TSUBO_DATA =' in js_code:
        js_code = re.sub(
            r'\n// ==========================================================================\n// Phase 11: キヤシカゥアのツボ.*?\nconst GARAM_TSUBO_DATA = \{.*?\};\n',
            block,
            js_code,
            flags=re.DOTALL
        )
    else:
        # Insert right before if (typeof module !== 'undefined' && module.exports)
        export_idx = js_code.rfind("if (typeof module !== 'undefined' && module.exports)")
        assert export_idx != -1, 'Could not find module.exports block in js/data.js'
        js_code = js_code[:export_idx] + block + "\n" + js_code[export_idx:]

    if 'module.exports.GARAM_TSUBO_DATA' not in js_code:
        js_code = js_code.replace(
            'module.exports.CHEST_MAP_ASSETS = CHEST_MAP_ASSETS;',
            'module.exports.CHEST_MAP_ASSETS = CHEST_MAP_ASSETS;\n  module.exports.GARAM_TSUBO_DATA = GARAM_TSUBO_DATA;'
        )

    with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_code)
    print('Successfully updated js/data.js with GARAM_TSUBO_DATA.')
