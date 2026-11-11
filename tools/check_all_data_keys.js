const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '../js/data.js'));

console.log('=== Checking all data objects keys in data.js ===');

// 1. SPIRITS_DATA
console.log('\n--- SPIRITS_DATA ---');
const spiritKeys = new Set();
data.SPIRITS_DATA.forEach(s => Object.keys(s).forEach(k => spiritKeys.add(k)));
console.log('Spirits keys:', Array.from(spiritKeys));

// 2. ITEM_RECOVERY_DATA
console.log('\n--- ITEM_RECOVERY_DATA ---');
const recoveryKeys = new Set();
data.ITEM_RECOVERY_DATA.forEach(r => Object.keys(r).forEach(k => recoveryKeys.add(k)));
console.log('Recovery keys:', Array.from(recoveryKeys));
console.log('Sample recovery:', data.ITEM_RECOVERY_DATA[0]);

// 3. ITEM_EQUIP_DATA
console.log('\n--- ITEM_EQUIP_DATA ---');
const equipKeys = new Set();
data.ITEM_EQUIP_DATA.forEach(e => Object.keys(e).forEach(k => equipKeys.add(k)));
console.log('Equip keys:', Array.from(equipKeys));
console.log('Sample equip:', data.ITEM_EQUIP_DATA[0]);

// 4. ITEM_EQUIP_SETS
console.log('\n--- ITEM_EQUIP_SETS ---');
const setKeys = new Set();
data.ITEM_EQUIP_SETS.forEach(s => Object.keys(s).forEach(k => setKeys.add(k)));
console.log('Equip set keys:', Array.from(setKeys));
console.log('Sample set:', data.ITEM_EQUIP_SETS[0]);

// 5. ITEM_MD_DATA
console.log('\n--- ITEM_MD_DATA ---');
const mdKeys = new Set();
data.ITEM_MD_DATA.forEach(m => Object.keys(m).forEach(k => mdKeys.add(k)));
console.log('MD keys:', Array.from(mdKeys));
console.log('Sample md:', data.ITEM_MD_DATA[0]);

// 6. ITEM_OTHER_DATA
console.log('\n--- ITEM_OTHER_DATA ---');
const otherKeys = new Set();
data.ITEM_OTHER_DATA.forEach(o => Object.keys(o).forEach(k => otherKeys.add(k)));
console.log('Other keys:', Array.from(otherKeys));
console.log('Sample other:', data.ITEM_OTHER_DATA[0]);

// 7. BOSS_MONSTERS_DATA
console.log('\n--- BOSS_MONSTERS_DATA ---');
const bossKeys = new Set();
data.BOSS_MONSTERS_DATA.forEach(b => Object.keys(b).forEach(k => bossKeys.add(k)));
console.log('Boss keys:', Array.from(bossKeys));
console.log('Sample boss:', data.BOSS_MONSTERS_DATA[0]);

// 8. STORY_CHOICES_DATA
console.log('\n--- STORY_CHOICES_DATA ---');
data.STORY_CHOICES_DATA.forEach(p => {
  console.log(`Plane: ${p.plane}, Events: ${p.events.length}`);
  if (p.events.length > 0) {
    console.log('  Event keys:', Object.keys(p.events[0]));
    if (p.events[0].choices && p.events[0].choices.length > 0) {
      console.log('    Choice keys:', Object.keys(p.events[0].choices[0]));
    }
  }
});

// 9. MAGIC_NOTES_DATA
console.log('\n--- MAGIC_NOTES_DATA ---');
const noteKeys = new Set();
data.MAGIC_NOTES_DATA.forEach(n => Object.keys(n).forEach(k => noteKeys.add(k)));
console.log('Magic notes keys:', Array.from(noteKeys));
console.log('Sample note:', data.MAGIC_NOTES_DATA[0]);

// 10. MIMIC_COINS_DATA
console.log('\n--- MIMIC_COINS_DATA ---');
const coinKeys = new Set();
data.MIMIC_COINS_DATA.forEach(c => Object.keys(c).forEach(k => coinKeys.add(k)));
console.log('Mimic coins keys:', Array.from(coinKeys));
console.log('Sample coin:', data.MIMIC_COINS_DATA[0]);

// 11. RECORD_CRITERIA_DATA
console.log('\n--- RECORD_CRITERIA_DATA ---');
const recKeys = new Set();
data.RECORD_CRITERIA_DATA.forEach(r => Object.keys(r).forEach(k => recKeys.add(k)));
console.log('Record keys:', Array.from(recKeys));
console.log('Sample rec:', data.RECORD_CRITERIA_DATA[0]);
