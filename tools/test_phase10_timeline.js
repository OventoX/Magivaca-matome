const fs = require('fs');
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

const initialFiveKeys = {
  'magivaca_spirit_checklist_v1': JSON.stringify(['火_3', '愛_1']),
  'magivaca_magic_notes_v1': JSON.stringify([1, 2]),
  'magivaca_mimic_coins_v1': JSON.stringify(['coin_1']),
  'magivaca_records_v1': JSON.stringify(['rec_1']),
  'magivaca_chest_checklist_v1': JSON.stringify(['chest_001'])
};

const mockStorage = Object.assign({}, initialFiveKeys);
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; }
};

require(path.join(baseDir, 'js/app.js'));
if (domLoadedHandler) domLoadedHandler();

console.log('================================================================');
console.log('🧪 第10弾検証1: 元データの missable 件数とタイムライン集約件数の機械照合');
console.log('================================================================');

const srcSpiritsMissable = data.SPIRITS_DATA.filter(s => Boolean(s.missable));
const srcChestsMissable = data.CHESTS_DATA.filter(c => Boolean(c.missable));
const srcStoryMissable = [];
data.STORY_CHOICES_DATA.forEach(p => {
  (p.events || []).forEach(ev => {
    if (ev.missable) srcStoryMissable.push(ev);
  });
});

const timelineItems = global.window.buildMissableTimelineItems();
const tlSpirits = timelineItems.filter(it => it.category === 'spirit');
const tlChests = timelineItems.filter(it => it.category === 'chest');
const tlEvents = timelineItems.filter(it => it.category === 'event');
const tlUndetermined = timelineItems.filter(it => it.groupKey === 'undetermined');

console.log(`・精霊 missable: 元データ=${srcSpiritsMissable.length}件 / タイムライン=${tlSpirits.length}件`);
console.log(`・宝箱 missable: 元データ=${srcChestsMissable.length}件 / タイムライン=${tlChests.length}件`);
console.log(`・選択肢・イベント missable: 元データ=${srcStoryMissable.length}件 / タイムライン=${tlEvents.length}件`);
console.log(`・合計: 元データ=${srcSpiritsMissable.length + srcChestsMissable.length + srcStoryMissable.length}件 / タイムライン=${timelineItems.length}件`);
console.log(`・うち「順序未確定」グループ: ${tlUndetermined.length}件`);
tlUndetermined.forEach(u => {
  console.log(`   - [${u.refId}] ${u.title} (${u.location}) -> 理由: ${u.undeterminedReason}`);
});

assert.strictEqual(tlSpirits.length, srcSpiritsMissable.length, 'Spirit missable count mismatch');
assert.strictEqual(tlChests.length, srcChestsMissable.length, 'Chest missable count mismatch');
assert.strictEqual(tlEvents.length, srcStoryMissable.length, 'Story event missable count mismatch');
assert.strictEqual(timelineItems.length, 39, 'Total missable items should be 39');
assert.strictEqual(tlUndetermined.length, 3, 'Undetermined order items should be 3');

console.log('\n================================================================');
console.log('🧪 第10弾検証2: 全項目の出典URL・必須フィールド・undefinedゼロ検証');
console.log('================================================================');

timelineItems.forEach((it, idx) => {
  assert(it.timelineId && !it.timelineId.includes('undefined'), `Invalid timelineId at ${idx}`);
  assert(it.title && !it.title.includes('undefined'), `Invalid title at ${idx}`);
  assert(it.location && !it.location.includes('undefined'), `Invalid location at ${idx}`);
  assert(it.warningText && !it.warningText.includes('undefined'), `Invalid warningText at ${idx}`);
  assert(it.sourceUrl && it.sourceUrl.startsWith('https://wikiwiki.jp/magivaca/'), `Missing or invalid sourceUrl at ${idx}: ${it.sourceUrl}`);
});

const timelineHtml = domNodes['timeline-tab-content'].innerHTML;
assert(timelineHtml.length > 1000, 'Timeline tab content should be rendered');
assert(!timelineHtml.includes('undefined'), 'Rendered timeline HTML must not contain "undefined"');
assert(timelineHtml.includes('Nintendo Switch Online'), 'Rendered timeline HTML must include NSO note');

// Check all 39 items are rendered in DOM HTML
timelineItems.forEach(it => {
  assert(timelineHtml.includes(`data-timeline-id="${it.timelineId}"`), `Timeline item ${it.timelineId} missing in rendered HTML`);
});
console.log('✅ 全39項目の出典URL・注意テキスト・描画HTML（undefined 0件）を確認！');

console.log('\n================================================================');
console.log('🧪 第10弾検証3: localStorage 独立保存 ＆ 既存5キー不変確認');
console.log('================================================================');

global.window.toggleTimelineItem('tl_spirit_火_3');
global.window.toggleTimelineItem('tl_chest_chest_001');

const savedTl = JSON.parse(mockStorage['magivaca_timeline_checklist_v1'] || '[]');
assert(savedTl.includes('tl_spirit_火_3') && savedTl.includes('tl_chest_chest_001'), 'Timeline checklist state did not persist to magivaca_timeline_checklist_v1');

// Verify existing 5 keys were NOT modified by toggleTimelineItem
for (const [key, expectedVal] of Object.entries(initialFiveKeys)) {
  assert.strictEqual(mockStorage[key], expectedVal, `Existing localStorage key ${key} was unexpectedly modified!`);
}
console.log('✅ 新規キー magivaca_timeline_checklist_v1 の正常保存と、既存5キーの完全不変を確認！');
console.log('\n🎉 PHASE 10 TIMELINE VERIFICATION PASSED 100%!');
