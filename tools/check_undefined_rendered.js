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

// DOMモック
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
    querySelectorAll: (selector) => [],
    querySelector: (selector) => {
      // 簡易querySelector
      return {
        addEventListener: () => {},
        checked: false
      };
    },
    appendChild: function(child) {
      this.children.push(child);
      if (child.innerHTML) {
        this.innerHTML += child.innerHTML;
      }
    }
  };
  domNodes[id] = el;
  return el;
}

global.document = {
  getElementById: (id) => {
    if (!domNodes[id]) {
      createMockElement(id);
    }
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
      querySelectorAll: (selector) => [],
      querySelector: (selector) => ({
        addEventListener: () => {},
        checked: false
      }),
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
    if (evt === 'DOMContentLoaded') {
      domLoadedHandler = handler;
    }
  },
  scrollTo: () => {}
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// app.js を評価
const appJsPath = path.join(__dirname, '../js/app.js');
require(appJsPath);

// DOMContentLoaded 発火
if (domLoadedHandler) {
  domLoadedHandler();
}

console.log('=== Checking for "undefined" in rendered mock DOM containers ===');
let foundUndefined = false;
for (const [id, node] of Object.entries(domNodes)) {
  const text = (node.innerHTML || '') + (node.textContent || '');
  if (text.includes('undefined')) {
    console.error(`❌ Found "undefined" in element #${id}:`);
    // 該当箇所の抜粋を表示
    const idx = text.indexOf('undefined');
    const snippet = text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 60));
    console.error(`   Snippet: ...${snippet}...`);
    foundUndefined = true;
  } else {
    // console.log(`  [OK] #${id}`);
  }
}

if (!foundUndefined) {
  console.log('✅ No "undefined" found in any rendered elements!');
} else {
  console.log('❌ "undefined" was detected.');
}
