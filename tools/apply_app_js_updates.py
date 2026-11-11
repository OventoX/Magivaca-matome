import os
import re

def update_app_js():
    app_js_path = "js/app.js"
    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. State variables addition
    if "let garamSelectedFloor = 1;" not in content:
        content = content.replace(
            "let chestOnlyStar = false;",
            "let chestOnlyStar = false;\nlet garamSelectedFloor = 1;\nlet garamViewMode = 'floor'; // 'floor' or 'all'\nlet lidonahySelectedSubmap = 'リドナヒー4';\nlet collapsedMaps = new Set();"
        )

    # 2. Add interactive helper functions (toggleMapCollapse, setGaramFloor, setGaramViewMode, setLidonahySubmap)
    helpers_code = """
  // Map Interactive Handlers
  function toggleMapCollapse(areaKey) {
    if (collapsedMaps.has(areaKey)) {
      collapsedMaps.delete(areaKey);
    } else {
      collapsedMaps.add(areaKey);
    }
    renderChestsTab();
  }
  window.toggleMapCollapse = toggleMapCollapse;

  function setGaramFloor(floor) {
    garamSelectedFloor = Math.max(1, Math.min(50, parseInt(floor, 10) || 1));
    renderChestsTab();
  }
  window.setGaramFloor = setGaramFloor;

  function setGaramViewMode(mode) {
    garamViewMode = mode;
    renderChestsTab();
  }
  window.setGaramViewMode = setGaramViewMode;

  function setLidonahySubmap(name) {
    lidonahySelectedSubmap = name;
    renderChestsTab();
  }
  window.setLidonahySubmap = setLidonahySubmap;

  // SVG Schematic Generator
  function renderSchematicSvg(defn, areaChests, areaKey) {
    if (!defn || !defn.grid) return '';
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

  // Area Map & Schematic Section Renderer
  function renderAreaMapSection(areaName, planeName, areaChests, allChestsInArea) {
    if (typeof CHEST_MAP_ASSETS === 'undefined') return '';
    const areaKey = planeName + '_' + areaName;
    const isMapCollapsed = collapsedMaps.has(areaKey);
    const planeUrl = CHESTS_META && CHESTS_META.sourceUrls ? CHESTS_META.sourceUrls[planeName] : 'https://wikiwiki.jp/magivaca/';

    // 1. Real map areas
    if (CHEST_MAP_ASSETS.real && CHEST_MAP_ASSETS.real[areaName]) {
      const realMeta = CHEST_MAP_ASSETS.real[areaName];

      if (areaName === 'ガラムマサラ') {
        const floorStr = String(garamSelectedFloor);
        const floorMapImg = (realMeta.floorMaps && realMeta.floorMaps[floorStr]) ? realMeta.floorMaps[floorStr] : `img/maps/map-garam${floorStr.padStart(2, '0')}-0.png`;
        const floorTargetName = 'ガラムマサラ' + floorStr;
        const floorChests = allChestsInArea.filter(c => c.mapName === floorTargetName);
        const floorOpened = floorChests.filter(c => checkedChests.has(c.id)).length;
        
        let floorOptions = '';
        for (let f = 1; f <= 50; f++) {
          const fc = allChestsInArea.filter(c => c.mapName === 'ガラムマサラ' + f);
          const fo = fc.filter(c => checkedChests.has(c.id)).length;
          const statusLabel = fc.length === 0 ? '(宝箱なし)' : (fo === fc.length ? `(3/3個済)` : `(${fo}/${fc.length}個)`);
          floorOptions += `<option value="${f}" ${f === garamSelectedFloor ? 'selected' : ''}>${f}F ${statusLabel}</option>`;
        }

        return `
          <div class="chest-area-map-container" id="map-container-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
            <div class="chest-map-header">
              <div class="chest-map-title-row">
                <span class="badge-map-real">🗺️ 実マップ画像</span>
                <span class="chest-map-title-text">${escapeHtml(realMeta.title)}</span>
              </div>
              <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleMapCollapse('${areaKey}')">
                ${isMapCollapsed ? '🗺️ マップを表示' : '▲ マップを折りたたむ'}
              </button>
            </div>
            ${!isMapCollapsed ? `
              <div class="chest-map-desc">${escapeHtml(realMeta.desc)}</div>
              <div class="chest-floor-controls">
                <button type="button" class="btn btn-sm btn-outline" onclick="window.setGaramFloor(${garamSelectedFloor - 1})" ${garamSelectedFloor <= 1 ? 'disabled' : ''}>◀ 前の階</button>
                <select class="chest-floor-select" onchange="window.setGaramFloor(this.value)">
                  ${floorOptions}
                </select>
                <button type="button" class="btn btn-sm btn-outline" onclick="window.setGaramFloor(${garamSelectedFloor + 1})" ${garamSelectedFloor >= 50 ? 'disabled' : ''}>次の階 ▶</button>
                <button type="button" class="btn btn-sm btn-outline" onclick="window.setGaramViewMode('${garamViewMode === 'floor' ? 'all' : 'floor'}')">
                  ${garamViewMode === 'floor' ? '📄 全階層を一括表示' : '🔍 フロア個別表示に戻す'}
                </button>
              </div>
              <div class="chest-real-map-wrapper">
                <img src="${floorMapImg}" alt="ガラムマサラ ${garamSelectedFloor}F マップ" class="chest-real-map-img" loading="lazy">
              </div>
              <div class="map-credit-box">
                ${realMeta.credit}
                | <a href="${realMeta.sourceUrl}" target="_blank" rel="noopener noreferrer">Wikiページを開く ↗</a>
              </div>
            ` : ''}
          </div>
        `;
      }

      if (areaName === 'リドナヒー') {
        const activeSubmap = realMeta.submaps.find(s => s.name === lidonahySelectedSubmap) || realMeta.submaps[0];
        const tabsHtml = realMeta.submaps.map(sm => {
          const isAct = sm.name === activeSubmap.name;
          return `<button type="button" class="map-subtab-btn ${isAct ? 'active' : ''}" onclick="window.setLidonahySubmap('${sm.name}')">${escapeHtml(sm.name)}</button>`;
        }).join('');

        return `
          <div class="chest-area-map-container" id="map-container-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
            <div class="chest-map-header">
              <div class="chest-map-title-row">
                <span class="badge-map-real">🗺️ 実マップ画像</span>
                <span class="chest-map-title-text">${escapeHtml(realMeta.title)}</span>
              </div>
              <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleMapCollapse('${areaKey}')">
                ${isMapCollapsed ? '🗺️ マップを表示' : '▲ マップを折りたたむ'}
              </button>
            </div>
            ${!isMapCollapsed ? `
              <div class="chest-map-desc">${escapeHtml(realMeta.desc)}</div>
              <div class="map-subtabs">${tabsHtml}</div>
              <div class="chest-real-map-wrapper">
                <img src="${activeSubmap.file}" alt="${escapeHtml(activeSubmap.name)} マップ" class="chest-real-map-img" loading="lazy">
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin:4px 0 8px 0; background:#fff; padding:6px 10px; border-radius:4px; border-left:3px solid var(--accent);">
                📍 <strong>ルート・分岐案内:</strong> ${escapeHtml(activeSubmap.desc)}
              </div>
              <div class="map-credit-box">
                ${realMeta.credit}
                | <a href="${realMeta.sourceUrl}" target="_blank" rel="noopener noreferrer">Wikiページを開く ↗</a>
              </div>
            ` : ''}
          </div>
        `;
      }

      if (areaName === 'リギニオ密林') {
        return `
          <div class="chest-area-map-container" id="map-container-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
            <div class="chest-map-header">
              <div class="chest-map-title-row">
                <span class="badge-map-real">🗺️ 実マップ画像</span>
                <span class="chest-map-title-text">${escapeHtml(realMeta.title)}</span>
              </div>
              <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleMapCollapse('${areaKey}')">
                ${isMapCollapsed ? '🗺️ マップを表示' : '▲ マップを折りたたむ'}
              </button>
            </div>
            ${!isMapCollapsed ? `
              <div class="chest-map-desc">${escapeHtml(realMeta.desc)}</div>
              <div class="chest-real-map-wrapper">
                <img src="${realMeta.file}" alt="リギニオ密林 概略マップ" class="chest-real-map-img" loading="lazy">
              </div>
              <div class="map-credit-box">
                ${realMeta.credit}
                | <a href="${realMeta.sourceUrl}" target="_blank" rel="noopener noreferrer">Wikiページを開く ↗</a>
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    // 2. Schematic areas (32 areas)
    if (CHEST_MAP_ASSETS.schematic && CHEST_MAP_ASSETS.schematic[areaName]) {
      const defn = CHEST_MAP_ASSETS.schematic[areaName];
      const svgCode = renderSchematicSvg(defn, allChestsInArea, areaKey);

      return `
        <div class="chest-area-map-container" id="map-container-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
          <div class="chest-map-header">
            <div class="chest-map-title-row">
              <span class="badge-map-schematic">📐 エリア模式図</span>
              <span class="chest-map-title-text">${escapeHtml(defn.title)}</span>
            </div>
            <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleMapCollapse('${areaKey}')">
              ${isMapCollapsed ? '🗺️ 模式図を表示' : '▲ 模式図を折りたたむ'}
            </button>
          </div>
          ${!isMapCollapsed ? `
            <div class="schematic-notice">
              ※本図はWikiの「マップ位置 概略」データに基づく部屋接続模式図です（ゲーム画面の画像ではありません）。各部屋の宝箱個数・開封状況をリアルタイムで示しています。
            </div>
            <div class="area-schematic-svg-wrap">
              ${svgCode}
            </div>
            <div class="map-credit-box">
              一次情報出典: <a href="${planeUrl}" target="_blank" rel="noopener noreferrer">マジカルバケーション攻略Wiki (${escapeHtml(planeName)})</a>（マップ位置概略に準拠）
            </div>
          ` : ''}
        </div>
      `;
    }

    return '';
  }
"""

    if "function renderAreaMapSection" not in content:
        content = content.replace(
            "function renderChestsTab() {",
            helpers_code + "\n  function renderChestsTab() {"
        )

    # 3. Inside renderChestsTab, insert map section and handle displayedChests
    target_pattern = r"""(\s+<div class="chest-area-panel \$\{isCollapsed \? 'collapsed' : ''\}" id="area-panel-\$\{areaKey\.replace\(/\[\^a-zA-Z0-9_\]/g, '_'\)\}">\s+<div class="chest-area-header" onclick="window\.toggleAreaCollapse\('\$\{areaKey\}'\)">[\s\S]*?<\/div>\s+<\/div>\s+)(<div class="chest-cards-grid">)"""
    
    # We want:
    # </div>
    # ${renderAreaMapSection(areaName, planeName, areaChests, allChestsInArea)}
    # <div class="chest-cards-grid">
    
    replacement = r"""\1
            ${renderAreaMapSection(areaName, planeName, areaChests, allChestsInArea)}
            \2"""
            
    content = re.sub(target_pattern, replacement, content)

    # Also handle Garam Masala floor filtering for chest cards:
    old_loop = "areaChests.forEach(c => {"
    new_loop = """let displayedChests = areaChests;
        if (areaName === 'ガラムマサラ' && garamViewMode === 'floor' && !chestSearchQuery) {
          const targetFloor = 'ガラムマサラ' + garamSelectedFloor;
          displayedChests = areaChests.filter(c => c.mapName === targetFloor);
        }
        if (displayedChests.length === 0) {
          html += `
            <div style="grid-column: 1 / -1; padding: 18px; text-align: center; background: #fff; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.88rem;">
              ガラムマサラ ${garamSelectedFloor}F には宝箱はありません（モンスター・ボス・フロア移動）。<br>
              上のフロア切り替えボタンまたはプルダウンメニューで前後の階をお選びください。
            </div>
          `;
        }
        displayedChests.forEach(c => {"""

    content = content.replace(old_loop, new_loop, 1)

    with open(app_js_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Successfully updated js/app.js!")

if __name__ == "__main__":
    update_app_js()
