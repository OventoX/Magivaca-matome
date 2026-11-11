const d = require('../js/data.js');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSchematicSvg(defn, areaChests, checkedChests) {
  const grid = defn.grid;
  const nrows = grid.length;
  let ncols = 0;
  for (let r = 0; r < nrows; r++) {
    if (grid[r].length > ncols) ncols = grid[r].length;
  }
  
  const nodeStats = {};
  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const node = grid[r][c];
      if (!node) continue;
      const matched = areaChests.filter(ch => {
        return node.aliases.some(a => a === ch.mapName || ch.mapName.includes(a) || a.includes(ch.mapName));
      });
      const opened = matched.filter(ch => checkedChests.has(ch.id)).length;
      nodeStats[node.name] = { total: matched.length, opened: opened };
    }
  }

  const cellW = 118;
  const cellH = 54;
  const gapX = 16;
  const gapY = 14;
  const padX = 14;
  const padY = 28;
  
  const totalW = padX * 2 + ncols * cellW + (ncols - 1) * gapX;
  const totalH = padY * 2 + nrows * cellH + (nrows - 1) * gapY;
  
  let svg = `<svg viewBox="0 0 ${totalW} ${totalH}" class="area-schematic-svg" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${totalW}" height="${totalH}" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>`;
  
  // Legend
  svg += `<g transform="translate(${padX}, 17)" font-size="9.5" font-family="sans-serif">`;
  svg += `<circle cx="5" cy="-3" r="3.5" fill="#f59e0b"/>`;
  svg += `<text x="13" y="0" fill="#475569">🎁 宝箱あり</text>`;
  svg += `<circle cx="85" cy="-3" r="3.5" fill="#10b981"/>`;
  svg += `<text x="93" y="0" fill="#475569">✅ 開封完了</text>`;
  svg += `<circle cx="165" cy="-3" r="3.5" fill="#3b82f6"/>`;
  svg += `<text x="173" y="0" fill="#475569">🚪 出入口/通路</text>`;
  svg += `</g>`;
  
  // Connections
  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (!grid[r][c]) continue;
      const x1 = padX + c * (cellW + gapX) + cellW / 2;
      const y1 = padY + r * (cellH + gapY) + cellH / 2;
      
      // Horizontal
      if (c + 1 < grid[r].length && grid[r][c + 1]) {
        const x2 = padX + (c + 1) * (cellW + gapX) + cellW / 2;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" stroke="#cbd5e1" stroke-width="1.8" stroke-dasharray="3,3"/>`;
      }
      // Vertical
      if (r + 1 < nrows && c < grid[r + 1].length && grid[r + 1][c]) {
        const y2 = padY + (r + 1) * (cellH + gapY) + cellH / 2;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" stroke="#cbd5e1" stroke-width="1.8" stroke-dasharray="3,3"/>`;
      }
    }
  }

  // Nodes
  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const node = grid[r][c];
      if (!node) continue;
      const x = padX + c * (cellW + gapX);
      const y = padY + r * (cellH + gapY);
      
      const stat = nodeStats[node.name] || { total: 0, opened: 0 };
      const hasChests = stat.total > 0;
      const allOpened = hasChests && stat.opened === stat.total;
      const isEntrance = node.entrance;
      
      let rectFill = "#ffffff";
      let rectStroke = "#cbd5e1";
      let strokeW = "1";
      let textFill = "#334155";
      
      if (allOpened) {
        rectFill = "#f0fdf4";
        rectStroke = "#10b981";
        strokeW = "1.5";
        textFill = "#166534";
      } else if (hasChests) {
        rectFill = "#fffbeb";
        rectStroke = "#f59e0b";
        strokeW = "2";
        textFill = "#92400e";
      } else if (isEntrance) {
        rectFill = "#eff6ff";
        rectStroke = "#3b82f6";
        strokeW = "1.5";
        textFill = "#1e40af";
      }
      
      svg += `<g class="schematic-node" transform="translate(${x},${y})">`;
      svg += `<rect width="${cellW}" height="${cellH}" rx="6" fill="${rectFill}" stroke="${rectStroke}" stroke-width="${strokeW}"/>`;
      
      const name = escapeHtml(node.name);
      if (name.length > 9) {
        const line1 = name.slice(0, 8);
        const line2 = name.slice(8);
        svg += `<text x="${cellW / 2}" y="${cellH / 2 - 5}" font-size="9.5" font-weight="600" fill="${textFill}" text-anchor="middle">${line1}</text>`;
        svg += `<text x="${cellW / 2}" y="${cellH / 2 + 7}" font-size="8.5" fill="${textFill}" text-anchor="middle">${line2}</text>`;
      } else {
        svg += `<text x="${cellW / 2}" y="${cellH / 2 + (hasChests ? -2 : 3)}" font-size="10.5" font-weight="600" fill="${textFill}" text-anchor="middle">${name}</text>`;
      }
      
      if (hasChests) {
        let badgeBg = allOpened ? "#dcfce7" : "#fef3c7";
        let badgeStroke = allOpened ? "#10b981" : "#f59e0b";
        let badgeText = allOpened ? `✅ ${stat.total}個済` : (stat.opened > 0 ? `🎁 ${stat.opened}/${stat.total}済` : `🎁 ${stat.total}個`);
        let badgeColor = allOpened ? "#15803d" : "#b45309";
        
        svg += `<rect x="${cellW / 2 - 27}" y="${cellH - 16}" width="54" height="12" rx="3" fill="${badgeBg}" stroke="${badgeStroke}" stroke-width="0.8"/>`;
        svg += `<text x="${cellW / 2}" y="${cellH - 7}" font-size="8.5" font-weight="bold" fill="${badgeColor}" text-anchor="middle">${badgeText}</text>`;
      } else if (isEntrance) {
        svg += `<text x="${cellW / 2}" y="${cellH - 6}" font-size="8" fill="#3b82f6" text-anchor="middle">出入口</text>`;
      }
      
      svg += `</g>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

const chests = d.CHESTS_DATA;
const schematics = d.CHEST_MAP_ASSETS.schematic;

console.log("Testing all 32 areas schematic SVG generation:");
let totalSvgs = 0;
for (const [area, defn] of Object.entries(schematics)) {
  const areaChests = chests.filter(c => c.area === area);
  const checkedChests = new Set(areaChests.slice(0, 1).map(c => c.id));
  const svg = renderSchematicSvg(defn, areaChests, checkedChests);
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
    console.error(`Invalid SVG for ${area}`);
  } else {
    totalSvgs++;
  }
}
console.log(`Successfully generated valid SVGs for all ${totalSvgs}/32 areas!`);
