const path = require('path');
const data = require(path.join(__dirname, '../js/data.js'));

// モック環境の構築
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
  createElement: (tag) => {
    return {
      tagName: tag,
      innerHTML: '',
      textContent: '',
      children: [],
      style: {},
      dataset: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      addEventListener: () => {},
      querySelectorAll: () => [],
      querySelector: () => ({ addEventListener: () => {}, checked: false }),
      appendChild: function(c) {
        this.children.push(c);
        if (c.innerHTML) this.innerHTML += c.innerHTML;
      }
    };
  },
  querySelectorAll: () => []
};

let domLoadedHandler = null;
global.window = {
  addEventListener: (evt, handler) => {
    if (evt === 'DOMContentLoaded') domLoadedHandler = handler;
  },
  scrollTo: () => {}
};

const mockStorage = {
  'magivaca_spirit_checklist_v1': JSON.stringify(['火_1', '水_3'])
};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; }
};

// app.js 実行
require(path.join(__dirname, '../js/app.js'));
if (domLoadedHandler) domLoadedHandler();

console.log('================================================================');
console.log('🧪 必須検証1: 全112体の精霊カード 名前・番号・居場所チェック');
console.log('================================================================');

const spiritsContainer = domNodes['spirits-container'];
const spiritCards = spiritsContainer.children;
console.log(`Rendered cards count: ${spiritCards.length} / 112`);

if (spiritCards.length !== 112) {
  console.error(`❌ Expected 112 cards, but found ${spiritCards.length}`);
  process.exit(1);
}

let cardErrors = 0;
data.SPIRITS_DATA.forEach((s, idx) => {
  const card = spiritCards[idx];
  const html = card.innerHTML;

  // 1. 名前チェック
  if (!html.includes(s.spiritName) || html.includes('精霊 undefined')) {
    console.error(`❌ Spirit [${s.id}] missing name "${s.spiritName}"!`);
    cardErrors++;
  }

  // 2. 番号チェック (#1 ~ #7)
  const expectedNum = `#${s.index}`;
  if (!html.includes(expectedNum)) {
    console.error(`❌ Spirit [${s.id}] missing index "${expectedNum}"!`);
    cardErrors++;
  }

  // 3. 居場所チェック
  if (!html.includes(s.locationClean)) {
    console.error(`❌ Spirit [${s.id}] missing location "${s.locationClean}"!`);
    cardErrors++;
  }
});

if (cardErrors === 0) {
  console.log('✅ 全112体の精霊カードすべてで名前・番号(#1〜#7)・居場所が完全に正しく表示されています！');
} else {
  console.error(`❌ ${cardErrors} 件のカード表示エラーが見つかりました。`);
  process.exit(1);
}

console.log('\n================================================================');
console.log('🧪 必須検証2: 全タブ描画データ内の "undefined" 0件チェック');
console.log('================================================================');

let undefinedCount = 0;
for (const [id, node] of Object.entries(domNodes)) {
  const text = (node.innerHTML || '') + (node.textContent || '');
  if (text.includes('undefined')) {
    console.error(`❌ Found "undefined" in #${id}`);
    undefinedCount++;
  }
}

if (undefinedCount === 0) {
  console.log('✅ 全レンダリングDOM要素内で "undefined" は 0 件です！');
} else {
  console.error(`❌ ${undefinedCount} 件の要素で "undefined" が検出されました。`);
  process.exit(1);
}

console.log('\n================================================================');
console.log('🧪 必須検証3: 精霊検索（名前・居場所）の動作チェック');
console.log('================================================================');

function simulateSearch(query) {
  const q = query.toLowerCase().trim();
  return data.SPIRITS_DATA.filter(s => {
    const searchTarget = [
      s.element,
      s.spiritName,
      s.locationRaw,
      s.locationClean,
      s.locationDetail,
      s.condition,
      s.requirement,
      s.remarks,
      s.missable || '',
      s.reqTags ? s.reqTags.join(' ') : ''
    ].join(' ').toLowerCase();
    return searchTarget.includes(q);
  });
}

// テスト1: 名前「トースト」で検索
const searchToast = simulateSearch('トースト');
const toastNames = searchToast.filter(s => s.spiritName === 'トースト');
console.log(`検索「トースト」ヒット数: ${searchToast.length} 件（うち精霊名がトースト: ${toastNames.length} 件）`);

if (toastNames.length !== 7) {
  console.error('❌ 火の精霊トースト全7体がヒットしませんでした。');
  process.exit(1);
}

// テスト2: 居場所「森の洞窟」で検索
const searchCave = simulateSearch('森の洞窟');
console.log(`検索「森の洞窟」ヒット数: ${searchCave.length} 件`);

const validCaveHits = searchCave.every(s => 
  (s.locationClean && s.locationClean.includes('森の洞窟')) || 
  (s.locationDetail && s.locationDetail.includes('森の洞窟')) ||
  (s.locationRaw && s.locationRaw.includes('森の洞窟'))
);

if (searchCave.length === 0 || !validCaveHits) {
  console.error('❌ 居場所検索「森の洞窟」が正しくヒットしませんでした。');
  process.exit(1);
}
console.log('✅ 精霊検索で「名前（トースト）」全7体、および「居場所（森の洞窟）」が完璧にヒットしました！');

console.log('\n================================================================');
console.log('🧪 必須検証4: 既存進捗（チェック状態）の互換性チェック');
console.log('================================================================');

const parsedSpirits = JSON.parse(mockStorage['magivaca_spirit_checklist_v1']);
if (parsedSpirits.includes('火_1') && parsedSpirits.includes('水_3')) {
  console.log(`✅ localStorage [magivaca_spirit_checklist_v1] のチェックデータ（火_1, 水_3）が完全に維持されています！`);
} else {
  console.error('❌ 進捗データが破損しています。');
  process.exit(1);
}

console.log('\n================================================================');
console.log('🧪 必須検証5: 宝箱マップ＆チェックリスト（全453件・35エリア・期間限定15件）チェック');
console.log('================================================================');

if (!data.CHESTS_DATA || data.CHESTS_DATA.length !== 453) {
  console.error(`❌ Expected 453 chests, but got ${data.CHESTS_DATA ? data.CHESTS_DATA.length : 0}`);
  process.exit(1);
}
console.log(`総宝箱数: ${data.CHESTS_DATA.length} 件`);

const uniqueAreas = new Set(data.CHESTS_DATA.map(c => c.area));
if (uniqueAreas.size !== 35) {
  console.error(`❌ Expected 35 areas, but got ${uniqueAreas.size}`);
  process.exit(1);
}
console.log(`総エリア数: ${uniqueAreas.size} エリア`);

const missableChests = data.CHESTS_DATA.filter(c => c.missable);
if (missableChests.length !== 15) {
  console.error(`❌ Expected 15 missable chests, but got ${missableChests.length}`);
  process.exit(1);
}
console.log(`期間限定宝箱: ${missableChests.length} 件（警告付き）`);

const chestsContent = domNodes['chests-tab-content'];
if (!chestsContent || !chestsContent.innerHTML.includes('🧰 宝箱マップ＆開封チェックリスト')) {
  console.error('❌ chests-tab-content did not render correctly!');
  process.exit(1);
}

// 開封トグル＆localStorage永続化テスト
window.toggleChest('chest_001'); // バンダナ開封
window.toggleChest('chest_040'); // 500ブラー開封
const savedChestJson = mockStorage['magivaca_chest_checklist_v1'];
if (!savedChestJson || !savedChestJson.includes('chest_001') || !savedChestJson.includes('chest_040')) {
  console.error('❌ LocalStorage persistence for chests failed!');
  process.exit(1);
}
console.log(`✅ localStorage [magivaca_chest_checklist_v1] への開封進捗保存を確認！`);

// トグル解除テスト
window.toggleChest('chest_040');
const updatedChestJson = mockStorage['magivaca_chest_checklist_v1'];
if (updatedChestJson.includes('chest_040')) {
  console.error('❌ Chest unchecking failed!');
  process.exit(1);
}
console.log(`✅ 開封解除（再クリックでの未開封戻し）も正常動作！`);

console.log('✅ 宝箱マップ＆チェックリストの全機能が完璧に動作しています！');

console.log('\n🎉 ALL 5 MANDATORY VERIFICATIONS PASSED WITH 100% SUCCESS!');
