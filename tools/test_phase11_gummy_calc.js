const path = require('path');
const assert = require('assert');

const baseDir = path.join(__dirname, '..');
const data = require(path.join(baseDir, 'js/data.js'));

// Set up mock globals for app.js
Object.assign(global, data);

const domNodes = {};
function createMockElement(id) {
  const el = {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
    children: [],
    style: {},
    dataset: {},
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => false,
      contains: () => false
    },
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => ({ addEventListener: () => {}, checked: false, scrollIntoView: () => {}, classList: { add: () => {}, remove: () => {} } }),
    appendChild: function(child) {
      this.children.push(child);
      if (child.innerHTML) this.innerHTML += child.innerHTML;
    }
  };
  domNodes[id] = el;
  return el;
}

global.document = {
  getElementById: (id) => {
    if (!domNodes[id]) createMockElement(id);
    return domNodes[id];
  },
  createElement: (tag) => createMockElement(tag),
  querySelectorAll: () => [],
  querySelector: () => null
};

let domLoadedHandler = null;
global.window = {
  addEventListener: (evt, handler) => {
    if (evt === 'DOMContentLoaded') domLoadedHandler = handler;
  },
  scrollTo: () => {}
};

const existingKeysSnapshot = {
  'magivaca_spirit_checklist_v1': JSON.stringify(['火_1']),
  'magivaca_magic_notes_v1': JSON.stringify([1]),
  'magivaca_mimic_coins_v1': JSON.stringify(['coin_1']),
  'magivaca_records_v1': JSON.stringify(['rec_1']),
  'magivaca_chest_checklist_v1': JSON.stringify(['chest_001']),
  'magivaca_timeline_checklist_v1': JSON.stringify(['tl_spirit_火_3'])
};

const mockStorage = Object.assign({}, existingKeysSnapshot);
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; }
};

require(path.join(baseDir, 'js/app.js'));
if (domLoadedHandler) domLoadedHandler();

console.log('================================================================');
console.log('🧪 第11弾検証1: GARAM_TSUBO_DATA 全50階・出典URL・未確認範囲の明示検証');
console.log('================================================================');

assert(data.GARAM_TSUBO_DATA, 'GARAM_TSUBO_DATA must exist');
assert.strictEqual(data.GARAM_TSUBO_DATA.floors.length, 50, 'GARAM_TSUBO_DATA must have 50 floors');
assert.strictEqual(data.GARAM_TSUBO_DATA.totalPotsAllChests, 173, 'Total pots across 1F-50F must be 173');

data.GARAM_TSUBO_DATA.floors.forEach((f, idx) => {
  assert.strictEqual(f.floor, idx + 1, `Floor index mismatch at ${idx}`);
  assert(f.sourceUrl && f.sourceUrl.startsWith('https://wikiwiki.jp/magivaca/'), `Missing sourceUrl at floor ${f.floor}`);
  assert(f.overviewUrl && f.overviewUrl.startsWith('https://wikiwiki.jp/magivaca/'), `Missing overviewUrl at floor ${f.floor}`);
  assert(f.shortestPathPotCount && f.shortestPathPotCount.includes('未確認'), `Missing 未確認 marker on shortestPathPotCount at floor ${f.floor}`);
});
console.log('✅ 全50階のデータ構造・各行の出典URL・未確認範囲（最短通過のみのツボ数）の明示を確認！');

console.log('\n================================================================');
console.log('🧪 第11弾検証2: 要求数テーブルの合計と計算機の累計表示の機械照合');
console.log('================================================================');

const testCases = [
  { currentFloor: 1, targetFloor: 50, heldGummies: 50, calcMode: 'min', difficulty: 'ナミ', feedColor: 'green', startRequirement: 1, useMimicReduction: true },
  { currentFloor: 1, targetFloor: 10, heldGummies: 20, calcMode: 'min', difficulty: 'ナミ', feedColor: 'green', startRequirement: 1, useMimicReduction: true },
  { currentFloor: 15, targetFloor: 35, heldGummies: 100, calcMode: 'min', difficulty: 'ナミ', feedColor: 'green', startRequirement: 1, useMimicReduction: true },
  { currentFloor: 1, targetFloor: 50, heldGummies: 300, calcMode: 'sim', difficulty: 'オニ', feedColor: 'green', startRequirement: 1, useMimicReduction: true },
  { currentFloor: 5, targetFloor: 25, heldGummies: 80, calcMode: 'sim', difficulty: 'ナミ', feedColor: 'blue', startRequirement: 5, useMimicReduction: false },
  { currentFloor: 10, targetFloor: 49, heldGummies: 120, calcMode: 'sim', difficulty: 'ヌル', feedColor: 'red', startRequirement: 10, useMimicReduction: true }
];

testCases.forEach((tc, idx) => {
  const res = global.window.calculateGaramGummyRequirement(tc);
  const tableSum = res.rows.filter(r => r.inRange).reduce((acc, r) => acc + r.floorRequired, 0);
  const expectedShortfall = Math.max(0, res.totalRequired - tc.heldGummies);
  console.log(`  Case ${idx + 1} [${tc.calcMode}/${tc.difficulty}/${tc.feedColor} ${tc.currentFloor}F→${tc.targetFloor}F 手持ち${tc.heldGummies}]: テーブル合計=${tableSum}個 / 計算機累計=${res.totalRequired}個 / 不足数=${res.shortfall}個`);
  assert.strictEqual(tableSum, res.totalRequired, `Table sum (${tableSum}) !== Calculator cumulative (${res.totalRequired}) in case ${idx + 1}`);
  assert.strictEqual(res.shortfall, expectedShortfall, `Shortfall mismatch in case ${idx + 1}`);
});

// DOM HTML 描画上の一致照合 (10F -> 30F, 手持ち 30個)
global.window.updateGummyCalcParam('currentFloor', 10);
global.window.updateGummyCalcParam('targetFloor', 30);
global.window.updateGummyCalcParam('heldGummies', 30);
global.window.updateGummyCalcParam('calcMode', 'min');

const chestsHtml = domNodes['chests-tab-content'].innerHTML;
assert(!chestsHtml.includes('undefined'), 'Rendered chests HTML with calculator must not contain "undefined"');
assert(chestsHtml.includes('id="garam-gummy-calc-panel"'), 'Garam gummy calculator panel must be rendered in chests tab');
assert(chestsHtml.includes('ITEM_DROP_INDEX'), 'Calculator must include ITEM_DROP_INDEX drop reference section');

const rowMatches = [...chestsHtml.matchAll(/data-in-range="1"\s+data-floor-req="(\d+)"/g)];
const domTableSum = rowMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
const calcTotalMatch = chestsHtml.match(/id="gummy-calc-total-req"[^>]*>(\d+)\s*個</);
const tableFootMatch = chestsHtml.match(/id="gummy-table-sum-cell"[^>]*>(\d+)\s*個</);

assert(calcTotalMatch && tableFootMatch, 'Calculator total and table footer sum elements must exist in rendered HTML');
assert.strictEqual(domTableSum, parseInt(calcTotalMatch[1], 10), 'DOM table rows sum must match #gummy-calc-total-req');
assert.strictEqual(domTableSum, parseInt(tableFootMatch[1], 10), 'DOM table rows sum must match #gummy-table-sum-cell');
console.log(`✅ DOM描画HTML上でもテーブル対象行合計（${domTableSum}個）と計算機累計表示（${calcTotalMatch[1]}個）の完全一致を確認！`);

console.log('\n================================================================');
console.log('🧪 第11弾検証3: localStorage 独立保存 ＆ 既存キー不変確認');
console.log('================================================================');

assert(mockStorage['magivaca_gummy_calc_v1'], 'magivaca_gummy_calc_v1 should be saved');
for (const [k, expectedVal] of Object.entries(existingKeysSnapshot)) {
  assert.strictEqual(mockStorage[k], expectedVal, `Existing localStorage key ${k} was unexpectedly modified!`);
}
console.log('✅ 新規キー magivaca_gummy_calc_v1 への保存と、既存全キーの完全不変を確認！');
console.log('\n🎉 PHASE 11 GUMMY CALCULATOR VERIFICATION PASSED 100%!');
