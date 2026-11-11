with open("js/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

# 1. STORAGE_KEY_CHESTS & State 定義の追加
old_storage_keys = "const STORAGE_KEY_RECORDS = 'magivaca_records_v1';"
new_storage_keys = """const STORAGE_KEY_RECORDS = 'magivaca_records_v1';
  const STORAGE_KEY_CHESTS = 'magivaca_chest_checklist_v1';"""

assert old_storage_keys in app_js, "STORAGE_KEY_RECORDS not found"
app_js = app_js.replace(old_storage_keys, new_storage_keys, 1)

old_state = "let checkedRecords = new Set();"
new_state = """let checkedRecords = new Set();
  let checkedChests = new Set();

  // State: Chests Tab
  let chestPlane = 'all';
  let chestSearchQuery = '';
  let chestOnlyUnchecked = false;
  let chestOnlyMissable = false;
  let chestOnlyStar = false;
  let collapsedAreas = new Set();"""

assert old_state in app_js, "checkedRecords not found"
app_js = app_js.replace(old_state, new_state, 1)

# 2. loadState & saveState に checkedChests を追加
old_load = """      const savedRecs = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecs) {
        const arr = JSON.parse(savedRecs);
        if (Array.isArray(arr)) checkedRecords = new Set(arr);
      }"""

new_load = """      const savedRecs = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecs) {
        const arr = JSON.parse(savedRecs);
        if (Array.isArray(arr)) checkedRecords = new Set(arr);
      }

      const savedChests = localStorage.getItem(STORAGE_KEY_CHESTS);
      if (savedChests) {
        const arr = JSON.parse(savedChests);
        if (Array.isArray(arr)) checkedChests = new Set(arr);
      }"""

assert old_load in app_js, "loadState block not found"
app_js = app_js.replace(old_load, new_load, 1)

old_save = "localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(Array.from(checkedRecords)));"
new_save = """localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(Array.from(checkedRecords)));
      localStorage.setItem(STORAGE_KEY_CHESTS, JSON.stringify(Array.from(checkedChests)));"""

assert old_save in app_js, "saveState block not found"
app_js = app_js.replace(old_save, new_save, 1)

# 3. 宝箱操作ヘルパー関数を定義
toggle_helpers = """  // Chest Toggle Helpers
  function toggleChest(id) {
    if (checkedChests.has(id)) {
      checkedChests.delete(id);
    } else {
      checkedChests.add(id);
    }
    saveState();
    renderChestsTab();
  }
  window.toggleChest = toggleChest;

  function toggleAreaCollapse(areaKey) {
    if (collapsedAreas.has(areaKey)) {
      collapsedAreas.delete(areaKey);
    } else {
      collapsedAreas.add(areaKey);
    }
    renderChestsTab();
  }
  window.toggleAreaCollapse = toggleAreaCollapse;

  function setChestPlane(p) {
    chestPlane = p;
    renderChestsTab();
  }
  window.setChestPlane = setChestPlane;

  function setAllChestsInCurrentView(openAll) {
    if (typeof CHESTS_DATA === 'undefined') return;
    const list = getFilteredChests();
    if (openAll) {
      list.forEach(c => checkedChests.add(c.id));
    } else {
      list.forEach(c => checkedChests.delete(c.id));
    }
    saveState();
    renderChestsTab();
  }
  window.setAllChestsInCurrentView = setAllChestsInCurrentView;

  function setAllAreasCollapsed(collapse) {
    if (typeof CHESTS_DATA === 'undefined') return;
    if (collapse) {
      CHESTS_DATA.forEach(c => collapsedAreas.add(c.plane + '_' + c.area));
    } else {
      collapsedAreas.clear();
    }
    renderChestsTab();
  }
  window.setAllAreasCollapsed = setAllAreasCollapsed;

  function getFilteredChests() {
    if (typeof CHESTS_DATA === 'undefined') return [];
    return CHESTS_DATA.filter(c => {
      if (chestPlane !== 'all' && c.plane !== chestPlane) return false;
      if (chestOnlyUnchecked && checkedChests.has(c.id)) return false;
      if (chestOnlyMissable && !c.missable) return false;
      if (chestOnlyStar && !c.type.includes('宝箱*')) return false;
      if (chestSearchQuery) {
        const q = chestSearchQuery.toLowerCase();
        const mMap = c.mapName.toLowerCase().includes(q);
        const mArea = c.area.toLowerCase().includes(q);
        const mItem = c.item.toLowerCase().includes(q);
        const mNote = c.note.toLowerCase().includes(q);
        const mCoord = c.coord.includes(q);
        if (!mMap && !mArea && !mItem && !mNote && !mCoord) return false;
      }
      return true;
    });
  }
"""

old_record_toggle = "saveState();\n    renderCollectionsTab();\n  }"
assert old_record_toggle in app_js, "record toggle end not found"
app_js = app_js.replace(old_record_toggle, old_record_toggle + "\n\n" + toggle_helpers, 1)

# 4. renderChestsTab の実装
render_chests_fn = """
  // ============================================================================
  // Tab: Chests Map (宝箱マップ)
  // ============================================================================
  function renderChestsTab() {
    const container = document.getElementById('chests-tab-content');
    if (!container || typeof CHESTS_DATA === 'undefined') return;

    const totalChests = CHESTS_DATA.length;
    const totalOpened = checkedChests.size;
    const totalPct = totalChests > 0 ? ((totalOpened / totalChests) * 100).toFixed(1) : 0;
    const missableCount = CHESTS_META ? CHESTS_META.missableCount : 15;
    const openedMissable = CHESTS_DATA.filter(c => c.missable && checkedChests.has(c.id)).length;

    // フィルタリング
    const filtered = getFilteredChests();

    // プレーン別・エリア別の集約
    const planeOrder = ["物質のプレーン", "光のプレーン", "闇のプレーン", "死のプレーン", "ガラムマサラ", "シサバレイ", "リドナヒー"];
    
    // 表示対象プレーン
    const activePlanes = chestPlane === 'all' ? planeOrder : [chestPlane];

    // HTML構築
    let html = `
      <div class="chest-summary-banner">
        <h2>🧰 宝箱マップ＆開封チェックリスト</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
          GBA『マジカルバケーション』全プレーン・全35エリアに存在する<strong>全453個の宝箱</strong>（通常宝箱301個＋ブランド装備・MDパーツ等の特殊宝箱152個）を、階層・座標・中身・目印付きで完全収録。<br>
          ストーリー進行で消滅する<strong>期間限定宝箱（15個）</strong>には警告を表示しています。
        </p>

        <!-- 収集チェックリストとの相互リンク -->
        <div class="note-box" style="margin-bottom:14px; background:#eff6ff; border-color:#bfdbfe; color:#1e3a8a; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <span>💡 <strong>収集チェックリスト連携:</strong> ミミック等のハズレ宝箱から出るコイン一覧は [📋 収集チェックリスト] タブで管理できます。</span>
          <button type="button" class="btn btn-sm btn-outline" onclick="window.switchTab('tab-collections')" style="font-size:0.8rem; padding:3px 10px; background:#fff;">
            📋 収集チェックリストを開く
          </button>
        </div>

        <!-- 全体統計ボックス -->
        <div class="chest-stats-grid">
          <div class="chest-stat-box">
            <div class="chest-stat-label">全体開封進捗</div>
            <div class="chest-stat-val">${totalOpened} / ${totalChests} <span style="font-size:0.9rem; font-weight:normal; color:var(--text-muted);">(${totalPct}%)</span></div>
            <div class="progress-bar-bg" style="margin-top:6px; height:6px;">
              <div class="progress-bar-fill" style="width:${totalPct}%; background-color:var(--success-color);"></div>
            </div>
          </div>
          <div class="chest-stat-box">
            <div class="chest-stat-label">⚠️ 期間限定宝箱</div>
            <div class="chest-stat-val" style="color:var(--warning-text);">${openedMissable} / ${missableCount} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">(消滅注意)</span></div>
          </div>
          <div class="chest-stat-box">
            <div class="chest-stat-label">⭐ 特殊宝箱* (装備・パーツ)</div>
            <div class="chest-stat-val">${CHESTS_DATA.filter(c => c.type.includes('宝箱*') && checkedChests.has(c.id)).length} / 152</div>
          </div>
          <div class="chest-stat-box">
            <div class="chest-stat-label">現在表示中</div>
            <div class="chest-stat-val">${filtered.length} 個</div>
          </div>
        </div>
      </div>

      <!-- フィルター＆コントロールバー -->
      <div class="chest-filter-bar">
        <!-- プレーンピルボタン -->
        <div class="plane-pills-wrap">
    `;

    const planesMeta = CHESTS_META ? CHESTS_META.planes : [];
    planesMeta.forEach(p => {
      const isAct = chestPlane === (p.name === 'すべて' ? 'all' : p.name);
      const planeVal = p.name === 'すべて' ? 'all' : p.name;
      // このプレーンの開封数
      const pOpened = p.name === 'すべて' ? totalOpened : CHESTS_DATA.filter(c => c.plane === p.name && checkedChests.has(c.id)).length;
      html += `
        <button type="button" class="plane-pill-btn ${isAct ? 'active' : ''}" onclick="window.setChestPlane('${planeVal}')">
          ${p.name} (${pOpened}/${p.count})
        </button>
      `;
    });

    html += `
        </div>

        <!-- 検索・絞り込み・操作行 -->
        <div class="chest-controls-row">
          <input type="text" id="chest-search-box" class="chest-search-input" placeholder="🔍 エリア・マップ名・アイテム名・座標で検索..." value="${escapeHtml(chestSearchQuery)}">

          <div class="chest-checkbox-filters">
            <label class="chest-checkbox-label">
              <input type="checkbox" id="chk-chest-unopened" ${chestOnlyUnchecked ? 'checked' : ''}>
              <span>未開封のみ</span>
            </label>
            <label class="chest-checkbox-label">
              <input type="checkbox" id="chk-chest-missable" ${chestOnlyMissable ? 'checked' : ''}>
              <span style="color:var(--warning-text);">⚠️ 期間限定のみ</span>
            </label>
            <label class="chest-checkbox-label">
              <input type="checkbox" id="chk-chest-star" ${chestOnlyStar ? 'checked' : ''}>
              <span>⭐ 特殊宝箱*のみ</span>
            </label>
          </div>

          <div class="chest-action-btns">
            <button type="button" class="btn btn-sm" onclick="window.setAllAreasCollapsed(false)">展開</button>
            <button type="button" class="btn btn-sm" onclick="window.setAllAreasCollapsed(true)">折畳</button>
            <button type="button" class="btn btn-sm btn-outline" onclick="if(confirm('表示中の宝箱をすべて開封済みにしますか？')) window.setAllChestsInCurrentView(true)">表示中を全開封</button>
            <button type="button" class="btn btn-sm btn-outline" onclick="if(confirm('表示中の宝箱の開封チェックをすべて解除しますか？')) window.setAllChestsInCurrentView(false)">表示中を全解除</button>
          </div>
        </div>
      </div>

      <!-- 宝箱階層リスト (プレーン → エリア → 宝箱) -->
      <div class="chest-planes-container">
    `;

    let totalRenderedAreas = 0;

    activePlanes.forEach(planeName => {
      // 当該プレーンの宝箱
      const planeChests = filtered.filter(c => c.plane === planeName);
      if (planeChests.length === 0) return;

      // エリアごとにグルーピング
      const areasInPlane = [];
      const areaMap = new Map();

      planeChests.forEach(c => {
        if (!areaMap.has(c.area)) {
          areaMap.set(c.area, []);
          areasInPlane.push(c.area);
        }
        areaMap.get(c.area).push(c);
      });

      const planeTotalAll = CHESTS_DATA.filter(c => c.plane === planeName).length;
      const planeOpenedAll = CHESTS_DATA.filter(c => c.plane === planeName && checkedChests.has(c.id)).length;
      const planePct = planeTotalAll > 0 ? ((planeOpenedAll / planeTotalAll) * 100).toFixed(0) : 0;
      const planeUrl = CHESTS_META && CHESTS_META.sourceUrls ? CHESTS_META.sourceUrls[planeName] : 'https://wikiwiki.jp/magivaca/';

      html += `
        <div class="plane-section-wrapper" style="margin-bottom:28px;">
          <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:12px; border-bottom:2px solid var(--accent); padding-bottom:6px;">
            <h3 style="font-size:1.2rem; color:var(--accent); margin:0; display:flex; align-items:center; gap:8px;">
              <span>🗺️ ${planeName}</span>
              <span style="font-size:0.85rem; font-weight:normal; color:var(--text-muted);">(${planeOpenedAll} / ${planeTotalAll} 開封 [${planePct}%])</span>
            </h3>
            <a href="${planeUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem; color:var(--text-muted); text-decoration:none;">
              📖 Wiki出典 ↗
            </a>
          </div>
      `;

      areasInPlane.forEach(areaName => {
        totalRenderedAreas++;
        const areaChests = areaMap.get(areaName);
        const areaKey = planeName + '_' + areaName;
        const isCollapsed = collapsedAreas.has(areaKey);

        // エリア本来の全宝箱数と開封数
        const allChestsInArea = CHESTS_DATA.filter(c => c.plane === planeName && c.area === areaName);
        const areaTotal = allChestsInArea.length;
        const areaOpened = allChestsInArea.filter(c => checkedChests.has(c.id)).length;
        const areaPct = areaTotal > 0 ? ((areaOpened / areaTotal) * 100).toFixed(0) : 0;

        html += `
          <div class="chest-area-panel ${isCollapsed ? 'collapsed' : ''}" id="area-panel-${areaKey.replace(/[^a-zA-Z0-9_]/g, '_')}">
            <div class="chest-area-header" onclick="window.toggleAreaCollapse('${areaKey}')">
              <div class="chest-area-title-group">
                <span class="chest-area-toggle-icon">▼</span>
                <h4 class="chest-area-title">${escapeHtml(areaName)}</h4>
                <span class="badge badge-normal" style="font-size:0.75rem;">${areaChests.length} 個表示中</span>
                ${allChestsInArea.some(c => c.missable) ? '<span class="badge badge-missable" style="font-size:0.72rem;">⚠️ 期間限定あり</span>' : ''}
              </div>
              <div class="chest-area-progress-group">
                <div class="chest-area-progress-bar-bg">
                  <div class="chest-area-progress-bar-fill" style="width:${areaPct}%;"></div>
                </div>
                <span class="chest-area-progress-text">${areaOpened} / ${areaTotal} (${areaPct}%)</span>
              </div>
            </div>

            <div class="chest-cards-grid">
        `;

        areaChests.forEach(c => {
          const isOpened = checkedChests.has(c.id);
          const isStar = c.type.includes('宝箱*');

          html += `
            <div class="chest-card ${isOpened ? 'is-opened' : ''} ${c.missable ? 'is-missable' : ''}" data-chest-id="${c.id}">
              <label class="chest-card-checkbox" title="${isOpened ? '開封済み (クリックで未開封に戻す)' : '未開封 (クリックで開封済みにする)'}">
                <input type="checkbox" ${isOpened ? 'checked' : ''} onchange="window.toggleChest('${c.id}')">
              </label>
              <div class="chest-card-body">
                <div class="chest-card-header">
                  <span class="badge ${isStar ? 'badge-star' : 'badge-normal'}">${isStar ? '⭐ 宝箱*' : '📦 宝箱'}</span>
                  <span class="chest-num">#${escapeHtml(c.number || '-')}</span>
                  <strong class="chest-item-name">${escapeHtml(c.item)}</strong>
                  ${c.missable ? '<span class="badge badge-missable">⚠️ 期間限定</span>' : ''}
                </div>
                <div class="chest-card-loc">
                  <span class="loc-map">📍 ${escapeHtml(c.mapName)}</span>
                  <span class="loc-coord">座標: <code>${escapeHtml(c.coord || '-')}</code></span>
                </div>
                ${c.note ? `<div class="chest-card-note">${escapeHtml(c.note)}</div>` : ''}
                ${c.missable ? `<div class="chest-missable-reason">⚠️ <strong>消滅条件:</strong> ${escapeHtml(c.missableReason)}</div>` : ''}
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    if (totalRenderedAreas === 0) {
      html += `
        <div style="text-align:center; padding:48px 20px; background:#fff; border:1px solid var(--border-light); border-radius:var(--radius-md); color:var(--text-muted);">
          <p style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">条件に合致する宝箱が見つかりませんでした</p>
          <p style="font-size:0.85rem;">検索条件やフィルターを緩和してお試しください。</p>
        </div>
      `;
    }

    html += `</div>`;

    container.innerHTML = html;

    // 検索入力＆チェックボックスのイベントバインド
    const searchBox = document.getElementById('chest-search-box');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        chestSearchQuery = e.target.value.trim();
        renderChestsTab();
        // 入力フォーカスを維持
        const newSearchBox = document.getElementById('chest-search-box');
        if (newSearchBox) {
          newSearchBox.focus();
          newSearchBox.selectionStart = newSearchBox.selectionEnd = newSearchBox.value.length;
        }
      });
    }

    const chkUnopened = document.getElementById('chk-chest-unopened');
    if (chkUnopened) {
      chkUnopened.addEventListener('change', (e) => {
        chestOnlyUnchecked = e.target.checked;
        renderChestsTab();
      });
    }

    const chkMissable = document.getElementById('chk-chest-missable');
    if (chkMissable) {
      chkMissable.addEventListener('change', (e) => {
        chestOnlyMissable = e.target.checked;
        renderChestsTab();
      });
    }

    const chkStar = document.getElementById('chk-chest-star');
    if (chkStar) {
      chkStar.addEventListener('change', (e) => {
        chestOnlyStar = e.target.checked;
        renderChestsTab();
      });
    }
  }
"""

# renderCollectionsTab の直後に renderChestsTab を挿入
old_render_coll_end = "renderCollectionsTab();\n  }"
assert "function renderCollectionsTab()" in app_js, "renderCollectionsTab not found"

# 挿入箇所を特定
idx_coll = app_js.find("function renderCollectionsTab()")
idx_level = app_js.find("function renderLevelingTab()")
assert idx_coll != -1 and idx_level != -1, "Tabs functions not found"

app_js = app_js[:idx_level] + render_chests_fn + "\n\n  " + app_js[idx_level:]

# 5. updateUI に renderChestsTab() を追加
old_update_ui = """    renderStoryTab();
    renderCollectionsTab();"""
new_update_ui = """    renderStoryTab();
    renderCollectionsTab();
    renderChestsTab();"""
assert old_update_ui in app_js, "updateUI block not found"
app_js = app_js.replace(old_update_ui, new_update_ui, 1)

# 6. バックアップ/復元に chests を含める
old_backup = """            magicNotes: Array.from(checkedMagicNotes),
            mimicCoins: Array.from(checkedMimicCoins),
            records: Array.from(checkedRecords)"""
new_backup = """            magicNotes: Array.from(checkedMagicNotes),
            mimicCoins: Array.from(checkedMimicCoins),
            records: Array.from(checkedRecords),
            chests: Array.from(checkedChests)"""
assert old_backup in app_js, "backup export block not found"
app_js = app_js.replace(old_backup, new_backup, 1)

old_import = """            if (Array.isArray(parsed.mimicCoins)) checkedMimicCoins = new Set(parsed.mimicCoins);
            if (Array.isArray(parsed.records)) checkedRecords = new Set(parsed.records);"""
new_import = """            if (Array.isArray(parsed.mimicCoins)) checkedMimicCoins = new Set(parsed.mimicCoins);
            if (Array.isArray(parsed.records)) checkedRecords = new Set(parsed.records);
            if (Array.isArray(parsed.chests)) checkedChests = new Set(parsed.chests);"""
assert old_import in app_js, "backup import block not found"
app_js = app_js.replace(old_import, new_import, 1)

old_alert = """・ハズレコイン: ${checkedMimicCoins.size}枚\\n・成績項目: ${checkedRecords.size}件`);"""
new_alert = """・ハズレコイン: ${checkedMimicCoins.size}枚\\n・成績項目: ${checkedRecords.size}件\\n・宝箱: ${checkedChests.size}個`);"""
assert old_alert in app_js, "backup alert not found"
app_js = app_js.replace(old_alert, new_alert, 1)

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(app_js)

print("Updated js/app.js successfully!")
