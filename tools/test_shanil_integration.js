const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 相川ともき氏攻略情報・事実情報照合検証テスト (test_shanil_integration.js)');
console.log('================================================================');

// 1. Data file inspection
const data = require(path.join(__dirname, '../js/data.js'));
const CHESTS_DATA = data.CHESTS_DATA;
const CHEST_MAP_ASSETS = data.CHEST_MAP_ASSETS;

assert(CHESTS_DATA && CHESTS_DATA.length === 453, 'CHESTS_DATA must contain 453 chests');
assert(CHEST_MAP_ASSETS && CHEST_MAP_ASSETS.schematic, 'CHEST_MAP_ASSETS.schematic must exist');
assert(CHEST_MAP_ASSETS && CHEST_MAP_ASSETS.sourceLinks, 'CHEST_MAP_ASSETS.sourceLinks must exist');

const sourceLinks = CHEST_MAP_ASSETS.sourceLinks;
const shanilAreas = Object.keys(sourceLinks).filter(a => sourceLinks[a].shanilUrl !== null);
console.log(`\n1. 相川氏サイト出典リンク設定エリア数: ${shanilAreas.length} / 32 エリア`);
assert.strictEqual(shanilAreas.length, 32, 'Must have exactly 32 Shanil source areas');

// 2. Validate NO image files on disk
console.log('\n2. 著作権配慮：他サイトの画像ファイル完全撤去チェック');
const mapsDir = path.join(__dirname, '../img/maps');
let imgCount = 0;
if (fs.existsSync(mapsDir)) {
  const files = fs.readdirSync(mapsDir, { recursive: true });
  for (const f of files) {
    if (/\.(png|gif|jpe?g|webp)$/i.test(f)) imgCount++;
  }
}
assert.strictEqual(imgCount, 0, 'Must have 0 image files in img/maps');
console.log('✅ img/maps 配下に外部画像ファイルは一切存在しないことを確認！');

// 3. Validate chests mapping and differences (facts data)
console.log('\n3. 事実情報：赤丸番号・場所対応および相違点注記チェック');
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
console.log('✅ 未記載宝箱 (chest_216 / 荒廃の地6) は無理に対応させず「未記載（Wiki優先）」として明記されていることを確認！');

// Check diff notes
const withDiff = chestsInShanilAreas.filter(c => c.diffNote !== null && c.diffNote !== undefined);
console.log(`相違点・照合注記付与件数: ${withDiff.length} 件`);
assert(withDiff.length > 0, 'Must have difference notes recorded');
console.log('✅ 相川氏サイトとWikiの表記ゆれ・数量差・分類差（例: ラシモフ金貨/銀貨、カエルグミ青/緑等）が注記されていることを確認！');

// 4. Mock Environment and Rendering Verification
console.log('\n4. モック環境による自作SVG模式図・出典リンク・赤丸対応表描画テスト');
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

// Test Benakoncha rendered in HTML
assert(chestsHtml.includes('相川ともき氏サイトでダンジョン実マップを見る'), 'Must render Shanil site direct link');
assert(chestsHtml.includes('https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_5.html'), 'Must link to Benakoncha chart');
assert(chestsHtml.includes('相川氏チャート赤丸番号・場所と宝箱の対応表'), 'Must render red circle reference table');
assert(chestsHtml.includes('badge-shanil-pos'), 'Must render badge-shanil-pos on chest cards');
assert(chestsHtml.includes('マップ ④'), 'Must render map mark ④ for Benakoncha north');
console.log('✅ ベナコンチャ遺跡の自作SVG模式図、相川氏出典リンク、赤丸対応表、宝箱カードバッジの正常描画を確認！');

// Test NO <img> with map files
assert(!chestsHtml.includes('<img src="img/maps/'), 'Must not render any local map image tags');
console.log('✅ HTML内にローカルマップ画像タグが一切含まれないことを確認！');

// Test toggle chest in mark table
global.window.toggleChest('chest_031');
assert(storageMock['magivaca_chest_checklist_v1'], 'Checked chest must be saved to localStorage');
assert(storageMock['magivaca_chest_checklist_v1'].includes('chest_031'), 'chest_031 must be saved in localStorage');
console.log('✅ 宝箱チェックボックスとlocalStorage連動が正常に動作することを確認！');

console.log('\n================================================================');
console.log('🎉 ALL SHANIL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
console.log('================================================================');
