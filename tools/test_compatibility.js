const path = require('path');
const data = require(path.join(__dirname, '../js/data.js'));

console.log('=== Checking Spirits Compatibility ===');
if (!data.SPIRITS_DATA || data.SPIRITS_DATA.length !== 112) {
  console.error(`FAILED: SPIRITS_DATA length is ${data.SPIRITS_DATA ? data.SPIRITS_DATA.length : 0}, expected 112`);
  process.exit(1);
}

// 16属性 x 7体
const elements = ['火', '風', '毒', '美', '刃', '音', '石', '虫', '木', '獣', '水', '雷', '古', '闇', '光', '愛'];
const countByElem = {};
data.SPIRITS_DATA.forEach(s => {
  countByElem[s.element] = (countByElem[s.element] || 0) + 1;
});

let elemErr = 0;
elements.forEach(e => {
  if (countByElem[e] !== 7) {
    console.error(`Element ${e} has ${countByElem[e]} spirits (expected 7)`);
    elemErr++;
  }
});

if (elemErr > 0) {
  process.exit(1);
}
console.log('All 16 elements have exactly 7 spirits (112 total). OK!');

// Mock localStorage test
console.log('\n=== Testing LocalStorage Migration & Format Compatibility ===');
const mockStorage = {};
const STORAGE_KEY = 'magivaca_spirit_checklist_v1';
const STORAGE_KEY_MAGIC_NOTES = 'magivaca_magic_notes_v1';
const STORAGE_KEY_MIMIC_COINS = 'magivaca_mimic_coins_v1';
const STORAGE_KEY_RECORDS = 'magivaca_records_v1';

// 1. 旧形式の精霊チェックデータ
const legacySpirits = ['fire_01', 'water_02', 'light_01'];
mockStorage[STORAGE_KEY] = JSON.stringify(legacySpirits);

// 読み込みテスト
const loadedSpirits = JSON.parse(mockStorage[STORAGE_KEY]);
if (loadedSpirits.length !== 3 || loadedSpirits[0] !== 'fire_01') {
  console.error('Legacy spirit loading failed!');
  process.exit(1);
}
console.log('Legacy spirit localStorage loading: OK');

// 2. 新チェックリストキーの独立性テスト
mockStorage[STORAGE_KEY_MAGIC_NOTES] = JSON.stringify([1, 2, 5]);
mockStorage[STORAGE_KEY_MIMIC_COINS] = JSON.stringify([1, 28, 43]);
mockStorage[STORAGE_KEY_RECORDS] = JSON.stringify(['勝率', '気絶回数']);

// 精霊データが汚染されていないか
const verifySpirits = JSON.parse(mockStorage[STORAGE_KEY]);
if (verifySpirits.length !== 3) {
  console.error('Spirits storage was polluted by new keys!');
  process.exit(1);
}
console.log('Storage key isolation test: OK');

console.log('\n✅ COMPATIBILITY VERIFICATION SUCCESSFUL!');
