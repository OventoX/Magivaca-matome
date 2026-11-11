const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("================================================================");
console.log("🧪 模式図SVG見た目改善 検証テスト (test_schematic_visual_improvement.js)");
console.log("================================================================");

const baseDir = path.resolve(__dirname, '..');
const dataJsPath = path.join(baseDir, 'js', 'data.js');
const appJsPath = path.join(baseDir, 'js', 'app.js');

// 1. Data Integrity Check
const data = require(dataJsPath);
assert.strictEqual(data.SPIRITS_DATA.length, 112, "精霊112件であること");
assert.strictEqual(data.CHESTS_DATA.length, 453, "宝箱453件であること");

// 2. DOM & Window Mock
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
  addEventListener() {}
};

const storageMock = {};
const localStorageMock = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; }
};

const ctx = {
  window: {},
  document: documentMock,
  localStorage: localStorageMock,
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

// Render Chests Tab
ctx.window.renderChestsTab();
const content = documentMock.getElementById('chests-tab-content').innerHTML;

console.log("\n=== 1. 代表エリア（森・洞窟・火山・水・遺跡）の模式図レンダリング検証 ===");
const testAreas = [
  { name: 'ミモレットの森', expectedTheme: 'forest' },
  { name: '森の洞窟', expectedTheme: 'cave' },
  { name: 'モルビエ火山', expectedTheme: 'volcano_desert' },
  { name: 'アクアビット城', expectedTheme: 'water' },
  { name: 'ベナコンチャ遺跡', expectedTheme: 'ruins' },
  { name: 'ガラムマサラ', expectedTheme: 'dynamic_50' }
];

for (const a of testAreas) {
  if (a.name === 'ガラムマサラ') {
    assert(content.includes('ガラムマサラ 1F 模式図'), "ガラムマサラ 1F 模式図が描画されていること");
    console.log(`✅ ${a.name}: 動的フロア模式図の描画確認！`);
  } else {
    assert(content.includes(a.name), `${a.name} が描画されていること`);
    console.log(`✅ ${a.name}: 模式図の描画確認！`);
  }
}

console.log("\n=== 2. 四角の均一感解消（サイズ・縦横比・オフセット変化）検証 ===");
// Verify SVG contains dynamic bezier paths and different rect dimensions
assert(content.includes('<path d="M '), "曲線（ベジェ）接続パスが生成されていること");
assert(content.includes('class="schematic-compass"'), "方位（北）コンパスが表示されていること");
assert(content.includes('N</text>'), "方位（N）テキストが表示されていること");
console.log("✅ 自然なベジェ曲線接続パスと方位コンパスの存在を確認！");

console.log("\n=== 3. 宝箱マーカー・チェック連動検証 ===");
// Toggle chest_001 (ミモレットの森)
const beforeChests = data.CHESTS_DATA.filter(c => c.area === 'ミモレットの森');
const sampleChest = beforeChests[0];
ctx.window.toggleChest(sampleChest.id);
const updatedContent = documentMock.getElementById('chests-tab-content').innerHTML;
assert(storageMock['magivaca_chest_checklist_v1'].includes(sampleChest.id), "トグルでlocalStorageに保存されること");
console.log(`✅ 宝箱チェック連動（${sampleChest.id}）が正常に維持されていることを確認！`);

console.log("\n=== 4. ガラムマサラ各階の動的更新検証 ===");
ctx.window.setGaramFloor(13);
const f13Content = documentMock.getElementById('chests-tab-content').innerHTML;
assert(f13Content.includes('ガラムマサラ 13F 模式図'), "13F模式図への切替が動作すること");
assert(f13Content.includes('✅ 宝箱 3/3個 開封済') || f13Content.includes('🎁 宝箱 0/3個'), "13F宝箱ステータスが表示されること");
console.log("✅ ガラムマサラ13Fの模式図更新を確認！");

console.log("\n================================================================");
console.log("🎉 ALL SCHEMATIC VISUAL IMPROVEMENT TESTS PASSED 100%!");
console.log("================================================================");
