const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const dataJs = fs.readFileSync(path.join(baseDir, 'js/data.js'), 'utf8');
const appJs = fs.readFileSync(path.join(baseDir, 'js/app.js'), 'utf8');

console.log('=== Verifying HTML IDs referenced in app.js ===');
const idMatches = appJs.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [];
const ids = idMatches.map(m => m.match(/getElementById\(['"]([^'"]+)['"]\)/)[1]);
const uniqueIds = Array.from(new Set(ids));

let missingCount = 0;
uniqueIds.forEach(id => {
  const inHtml = html.includes(`id="${id}"`);
  const inAppJs = appJs.includes(`id="${id}"`) || appJs.includes(`id=\\"${id}\\"`);
  if (!inHtml && !inAppJs) {
    console.error(`  [MISSING ID] "${id}" is referenced but not found in index.html or dynamic templates!`);
    missingCount++;
  } else {
    // console.log(`  [OK] "${id}" found (${inHtml ? 'HTML' : 'Dynamic'})`);
  }
});

console.log(`Checked ${uniqueIds.length} IDs. Missing: ${missingCount}`);

console.log('\n=== Verifying Nav Tab Buttons vs Tab Sections ===');
const navTabMatches = html.match(/data-tab="([^"]+)"/g) || [];
const tabIds = navTabMatches.map(m => m.match(/data-tab="([^"]+)"/)[1]);

tabIds.forEach(tId => {
  const hasSection = html.includes(`id="${tId}"`);
  if (!hasSection) {
    console.error(`  [MISSING SECTION] <section id="${tId}"> not found in index.html!`);
    missingCount++;
  } else {
    console.log(`  [OK] Tab: ${tId} matches section.`);
  }
});

console.log('\n=== Verifying Data Objects in data.js ===');
const data = require(path.join(baseDir, 'js/data.js'));
const requiredObjects = [
  'SPIRITS_DATA', 'ELEMENT_META', 'PIRANHA_DATA', 'LIFESPAN_GUIDE', 'COMP_GUIDE',
  'LEVELING_DATA', 'CHART_DATA', 'SYSTEM_DATA', 'OFURO_CHART_DATA',
  'ITEM_RECOVERY_DATA', 'ITEM_OTHER_DATA', 'ITEM_MD_DATA', 'ITEM_EQUIP_DATA', 'ITEM_EQUIP_SETS',
  'ITEM_DROP_INDEX', 'MAGIC_NOTES_DATA', 'MIMIC_COINS_DATA', 'BOSS_MONSTERS_DATA',
  'REGULAR_MONSTERS_DATA',
  'STORY_CHOICES_DATA', 'RECORD_CRITERIA_DATA', 'CHESTS_DATA', 'CHESTS_META', 'GARAM_TSUBO_DATA'
];

requiredObjects.forEach(objName => {
  if (data[objName] !== undefined) {
    console.log(`  [OK] ${objName} is loaded (${Array.isArray(data[objName]) ? data[objName].length + ' items' : typeof data[objName]})`);
  } else {
    console.error(`  [MISSING DATA] ${objName} is missing from data.js!`);
    missingCount++;
  }
});

if (missingCount === 0) {
  console.log('\n✅ ALL INTEGRITY TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`\n❌ FAILED with ${missingCount} errors.`);
  process.exit(1);
}
