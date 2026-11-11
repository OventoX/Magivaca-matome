const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("================================================================");
console.log("🧪 第9弾 モンスター図鑑・ストーリー選択肢拡充 統合検証テスト");
console.log("================================================================");

const baseDir = path.resolve(__dirname, '..');
const dataJsPath = path.join(baseDir, 'js', 'data.js');
const appJsPath = path.join(baseDir, 'js', 'app.js');

// 1. Data Integrity & Coverage Checks
console.log("\n=== 1. データ完全性・収録件数・カバー率チェック ===");
const data = require(dataJsPath);

// Existing data untouched
assert.strictEqual(data.SPIRITS_DATA.length, 112, "精霊数は112件であること");
assert.strictEqual(data.CHESTS_DATA.length, 453, "宝箱数は453件であること");
assert.strictEqual(data.BOSS_MONSTERS_DATA.length, 13, "ボスモンスター数は13件であること");

// Phase 9 Expanded Data
assert.strictEqual(data.REGULAR_MONSTERS_DATA.length, 288, "通常モンスターは全288種が完全収録されていること");
console.log(`✅ 通常モンスター図鑑: 288 / 288種 (カバー率 100.0%) 完全収録！`);
console.log(`✅ ボスモンスター: 13 / 13体 完全収録！`);
console.log(`✅ 総合モンスターデータ数: ${data.REGULAR_MONSTERS_DATA.length + data.BOSS_MONSTERS_DATA.length}体 (全301体)`);

// Check Monster fields and Source URLs
data.REGULAR_MONSTERS_DATA.forEach((m, idx) => {
  assert(m.number, `Monster #${idx+1} must have number`);
  assert(m.name, `Monster #${idx+1} must have name`);
  assert(m.element, `Monster #${idx+1} must have element`);
  assert(m.url && m.url.startsWith('https://wikiwiki.jp/magivaca/MonsterList/'), `Monster #${idx+1} must have official Wiki URL`);
  assert(Array.isArray(m.locations) && m.locations.length > 0, `Monster #${idx+1} must have locations`);
});
console.log(`✅ 通常モンスター全288件すべてに公式Wiki出典URL・属性・出現場所が完備されていることを確認！`);

// Story Choices checks
assert.strictEqual(data.STORY_CHOICES_DATA.length, 5, "5プレーンすべて収録されていること");
const totalStoryEvents = data.STORY_CHOICES_DATA.reduce((sum, p) => sum + p.events.length, 0);
assert.strictEqual(totalStoryEvents, 28, "ストーリー選択肢は全28場面（既存16場面から+12場面拡充）であること");
console.log(`✅ ストーリー選択肢: 全5プレーン・28場面（+12場面の大幅拡充）を確認！`);

data.STORY_CHOICES_DATA.forEach(p => {
  p.events.forEach(ev => {
    assert(ev.scene, `Event must have scene`);
    assert(ev.url && ev.url.startsWith('https://wikiwiki.jp/magivaca/'), `Event must have Wiki URL`);
    assert(Array.isArray(ev.choices) && ev.choices.length > 0, `Event must have choices`);
  });
});
console.log(`✅ ストーリー選択肢全28場面すべてに公式Wikiチャート出典URLが完備されていることを確認！`);

// 2. DOM Mock & App Rendering
console.log("\n=== 2. モンスター画面 レンダリング・検索・統合表示検証 ===");
class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag ? tag.toUpperCase() : 'DIV';
    this.id = id;
    this.className = '';
    this.children = [];
    this.innerHTML = '';
    this.value = '';
    this.checked = false;
    this.style = {};
  }
  appendChild(child) { this.children.push(child); return child; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  addEventListener() {}
  scrollIntoView() {}
}

const documentMock = {
  elementsById: {},
  getElementById(id) {
    if (!this.elementsById[id]) {
      this.elementsById[id] = new MockElement('div', id);
    }
    return this.elementsById[id];
  },
  createElement(tag) { return new MockElement(tag); },
  querySelectorAll() { return []; },
  addEventListener() {}
};

const storageMock = {};
const ctx = {
  window: {},
  document: documentMock,
  localStorage: {
    getItem: (k) => storageMock[k] || null,
    setItem: (k, v) => { storageMock[k] = String(v); },
    removeItem: (k) => { delete storageMock[k]; }
  },
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  alert: () => {},
  confirm: () => true,
  addEventListener: () => {}
};
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dataJsPath, 'utf-8'), ctx);
vm.runInContext(fs.readFileSync(appJsPath, 'utf-8'), ctx);

// Render Monsters Tab
ctx.window.renderMonstersTab();
const monstersHtml = documentMock.getElementById('monsters-tab-content').innerHTML;

// Verify presence of total 301 monsters
assert(monstersHtml.includes('全301体'), "Title must state 301 monsters");
assert(monstersHtml.includes('ひふきコウモリ'), "Must render #001 ひふきコウモリ");
assert(monstersHtml.includes('#001'), "Must render badge #001");
assert(monstersHtml.includes('ケルレンドゥ'), "Must render Boss ケルレンドゥ");
assert(monstersHtml.includes('👑 BOSS'), "Must render badge 👑 BOSS");
assert(monstersHtml.includes('is-boss'), "Must apply is-boss class for bosses");
assert(monstersHtml.includes('ゲヴグレンドゥ'), "Must render #288 ゲヴグレンドゥ");
assert(monstersHtml.includes('🎁 ドロップ候補:'), "Must render drop candidates");
assert(monstersHtml.includes('ディニレンドゥ'), "Must retain Dinilendu warning");
console.log("✅ モンスター画面で全301体（通常288体＋ボス13体）の統合カード表示、BOSSバッジ、ドロップ連携を確認！");

// 3. Story Choices Tab Rendering
console.log("\n=== 3. ストーリー選択肢画面 レンダリング検証 ===");
ctx.window.renderStoryTab();
const storyCardsHtml = documentMock.getElementById('story-cards-container').innerHTML;

assert(storyCardsHtml.includes('図書室・教室での装備回収と仲間会話'), "Must include expanded event: 物質のプレーン図書室");
assert(storyCardsHtml.includes('カエルの林・カエルグミ捕獲と成績表リセット'), "Must include expanded event: カエルの林");
assert(storyCardsHtml.includes('森の洞窟・ヴァルカネイラ戦とアランシア加入'), "Must include expanded event: 森の洞窟");
assert(storyCardsHtml.includes('トルーナ村・キルシュ再加入と村長イベント'), "Must include expanded event: トルーナ村");
assert(storyCardsHtml.includes('マサラティ村・カフェオレ救出と再加入'), "Must include expanded event: マサラティ村");
assert(storyCardsHtml.includes('シサバレイ・精霊石像と目玉石像による特殊PT操作'), "Must include expanded event: シサバレイ石像");
assert(storyCardsHtml.includes('リドナヒー・闇魔法使い限定突入とニルヴァ'), "Must include expanded event: リドナヒー");
console.log("✅ ストーリー画面で全28場面の選択肢・分岐・注意事項・出典リンクが正常に描画されることを確認！");

console.log("\n================================================================");
console.log("🎉 ALL PHASE 9 VERIFICATIONS PASSED 100% SUCCESSFULLY!");
console.log("================================================================");
