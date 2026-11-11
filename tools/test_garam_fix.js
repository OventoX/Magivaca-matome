const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("================================================================");
console.log("🧪 ガラムマサラ階別表示・正規化修正 検証テスト (test_garam_fix.js)");
console.log("================================================================");

const baseDir = path.resolve(__dirname, '..');
const dataJsPath = path.join(baseDir, 'js', 'data.js');
const appJsPath = path.join(baseDir, 'js', 'app.js');

// 1. Data Integrity Checks
const data = require(dataJsPath);
assert.strictEqual(data.SPIRITS_DATA.length, 112, "精霊数は112件であること");
assert.strictEqual(data.CHESTS_DATA.length, 453, "宝箱総数は453件であること");

const garamChests = data.CHESTS_DATA.filter(c => c.area === 'ガラムマサラ');
assert.strictEqual(garamChests.length, 150, "ガラムマサラの宝箱数は150件であること");
console.log(`✅ 精霊数: ${data.SPIRITS_DATA.length}件、宝箱総数: ${data.CHESTS_DATA.length}件、ガラムマサラ宝箱数: ${garamChests.length}件 を確認！`);

// 2. DOM & Logic Mock
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

// Load data.js and app.js
vm.runInContext(fs.readFileSync(dataJsPath, 'utf-8'), ctx);
vm.runInContext(fs.readFileSync(appJsPath, 'utf-8'), ctx);

// Render Chests Tab
ctx.window.renderChestsTab();
const chestsContent = documentMock.getElementById('chests-tab-content').innerHTML;

// 3. Verify Floor Selector Options
console.log("\n=== 2. ガラムマサラ各階のフロアセレクタ表示検証 ===");
let totalCountInSelector = 0;
let floorsWithNoChests = 0;

for (let f = 1; f <= 50; f++) {
  // Option regex: <option value="1" selected>1F (0/3個)</option> or (x/y個)
  const optRegex = new RegExp(`<option value="${f}"[^>]*>${f}F \\((\\d+)\\/(\\d+)個\\)<\\/option>`);
  const match = chestsContent.match(optRegex);
  
  if (!match) {
    if (chestsContent.includes(`${f}F (宝箱なし)`)) {
      floorsWithNoChests++;
      console.error(`❌ Floor ${f} is still showing '(宝箱なし)'`);
    } else {
      console.error(`❌ Floor ${f} option not matched in selector!`);
    }
  } else {
    const opened = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    totalCountInSelector += total;
  }
}

assert.strictEqual(floorsWithNoChests, 0, "全50階で '(宝箱なし)' が 0件であること");
assert.strictEqual(totalCountInSelector, 150, "セレクタの全階宝箱数合計が150個（CHESTS_DATAと一致）であること");
console.log(`✅ フロアセレクタ全50階で各階3個（合計 ${totalCountInSelector}個）が正常表示されていることを確認！`);

// 4. Verify Floor Card Rendering for Floor 1
console.log("\n=== 3. 階別表示での宝箱カード表示検証 ===");
// Floor 1 initial render
assert(chestsContent.includes('ガラムマサラ１'), "Floor 1 cards must show ガラムマサラ１ location");
assert(chestsContent.includes('カエルグミ赤'), "Floor 1 chest 1 (カエルグミ赤) must be rendered");
assert(chestsContent.includes('スカンピシェル'), "Floor 1 chest 2 (スカンピシェル) must be rendered");
assert(chestsContent.includes('カエルグミ赤 x3'), "Floor 1 chest 3 (カエルグミ赤 x3) must be rendered");
console.log("✅ 1Fの宝箱カード3件（カエルグミ赤、スカンピシェル、カエルグミ赤 x3）が正常表示！");

// 5. Test Floor Switching and Card Rendering for Floor 13
ctx.window.setGaramFloor(13);
const contentFloor13 = documentMock.getElementById('chests-tab-content').innerHTML;
assert(contentFloor13.includes('ガラムマサラ 13F 模式図'), "Header must update to Floor 13");
assert(contentFloor13.includes('ガラムマサラ１３'), "Floor 13 cards must show ガラムマサラ１３");
assert(contentFloor13.includes('トータスシェル'), "Floor 13 chest (トータスシェル) must be rendered");
assert(contentFloor13.includes('400ブラー'), "Floor 13 chest (400ブラー) must be rendered");
console.log("✅ 13Fへのフロア切替で13Fの宝箱カード3件（トータスシェル、400ブラー等）が正常表示！");

// 6. Test Checkbox Toggle and Dynamic Label '(fo/total個済)'
console.log("\n=== 4. 開封チェックと動的ラベル '(${fo}/${fc.length}個済)' 検証 ===");
// Floor 13 has chests: chest_337, chest_338, chest_339
const f13Chests = data.CHESTS_DATA.filter(c => c.mapName === 'ガラムマサラ１３');
assert.strictEqual(f13Chests.length, 3);

// Open all 3 chests on Floor 13
f13Chests.forEach(c => ctx.window.toggleChest(c.id));
const contentAfterCheck = documentMock.getElementById('chests-tab-content').innerHTML;

// Verify localStorage
const savedStorage = storageMock['magivaca_chest_checklist_v1'];
assert(savedStorage, "localStorage [magivaca_chest_checklist_v1] must exist");
f13Chests.forEach(c => {
  assert(savedStorage.includes(c.id), `localStorage must contain checked chest ${c.id}`);
});
console.log("✅ localStorage [magivaca_chest_checklist_v1] への保存を確認！");

// Verify selector option shows completed: <option value="13" selected>13F (3/3個済)</option>
const optDoneRegex = /<option value="13"[^>]*>13F \(3\/3個済\)<\/option>/;
assert(optDoneRegex.test(contentAfterCheck), "Floor 13 option must dynamically show (3/3個済)");
console.log("✅ 全開封時に動的ラベル '(3/3個済)' がセレクタに反映されることを確認！");

// Verify SVG schematic status text updates to completed
assert(contentAfterCheck.includes('✅ 宝箱 3/3個 開封済'), "SVG status must show completed");
console.log("✅ フロア模式図内のステータスも動的に '✅ 宝箱 3/3個 開封済' に更新されることを確認！");

console.log("\n================================================================");
console.log("🎉 ALL GARAM MASALA TESTS PASSED 100% SUCCESSFULLY!");
console.log("================================================================");
