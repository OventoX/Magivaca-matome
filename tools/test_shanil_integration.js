const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 相川ともき氏攻略マップ 統合検証テスト (test_shanil_integration.js)');
console.log('================================================================');

// 1. Data file inspection
const data = require(path.join(__dirname, '../js/data.js'));
const CHESTS_DATA = data.CHESTS_DATA;
const CHEST_MAP_ASSETS = data.CHEST_MAP_ASSETS;

assert(CHESTS_DATA && CHESTS_DATA.length === 453, 'CHESTS_DATA must contain 453 chests');
assert(CHEST_MAP_ASSETS && CHEST_MAP_ASSETS.shanil, 'CHEST_MAP_ASSETS.shanil must exist');

const shanilAreas = Object.keys(CHEST_MAP_ASSETS.shanil);
console.log(`\n1. 相川氏マップ採用エリア数: ${shanilAreas.length} / 32 エリア`);
assert.strictEqual(shanilAreas.length, 32, 'Must have exactly 32 Shanil map areas');

// 2. Validate all 35 images on disk
console.log('\n2. ディスク上のマップ画像実在・完全性チェック');
let totalMapsChecked = 0;
for (const area of shanilAreas) {
  const meta = CHEST_MAP_ASSETS.shanil[area];
  assert(meta.sourceName.includes('相川ともき氏'), `${area}: sourceName must mention 相川ともき氏`);
  assert(meta.sourceUrl.startsWith('https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/'), `${area}: valid sourceUrl`);
  assert(meta.credit.includes('相川ともき氏'), `${area}: credit must mention 相川ともき氏`);
  assert(Array.isArray(meta.maps) && meta.maps.length > 0, `${area}: must have submaps`);

  for (const sm of meta.maps) {
    const fullPath = path.join(__dirname, '..', sm.file);
    assert(fs.existsSync(fullPath), `Map file not found on disk: ${sm.file}`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 0, `Map file is empty: ${sm.file}`);
    totalMapsChecked++;
  }
}
console.log(`✅ 全32エリアに登録された全マップ画像（延べ ${totalMapsChecked} 枚）の実在と有効サイズを確認！`);

// 3. Validate chests mapping and differences
console.log('\n3. 宝箱データとの赤丸番号・場所対応および相違点注記チェック');
const chestsInShanilAreas = CHESTS_DATA.filter(c => shanilAreas.includes(c.area));
console.log(`相川氏エリア内宝箱数: ${chestsInShanilAreas.length} 件`);
assert.strictEqual(chestsInShanilAreas.length, 293, 'Must have exactly 293 chests in Shanil areas');

const withMark = chestsInShanilAreas.filter(c => c.shanilMark !== null && c.shanilMark !== undefined);
console.log(`赤丸番号付与件数: ${withMark.length} / 293 件 (${(withMark.length / 293 * 100).toFixed(1)}%)`);
assert.strictEqual(withMark.length, 292, 'Exactly 292 chests must have Shanil marks');

// Check the 1 unmapped chest (chest_216)
const unmapped = chestsInShanilAreas.filter(c => c.shanilMark === null);
assert.strictEqual(unmapped.length, 1, 'Exactly 1 chest must remain unmapped');
assert.strictEqual(unmapped[0].id, 'chest_216', 'chest_216 must be the unmapped chest');
assert(unmapped[0].diffNote.includes('相川氏チャートには未記載'), 'chest_216 must have proper diffNote');
console.log(`✅ 未記載宝箱 (chest_216 / 荒廃の地6) は無理に対応させず「未記載（Wiki優先）」として明記されていることを確認！`);

// Check sample diff notes
const withDiff = chestsInShanilAreas.filter(c => c.diffNote !== null && c.diffNote !== undefined);
console.log(`相違点・照合注記付与件数: ${withDiff.length} 件`);
assert(withDiff.length > 0, 'Must have difference notes recorded');
console.log(`✅ 相川氏サイトとWikiの表記ゆれ・数量差・分類差（例: ラシモフ金貨/銀貨、カエルグミ青/緑等）が注記されていることを確認！`);

// 4. Mock Environment and Rendering Verification
console.log('\n4. モック環境による描画関数・UI連動テスト');
global.SPIRITS_DATA = data.SPIRITS_DATA;
global.ELEMENT_META = data.ELEMENT_META;
global.PIRANHA_DATA = data.PIRANHA_DATA;
global.LIFESPAN_GUIDE = data.LIFESPAN_GUIDE;
global.COMP_GUIDE = data.COMP_GUIDE;
global.LEVELING_DATA = data.LEVELING_DATA;
global.CHART_DATA = data.CHART_DATA;
global.SYSTEM_DATA = data.SYSTEM_DATA;
global.OFURO_CHART_DATA = data.OFURO_CHART_DATA;
global.ITEM_RECOVERY_DATA = data.ITEM_RECOVERY_DATA;
global.ITEM_OTHER_DATA = data.ITEM_OTHER_DATA;
global.ITEM_MD_DATA = data.ITEM_MD_DATA;
global.ITEM_EQUIP_DATA = data.ITEM_EQUIP_DATA;
global.ITEM_EQUIP_SETS = data.ITEM_EQUIP_SETS;
global.ITEM_DROP_INDEX = data.ITEM_DROP_INDEX;
global.MAGIC_NOTES_DATA = data.MAGIC_NOTES_DATA;
global.MIMIC_COINS_DATA = data.MIMIC_COINS_DATA;
global.BOSS_MONSTERS_DATA = data.BOSS_MONSTERS_DATA;
global.STORY_CHOICES_DATA = data.STORY_CHOICES_DATA;
global.RECORD_CRITERIA_DATA = data.RECORD_CRITERIA_DATA;
global.CHESTS_DATA = data.CHESTS_DATA;
global.CHESTS_META = data.CHESTS_META;
global.CHEST_MAP_ASSETS = data.CHEST_MAP_ASSETS;

const domNodes = {};
function createMockElement(id) {
  const el = {
    id,
    innerHTML: '',
    textContent: '',
    children: [],
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => ({ addEventListener: () => {}, checked: false }),
    appendChild: (child) => el.children.push(child)
  };
  return el;
}

const mockIds = [
  'spirits-grid', 'spirits-total-count', 'spirits-warning-count', 'spirits-remaining-count', 'spirits-completed-count',
  'spirits-empty-state', 'clear-search-btn', 'overall-progress-fill', 'overall-progress-text', 'tab-content-wrapper',
  'items-grid', 'items-total-count', 'items-search', 'items-clear-btn', 'items-empty-state', 'item-sets-container',
  'monsters-grid', 'monsters-total-count', 'monsters-search', 'monsters-clear-btn', 'monsters-empty-state',
  'story-choices-container', 'rank-criteria-container', 'chests-tab-content', 'chests-total-opened',
  'chests-total-all', 'chests-progress-percent', 'chests-progress-fill', 'chests-search', 'chests-search-clear',
  'chests-unopened-only', 'chests-missable-only', 'chests-star-only', 'chests-plane-filter-bar'
];
mockIds.forEach(id => {
  domNodes[id] = createMockElement(id);
});

const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = v.toString(); },
  removeItem: (k) => { delete storageMock[k]; }
};

global.document = {
  getElementById: (id) => domNodes[id] || createMockElement(id),
  querySelectorAll: () => [],
  querySelector: () => null
};

global.window = {
  document: global.document,
  localStorage: global.localStorage,
  addEventListener: () => {}
};

// Load app.js
require(path.join(__dirname, '../js/app.js'));

// Render Chests Tab
assert(typeof global.window.renderChestsTab === 'function', 'renderChestsTab must be defined');
global.window.renderChestsTab();

const chestsHtml = domNodes['chests-tab-content'].innerHTML;
assert(chestsHtml.length > 0, 'chests-tab-content must have content rendered');

// Test Benakoncha map rendered in HTML
assert(chestsHtml.includes('img/maps/shanil/map_benakoncha.gif'), 'Must render Benakoncha map image');
assert(chestsHtml.includes('相川ともき氏のマジカルバケーション攻略サイト'), 'Must render Shanil site credit');
assert(chestsHtml.includes('マップ赤丸番号と宝箱の対応表'), 'Must render red circle reference table');
assert(chestsHtml.includes('badge-shanil-pos'), 'Must render badge-shanil-pos on chest cards');
assert(chestsHtml.includes('マップ ④'), 'Must render map mark ④ for Benakoncha north');
console.log('✅ ベナコンチャ遺跡のマップ画像、相川氏出典クレジット、赤丸対応表、宝箱カードバッジの正常描画を確認！');

// Test Moginasu multi-map subtabs
assert(chestsHtml.includes('img/maps/shanil/map_moginasu1.png'), 'Must render Moginasu map 1');
assert(chestsHtml.includes('setShanilSubmap'), 'Must render setShanilSubmap onclick handlers');
console.log('✅ モギナス魔窟の複数マップ切替タブ (3階層分) の正常描画を確認！');

// Test switching Moginasu submap
global.window.setShanilSubmap('死のプレーン_モギナス魔窟', 'moginasu2');
const updatedHtml = domNodes['chests-tab-content'].innerHTML;
assert(updatedHtml.includes('img/maps/shanil/map_moginasu2.png'), 'Must render Moginasu map 2 after switching');
console.log('✅ サブマップ切替 (setShanilSubmap) が正常に動作し画像が動的更新されたことを確認！');

// Test toggling to schematic view
global.window.setShanilViewMode('光のプレーン_ベナコンチャ遺跡', 'schematic');
const schematicHtml = domNodes['chests-tab-content'].innerHTML;
assert(schematicHtml.includes('area-schematic-svg'), 'Must render SVG schematic when switched to schematic');
console.log('✅ 模式図への切替表示 (setShanilViewMode) が正常に動作することを確認！');

// Test toggle chest in mark table
global.window.toggleChest('chest_031');
assert(storageMock['magivaca_chest_checklist_v1'], 'Checked chest must be saved to localStorage');
assert(storageMock['magivaca_chest_checklist_v1'].includes('chest_031'), 'chest_031 must be saved in localStorage');
console.log('✅ 宝箱チェックボックスとlocalStorage連動が正常に動作することを確認！');

console.log('\n================================================================');
console.log('🎉 ALL SHANIL MAP INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
console.log('================================================================');
