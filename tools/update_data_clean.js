const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../js/data.js');
const content = fs.readFileSync(dataPath, 'utf8');

// Load current data.js to get existing schematic definitions
const currentData = require(dataPath);
const existingSchematic = currentData.CHEST_MAP_ASSETS.schematic || {};

// 1. Add "リギニオ密林" to schematic
existingSchematic["リギニオ密林"] = {
  plane: "闇のプレーン",
  area: "リギニオ密林",
  title: "リギニオ密林 ルート・フロア接続模式図",
  desc: "レヒカフ沼周辺７から続く密林ダンジョン。分岐する各ルートと宝箱配置の模式図です。",
  grid: [
    [
      { name: "リギニオ密林7", aliases: ["リギニオ密林7", "リギニオ密林７"], links: ["south"], desc: "北西部ルート" },
      { name: "リギニオ密林6", aliases: ["リギニオ密林6", "リギニオ密林６"], links: ["south", "west"], desc: "北東部（宝箱2個）" },
      { name: "リギニオ密林8", aliases: ["リギニオ密林8", "リギニオ密林８"], links: ["west"], desc: "最奥部" }
    ],
    [
      { name: "リギニオ密林4", aliases: ["リギニオ密林4", "リギニオ密林４", "リギニオ密林４(密林６の階段から進入)", "リギニオ密林４(密林５の右上から進入)"], links: ["north", "south", "east"], desc: "中央広場（宝箱2個）" },
      { name: "リギニオ密林5", aliases: ["リギニオ密林5", "リギニオ密林５"], links: ["north", "west"], desc: "東部連絡路" },
      null
    ],
    [
      { name: "リギニオ密林1", aliases: ["リギニオ密林1", "リギニオ密林１"], isEntrance: true, links: ["north", "east"], desc: "入口（宝箱2個）" },
      { name: "リギニオ密林2", aliases: ["リギニオ密林2", "リギニオ密林２"], links: ["west", "east"], desc: "南部通路（宝箱1個）" },
      { name: "リギニオ密林3", aliases: ["リギニオ密林3", "リギニオ密林３"], links: ["west"], desc: "南東部（宝箱2個）" }
    ]
  ]
};

// 2. Add "リドナヒー" to schematic
existingSchematic["リドナヒー"] = {
  plane: "リドナヒー",
  area: "リドナヒー",
  title: "リドナヒー 階層・ルート分岐模式図",
  desc: "リドナヒーの階層接続。5階でボス直行ルートと宝箱フロアルートに分岐します。",
  grid: [
    [
      { name: "リドナヒー6", aliases: ["リドナヒー8", "リドナヒー８", "リドナヒー9", "リドナヒー９", "リドナヒー10", "リドナヒー１０"], links: ["south"], desc: "宝箱フロア（ホワイト装備3個）" },
      { name: "ボスフロア", aliases: ["リドナヒー6 (ボス部屋)"], links: [], desc: "ボス戦（宝箱なし）" }
    ],
    [
      { name: "リドナヒー5", aliases: ["リドナヒー7", "リドナヒー７"], links: ["north", "south"], desc: "右階段→宝箱 / 左階段→ボス（宝箱1個）" },
      null
    ],
    [
      { name: "リドナヒー4", aliases: ["リドナヒー3", "リドナヒー３"], isEntrance: true, links: ["north"], desc: "広間・入口（宝箱1個）" },
      null
    ]
  ]
};

// 3. Add "ガラムマサラ" to schematic
existingSchematic["ガラムマサラ"] = {
  plane: "ガラムマサラ",
  area: "ガラムマサラ",
  title: "ガラムマサラ 1F〜50F 階層構造・宝箱出現模式図",
  desc: "全50フロアのタワーダンジョン。3フロアごと（1F, 4F, 7F, 10F...49F）に各3個の宝箱（計150個）が出現します。下のフロア選択で各階の宝箱と開封状況を確認できます。",
  grid: [
    [
      { name: "ガラムマサラ49F", links: ["north", "south"], desc: "最深層宝箱フロア（宝箱3個）" },
      { name: "ガラムマサラ50F", links: ["west"], desc: "最上階・ボスフロア" }
    ],
    [
      { name: "ガラムマサラ25F〜46F", links: ["north", "south"], desc: "深層（3フロアごとに宝箱3個）" },
      null
    ],
    [
      { name: "ガラムマサラ1F〜22F", isEntrance: true, links: ["north"], desc: "中低層（3フロアごとに宝箱3個）" },
      null
    ]
  ]
};

// 4. Build sourceLinks for all 35 areas (official & Wiki direct links)
const sourceLinks = {
  "キャンプ場（ウィルオウィスプ・ヴァレンシア海岸）": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_1.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9",
    subpages: [
      { name: "ウィルオウィスプ (相川氏サイト)", url: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_1.html" },
      { name: "ヴァレンシア海岸 (相川氏サイト)", url: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_2.html" }
    ]
  },
  "ミモレットの森": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_3.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "森の洞窟": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_3.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "トルーナ村": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_4.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "ベナコンチャ遺跡": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_5.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "レーミッツ宮殿外": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_7.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "レーミッツ宮殿内": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_7.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "～ピップルスタウン": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_8.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "ラ・ロッシュの塔": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_9.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "～ゲアラヴァ村": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_10.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "キードモンガ": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/l_11.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/1"
  },
  "氷の島・ジェラ風穴": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_2.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2",
    subpages: [
      { name: "ジェラ風穴 (相川氏サイト)", url: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_2.html" },
      { name: "マサラティ村・氷の島 (相川氏サイト)", url: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_2.html" }
    ]
  },
  "タピオカティ村": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_3.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "リギニオ密林": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_4.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%AA%E3%82%AE%E3%83%8B%E3%82%AA%E5%AF%86%E6%9E%97"
  },
  "クムヤムト砂漠": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "ずんどこ穴": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "アクアビット城": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_5.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "エニグマの森": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_6.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "東の森": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_7.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "モルビエ火山": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_8.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "バソリモ村": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_9.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "ブラウニーの穴": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_9.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "キスニカ鉱山": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/d_10.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/2"
  },
  "タンドーリ": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_2.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "荒廃の地(～モイロロト村)": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_3.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "ピラミッド": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_4.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "荒廃の地(～ラキューオ)": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_5.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "ラキューオ": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_5.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "死の回廊": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_6.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "暗闇の地": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_7.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "失意の沼": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_7.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "モギナス魔窟": {
    shanilName: "相川ともき氏のマジカルバケーション攻略サイト",
    shanilUrl: "https://www5f.biglobe.ne.jp/~shanil/mv/data/chart/e_8.html",
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/3"
  },
  "ガラムマサラ": {
    shanilName: null,
    shanilUrl: null,
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9"
  },
  "リドナヒー": {
    shanilName: null,
    shanilUrl: null,
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9"
  },
  "シサバレイ": {
    shanilName: null,
    shanilUrl: null,
    wikiUrl: "https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9/4"
  }
};

// 5. Construct new CHEST_MAP_ASSETS without any image file paths
const newAssets = {
  schematic: existingSchematic,
  sourceLinks: sourceLinks
};

const newAssetsJson = JSON.stringify(newAssets, null, 2);

// Replace CHEST_MAP_ASSETS in data.js
const startMarker = 'const CHEST_MAP_ASSETS = ';
const endMarker = 'if (typeof window !== \'undefined\') {\n  window.CHEST_MAP_ASSETS = CHEST_MAP_ASSETS;';

const sIdx = content.indexOf(startMarker);
let eIdx = content.indexOf(endMarker, sIdx);
if (eIdx === -1) {
  // try regex
  const m = content.slice(sIdx).match(/;\s*if\s*\(\s*typeof\s*window\s*!==\s*'undefined'\s*\)\s*\{\s*window\.CHEST_MAP_ASSETS/);
  if (m) {
    eIdx = sIdx + m.index + (m[0].indexOf('if'));
  }
}

if (sIdx === -1 || eIdx === -1) {
  console.error('ERROR: Could not locate CHEST_MAP_ASSETS markers', { sIdx, eIdx });
  process.exit(1);
}

const updatedContent = content.slice(0, sIdx) +
  `const CHEST_MAP_ASSETS = ${newAssetsJson};\n\n` +
  content.slice(eIdx);

fs.writeFileSync(dataPath, updatedContent, 'utf8');
console.log('Successfully updated js/data.js without any image paths!');
console.log(`Total schematic areas: ${Object.keys(existingSchematic).length} / 35`);
console.log(`Total source links: ${Object.keys(sourceLinks).length} / 35`);
