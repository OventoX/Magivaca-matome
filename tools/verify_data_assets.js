const d = require('../js/data.js');
console.log("CHEST_MAP_ASSETS loaded:", Object.keys(d.CHEST_MAP_ASSETS));
console.log("Real areas:", Object.keys(d.CHEST_MAP_ASSETS.real));
console.log("Schematic areas count:", Object.keys(d.CHEST_MAP_ASSETS.schematic).length);
console.log("Garam floors:", Object.keys(d.CHEST_MAP_ASSETS.real["ガラムマサラ"].floorMaps).length);
