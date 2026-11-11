import re

with open("js/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

new_code = '''  // Garam Masala Dynamic Floor Schematic Generator (100% Original SVG)
  function renderGaramFloorSvg(floor, floorChests, checkedChests) {
    const isTreasureFloor = (floor % 3 === 1);
    const totalChests = floorChests.length;
    const openedChests = floorChests.filter(c => checkedChests.has(c.id)).length;
    const allOpened = (totalChests > 0 && openedChests === totalChests);

    const width = 360;
    const height = 150;

    let statusBg = isTreasureFloor ? (allOpened ? '#dcfce7' : '#fef3c7') : '#f1f5f9';
    let statusStroke = isTreasureFloor ? (allOpened ? '#10b981' : '#f59e0b') : '#cbd5e1';
    let statusTextColor = isTreasureFloor ? (allOpened ? '#15803d' : '#b45309') : '#64748b';
    let statusText = isTreasureFloor ? (allOpened ? '✅ 宝箱 3/3個 開封済' : `🎁 宝箱 ${openedChests}/3個`) : '🛡️ 通路フロア（宝箱なし）';

    let svg = `<svg class="area-schematic-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
      <filter id="shadow-garam" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.06"/></filter>
    </defs>`;

    // Background
    svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>`;

    // Header row
    svg += `<text x="16" y="25" font-size="12" font-weight="bold" fill="#1e293b">ガラムマサラ ${floor}F 模式図</text>`;
    svg += `<rect x="${width - 150}" y="11" width="136" height="20" rx="10" fill="${statusBg}" stroke="${statusStroke}" stroke-width="1"/>`;
    svg += `<text x="${width - 82}" y="25" font-size="10" font-weight="bold" fill="${statusTextColor}" text-anchor="middle">${statusText}</text>`;

    // Previous Floor / Downstairs
    svg += `<rect x="24" y="52" width="80" height="72" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow-garam)"/>`;
    svg += `<text x="64" y="76" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">${floor === 1 ? '入口' : `${floor - 1}Fへ`}</text>`;
    svg += `<text x="64" y="94" font-size="9" fill="#64748b" text-anchor="middle">▲ 階段</text>`;

    // Center / Treasure room
    let centerFill = isTreasureFloor ? '#fefce8' : '#f8fafc';
    let centerStroke = isTreasureFloor ? '#facc15' : '#cbd5e1';
    svg += `<rect x="136" y="46" width="88" height="82" rx="6" fill="${centerFill}" stroke="${centerStroke}" stroke-width="1.8" filter="url(#shadow-garam)"/>`;
    svg += `<text x="180" y="70" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">${isTreasureFloor ? '宝箱フロア' : '連絡通路'}</text>`;
    if (isTreasureFloor) {
      svg += `<text x="180" y="88" font-size="9.5" font-weight="bold" fill="#b45309" text-anchor="middle">🎁 宝箱 3個</text>`;
      svg += `<text x="180" y="106" font-size="8.5" fill="#64748b" text-anchor="middle">モンスター警戒</text>`;
    } else {
      svg += `<text x="180" y="92" font-size="9" fill="#64748b" text-anchor="middle">通常フロア</text>`;
    }

    // Next Floor / Upstairs
    svg += `<rect x="256" y="52" width="80" height="72" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow-garam)"/>`;
    svg += `<text x="296" y="76" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">${floor === 50 ? '最深部(ボス)' : `${floor + 1}Fへ`}</text>`;
    svg += `<text x="296" y="94" font-size="9" fill="#64748b" text-anchor="middle">▼ 階段</text>`;

    // Passage lines
    svg += `<line x1="104" y1="88" x2="136" y2="88" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`;
    svg += `<line x1="224" y1="88" x2="256" y2="88" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`;

    svg += `</svg>`;
    return svg;
  }

  // Area Map & Schematic Section Renderer (100% Original SVG + Direct Source Links)
  function renderAreaMapSection(areaName, planeName, areaChests, allChestsInArea) {
    if (typeof CHEST_MAP_ASSETS === 'undefined') return '';
    const areaKey = planeName + '_' + areaName;
    const isMapCollapsed = collapsedMaps.has(areaKey);
    const planeUrl = CHESTS_META && CHESTS_META.sourceUrls ? CHESTS_META.sourceUrls[planeName] : 'https://wikiwiki.jp/magivaca/';
    const sourceLinks = (CHEST_MAP_ASSETS.sourceLinks && CHEST_MAP_ASSETS.sourceLinks[areaName]) || {};

    // 1. Garam Masala: Dynamic Floor Schematics (50 Floors)
    if (areaName === 'ガラムマサラ') {
      const floorStr = String(garamSelectedFloor);
      const floorTargetName = 'ガラムマサラ' + floorStr;
      const floorChests = allChestsInArea.filter(c => c.mapName === floorTargetName);
      const floorOpened = floorChests.filter(c => checkedChests.has(c.id)).length;

      let floorOptions = '';
      for (let f = 1; f <= 50; f++) {
        const fc = allChestsInArea.filter(c => c.mapName === 'ガラムマサラ' + f);
        const fo = fc.filter(c => checkedChests.has(c.id)).length;
        const statusLabel = fc.length === 0 ? '(宝箱なし)' : (fo === fc.length ? '(3/3個済)' : `(${fo}/${fc.length}個)`);
        floorOptions += `<option value="${f}" ${f === garamSelectedFloor ? 'selected' : ''}>${f}F ${statusLabel}</option>`;
      }

      const floorSvg = renderGaramFloorSvg(garamSelectedFloor, floorChests, checkedChests);

      return `
        <div class="chest-area-map-container" id="map-container-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
          <div class="chest-map-header">
            <div class="chest-map-title-row">
              <span class="badge-map-schematic">📐 フロア接続模式図</span>
              <span class="chest-map-title-text">ガラムマサラ ${garamSelectedFloor}F / 全50フロア</span>
            </div>
            <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleMapCollapse('${areaKey}')">
              ${isMapCollapsed ? '🗺️ 模式図を表示' : '▲ 模式図を折りたたむ'}
            </button>
          </div>
          ${!isMapCollapsed ? `
            <div class="chest-map-desc">
              全50フロアのタワーダンジョン。3フロアごと（1F, 4F, 7F...49F）に各3個の宝箱（計150個）が出現します。自作SVG模式図でフロア接続と宝箱状況を確認できます。
            </div>
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
            <div class="area-schematic-svg-wrap">
              ${floorSvg}
            </div>
            <div class="map-external-links-bar">
              <a href="https://wikiwiki.jp/magivaca/%E3%82%AC%E3%83%A9%E3%83%A0%E3%83%9E%E3%82%B5%E3%83%A9" target="_blank" rel="noopener noreferrer" class="btn-ext-link wiki">
                📖 Wikiで有志作成ガラムマサラ実マップを見る ↗
              </a>
              <span class="ext-link-note">※他者著作物への配慮のため、実マップ画像の自サイトへの複製掲載は行わず、Wiki直接リンクでご案内しています。</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    // 2. All other 34 areas: Original SVG Schematics + Direct External Source Links
    if (CHEST_MAP_ASSETS.schematic && CHEST_MAP_ASSETS.schematic[areaName]) {
      const defn = CHEST_MAP_ASSETS.schematic[areaName];
      const svgCode = renderSchematicSvg(defn, allChestsInArea, areaKey);

      // Build source link buttons
      let extLinksHtml = '';
      if (sourceLinks.shanilUrl) {
        let subLinksHtml = '';
        if (sourceLinks.subpages && sourceLinks.subpages.length > 0) {
          subLinksHtml = sourceLinks.subpages.map(sp =>
            `<a href="${escapeHtml(sp.url)}" target="_blank" rel="noopener noreferrer" class="btn-ext-link sub">🗺️ ${escapeHtml(sp.name)} ↗</a>`
          ).join(' ');
        } else {
          subLinksHtml = `<a href="${escapeHtml(sourceLinks.shanilUrl)}" target="_blank" rel="noopener noreferrer" class="btn-ext-link">🗺️ 相川ともき氏サイトでダンジョン実マップを見る ↗</a>`;
        }

        extLinksHtml = `
          <div class="map-external-links-bar">
            <div class="ext-links-row">
              ${subLinksHtml}
              <a href="${escapeHtml(sourceLinks.wikiUrl || planeUrl)}" target="_blank" rel="noopener noreferrer" class="btn-ext-link wiki">📖 Wiki拾得物ページ ↗</a>
            </div>
            <span class="ext-link-note">※著作権配慮のため他サイトの実マップ画像は自サイト内にコピー・掲載しておりません。詳細な実物マップは上記リンク先にて直接ご覧いただけます。</span>
          </div>
        `;
      } else {
        extLinksHtml = `
          <div class="map-external-links-bar">
            <div class="ext-links-row">
              <a href="${escapeHtml(sourceLinks.wikiUrl || planeUrl)}" target="_blank" rel="noopener noreferrer" class="btn-ext-link wiki">📖 Wiki拾得物詳細ページ ↗</a>
            </div>
            <span class="ext-link-note">※フロア部屋接続・宝箱配置は自作SVG模式図で掲載しています。</span>
          </div>
        `;
      }

      // Red circle reference table (赤丸番号と宝箱対応表)
      const markGroups = new Map();
      allChestsInArea.forEach(c => {
        const mark = c.shanilMark || '-';
        const place = c.shanilPlace || c.mapName || '-';
        const groupKey = mark + '___' + place;
        if (!markGroups.has(groupKey)) {
          markGroups.set(groupKey, { mark, place, chests: [] });
        }
        markGroups.get(groupKey).chests.push(c);
      });

      let markTableRows = '';
      let hasShanilMarks = false;
      markGroups.forEach((grp) => {
        if (grp.mark !== '-') hasShanilMarks = true;
        const openedCount = grp.chests.filter(c => checkedChests.has(c.id)).length;
        const allDone = openedCount === grp.chests.length && grp.chests.length > 0;
        const markBadge = grp.mark !== '-' ? `<span class="badge-shanil-circle">${escapeHtml(grp.mark)}</span>` : '<span class="badge-shanil-circle none">-</span>';

        const chestBadges = grp.chests.map(c => {
          const isOp = checkedChests.has(c.id);
          return `<label class="mark-chest-item ${isOp ? 'is-opened' : ''}">
            <input type="checkbox" ${isOp ? 'checked' : ''} onchange="window.toggleChest('${c.id}')">
            <span class="mark-chest-name">${escapeHtml(c.item)}</span>
            ${c.missable ? '<span class="badge-xs badge-missable">消滅注意</span>' : ''}
          </label>`;
        }).join('');

        const statusText = allDone ? '<span style="color:#15803d; font-weight:600;">✅ 完了</span>' : `<span style="color:var(--text-secondary);">${openedCount}/${grp.chests.length}個</span>`;

        markTableRows += `
          <tr>
            <td class="col-mark">${markBadge}</td>
            <td class="col-place"><strong>${escapeHtml(grp.place)}</strong></td>
            <td class="col-chests">${chestBadges}</td>
            <td class="col-status">${statusText}</td>
          </tr>
        `;
      });

      const tableHtml = hasShanilMarks ? `
        <div class="shanil-mark-table-container">
          <div class="shanil-table-header">
            <strong>📍 相川氏チャート赤丸番号・場所と宝箱の対応表</strong>
            <span class="shanil-table-note">（外部マップの赤丸番号順 / チェックボックスで開封記録可能）</span>
          </div>
          <div class="table-responsive">
            <table class="shanil-mark-table">
              <thead>
                <tr>
                  <th style="width:50px;">番号</th>
                  <th style="width:140px;">場所</th>
                  <th>宝箱アイテム</th>
                  <th style="width:75px;">状態</th>
                </tr>
              </thead>
              <tbody>
                ${markTableRows}
              </tbody>
            </table>
          </div>
        </div>
      ` : '';

      return `
        <div class="chest-area-map-container" id="map-container-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
          <div class="chest-map-header">
            <div class="chest-map-title-row">
              <span class="badge-map-schematic">📐 エリア模式図</span>
              <span class="chest-map-title-text">${escapeHtml(defn.title || areaName)}</span>
            </div>
            <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleMapCollapse('${areaKey}')">
              ${isMapCollapsed ? '🗺️ 模式図を表示' : '▲ 模式図を折りたたむ'}
            </button>
          </div>
          ${!isMapCollapsed ? `
            <div class="chest-map-desc">${escapeHtml(defn.desc || '部屋のつながりと宝箱の配置を示す自作模式図です。')}</div>
            <div class="area-schematic-svg-wrap">
              ${svgCode}
            </div>
            ${extLinksHtml}
            ${tableHtml}
          ` : ''}
        </div>
      `;
    }

    return '';
  }'''

# Replace from '// Area Map & Schematic Section Renderer' to 'function renderChestsTab()'
pattern = re.compile(r'  // Area Map & Schematic Section Renderer\s*function renderAreaMapSection[\s\S]*?function renderChestsTab\(\)', re.MULTILINE)

m = pattern.search(app_js)
if not m:
    print("ERROR: pattern not matched")
    exit(1)

app_js = app_js[:m.start()] + new_code + "\n\n  function renderChestsTab()" + app_js[m.end():]

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(app_js)

print("Successfully replaced renderAreaMapSection in js/app.js!")
