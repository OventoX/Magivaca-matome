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
  let statusText = isTreasureFloor ? (allOpened ? `✅ 宝箱 3/3個 開封完了` : `🎁 宝箱 ${openedChests}/3個 開封`) : `🛡️ 通路フロア（宝箱なし）`;

  let svg = `<svg class="area-schematic-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs>
    <filter id="shadow-g" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.06"/></filter>
  </defs>`;

  // Background
  svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>`;

  // Title
  svg += `<text x="16" y="24" font-size="12" font-weight="bold" fill="#1e293b">ガラムマサラ ${floor}F 模式図</text>`;
  svg += `<rect x="${width - 160}" y="10" width="144" height="20" rx="10" fill="${statusBg}" stroke="${statusStroke}" stroke-width="1"/>`;
  svg += `<text x="${width - 88}" y="24" font-size="10" font-weight="bold" fill="${statusTextColor}" text-anchor="middle">${statusText}</text>`;

  // Rooms layout: [上り階段] --- [中央フロア] --- [下り階段]
  // Downstairs (from previous floor)
  svg += `<rect x="24" y="50" width="80" height="70" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow-g)"/>`;
  svg += `<text x="64" y="74" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">${floor === 1 ? '入口' : `${floor - 1}Fへ`}</text>`;
  svg += `<text x="64" y="92" font-size="9" fill="#64748b" text-anchor="middle">▲ 階段</text>`;

  // Center / Treasure room
  let centerFill = isTreasureFloor ? '#fefce8' : '#f8fafc';
  let centerStroke = isTreasureFloor ? '#facc15' : '#cbd5e1';
  svg += `<rect x="136" y="45" width="88" height="80" rx="6" fill="${centerFill}" stroke="${centerStroke}" stroke-width="1.8" filter="url(#shadow-g)"/>`;
  svg += `<text x="180" y="68" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">${isTreasureFloor ? '宝箱部屋' : '中央通路'}</text>`;
  if (isTreasureFloor) {
    svg += `<text x="180" y="86" font-size="9.5" font-weight="bold" fill="#b45309" text-anchor="middle">🎁 宝箱 3個</text>`;
    svg += `<text x="180" y="104" font-size="8.5" fill="#64748b" text-anchor="middle">魔物・エンカウント</text>`;
  } else {
    svg += `<text x="180" y="90" font-size="9" fill="#64748b" text-anchor="middle">通常フロア</text>`;
  }

  // Upstairs (to next floor)
  svg += `<rect x="256" y="50" width="80" height="70" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow-g)"/>`;
  svg += `<text x="296" y="74" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">${floor === 50 ? '最深部' : `${floor + 1}Fへ`}</text>`;
  svg += `<text x="296" y="92" font-size="9" fill="#64748b" text-anchor="middle">▼ 階段</text>`;

  // Connections
  svg += `<line x1="104" y1="85" x2="136" y2="85" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`;
  svg += `<line x1="224" y1="85" x2="256" y2="85" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`;

  svg += `</svg>`;
  return svg;
}

console.log('Tested renderGaramFloorSvg length:', renderGaramFloorSvg(1, [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }], new Set()).length);
