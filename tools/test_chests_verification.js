const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.join(__dirname, '..');
const dataCode = fs.readFileSync(path.join(baseDir, 'js/data.js'), 'utf8');
const appCode = fs.readFileSync(path.join(baseDir, 'js/app.js'), 'utf8');

// DOMシミュレータ環境
class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName;
    this.id = id;
    this.children = [];
    this._innerHTML = '';
    this.classList = new Set();
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this.attributes = {};
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
  }

  appendChild(el) {
    this.children.push(el);
  }

  addEventListener(type, cb) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(cb);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(cb => cb(event));
  }

  querySelector(sel) {
    return null;
  }

  querySelectorAll(sel) {
    return [];
  }
}

class MockDocument {
  constructor() {
    this.elements = new Map();
    // 主要要素
    const ids = [
      'overall-progress-count', 'overall-progress-bar',
      'spirits-container', 'element-tracker-grid', 'filter-results-summary',
      'search-box', 'plane-select', 'req-select', 'chk-warning-only', 'chk-hide-completed', 'chk-plane-progress',
      'complete-guide-tab-content', 'items-tab-content', 'monsters-tab-content',
      'story-tab-content', 'collections-tab-content', 'chests-tab-content',
      'leveling-tab-content', 'chart-tab-content', 'ofuro-tab-content',
      'system-tab-content', 'guides-tab-content',
      'btn-reset-checklist', 'btn-backup', 'backup-modal', 'modal-close-btn',
      'backup-textarea', 'btn-copy-backup', 'btn-import-backup'
    ];
    ids.forEach(id => {
      this.elements.set(id, new MockElement('div', id));
    });
  }

  getElementById(id) {
    if (!this.elements.has(id)) {
      this.elements.set(id, new MockElement('div', id));
    }
    return this.elements.get(id);
  }

  querySelectorAll(sel) {
    return [];
  }
}

const mockStorage = {};
const mockLocalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const dom = new MockDocument();
const sandbox = {
  window: {},
  document: dom,
  localStorage: mockLocalStorage,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  alert: (msg) => console.log('Mock Alert:', msg),
  confirm: (msg) => true,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  addEventListener: (type, cb) => {
    if (type === 'DOMContentLoaded') cb();
  }
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);
vm.runInContext(appCode, sandbox);

console.log('================================================================');
console.log('🧪 宝箱マップ＆チェックリスト 総合検証');
console.log('================================================================');

// 1. データ件数検証
const chests = sandbox.CHESTS_DATA;
console.log(`総宝箱数: ${chests.length} 件`);
if (chests.length !== 453) throw new Error(`Expected 453 chests, got ${chests.length}`);
console.log('✅ 宝箱総数 453件 を確認！');

// 2. エリア数検証
const areas = new Set(chests.map(c => c.area));
console.log(`総エリア数: ${areas.size} エリア`);
if (areas.size !== 35) throw new Error(`Expected 35 areas, got ${areas.size}`);
console.log('✅ 総エリア数 35エリア を確認！');

// 3. 期間限定宝箱
const missable = chests.filter(c => c.missable);
console.log(`期間限定宝箱: ${missable.length} 件`);
if (missable.length !== 15) throw new Error(`Expected 15 missables, got ${missable.length}`);
console.log('✅ 期間限定宝箱 15件（警告付き）を確認！');

// 4. 初回描画検証 (renderChestsTab)
const container = dom.getElementById('chests-tab-content');
if (!container.innerHTML.includes('🧰 宝箱マップ＆開封チェックリスト')) {
  throw new Error('renderChestsTab did not render expected title!');
}
if (container.innerHTML.includes('undefined')) {
  throw new Error('Rendered HTML contains "undefined"!');
}
console.log('✅ 宝箱マップ初回レンダリング成功（"undefined" 0件）！');

// 5. 開封チェック＆localStorage保持検証
console.log('\n--- 開封チェックの永続化テスト ---');
sandbox.toggleChest('chest_001'); // バンダナ開封
sandbox.toggleChest('chest_040'); // 500ブラー開封
sandbox.toggleChest('chest_292'); // ガラムマサラ カエルグミ赤開封

const storedJson = mockLocalStorage.getItem('magivaca_chest_checklist_v1');
console.log('localStorage raw:', storedJson);
const parsedStored = JSON.parse(storedJson);
if (!parsedStored.includes('chest_001') || !parsedStored.includes('chest_040') || !parsedStored.includes('chest_292')) {
  throw new Error('LocalStorage did not properly persist opened chests!');
}
console.log('✅ localStorage (magivaca_chest_checklist_v1) に3件正常保存！');

// 再トグル（解除）テスト
sandbox.toggleChest('chest_040');
const updatedStored = JSON.parse(mockLocalStorage.getItem('magivaca_chest_checklist_v1'));
if (updatedStored.includes('chest_040') || updatedStored.length !== 2) {
  throw new Error('Chest unchecking failed!');
}
console.log('✅ 開封解除（再トグル）も正常動作！');

// 6. 検索テスト
console.log('\n--- 検索＆フィルタテスト ---');
sandbox.setChestPlane('光のプレーン');
if (!container.innerHTML.includes('光のプレーン')) {
  throw new Error('Plane filtering failed!');
}
console.log('✅ プレーン絞り込み「光のプレーン」動作確認！');

// 全プレーン復元
sandbox.setChestPlane('all');

console.log('\n🎉 ALL CHESTS VERIFICATIONS PASSED WITH 100% SUCCESS!');
