// マジカルバケーション 攻略サポート - アプリケーションロジック
// 端末内 localStorage で進捗を管理（外部通信なし・完全静的）

(function() {
  'use strict';

  // LocalStorage Keys
  const STORAGE_KEY = 'magivaca_spirit_checklist_v1';
  const STORAGE_KEY_MAGIC_NOTES = 'magivaca_magic_notes_v1';
  const STORAGE_KEY_MIMIC_COINS = 'magivaca_mimic_coins_v1';
  const STORAGE_KEY_RECORDS = 'magivaca_records_v1';
  const STORAGE_KEY_CHESTS = 'magivaca_chest_checklist_v1';
  const STORAGE_KEY_TIMELINE = 'magivaca_timeline_checklist_v1';

  // Helper: 全角数字を半角数字に変換して正規化する共通関数
  function normalizeMapName(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .trim();
  }

  // Helper: 文字列から一意かつ再現可能な整数ハッシュ値を算出する関数
  function getDeterministicHash(str) {
    let hash = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Helper: エリア地形テーマ（森・洞窟・火山・水辺・遺跡など）のスタイル定義
  function getAreaTheme(areaName) {
    const name = areaName || '';
    if (/洞窟|穴|風穴|鉱山|魔窟|地下|ジェラ/.test(name)) {
      return {
        type: 'cave',
        label: '洞窟・坑道',
        bgGradStart: '#f8fafc',
        bgGradEnd: '#f1f5f9',
        dotColor: '#94a3b8',
        borderColor: '#cbd5e1',
        pathBase: '#e2e8f0',
        pathStroke: '#64748b',
        nodeDefaultBg: '#ffffff',
        nodeDefaultStroke: '#cbd5e1',
        themeIcon: '🪨'
      };
    }
    if (/森|密林|樹海|ヴァレンシア|ミモレット|エニグマ|キャンプ|平原/.test(name)) {
      return {
        type: 'forest',
        label: '森林・自然',
        bgGradStart: '#f7faf7',
        bgGradEnd: '#f0f5f0',
        dotColor: '#86efac',
        borderColor: '#bbf7d0',
        pathBase: '#e2e8f0',
        pathStroke: '#52796f',
        nodeDefaultBg: '#ffffff',
        nodeDefaultStroke: '#cbd5e1',
        themeIcon: '🌲'
      };
    }
    if (/火山|砂漠|荒廃|モルビエ|クムヤムト|タンドーリ/.test(name)) {
      return {
        type: 'volcano_desert',
        label: '火山・荒野',
        bgGradStart: '#fdfbf7',
        bgGradEnd: '#fff7ed',
        dotColor: '#fed7aa',
        borderColor: '#fed7aa',
        pathBase: '#ffedd5',
        pathStroke: '#c2410c',
        nodeDefaultBg: '#ffffff',
        nodeDefaultStroke: '#e2e8f0',
        themeIcon: '🏜️'
      };
    }
    if (/水|城|アクア|沼|湿地|湖|タピオカティ/.test(name)) {
      return {
        type: 'water',
        label: '水辺・城郭',
        bgGradStart: '#f0f9ff',
        bgGradEnd: '#e0f2fe',
        dotColor: '#7dd3fc',
        borderColor: '#bae6fd',
        pathBase: '#e0f2fe',
        pathStroke: '#0284c7',
        nodeDefaultBg: '#ffffff',
        nodeDefaultStroke: '#cbd5e1',
        themeIcon: '💧'
      };
    }
    // デフォルト: 遺跡・塔・宮殿・ピラミッド・古代回廊
    return {
      type: 'ruins',
      label: '遺跡・回廊',
      bgGradStart: '#fafaf9',
      bgGradEnd: '#f5f5f4',
      dotColor: '#d6d3d1',
      borderColor: '#e7e5e4',
      pathBase: '#e7e5e4',
      pathStroke: '#78716c',
      nodeDefaultBg: '#ffffff',
      nodeDefaultStroke: '#cbd5e1',
      themeIcon: '🏛️'
    };
  }

  // Helper: 模式図ノードから対応する宝箱カードへのスムーズスクロール
  function scrollToMapChest(nodeName) {
    if (!nodeName || typeof document === 'undefined') return;
    const norm = normalizeMapName(nodeName).toLowerCase();
    const cards = document.querySelectorAll('.chest-card');
    for (const card of cards) {
      const locEl = card.querySelector('.loc-map');
      if (locEl) {
        const txt = normalizeMapName(locEl.textContent).toLowerCase();
        if (txt.includes(norm) || norm.includes(txt)) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('chest-card-highlight');
          setTimeout(() => {
            card.classList.remove('chest-card-highlight');
          }, 2000);
          return;
        }
      }
    }
  }
  window.scrollToMapChest = scrollToMapChest;

  // State: Checklists
  let checkedSpirits = new Set();
  let checkedMagicNotes = new Set();
  let checkedMimicCoins = new Set();
  let checkedRecords = new Set();
  let checkedChests = new Set();
  let checkedTimeline = new Set();

  // State: Timeline Tab (Phase 10)
  let timelineCategoryFilter = 'all'; // 'all' | 'spirit' | 'chest' | 'event'
  let timelineGroupFilter = 'all'; // 'all' | 'matter' | 'light' | 'dark' | 'death' | 'garam' | 'undetermined'
  let timelineOnlyUnchecked = false;

  // State: Chests Tab
  let chestPlane = 'all';
  let chestSearchQuery = '';
  let chestOnlyUnchecked = false;
  let chestOnlyMissable = false;
  let chestOnlyStar = false;
let garamSelectedFloor = 1;
let garamViewMode = 'floor'; // 'floor' or 'all'
let lidonahySelectedSubmap = 'リドナヒー4';
let selectedShanilSubmaps = {}; // areaKey -> submapId
let shanilViewModes = {}; // areaKey -> 'map' or 'schematic'
let collapsedMaps = new Set();
  let collapsedAreas = new Set();

  // State: Spirits Filter
  let currentFilters = {
    element: 'all',
    plane: 'all',
    reqTag: 'all',
    onlyWarning: false,
    hideCompleted: false,
    planeProgressOnly: false,
    query: ''
  };

  // State: Items Tab
  let itemCategory = 'all';
  let itemEquipSlot = 'all';
  let itemSearchQuery = '';
  let lookupQuery = '';

  // State: Monsters Tab
  let monsterSearchQuery = '';
  let monsterSelectedElement = 'all';
  let monsterTypeFilter = 'all'; // 'all' | 'regular' | 'boss'

  // State: Story Tab
  let storyPlane = 'all';

  // State: Collections Tab
  let collectionSubTab = 'notes'; // notes | coins | records
  let collectionOnlyMissable = false;
  let collectionOnlyUnchecked = false;
  let collectionPlane = 'all';

  // Tab switching helper
  window.switchTab = function(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    let activeBtn = null;
    tabBtns.forEach(b => {
      if (b.dataset.tab === tabId) {
        b.classList.add('active');
        activeBtn = b;
      } else {
        b.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-content').forEach(tc => {
      if (tc.id === tabId) {
        tc.classList.add('active');
      } else {
        tc.classList.remove('active');
      }
    });

    // スマホの横スクロールタブバーで選択中タブが見える位置へスムーズスクロール
    if (activeBtn && activeBtn.scrollIntoView) {
      try {
        activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      } catch (e) {}
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load state from localStorage
  function loadState() {
    try {
      const savedSpirits = localStorage.getItem(STORAGE_KEY);
      if (savedSpirits) {
        const arr = JSON.parse(savedSpirits);
        if (Array.isArray(arr)) checkedSpirits = new Set(arr);
      }

      const savedNotes = localStorage.getItem(STORAGE_KEY_MAGIC_NOTES);
      if (savedNotes) {
        const arr = JSON.parse(savedNotes);
        if (Array.isArray(arr)) checkedMagicNotes = new Set(arr);
      }

      const savedCoins = localStorage.getItem(STORAGE_KEY_MIMIC_COINS);
      if (savedCoins) {
        const arr = JSON.parse(savedCoins);
        if (Array.isArray(arr)) checkedMimicCoins = new Set(arr);
      }

      const savedRecs = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecs) {
        const arr = JSON.parse(savedRecs);
        if (Array.isArray(arr)) checkedRecords = new Set(arr);
      }

      const savedChests = localStorage.getItem(STORAGE_KEY_CHESTS);
      if (savedChests) {
        const arr = JSON.parse(savedChests);
        if (Array.isArray(arr)) checkedChests = new Set(arr);
      }

      const savedTimeline = localStorage.getItem(STORAGE_KEY_TIMELINE);
      if (savedTimeline) {
        const arr = JSON.parse(savedTimeline);
        if (Array.isArray(arr)) checkedTimeline = new Set(arr);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  // Save state to localStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedSpirits)));
      localStorage.setItem(STORAGE_KEY_MAGIC_NOTES, JSON.stringify(Array.from(checkedMagicNotes)));
      localStorage.setItem(STORAGE_KEY_MIMIC_COINS, JSON.stringify(Array.from(checkedMimicCoins)));
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(Array.from(checkedRecords)));
      localStorage.setItem(STORAGE_KEY_CHESTS, JSON.stringify(Array.from(checkedChests)));
      localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(Array.from(checkedTimeline)));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  // Toggle helpers
  function toggleSpirit(id) {
    if (checkedSpirits.has(id)) {
      checkedSpirits.delete(id);
    } else {
      checkedSpirits.add(id);
    }
    saveState();
    updateProgressUI();
    renderSpiritsList();
    renderCompleteGuideTab();
    renderTimelineTab();
  }

  function toggleMagicNote(no) {
    if (checkedMagicNotes.has(no)) {
      checkedMagicNotes.delete(no);
    } else {
      checkedMagicNotes.add(no);
    }
    saveState();
    renderCollectionsTab();
  }

  // Chest Toggle Helpers
  function toggleChest(id) {
    if (checkedChests.has(id)) {
      checkedChests.delete(id);
    } else {
      checkedChests.add(id);
    }
    saveState();
    renderChestsTab();
    renderTimelineTab();
  }
  window.toggleChest = toggleChest;

  // Timeline Toggle Helpers (Phase 10)
  function toggleTimelineItem(timelineId) {
    if (checkedTimeline.has(timelineId)) {
      checkedTimeline.delete(timelineId);
    } else {
      checkedTimeline.add(timelineId);
    }
    saveState();
    renderTimelineTab();
  }
  window.toggleTimelineItem = toggleTimelineItem;

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
        const normQ = normalizeMapName(q).toLowerCase();
        const normMap = normalizeMapName(c.mapName).toLowerCase();
        const mMap = normMap.includes(normQ) || c.mapName.toLowerCase().includes(q);
        const mArea = c.area.toLowerCase().includes(q);
        const mItem = c.item.toLowerCase().includes(q);
        const mNote = c.note.toLowerCase().includes(q);
        const mCoord = c.coord.includes(q);
        if (!mMap && !mArea && !mItem && !mNote && !mCoord) return false;
      }
      return true;
    });
  }


  function toggleMimicCoin(id) {
    if (checkedMimicCoins.has(id)) {
      checkedMimicCoins.delete(id);
    } else {
      checkedMimicCoins.add(id);
    }
    saveState();
    renderCollectionsTab();
  }

  function toggleRecord(category) {
    if (checkedRecords.has(category)) {
      checkedRecords.delete(category);
    } else {
      checkedRecords.add(category);
    }
    saveState();
    renderCollectionsTab();
  }

  // Calculate Progress for Spirits
  function calculateProgress() {
    const total = SPIRITS_DATA.length;
    const checkedCount = checkedSpirits.size;
    const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

    const elemCounts = {};
    for (const elemName in ELEMENT_META) {
      elemCounts[elemName] = { total: 0, checked: 0 };
    }

    SPIRITS_DATA.forEach(s => {
      if (elemCounts[s.element]) {
        elemCounts[s.element].total++;
        if (checkedSpirits.has(s.id)) {
          elemCounts[s.element].checked++;
        }
      }
    });

    return { total, checkedCount, percent, elemCounts };
  }

  // Update Global Header Progress & Element Tracker Chips
  function updateProgressUI() {
    const prog = calculateProgress();

    const countEl = document.getElementById('overall-progress-count');
    const barEl = document.getElementById('overall-progress-bar');
    if (countEl) countEl.textContent = `${prog.checkedCount} / ${prog.total} 体 (${prog.percent}%)`;
    if (barEl) barEl.style.width = `${prog.percent}%`;

    const grid = document.getElementById('element-tracker-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // "All" chip
    const allChip = document.createElement('div');
    allChip.className = `element-chip ${currentFilters.element === 'all' ? 'selected' : ''}`;
    allChip.innerHTML = `
      <span class="chip-dot" style="background:#475569;"></span>
      <span class="chip-name">全属性</span>
      <span class="chip-count">${prog.checkedCount}/${prog.total}</span>
    `;
    allChip.addEventListener('click', () => {
      setElementFilter('all');
    });
    grid.appendChild(allChip);

    // 16 Element Chips
    for (const elemName in ELEMENT_META) {
      const meta = ELEMENT_META[elemName];
      const counts = prog.elemCounts[elemName] || { total: 7, checked: 0 };
      const isSelected = currentFilters.element === elemName;
      const isComplete = counts.checked === counts.total && counts.total > 0;

      const chip = document.createElement('div');
      chip.className = `element-chip ${isSelected ? 'selected' : ''} ${isComplete ? 'completed' : ''}`;
      chip.innerHTML = `
        <span class="chip-dot" style="background:${meta.color};"></span>
        <span class="chip-name">${elemName}</span>
        <span class="chip-count">${counts.checked}/${counts.total}</span>
      `;
      chip.addEventListener('click', () => {
        if (currentFilters.element === elemName) {
          setElementFilter('all');
        } else {
          setElementFilter(elemName);
        }
      });
      grid.appendChild(chip);
    }

    // アコーディオン要約ラベルの更新 (スマホ表示用)
    const accordionLabel = document.getElementById('elem-filter-current-label');
    if (accordionLabel) {
      if (currentFilters.element === 'all') {
        accordionLabel.textContent = `属性フィルター: すべて (${prog.checkedCount} / ${prog.total})`;
      } else {
        const counts = prog.elemCounts[currentFilters.element] || { total: 7, checked: 0 };
        const meta = ELEMENT_META[currentFilters.element];
        const icon = meta ? meta.icon : '✨';
        accordionLabel.textContent = `属性フィルター: ${icon} ${currentFilters.element} (${counts.checked} / ${counts.total})`;
      }
    }
  }

  function setElementFilter(elem) {
    currentFilters.element = elem;
    updateProgressUI();
    renderSpiritsList();

    // スマホ幅の場合、選択後にアコーディオンを自動で閉じる
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const accordion = document.getElementById('element-filter-accordion');
      if (accordion) accordion.classList.remove('expanded');
      const toggle = document.getElementById('element-filter-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Filter Spirits (including Phase 5 Plane Progress Linked Filter)
  function getFilteredSpirits() {
    const q = currentFilters.query.toLowerCase().trim();

    return SPIRITS_DATA.filter(s => {
      // Element
      if (currentFilters.element !== 'all' && s.element !== currentFilters.element) {
        return false;
      }

      // Plane
      if (currentFilters.plane !== 'all' && !s.planes.includes(currentFilters.plane)) {
        return false;
      }

      // Req Tag
      if (currentFilters.reqTag !== 'all' && !s.reqTags.includes(currentFilters.reqTag)) {
        return false;
      }

      // Warning only
      if (currentFilters.onlyWarning && !s.missable) {
        return false;
      }

      // Hide completed
      if (currentFilters.hideCompleted && checkedSpirits.has(s.id)) {
        return false;
      }

      // Phase 5: Plane Progress Linked Filter (選択プレーンの未収集のみ)
      if (currentFilters.planeProgressOnly) {
        if (checkedSpirits.has(s.id)) return false;
        if (currentFilters.plane !== 'all' && !s.planes.includes(currentFilters.plane)) {
          return false;
        }
      }

      // Keyword Search (名前、居場所、詳細、要求、条件、備考、警告)
      if (q) {
        const searchTarget = [
          s.element,
          s.spiritName,
          s.locationRaw,
          s.locationClean,
          s.locationDetail,
          s.condition,
          s.requirement,
          s.remarks,
          s.missable || '',
          s.reqTags ? s.reqTags.join(' ') : ''
        ].join(' ').toLowerCase();

        if (!searchTarget.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }

  // Render Spirits Cards (完全復元・正しいデータフィールド参照)
  function renderSpiritsList() {
    const container = document.getElementById('spirits-container');
    const summaryEl = document.getElementById('filter-results-summary');
    if (!container) return;

    const filtered = getFilteredSpirits();

    if (summaryEl) {
      summaryEl.textContent = `表示中: ${filtered.length} 体 / 全 ${SPIRITS_DATA.length} 体`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-muted);">
          <p>該当する精霊が見つかりませんでした。</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">条件や検索キーワードを変更してください。</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    filtered.forEach(s => {
      const isChecked = checkedSpirits.has(s.id);
      const meta = ELEMENT_META[s.element] || { color: '#888', symbol: s.element };

      const card = document.createElement('div');
      card.className = `spirit-card ${isChecked ? 'checked' : ''} ${s.missable ? 'has-warning' : ''}`;
      card.dataset.id = s.id;

      // Plane Badges HTML
      const planeBadges = s.planes.map(p => {
        let cls = 'badge-plane-light';
        if (p.includes('闇')) cls = 'badge-plane-dark';
        if (p.includes('死')) cls = 'badge-plane-death';
        return `<span class="badge ${cls}">${escapeHtml(p)}</span>`;
      }).join(' ');

      // Warning HTML
      const warningHtml = s.missable ? `
        <div class="spirit-warning-box">
          <span class="warning-icon">⚠️</span>
          <div class="warning-body">
            <strong>【取り返しのつかない要素】</strong><br>
            ${escapeHtml(s.missable)}
          </div>
        </div>
      ` : '';

      // Requirement HTML
      const reqVal = s.requirement || '-';
      const condVal = s.condition ? `
        <div class="detail-row">
          <span class="detail-key">出現条件</span>
          <span class="detail-val">${escapeHtml(s.condition)}</span>
        </div>
      ` : '';

      // Remarks HTML
      const remarksVal = s.remarks && s.remarks !== '-' ? `
        <div class="spirit-remarks">
          ${escapeHtml(s.remarks)}
        </div>
      ` : '';

      card.innerHTML = `
        <div class="card-header">
          <div class="card-title-group">
            <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''} aria-label="${escapeHtml(s.element)}の精霊${s.index}チェック">
            <span class="elem-badge-icon" style="background:${meta.color};">${meta.symbol}</span>
            <div class="spirit-title">
              <div class="spirit-main-name">
                ${escapeHtml(s.element)}の精霊 ${escapeHtml(s.spiritName)}
              </div>
              <span class="spirit-sub-num">${escapeHtml(s.element)} #${s.index}</span>
            </div>
          </div>
          <div class="card-badges">
            ${planeBadges}
          </div>
        </div>

        <div class="card-body">
          <div class="detail-row">
            <span class="detail-key">居場所</span>
            <span class="detail-val"><strong>${escapeHtml(s.locationClean)}</strong> ${s.locationDetail ? `<span style="color:var(--text-muted);">(${escapeHtml(s.locationDetail)})</span>` : ''}</span>
          </div>
          ${condVal}
          <div class="detail-row">
            <span class="detail-key">要求</span>
            <span class="detail-val requirement-highlight">${escapeHtml(reqVal)}</span>
          </div>
          ${remarksVal}
          ${warningHtml}
        </div>

        <div class="card-footer">
          <span>タグ: ${escapeHtml(s.reqTags ? s.reqTags.join(', ') : '-')}</span>
          <a href="${escapeHtml(s.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="source-link" title="一次情報Wikiの該当節を開く">
            出典Wiki ↗
          </a>
        </div>
      `;

      // Event listener for checkbox & card click
      const chk = card.querySelector('.custom-checkbox');
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSpirit(s.id);
      });

      card.addEventListener('click', (e) => {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'a') return;
        toggleSpirit(s.id);
      });

      container.appendChild(card);
    });
  }

  // Render Complete Guide Tab with Dynamic Warnings (完全復元・正しいデータ参照)
  function renderCompleteGuideTab() {
    const container = document.getElementById('complete-guide-tab-content');
    if (!container) return;

    const prog = calculateProgress();
    const darkChecked = prog.elemCounts['闇'] ? prog.elemCounts['闇'].checked : 0;
    const lightChecked = prog.elemCounts['光'] ? prog.elemCounts['光'].checked : 0;
    const fire3Checked = checkedSpirits.has('火_3');

    let dynamicAlertHtml = '';
    if (darkChecked > 0 && lightChecked < 7) {
      dynamicAlertHtml = `
        <div class="warning-callout" style="margin-bottom: 16px;">
          <h3>⚠️【重要警告】現在、闇の精霊（ニルヴァ）が ${darkChecked} 体チェックされています！</h3>
          <p>
            光の精霊（ルクス）は、仲間にしているニルヴァの数が多いと出現・加入しなくなります（最も厳しいリドナヒー10は『ニルヴァ1体以下』）。<br>
            <strong>必ず光の精霊7体をコンプリートしてから、残りの闇精霊を仲間にしてください。</strong>
          </p>
        </div>
      `;
    }

    let fireAlertHtml = '';
    if (!fire3Checked) {
      fireAlertHtml = `
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.85rem; color: #92400e;">
          <strong>🔔 ずんどこ穴のトースト（火_3）はまだ未チェックです</strong>
          <p style="margin-top:2px;">
            闇のプレーン「ずんどこ穴」でドワーフを1人でも説得すると二度と出現しなくなります。ドワーフ説得前に必ずミーロリ銀貨4枚を渡して仲間にしてください。
          </p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="guide-section">
        <h2>⚠️ 精霊コンプリートの手順と必須ルール</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          取り返しのつかない要素や加入制限が非常に多いため、必ず以下の順序を守って進行してください。
        </p>

        ${dynamicAlertHtml}
        ${fireAlertHtml}

        <div class="filter-card" style="margin-bottom:18px;">
          <h3 style="font-size:1.05rem; color:var(--accent); margin-bottom:8px;">🏆 推奨コンプリート順序（鉄則）</h3>
          <div style="font-size:0.92rem; font-weight:bold; color:var(--text-primary); line-height:1.6;">
            1. 愛の精霊（カエル捕獲0個〜少数） ➔ 2. 光の精霊（ニルヴァ1体以下〜） ➔ 3. 闇の精霊（カエル大量捕獲）
          </div>
          <p style="font-size:0.83rem; color:var(--text-muted); margin-top:4px;">
            一次情報出典: <a href="https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A#k55e4a54" target="_blank" rel="noopener noreferrer">攻略Wiki 精霊コンプリート節</a>
          </p>
        </div>

        <h3 style="font-size:1.05rem; color:var(--text-primary); margin-bottom:12px;">🚨 6大必須ルールと消滅警告</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${COMP_GUIDE.critical_rules.map((r, i) => `
            <div class="story-card missable" style="margin-bottom:0;">
              <div style="font-weight:700; color:var(--warning-text); margin-bottom:4px; font-size:0.95rem;">
                ${i+1}. ${escapeHtml(r.title)}
              </div>
              <div style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5;">
                ${escapeHtml(r.desc)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Tab: Items Database & Reverse Lookup (Phase 5 - Priority 1 & 4)
  // ==========================================================================
  function renderItemsTab() {
    const container = document.getElementById('items-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>📦 アイテム図鑑 ＆ 逆引きドロップ検索</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          Wiki記載の全アイテム（回復・装備品・MDパーツ・その他）の性能と入手先、および<strong>アイテム名から落とすマップと確率を逆引きできる検索機能</strong>です。
        </p>

        <!-- Reverse Lookup Card -->
        <div class="lookup-card">
          <h3>🎯 アイテム逆引きドロップ検索</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:10px;">
            アイテム名を入力すると、そのアイテムが<strong>「どのマップで何％でドロップするか」「道具屋で買えるか」</strong>を即座に調べられます。
          </p>
          <div class="lookup-input-row">
            <input type="text" id="item-lookup-input" class="search-input" placeholder="アイテム名を入力... (例: スカンピ, レザー, カエルグミ, ミーロリ, まつぼっくり)" value="${escapeHtml(lookupQuery)}">
            <button type="button" class="btn btn-primary" id="btn-do-lookup">検索</button>
            <button type="button" class="btn btn-secondary" id="btn-clear-lookup">クリア</button>
          </div>
          <div id="lookup-results-area">
            <!-- Results rendered here -->
          </div>
        </div>

        <!-- Category Sub Tabs -->
        <div class="sub-tab-nav" id="item-sub-tabs">
          <button type="button" class="sub-tab-btn ${itemCategory === 'all' ? 'active' : ''}" data-cat="all">すべて</button>
          <button type="button" class="sub-tab-btn ${itemCategory === '回復・補助' ? 'active' : ''}" data-cat="回復・補助">💊 回復・補助 (${ITEM_RECOVERY_DATA.length})</button>
          <button type="button" class="sub-tab-btn ${itemCategory === '装備品' ? 'active' : ''}" data-cat="装備品">🛡️ 装備品 (${ITEM_EQUIP_DATA.length})</button>
          <button type="button" class="sub-tab-btn ${itemCategory === 'セット効果' ? 'active' : ''}" data-cat="セット効果">✨ セット防具 (${ITEM_EQUIP_SETS.length})</button>
          <button type="button" class="sub-tab-btn ${itemCategory === 'MDパーツ' ? 'active' : ''}" data-cat="MDパーツ">🤖 MDパーツ (${ITEM_MD_DATA.length})</button>
          <button type="button" class="sub-tab-btn ${itemCategory === '貴重品・その他' ? 'active' : ''}" data-cat="貴重品・その他">📜 その他 (${ITEM_OTHER_DATA.length})</button>
        </div>

        <!-- Filter bar for Items -->
        <div class="filter-card" style="margin-bottom:16px;">
          <div class="search-box-row">
            <div class="search-input-wrapper">
              <input type="text" id="item-table-search" class="search-input" placeholder="🔍 表内キーワード検索... (名称、効果、入手方法)" value="${escapeHtml(itemSearchQuery)}">
            </div>
            ${itemCategory === '装備品' ? `
              <div class="filter-chips">
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'all' ? 'active' : ''}" data-slot="all">全部位</button>
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'あたま' ? 'active' : ''}" data-slot="あたま">あたま</button>
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'うで' ? 'active' : ''}" data-slot="うで">うで</button>
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'からだ' ? 'active' : ''}" data-slot="からだ">からだ</button>
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'あし' ? 'active' : ''}" data-slot="あし">あし</button>
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'アクセサリー' ? 'active' : ''}" data-slot="アクセサリー">アクセ</button>
                <button type="button" class="filter-btn equip-slot-btn ${itemEquipSlot === 'シール' ? 'active' : ''}" data-slot="シール">シール</button>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Item Tables Container -->
        <div id="item-tables-display">
          <!-- Rendered below -->
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/%E5%9B%9E%E5%BE%A9%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0" target="_blank" rel="noopener noreferrer">回復アイテム</a> |
          <a href="https://wikiwiki.jp/magivaca/%E8%A3%85%E5%82%99%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0" target="_blank" rel="noopener noreferrer">装備アイテム</a> |
          <a href="https://wikiwiki.jp/magivaca/MD%E3%83%91%E3%83%BC%E3%83%84" target="_blank" rel="noopener noreferrer">MDパーツ</a> |
          <a href="https://wikiwiki.jp/magivaca/%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0%E5%88%A5%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E7%A2%BA%E7%8E%87%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener noreferrer">アイテム別ドロップ確率一覧</a>
        </div>
      </div>
    `;

    renderLookupResults();
    renderItemTables();

    // Event listeners
    const subTabBtns = container.querySelectorAll('#item-sub-tabs .sub-tab-btn');
    subTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        itemCategory = btn.dataset.cat;
        renderItemsTab();
      });
    });

    const slotBtns = container.querySelectorAll('.equip-slot-btn');
    slotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        itemEquipSlot = btn.dataset.slot;
        renderItemsTab();
      });
    });

    const searchInput = document.getElementById('item-table-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        itemSearchQuery = e.target.value.trim().toLowerCase();
        renderItemTables();
      });
    }

    const lookupInput = document.getElementById('item-lookup-input');
    const doLookupBtn = document.getElementById('btn-do-lookup');
    const clearLookupBtn = document.getElementById('btn-clear-lookup');

    if (doLookupBtn && lookupInput) {
      doLookupBtn.addEventListener('click', () => {
        lookupQuery = lookupInput.value.trim();
        renderLookupResults();
      });
      lookupInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          lookupQuery = lookupInput.value.trim();
          renderLookupResults();
        }
      });
    }

    if (clearLookupBtn) {
      clearLookupBtn.addEventListener('click', () => {
        lookupQuery = '';
        if (lookupInput) lookupInput.value = '';
        renderLookupResults();
      });
    }
  }

  function renderLookupResults() {
    const resArea = document.getElementById('lookup-results-area');
    if (!resArea) return;

    if (!lookupQuery) {
      resArea.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted); padding:8px 0;">
          💡 人気の検索例: 
          <a href="javascript:void(0)" class="lookup-sample-tag" data-val="スカンピ">スカンピ</a>, 
          <a href="javascript:void(0)" class="lookup-sample-tag" data-val="レザー">レザー装備</a>, 
          <a href="javascript:void(0)" class="lookup-sample-tag" data-val="まつぼっくり">まつぼっくり</a>, 
          <a href="javascript:void(0)" class="lookup-sample-tag" data-val="カエルグミ">カエルグミ</a>, 
          <a href="javascript:void(0)" class="lookup-sample-tag" data-val="ミーロリ">ミーロリ銀貨</a>
        </div>
      `;
      resArea.querySelectorAll('.lookup-sample-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          lookupQuery = tag.dataset.val;
          const input = document.getElementById('item-lookup-input');
          if (input) input.value = lookupQuery;
          renderLookupResults();
        });
      });
      return;
    }

    const q = lookupQuery.toLowerCase();
    const matchedItems = Object.keys(ITEM_DROP_INDEX).filter(name => name.toLowerCase().includes(q));

    if (matchedItems.length === 0) {
      resArea.innerHTML = `
        <div class="lookup-result-box" style="color:var(--text-muted);">
          「${escapeHtml(lookupQuery)}」に該当するドロップデータは見つかりませんでした。<br>
          名称の一部（例: 「スカンピ」「レザー」「銀貨」等）で再度お試しください。
        </div>
      `;
      return;
    }

    let html = `<div class="lookup-result-box">`;
    html += `<div style="font-weight:600; margin-bottom:10px; color:var(--text-primary);">🎯 「${escapeHtml(lookupQuery)}」の検索結果（${matchedItems.length}件）:</div>`;

    matchedItems.slice(0, 10).forEach(itemName => {
      const dropList = ITEM_DROP_INDEX[itemName];
      html += `
        <div style="margin-bottom:14px; background:white; padding:10px 14px; border:1px solid var(--border-light); border-radius:var(--radius-sm);">
          <div style="font-weight:600; font-size:0.95rem; color:var(--accent); margin-bottom:6px;">
            📦 ${escapeHtml(itemName)} 
            <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">（ドロップ対象マップ: ${dropList.length}箇所）</span>
          </div>
          <div style="max-height:160px; overflow-y:auto; font-size:0.83rem;">
            <table class="data-table" style="margin:0;">
              <thead>
                <tr>
                  <th>マップ名</th>
                  <th>ドロップ確率 / 期待値</th>
                </tr>
              </thead>
              <tbody>
                ${dropList.map(d => `
                  <tr>
                    <td>${escapeHtml(d.map)}</td>
                    <td style="font-weight:600; color:#1e3a8a;">${escapeHtml(d.rate)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    if (matchedItems.length > 10) {
      html += `<div style="font-size:0.8rem; color:var(--text-muted);">他 ${matchedItems.length - 10} 件のアイテムが該当しました。より詳しい名称で絞り込んでください。</div>`;
    }

    html += `</div>`;
    resArea.innerHTML = html;
  }

  function renderItemTables() {
    const displayEl = document.getElementById('item-tables-display');
    if (!displayEl) return;

    const q = itemSearchQuery;
    let html = '';

    // 1. 回復アイテム
    if (itemCategory === 'all' || itemCategory === '回復・補助') {
      const filteredRecovery = ITEM_RECOVERY_DATA.filter(item => {
        if (!q) return true;
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.effect && item.effect.toLowerCase().includes(q)) ||
               (item.location && item.location.toLowerCase().includes(q));
      });

      if (filteredRecovery.length > 0) {
        html += `
          <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:16px;">💊 回復・補助アイテム (${filteredRecovery.length})</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:130px;">名称</th>
                  <th>効果・備考</th>
                  <th>入手場所</th>
                  <th style="width:90px;">値段</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecovery.map(it => `
                  <tr>
                    <td><strong>${escapeHtml(it.name)}</strong></td>
                    <td>${escapeHtml(it.effect)}</td>
                    <td>${escapeHtml(it.location)}</td>
                    <td><span class="badge ${it.price === '非売品' ? 'badge-warning' : 'badge-price'}">${escapeHtml(it.price)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    // 2. 装備アイテム
    if (itemCategory === 'all' || itemCategory === '装備品') {
      const filteredEquip = ITEM_EQUIP_DATA.filter(item => {
        if (itemEquipSlot !== 'all' && item.slot !== itemEquipSlot) return false;
        if (!q) return true;
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.slot && item.slot.toLowerCase().includes(q)) ||
               (item.desc && item.desc.toLowerCase().includes(q)) ||
               (item.shop && item.shop.toLowerCase().includes(q)) ||
               (item.chest && item.chest.toLowerCase().includes(q));
      });

      if (filteredEquip.length > 0) {
        html += `
          <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:20px;">🛡️ 装備アイテム (${filteredEquip.length})</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>部位</th>
                  <th>力</th>
                  <th>守</th>
                  <th>速</th>
                  <th>精</th>
                  <th>MP</th>
                  <th>入手方法（道具屋/宝箱/ドロップ）</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                ${filteredEquip.map(eq => `
                  <tr>
                    <td><strong>${escapeHtml(eq.name)}</strong></td>
                    <td><span class="badge badge-plane">${escapeHtml(eq.slot)}</span></td>
                    <td>${escapeHtml(eq.power)}</td>
                    <td>${escapeHtml(eq.def)}</td>
                    <td>${escapeHtml(eq.spd)}</td>
                    <td>${escapeHtml(eq.spi)}</td>
                    <td>${escapeHtml(eq.mp)}</td>
                    <td style="font-size:0.8rem;">
                      ${eq.shop !== '-' ? '店 ' : ''}${eq.chest !== '-' ? '箱 ' : ''}${eq.drop !== '-' ? '敵' : ''}
                    </td>
                    <td style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(eq.desc)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    // 3. 装備セット効果
    if (itemCategory === 'all' || itemCategory === 'セット効果') {
      const filteredSets = ITEM_EQUIP_SETS.filter(item => {
        if (!q) return true;
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.location && item.location.toLowerCase().includes(q));
      });

      if (filteredSets.length > 0) {
        html += `
          <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:20px;">✨ 装備セット効果 (${filteredSets.length})</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">同一シリーズの装備品（頭・腕・体・足・アクセ）を一式装備した際に発動するステータス補正値です。</p>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>セット名称</th>
                  <th>力</th>
                  <th>守</th>
                  <th>速</th>
                  <th>精</th>
                  <th>MP</th>
                  <th>入手方法</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSets.map(s => `
                  <tr>
                    <td><strong>${escapeHtml(s.name)}</strong></td>
                    <td>+${escapeHtml(s.power)}</td>
                    <td>+${escapeHtml(s.def)}</td>
                    <td>+${escapeHtml(s.spd)}</td>
                    <td>+${escapeHtml(s.spi)}</td>
                    <td>+${escapeHtml(s.mp)}</td>
                    <td>${escapeHtml(s.location)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    // 4. MDパーツ
    if (itemCategory === 'all' || itemCategory === 'MDパーツ') {
      const filteredMd = ITEM_MD_DATA.filter(item => {
        if (!q) return true;
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.type && item.type.toLowerCase().includes(q)) ||
               (item.desc && item.desc.toLowerCase().includes(q));
      });

      if (filteredMd.length > 0) {
        html += `
          <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:20px;">🤖 マジックドール（MD）パーツ (${filteredMd.length})</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>パーツ種別</th>
                  <th>入手方法</th>
                  <th>値段</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                ${filteredMd.map(p => `
                  <tr>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td><span class="badge badge-plane">${escapeHtml(p.type)}</span></td>
                    <td>${escapeHtml(p.location)}</td>
                    <td><span class="badge badge-price">${escapeHtml(p.price)}</span></td>
                    <td style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(p.desc)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    // 5. 貴重品・その他
    if (itemCategory === 'all' || itemCategory === '貴重品・その他') {
      const filteredOther = ITEM_OTHER_DATA.filter(item => {
        if (!q) return true;
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.desc && item.desc.toLowerCase().includes(q));
      });

      if (filteredOther.length > 0) {
        html += `
          <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:20px;">📜 その他・貴重品アイテム (${filteredOther.length})</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:180px;">名称</th>
                  <th>説明文・用途</th>
                </tr>
              </thead>
              <tbody>
                ${filteredOther.map(it => `
                  <tr>
                    <td><strong>${escapeHtml(it.name)}</strong></td>
                    <td>${escapeHtml(it.desc)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    if (!html) {
      displayEl.innerHTML = `
        <div class="empty-state">
          <p>条件に一致するアイテムが見つかりませんでした。</p>
        </div>
      `;
    } else {
      displayEl.innerHTML = html;
    }
  }

  // ==========================================================================
  // Tab: Monsters & Drop Rates (Phase 5 & 9 - Monster Encyclopedia)
  // ==========================================================================
  function renderMonstersTab() {
    const container = document.getElementById('monsters-tab-content');
    if (!container) return;

    // Build unified monster dataset (Regular 288 + Boss 13 = 301 total)
    const allMonsters = [];
    if (typeof REGULAR_MONSTERS_DATA !== 'undefined' && Array.isArray(REGULAR_MONSTERS_DATA)) {
      REGULAR_MONSTERS_DATA.forEach(m => {
        allMonsters.push({
          id: m.id || `mon_${m.number}`,
          number: m.number,
          name: m.name,
          level: m.level,
          element: m.element,
          locations: m.locations || [],
          size: m.size || '',
          description: m.description || '',
          url: m.url || 'https://wikiwiki.jp/magivaca/MonsterList',
          isBoss: false
        });
      });
    }

    if (typeof BOSS_MONSTERS_DATA !== 'undefined' && Array.isArray(BOSS_MONSTERS_DATA)) {
      BOSS_MONSTERS_DATA.forEach((b, idx) => {
        allMonsters.push({
          id: `boss_${idx + 1}`,
          number: 'BOSS',
          name: b.name,
          level: b.level,
          element: b.element,
          locations: [{ location: b.location, rate: b.rate }],
          size: '-',
          description: 'ボス・イベント戦闘モンスター（ゲーム内図鑑非掲載）',
          url: 'https://wikiwiki.jp/magivaca/MonsterList#boss',
          isBoss: true
        });
      });
    }

    // Filter by type, element, and query
    const filtered = allMonsters.filter(m => {
      if (monsterTypeFilter === 'regular' && m.isBoss) return false;
      if (monsterTypeFilter === 'boss' && !m.isBoss) return false;

      if (monsterSelectedElement !== 'all' && m.element !== monsterSelectedElement) return false;

      if (monsterSearchQuery) {
        const q = normalizeMapName(monsterSearchQuery).toLowerCase();
        const normName = normalizeMapName(m.name).toLowerCase();
        const normNum = normalizeMapName(m.number).toLowerCase();
        const matchName = normName.includes(q);
        const matchNum = normNum.includes(q);
        const matchLoc = m.locations.some(l => normalizeMapName(l.location).toLowerCase().includes(q));
        const matchElem = m.element.toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchLoc && !matchElem) return false;
      }

      return true;
    });

    const regularCount = allMonsters.filter(m => !m.isBoss).length;
    const bossCount = allMonsters.filter(m => m.isBoss).length;

    // Elements list
    const elementList = ['火', '風', '毒', '美', '刃', '音', '石', '虫', '木', '獣', '水', '雷', '古', '闇', '光', '愛'];

    // Helper: Find drops from ITEM_DROP_INDEX based on monster location maps
    function getMonsterDrops(m) {
      if (typeof ITEM_DROP_INDEX === 'undefined') return [];
      const drops = new Set();
      for (const loc of m.locations) {
        const normLoc = normalizeMapName(loc.location);
        for (const [itemName, dropList] of Object.entries(ITEM_DROP_INDEX)) {
          for (const d of dropList) {
            const normMap = normalizeMapName(d.map);
            if (normMap === normLoc || normLoc.includes(normMap) || normMap.includes(normLoc)) {
              drops.add(itemName);
              if (drops.size >= 4) break;
            }
          }
          if (drops.size >= 4) break;
        }
        if (drops.size >= 4) break;
      }
      return Array.from(drops);
    }

    container.innerHTML = `
      <div class="guide-section">
        <h2>👾 モンスター図鑑 ＆ ボス一覧 (全${allMonsters.length}体)</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:14px;">
          Wiki公式データに基づく通常モンスター全288種および図鑑非掲載ボス13体を完全網羅した総合図鑑です。<br>
          各モンスターの属性・LV・出現場所・出現確率・公式プロフィール・生息地のドロップアイテム情報を掲載しています。
        </p>

        <!-- Warning Callout for Monster Completing -->
        <div class="warning-callout" style="margin-bottom:18px;">
          <h3>⚠️ モンスター図鑑コンプリートの重大警告</h3>
          <p>
            ガラムマサラ（ずんどこ穴）50Fのボス#1<strong>「ディニレンドゥ」</strong>は、難易度「オニ」で文鳥を仲間にした時点で<strong>難易度に関わらず二度とフィールド上に出現しなくなります</strong>。<br>
            モンスター図鑑を埋めたい場合は、<strong>必ず1周目に難易度「ヌル」または「ナミ」で50階まで進め、ディニレンドゥを倒して図鑑登録してからオニに挑んでください</strong>。
          </p>
        </div>

        <!-- Filter Controls -->
        <div style="background:#f8fafc; border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:14px; margin-bottom:18px;">
          <!-- Search box & Type Filter Row -->
          <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:12px;">
            <div style="flex:1; min-width:240px;">
              <input type="text" id="monster-search-input" value="${escapeHtml(monsterSearchQuery)}" placeholder="🔍 モンスター名・番号・出現場所で検索..." class="input-text" style="width:100%; padding:8px 12px; font-size:0.95rem; border:1px solid var(--border-light); border-radius:6px;">
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="filter-btn monster-type-btn ${monsterTypeFilter === 'all' ? 'active' : ''}" data-type="all">すべて (${allMonsters.length})</button>
              <button type="button" class="filter-btn monster-type-btn ${monsterTypeFilter === 'regular' ? 'active' : ''}" data-type="regular">通常 (${regularCount})</button>
              <button type="button" class="filter-btn monster-type-btn ${monsterTypeFilter === 'boss' ? 'active' : ''}" data-type="boss">👑 ボス (${bossCount})</button>
            </div>
          </div>

          <!-- Element Chips Row -->
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); margin-right:4px;">属性:</span>
            <button type="button" class="chip-btn monster-elem-btn ${monsterSelectedElement === 'all' ? 'active' : ''}" data-elem="all">すべて</button>
            ${elementList.map(el => `
              <button type="button" class="chip-btn monster-elem-btn ${monsterSelectedElement === el ? 'active' : ''}" data-elem="${el}">${el}</button>
            `).join('')}
          </div>

          <!-- Stats & Clear -->
          <div style="margin-top:10px; font-size:0.85rem; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center;">
            <div>該当: <strong>${filtered.length}</strong> / ${allMonsters.length} 体</div>
            ${(monsterSearchQuery || monsterSelectedElement !== 'all' || monsterTypeFilter !== 'all') ? `
              <button type="button" id="monster-reset-btn" style="background:none; border:none; color:var(--primary-color); font-size:0.82rem; cursor:pointer; text-decoration:underline;">フィルタ解除</button>
            ` : ''}
          </div>
        </div>

        <!-- Monster Cards Grid -->
        <div id="monsters-list-container" class="monsters-grid">
          ${filtered.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-secondary);">
              条件に一致するモンスターが見つかりませんでした。
            </div>
          ` : filtered.map(m => {
            const drops = getMonsterDrops(m);
            return `
              <div class="monster-card ${m.isBoss ? 'is-boss' : ''}" id="${m.id}">
                <!-- Header -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span class="badge ${m.isBoss ? 'badge-boss' : 'badge-num'}">${m.isBoss ? '👑 BOSS' : `#${m.number}`}</span>
                    <span class="badge badge-plane">${escapeHtml(m.element)}</span>
                    <strong style="font-size:1.05rem; color:var(--text-primary);">${escapeHtml(m.name)}</strong>
                  </div>
                  <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); white-space:nowrap;">
                    LV ${escapeHtml(m.level)}
                  </div>
                </div>

                <!-- Locations & Encounter Rates -->
                <div style="margin-top:4px;">
                  <div style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin-bottom:2px;">📍 出現場所:</div>
                  <div>
                    ${m.locations.map(l => `
                      <span class="monster-loc-tag">
                        ${escapeHtml(l.location)} <strong style="color:var(--text-primary);">${escapeHtml(l.rate)}%</strong>
                      </span>
                    `).join('')}
                  </div>
                </div>

                <!-- Drop Items (Integrated from ITEM_DROP_INDEX) -->
                ${drops.length > 0 ? `
                  <div class="monster-drops-box">
                    🎁 ドロップ候補: <strong>${drops.map(escapeHtml).join('、')}</strong>
                  </div>
                ` : ''}

                <!-- Size & Profile Description -->
                ${(m.size || m.description) ? `
                  <div class="monster-desc-box">
                    ${m.size && m.size !== '-' ? `<div style="font-size:0.78rem; color:#64748b; margin-bottom:2px;">📏 ${escapeHtml(m.size)}</div>` : ''}
                    <div>${escapeHtml(m.description)}</div>
                  </div>
                ` : ''}

                <!-- Footer Source Link -->
                <div style="margin-top:auto; padding-top:6px; font-size:0.8rem; text-align:right;">
                  <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary-color); text-decoration:none;">
                    📖 Wiki図鑑ページ ↗
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Specifications & Wiki Links Accordion -->
        <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border-light);">
          <details style="background:#f8fafc; border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:12px 16px;">
            <summary style="font-weight:600; color:var(--text-primary); cursor:pointer;">
              📊 ドロップ確率と「期待値」の仕様 ＆ 種族図鑑リンク
            </summary>
            <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-top:10px;">
              <p>
                マジカルバケーションでは、1回の戦闘で同じアイテムを2個以上ドロップすることがあります。<br>
                例えば「森の洞窟でのカエルグミ緑」の場合、入手個数0個が76.51%、1個が21.69%、2個が1.76%、3個が0.04%となっており、戦闘100回あたりの平均入手期待値は <strong>25.33個</strong> となります。
              </p>
              <div style="margin-top:12px;">
                <a class="btn-ext-link" href="https://wikiwiki.jp/magivaca/%E7%A8%AE%E6%97%8F%E5%9B%B3%E9%91%91" target="_blank" rel="noopener noreferrer">
                  📖 Wiki種族図鑑（全22種）を見る ↗
                </a>
              </div>
            </div>
          </details>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:16px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/MonsterList" target="_blank" rel="noopener noreferrer">モンスター図鑑 (全288種)</a> |
          <a href="https://wikiwiki.jp/magivaca/%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener noreferrer">アイテムドロップ一覧</a>
        </div>
      </div>
    `;

    // Event Handlers
    const searchInput = document.getElementById('monster-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        monsterSearchQuery = e.target.value;
        renderMonstersTab();
        // Restore focus
        const el = document.getElementById('monster-search-input');
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    }

    container.querySelectorAll('.monster-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        monsterTypeFilter = btn.dataset.type;
        renderMonstersTab();
      });
    });

    container.querySelectorAll('.monster-elem-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        monsterSelectedElement = btn.dataset.elem;
        renderMonstersTab();
      });
    });

    const resetBtn = document.getElementById('monster-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        monsterSearchQuery = '';
        monsterSelectedElement = 'all';
        monsterTypeFilter = 'all';
        renderMonstersTab();
      });
    }
  }

  // ==========================================================================
  // Tab: Story Choices & Dialogue (Phase 5 - Priority 2)
  // ==========================================================================
  function renderStoryTab() {
    const container = document.getElementById('story-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>📜 ストーリー選択肢 ＆ イベント分岐ガイド</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          ストーリー進行中の会話選択肢や、選んだ行動によるストーリー分岐・仲間の加入離脱を整理したページです。<br>
          ※ゲーム台詞の全文転載は行わず、Wiki記載の選択肢・結果・注意点を要約して掲載しています。
        </p>

        <!-- Plane Filter Chips -->
        <div class="filter-chips" style="margin-bottom:18px;">
          <button type="button" class="filter-btn story-plane-btn ${storyPlane === 'all' ? 'active' : ''}" data-plane="all">全プレーン</button>
          <button type="button" class="filter-btn story-plane-btn ${storyPlane === '物質のプレーン' ? 'active' : ''}" data-plane="物質のプレーン">物質のプレーン</button>
          <button type="button" class="filter-btn story-plane-btn ${storyPlane === '光のプレーン' ? 'active' : ''}" data-plane="光のプレーン">光のプレーン</button>
          <button type="button" class="filter-btn story-plane-btn ${storyPlane === '闇のプレーン' ? 'active' : ''}" data-plane="闇のプレーン">闇のプレーン</button>
          <button type="button" class="filter-btn story-plane-btn ${storyPlane === '死のプレーン' ? 'active' : ''}" data-plane="死のプレーン">死のプレーン</button>
          <button type="button" class="filter-btn story-plane-btn ${storyPlane === 'ガラムマサラ' ? 'active' : ''}" data-plane="ガラムマサラ">ガラムマサラ</button>
        </div>

        <div id="story-cards-container">
          <!-- Rendered below -->
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88" target="_blank" rel="noopener noreferrer">攻略チャート各ページ</a>
        </div>
      </div>
    `;

    const containerCards = document.getElementById('story-cards-container');

    const filteredPlanes = STORY_CHOICES_DATA.filter(p => {
      if (storyPlane !== 'all' && p.plane !== storyPlane) return false;
      return true;
    });

    let html = '';
    filteredPlanes.forEach(planeData => {
      html += `<h3 style="font-size:1.1rem; color:var(--accent); margin-top:20px; margin-bottom:12px; border-bottom:2px solid var(--accent-light); padding-bottom:4px;">🗺️ ${escapeHtml(planeData.plane)}</h3>`;

      planeData.events.forEach(ev => {
        html += `
          <div class="story-card ${ev.missable ? 'missable' : ''}" data-story-scene="${escapeHtml(ev.scene)}">
            <div class="story-card-header">
              <div>
                <div class="story-card-title">${escapeHtml(ev.scene)}</div>
                <div class="story-card-location">📍 発生場所: ${escapeHtml(ev.location)}</div>
              </div>
              <div>
                ${ev.missable ? '<span class="badge badge-warning">⚠️ 期間限定・消滅注意</span>' : '<span class="badge badge-plane">通常イベント</span>'}
              </div>
            </div>

            <div class="story-choice-box">
              ${ev.choices.map(c => `
                <div class="story-choice-row">
                  <div class="story-choice-label">▶ ${escapeHtml(c.action)}:</div>
                  <div>
                    <div><strong>選択肢:</strong> ${escapeHtml(c.options)}</div>
                    <div style="color:var(--text-secondary); margin-top:3px;"><strong>結果・分岐:</strong> ${escapeHtml(c.result)}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            ${ev.notes ? `
              <div class="story-notes">
                <strong>💡 攻略ポイント・注意点:</strong><br>
                ${escapeHtml(ev.notes)}
              </div>
            ` : ''}

            <div style="font-size:0.8rem; margin-top:8px; text-align:right;">
              <a href="${escapeHtml(ev.url)}" target="_blank" rel="noopener noreferrer">📖 Wiki該当チャートで確認 ↗</a>
            </div>
          </div>
        `;
      });
    });

    containerCards.innerHTML = html;

    const planeBtns = container.querySelectorAll('.story-plane-btn');
    planeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        storyPlane = btn.dataset.plane;
        renderStoryTab();
      });
    });
  }

  // ==========================================================================
  // Tab: Collections Checklist (Phase 5 - Priority 3)
  // ==========================================================================
  function renderCollectionsTab() {
    const container = document.getElementById('collections-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>📋 収集チェックリスト拡張</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          精霊以外のゲーム内収集要素<strong>「魔法の手帳」「ハズレ宝箱コイン」「成績項目」</strong>を独立したチェックリストで記録・管理できます。<br>
          （データはお使いの端末内localStorageに個別のキーで安全に保存されます）
        </p>

        <!-- 宝箱マップ連携リンク -->
        <div class="note-box" style="margin-bottom:14px; background:#eff6ff; border-color:#bfdbfe; color:#1e3a8a; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <span>💡 <strong>宝箱マップ連携:</strong> フィールドやダンジョンの宝箱（全453個）の配置・中身・開封管理は [🧰 宝箱マップ] タブで行えます。</span>
          <button type="button" class="btn btn-sm btn-outline" onclick="window.switchTab('tab-chests')" style="font-size:0.8rem; padding:3px 10px; background:#fff;">
            🧰 宝箱マップを開く
          </button>
        </div>

        <!-- Sub Tabs for Collections -->
        <div class="sub-tab-nav" id="collection-sub-tabs">
          <button type="button" class="sub-tab-btn ${collectionSubTab === 'notes' ? 'active' : ''}" data-sub="notes">
            📖 魔法の手帳 (${checkedMagicNotes.size} / ${MAGIC_NOTES_DATA.length})
          </button>
          <button type="button" class="sub-tab-btn ${collectionSubTab === 'coins' ? 'active' : ''}" data-sub="coins">
            🪙 ハズレ宝箱コイン (${checkedMimicCoins.size} / 53枚)
          </button>
          <button type="button" class="sub-tab-btn ${collectionSubTab === 'records' ? 'active' : ''}" data-sub="records">
            🏆 成績評価（Sランク） (${checkedRecords.size} / ${RECORD_CRITERIA_DATA.length})
          </button>
        </div>

        <div id="collection-sub-content">
          <!-- Rendered below -->
        </div>
      </div>
    `;

    const subContentEl = document.getElementById('collection-sub-content');

    // Sub Tab Switching
    container.querySelectorAll('#collection-sub-tabs .sub-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        collectionSubTab = btn.dataset.sub;
        renderCollectionsTab();
      });
    });

    // 1. 魔法の手帳
    if (collectionSubTab === 'notes') {
      const total = MAGIC_NOTES_DATA.length;
      const checked = checkedMagicNotes.size;
      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

      let html = `
        <div class="collection-progress-bar-wrap">
          <div>
            <strong>📖 魔法の手帳 習得進捗:</strong>
            <span style="font-size:1.1rem; font-weight:bold; color:var(--accent); margin-left:8px;">${checked} / ${total} 項目 (${pct}%)</span>
          </div>
          <div style="flex:1; max-width:300px;">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
          <label class="checkbox-toggle-label">
            <input type="checkbox" id="note-filter-missable" ${collectionOnlyMissable ? 'checked' : ''}>
            <span>⚠️ 期間限定・消滅注意のみ表示</span>
          </label>
          <label class="checkbox-toggle-label">
            <input type="checkbox" id="note-filter-unchecked" ${collectionOnlyUnchecked ? 'checked' : ''}>
            <span>未習得のみ表示</span>
          </label>
        </div>

        <div id="notes-cards-list">
      `;

      MAGIC_NOTES_DATA.forEach(n => {
        const isChecked = checkedMagicNotes.has(n.no);
        if (collectionOnlyMissable && !n.missable) return;
        if (collectionOnlyUnchecked && isChecked) return;

        html += `
          <div class="collection-card ${isChecked ? 'checked' : ''} ${n.missable ? 'missable' : ''}">
            <input type="checkbox" class="collection-checkbox note-chk" data-no="${n.no}" ${isChecked ? 'checked' : ''}>
            <div class="collection-content">
              <div class="collection-header-row">
                <div class="collection-title">No.${n.no} : ${escapeHtml(n.title)}</div>
                <div>
                  ${n.missable ? '<span class="badge badge-warning">⚠️ 期間限定</span>' : '<span class="badge badge-plane">通常</span>'}
                </div>
              </div>
              <div class="collection-detail">${escapeHtml(n.content)}</div>
              <div class="collection-meta" style="margin-top:6px; color:var(--text-secondary);">
                <strong>出現条件・備考:</strong> ${escapeHtml(n.condition)}
              </div>
            </div>
          </div>
        `;
      });

      html += `
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/%E9%AD%94%E6%B3%95%E3%81%AE%E6%89%8B%E5%B8%B3" target="_blank" rel="noopener noreferrer">魔法の手帳</a>
        </div>
      `;

      subContentEl.innerHTML = html;

      subContentEl.querySelectorAll('.note-chk').forEach(chk => {
        chk.addEventListener('change', () => {
          toggleMagicNote(parseInt(chk.dataset.no, 10));
        });
      });

      const misChk = document.getElementById('note-filter-missable');
      if (misChk) misChk.addEventListener('change', (e) => {
        collectionOnlyMissable = e.target.checked;
        renderCollectionsTab();
      });

      const uncChk = document.getElementById('note-filter-unchecked');
      if (uncChk) uncChk.addEventListener('change', (e) => {
        collectionOnlyUnchecked = e.target.checked;
        renderCollectionsTab();
      });
    }

    // 2. ハズレ宝箱コイン
    else if (collectionSubTab === 'coins') {
      const total = 53; // Unique IDs 1..53
      const checked = checkedMimicCoins.size;
      const pct = Math.round((checked / total) * 100);

      let html = `
        <div class="collection-progress-bar-wrap">
          <div>
            <strong>🪙 ハズレ宝箱コイン獲得進捗:</strong>
            <span style="font-size:1.1rem; font-weight:bold; color:var(--accent); margin-left:8px;">${checked} / ${total} 枚 (${pct}%)</span>
          </div>
          <div style="flex:1; max-width:300px;">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>
        </div>

        <div class="warning-callout" style="margin-bottom:16px;">
          <h3>ℹ️ ハズレ宝箱コインの入手ルール</h3>
          <p>
            ・<strong>PTにアランシアがいる時</strong>、ハズレ宝箱での戦闘終了後にコインを1つ入手します。<br>
            ・入手可能な回数は<strong>各ID（全53種）ごとに1回限り</strong>です（同じIDの別マップ宝箱からは重複入手できません）。<br>
            ・アランシアが不在の状態で倒してしまっても、後からアランシアを連れてくれば問題ありません（取り返しがつきます）。
          </p>
        </div>

        <div class="filter-chips" style="margin-bottom:16px;">
          <button type="button" class="filter-btn coin-plane-btn ${collectionPlane === 'all' ? 'active' : ''}" data-plane="all">全プレーン</button>
          <button type="button" class="filter-btn coin-plane-btn ${collectionPlane === '闇のプレーン' ? 'active' : ''}" data-plane="闇のプレーン">闇のプレーン</button>
          <button type="button" class="filter-btn coin-plane-btn ${collectionPlane === '死のプレーン' ? 'active' : ''}" data-plane="死のプレーン">死のプレーン</button>
          <button type="button" class="filter-btn coin-plane-btn ${collectionPlane === 'ガラムマサラ' ? 'active' : ''}" data-plane="ガラムマサラ">ガラムマサラ</button>
        </div>

        <div id="coins-cards-list">
      `;

      MIMIC_COINS_DATA.forEach(c => {
        if (collectionPlane !== 'all' && c.plane !== collectionPlane) return;
        const isChecked = checkedMimicCoins.has(c.id);

        html += `
          <div class="collection-card ${isChecked ? 'checked' : ''}">
            <input type="checkbox" class="collection-checkbox coin-chk" data-id="${c.id}" ${isChecked ? 'checked' : ''}>
            <div class="collection-content">
              <div class="collection-header-row">
                <div class="collection-title">ID ${c.id}: ${escapeHtml(c.coinName)}</div>
                <div>
                  <span class="badge badge-plane">${escapeHtml(c.plane)}</span>
                </div>
              </div>
              <div class="collection-detail">
                📍 <strong>マップ:</strong> ${escapeHtml(c.map)} （座標: ${escapeHtml(c.coord)}）
              </div>
              ${c.altMaps ? `
                <div class="collection-meta" style="margin-top:4px;">
                  同IDの別マップ: ${escapeHtml(c.altMaps)}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      });

      html += `
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/%E3%83%8F%E3%82%BA%E3%83%AC%E5%AE%9D%E7%AE%B1%E3%81%AE%E3%82%B3%E3%82%A4%E3%83%86%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener noreferrer">ハズレ宝箱のコイン一覧</a>
        </div>
      `;

      subContentEl.innerHTML = html;

      subContentEl.querySelectorAll('.coin-chk').forEach(chk => {
        chk.addEventListener('change', () => {
          toggleMimicCoin(parseInt(chk.dataset.id, 10));
        });
      });

      subContentEl.querySelectorAll('.coin-plane-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          collectionPlane = btn.dataset.plane;
          renderCollectionsTab();
        });
      });
    }

    // 3. 成績評価（Sランクへの道）
    else if (collectionSubTab === 'records') {
      const total = RECORD_CRITERIA_DATA.length;
      const checked = checkedRecords.size;
      const pct = Math.round((checked / total) * 100);

      let html = `
        <div class="collection-progress-bar-wrap">
          <div>
            <strong>🏆 成績評価 達成目標:</strong>
            <span style="font-size:1.1rem; font-weight:bold; color:var(--accent); margin-left:8px;">${checked} / ${total} 項目達成 (${pct}%)</span>
          </div>
          <div style="flex:1; max-width:300px;">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>
        </div>

        <div class="warning-callout" style="margin-bottom:16px;">
          <h3>🏅 評価Sランク獲得の条件</h3>
          <p>
            クリア時の成績評価ポイント合計が<strong>90～95ポイントで「Sランク」</strong>となります。<br>
            特に<strong>「勝率（×5倍配点）」「気絶回数0回」「精霊全112体仲良し」「全魔法習得」</strong>が大きな配点を占めています。
          </p>
        </div>

        <div id="records-cards-list">
      `;

      RECORD_CRITERIA_DATA.forEach(rec => {
        const isChecked = checkedRecords.has(rec.category);

        html += `
          <div class="collection-card ${isChecked ? 'checked' : ''}">
            <input type="checkbox" class="collection-checkbox rec-chk" data-cat="${escapeHtml(rec.category)}" ${isChecked ? 'checked' : ''}>
            <div class="collection-content">
              <div class="collection-header-row">
                <div class="collection-title">${escapeHtml(rec.category)} （目標: ${escapeHtml(rec.target)}）</div>
                <div>
                  <span class="badge badge-price">配点比率: ${escapeHtml(rec.weight)}</span>
                </div>
              </div>
              <div class="collection-detail">${escapeHtml(rec.desc)}</div>
            </div>
          </div>
        `;
      });

      html += `
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/%E6%88%90%E7%B8%BE" target="_blank" rel="noopener noreferrer">成績システム</a>
        </div>
      `;

      subContentEl.innerHTML = html;

      subContentEl.querySelectorAll('.rec-chk').forEach(chk => {
        chk.addEventListener('change', () => {
          toggleRecord(chk.dataset.cat);
        });
      });
    }
  }

  // Render Leveling Tab (完全復元・実データ構造 LEVELING_DATA.spots に完全合致)
  
  // ============================================================================
  // Tab: Chests Map (宝箱マップ)
  // ============================================================================
  
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
  window.renderChestsTab = renderChestsTab;

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

  function setShanilSubmap(areaKey, submapId) {
    selectedShanilSubmaps[areaKey] = submapId;
    renderChestsTab();
  }
  window.setShanilSubmap = setShanilSubmap;

  function setShanilViewMode(areaKey, mode) {
    shanilViewModes[areaKey] = mode;
    renderChestsTab();
  }
  window.setShanilViewMode = setShanilViewMode;

  // SVG Schematic Generator (Organic Map Layout + Natural Paths + Compass + Theming)
  function renderSchematicSvg(defn, areaChests, areaKey) {
    if (!defn || !defn.grid) return '';
    const grid = defn.grid;
    const nrows = grid.length;
    let ncols = 0;
    for (let r = 0; r < nrows; r++) {
      if (grid[r].length > ncols) ncols = grid[r].length;
    }
    
    // エリア名から地形テーマを取得
    const areaName = defn.title ? defn.title.replace(/ 模式図.*$/, '').trim() : '';
    const theme = getAreaTheme(areaName);
    
    // ノードごとの宝箱集計
    const nodeStats = {};
    for (let r = 0; r < nrows; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const node = grid[r][c];
        if (!node) continue;
        const matched = areaChests.filter(ch => {
          if (!ch.mapName) return false;
          const normCh = normalizeMapName(ch.mapName);
          const normNode = normalizeMapName(node.name);
          if (normCh === normNode || ch.mapName === node.name) return true;
          if (node.aliases && Array.isArray(node.aliases)) {
            return node.aliases.some(a => {
              const normA = normalizeMapName(a);
              return a === ch.mapName || normA === normCh || ch.mapName.includes(a) || a.includes(ch.mapName) || normCh.includes(normA) || normA.includes(normCh);
            });
          }
          return false;
        });
        const opened = matched.filter(ch => checkedChests.has(ch.id)).length;
        nodeStats[node.name] = { total: matched.length, opened: opened };
      }
    }

    const cellW = 126;
    const cellH = 60;
    const gapX = 26;
    const gapY = 24;
    const padX = 20;
    const padY = 32;
    
    const totalW = padX * 2 + ncols * cellW + (ncols - 1) * gapX;
    const totalH = padY * 2 + nrows * cellH + (nrows - 1) * gapY;
    
    // 各ノードの配置計算（大きさ・縦横比・オフセットに変化をつける）
    const nodeLayout = [];
    for (let r = 0; r < nrows; r++) {
      nodeLayout[r] = [];
      for (let c = 0; c < grid[r].length; c++) {
        const node = grid[r][c];
        if (!node) {
          nodeLayout[r][c] = null;
          continue;
        }
        const stat = nodeStats[node.name] || { total: 0, opened: 0 };
        const hash = getDeterministicHash(node.name + '_' + r + '_' + c);
        const name = node.name;
        const isEntrance = node.entrance;

        // 部屋タイプ・重要度判定
        const isLarge = /広場|ホール|大回廊|中心|宮殿|湖|神殿|遺跡|ピラミッド|中庭|オアシス|山頂|火口|本堂|城/.test(name) || stat.total >= 2;
        const isPassage = (/通路|小道|道|細道|連絡|連絡路|階段/.test(name) || isEntrance) && stat.total === 0;

        let w, h, rx;
        if (isLarge) {
          w = 124 + (hash % 9); // 124〜132px
          h = 58 + ((hash >> 2) % 7); // 58〜64px
          rx = 10;
        } else if (isPassage) {
          w = 106 + (hash % 9); // 106〜114px
          h = 48 + ((hash >> 2) % 5); // 48〜52px
          rx = 6;
        } else {
          w = 116 + (hash % 9); // 116〜124px
          h = 54 + ((hash >> 2) % 7); // 54〜60px
          rx = 8;
        }

        // セル中央からの微小ジッター（隣接セルと重ならない範囲で配置に有機的な変化）
        const dx = ((hash % 11) - 5) * 1.3; // 約 -6.5px 〜 +6.5px
        const dy = (((hash >> 4) % 9) - 4) * 1.1; // 約 -4.4px 〜 +4.4px

        const cellCenterX = padX + c * (cellW + gapX) + cellW / 2 + dx;
        const cellCenterY = padY + r * (cellH + gapY) + cellH / 2 + dy;

        const x = cellCenterX - w / 2;
        const y = cellCenterY - h / 2;

        nodeLayout[r][c] = {
          node,
          stat,
          w,
          h,
          rx,
          x,
          y,
          cx: cellCenterX,
          cy: cellCenterY,
          isLarge,
          isPassage,
          hash
        };
      }
    }

    const svgId = 'svg-schem-' + Math.abs(getDeterministicHash(areaKey || 'default'));
    let svg = `<svg viewBox="0 0 ${totalW} ${totalH}" class="area-schematic-svg" xmlns="http://www.w3.org/2000/svg">`;
    
    // Defs: グラデーション・パターン・シャドウ
    svg += `<defs>
      <linearGradient id="${svgId}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bgGradStart}"/>
        <stop offset="100%" stop-color="${theme.bgGradEnd}"/>
      </linearGradient>
      <pattern id="${svgId}-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.8" fill="${theme.dotColor}" opacity="0.35"/>
      </pattern>
      <filter id="${svgId}-shadow" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.06"/>
      </filter>
    </defs>`;

    // Background
    svg += `<rect width="${totalW}" height="${totalH}" rx="10" fill="url(#${svgId}-bg)" stroke="${theme.borderColor}" stroke-width="1.2"/>`;
    svg += `<rect width="${totalW}" height="${totalH}" rx="10" fill="url(#${svgId}-dots)"/>`;

    // Legend & Compass Header
    svg += `<g transform="translate(${padX}, 18)" font-size="9.5" font-family="sans-serif">`;
    svg += `<rect x="0" y="-12" width="232" height="18" rx="4" fill="rgba(255,255,255,0.75)" stroke="#e2e8f0" stroke-width="0.8"/>`;
    svg += `<circle cx="10" cy="-3" r="3.5" fill="#f59e0b"/>`;
    svg += `<text x="18" y="0" fill="#475569">🎁 宝箱あり</text>`;
    svg += `<circle cx="82" cy="-3" r="3.5" fill="#10b981"/>`;
    svg += `<text x="90" y="0" fill="#475569">✅ 開封完了</text>`;
    svg += `<circle cx="154" cy="-3" r="3.5" fill="#3b82f6"/>`;
    svg += `<text x="162" y="0" fill="#475569">🚪 出入口/通路</text>`;
    svg += `</g>`;

    // Compass (North indicator)
    svg += `<g transform="translate(${totalW - 24}, 20)" class="schematic-compass" pointer-events="none">`;
    svg += `<circle cx="0" cy="0" r="11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#${svgId}-shadow)"/>`;
    svg += `<polygon points="0,-7 2.8,0 -2.8,0" fill="#dc2626"/>`;
    svg += `<polygon points="0,7 2.8,0 -2.8,0" fill="#94a3b8"/>`;
    svg += `<circle cx="0" cy="0" r="1.3" fill="#ffffff"/>`;
    svg += `<text x="0" y="-8.5" font-size="6.5" font-weight="bold" fill="#dc2626" text-anchor="middle">N</text>`;
    svg += `</g>`;

    // Connections (Natural Paths with Bezier curves)
    let pathsHtml = '';
    for (let r = 0; r < nrows; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const item1 = nodeLayout[r][c];
        if (!item1) continue;

        // Horizontal Connection: (r, c) <-> (r, c+1)
        if (c + 1 < grid[r].length && nodeLayout[r][c + 1]) {
          const item2 = nodeLayout[r][c + 1];
          const x1 = item1.x + item1.w;
          const y1 = item1.cy;
          const x2 = item2.x;
          const y2 = item2.cy;
          const midX = (x1 + x2) / 2;
          const pathD = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${midX.toFixed(1)} ${y1.toFixed(1)}, ${midX.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
          // Base path (border)
          pathsHtml += `<path d="${pathD}" fill="none" stroke="${theme.pathBase}" stroke-width="4.5" stroke-linecap="round"/>`;
          // Foreground path (texture)
          pathsHtml += `<path d="${pathD}" fill="none" stroke="${theme.pathStroke}" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,3"/>`;
        }

        // Vertical Connection: (r, c) <-> (r+1, c)
        if (r + 1 < nrows && c < grid[r + 1].length && nodeLayout[r + 1][c]) {
          const item2 = nodeLayout[r + 1][c];
          const x1 = item1.cx;
          const y1 = item1.y + item1.h;
          const x2 = item2.cx;
          const y2 = item2.y;
          const midY = (y1 + y2) / 2;
          const pathD = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
          // Base path (border)
          pathsHtml += `<path d="${pathD}" fill="none" stroke="${theme.pathBase}" stroke-width="4.5" stroke-linecap="round"/>`;
          // Foreground path (texture)
          pathsHtml += `<path d="${pathD}" fill="none" stroke="${theme.pathStroke}" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,3"/>`;
        }
      }
    }
    svg += pathsHtml;

    // Nodes (Rooms with distinct styles, rounded shapes, badges, icons)
    for (let r = 0; r < nrows; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const item = nodeLayout[r][c];
        if (!item) continue;
        const node = item.node;
        const stat = item.stat;
        const hasChests = stat.total > 0;
        const allOpened = hasChests && stat.opened === stat.total;
        const isEntrance = node.entrance;
        const note = node.note || '';

        let rectFill = theme.nodeDefaultBg;
        let rectStroke = theme.nodeDefaultStroke;
        let strokeW = "1.2";
        let textFill = "#334155";

        if (allOpened) {
          rectFill = "#f0fdf4";
          rectStroke = "#10b981";
          strokeW = "1.6";
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

        // Room Icon detection
        let roomIcon = '';
        if (/階段|B1F|1F|2F|上層|下層|昇降|登り|下り/.test(node.name) || /階段/.test(note)) {
          roomIcon = '🪜';
        } else if (/ワープ|転送/.test(node.name) || /ワープ/.test(note)) {
          roomIcon = '🌀';
        } else if (isEntrance || /入口|出口|学校|キャンプ/.test(node.name)) {
          roomIcon = '🚪';
        }

        svg += `<g class="schematic-node" transform="translate(${item.x.toFixed(1)},${item.y.toFixed(1)})" style="cursor: pointer;" onclick="window.scrollToMapChest('${escapeHtml(node.name)}');" filter="url(#${svgId}-shadow)">`;
        svg += `<rect width="${item.w}" height="${item.h}" rx="${item.rx}" fill="${rectFill}" stroke="${rectStroke}" stroke-width="${strokeW}"/>`;

        // Room Title
        const name = escapeHtml(node.name);
        const textX = item.w / 2;
        let lineY = item.h / 2 + (hasChests ? -3 : 2);

        if (name.length > 9) {
          const line1 = name.slice(0, 8);
          const line2 = name.slice(8);
          const iconPrefix = roomIcon ? `${roomIcon} ` : '';
          svg += `<text x="${textX}" y="${item.h / 2 - 6}" font-size="9.5" font-weight="600" fill="${textFill}" text-anchor="middle">${iconPrefix}${line1}</text>`;
          svg += `<text x="${textX}" y="${item.h / 2 + 6}" font-size="8.5" fill="${textFill}" text-anchor="middle">${line2}</text>`;
        } else {
          const iconPrefix = roomIcon ? `${roomIcon} ` : '';
          svg += `<text x="${textX}" y="${lineY}" font-size="10" font-weight="600" fill="${textFill}" text-anchor="middle">${iconPrefix}${name}</text>`;
        }

        // Chest Badge / Status
        if (hasChests) {
          let badgeBg = allOpened ? "#dcfce7" : "#fef3c7";
          let badgeStroke = allOpened ? "#10b981" : "#f59e0b";
          let badgeText = allOpened ? `✅ ${stat.total}個済` : (stat.opened > 0 ? `🎁 ${stat.opened}/${stat.total}済` : `🎁 ${stat.total}個`);
          let badgeColor = allOpened ? "#15803d" : "#b45309";
          const badgeW = 58;

          svg += `<rect x="${(item.w - badgeW) / 2}" y="${item.h - 16}" width="${badgeW}" height="12" rx="3.5" fill="${badgeBg}" stroke="${badgeStroke}" stroke-width="0.8"/>`;
          svg += `<text x="${textX}" y="${item.h - 7}" font-size="8.5" font-weight="bold" fill="${badgeColor}" text-anchor="middle">${badgeText}</text>`;
        } else if (isEntrance) {
          svg += `<text x="${textX}" y="${item.h - 6}" font-size="8" font-weight="bold" fill="#3b82f6" text-anchor="middle">出入口</text>`;
        } else if (note && note.length <= 6) {
          svg += `<text x="${textX}" y="${item.h - 6}" font-size="7.5" fill="#94a3b8" text-anchor="middle">${escapeHtml(note)}</text>`;
        }

        svg += `</g>`;
      }
    }

    svg += `</svg>`;
    return svg;
  }

  // Garam Masala Dynamic Floor Schematic Generator (100% Original SVG)
  function renderGaramFloorSvg(floor, floorChests, checkedChests) {
    const totalChests = floorChests.length;
    const isTreasureFloor = (totalChests > 0);
    const openedChests = floorChests.filter(c => checkedChests.has(c.id)).length;
    const allOpened = (totalChests > 0 && openedChests === totalChests);

    const width = 380;
    const height = 160;

    let statusBg = isTreasureFloor ? (allOpened ? '#dcfce7' : '#fef3c7') : '#f1f5f9';
    let statusStroke = isTreasureFloor ? (allOpened ? '#10b981' : '#f59e0b') : '#cbd5e1';
    let statusTextColor = isTreasureFloor ? (allOpened ? '#15803d' : '#b45309') : '#64748b';
    let statusText = isTreasureFloor ? (allOpened ? `✅ 宝箱 ${totalChests}/${totalChests}個 開封済` : `🎁 宝箱 ${openedChests}/${totalChests}個`) : '🛡️ 通路フロア（宝箱なし）';

    let svg = `<svg class="area-schematic-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
      <linearGradient id="garam-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fafaf9"/>
        <stop offset="100%" stop-color="#f5f5f4"/>
      </linearGradient>
      <pattern id="garam-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.8" fill="#d6d3d1" opacity="0.35"/>
      </pattern>
      <filter id="shadow-garam" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#1c1917" flood-opacity="0.07"/>
      </filter>
    </defs>`;

    // Background
    svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="url(#garam-bg)" stroke="#e7e5e4" stroke-width="1.2"/>`;
    svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="url(#garam-dots)"/>`;

    // Header row
    svg += `<text x="18" y="27" font-size="12" font-weight="bold" fill="#1e293b">ガラムマサラ ${floor}F 模式図</text>`;
    svg += `<rect x="${width - 176}" y="13" width="140" height="20" rx="10" fill="${statusBg}" stroke="${statusStroke}" stroke-width="1"/>`;
    svg += `<text x="${width - 106}" y="27" font-size="9.5" font-weight="bold" fill="${statusTextColor}" text-anchor="middle">${statusText}</text>`;

    // Compass
    svg += `<g transform="translate(${width - 20}, 23)" class="schematic-compass" pointer-events="none">`;
    svg += `<circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" filter="url(#shadow-garam)"/>`;
    svg += `<polygon points="0,-6 2.5,0 -2.5,0" fill="#dc2626"/>`;
    svg += `<polygon points="0,6 2.5,0 -2.5,0" fill="#94a3b8"/>`;
    svg += `<circle cx="0" cy="0" r="1" fill="#ffffff"/>`;
    svg += `<text x="0" y="-7" font-size="5.5" font-weight="bold" fill="#dc2626" text-anchor="middle">N</text>`;
    svg += `</g>`;

    // Passages (Natural Dungeon Corridor)
    // Left corridor: x: 104 -> 134, y: 92
    svg += `<path d="M 104 92 C 119 92, 119 92, 134 92" fill="none" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round"/>`;
    svg += `<path d="M 104 92 C 119 92, 119 92, 134 92" fill="none" stroke="#78716c" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4,3"/>`;

    // Right corridor: x: 246 -> 276, y: 92
    svg += `<path d="M 246 92 C 261 92, 261 92, 276 92" fill="none" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round"/>`;
    svg += `<path d="M 246 92 C 261 92, 261 92, 276 92" fill="none" stroke="#78716c" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4,3"/>`;

    // Previous Floor / Downstairs
    svg += `<g transform="translate(20, 52)" filter="url(#shadow-garam)">`;
    svg += `<rect width="84" height="76" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>`;
    svg += `<text x="42" y="32" font-size="10.5" font-weight="bold" fill="#3b82f6" text-anchor="middle">${floor === 1 ? '地上入口' : `${floor - 1}Fへ`}</text>`;
    svg += `<text x="42" y="52" font-size="9.5" fill="#64748b" text-anchor="middle">🪜 ▲ 昇り階段</text>`;
    svg += `</g>`;

    // Center / Treasure room or Corridor
    if (isTreasureFloor) {
      let centerFill = allOpened ? '#f0fdf4' : '#fffbeb';
      let centerStroke = allOpened ? '#10b981' : '#f59e0b';
      let centerTitleColor = allOpened ? '#15803d' : '#92400e';

      svg += `<g transform="translate(134, 44)" filter="url(#shadow-garam)">`;
      svg += `<rect width="112" height="92" rx="10" fill="${centerFill}" stroke="${centerStroke}" stroke-width="2"/>`;
      svg += `<text x="56" y="28" font-size="11" font-weight="bold" fill="${centerTitleColor}" text-anchor="middle">🎁 宝箱フロア</text>`;
      svg += `<rect x="18" y="38" width="76" height="18" rx="4" fill="${statusBg}" stroke="${statusStroke}" stroke-width="0.8"/>`;
      svg += `<text x="56" y="51" font-size="9" font-weight="bold" fill="${statusTextColor}" text-anchor="middle">宝箱 ${openedChests}/${totalChests}個</text>`;
      svg += `<text x="56" y="74" font-size="8.5" fill="#64748b" text-anchor="middle">⚠️ モンスター警戒</text>`;
      svg += `</g>`;
    } else {
      svg += `<g transform="translate(142, 52)" filter="url(#shadow-garam)">`;
      svg += `<rect width="96" height="76" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>`;
      svg += `<text x="48" y="34" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">連絡通路</text>`;
      svg += `<text x="48" y="52" font-size="9" fill="#64748b" text-anchor="middle">通常フロア</text>`;
      svg += `</g>`;
    }

    // Next Floor / Upstairs
    svg += `<g transform="translate(276, 52)" filter="url(#shadow-garam)">`;
    svg += `<rect width="84" height="76" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>`;
    svg += `<text x="42" y="32" font-size="10.5" font-weight="bold" fill="#10b981" text-anchor="middle">${floor === 50 ? '最深部(ボス)' : `${floor + 1}Fへ`}</text>`;
    svg += `<text x="42" y="52" font-size="9.5" fill="#64748b" text-anchor="middle">🪜 ▼ 降り階段</text>`;
    svg += `</g>`;

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
      const floorChests = allChestsInArea.filter(c => normalizeMapName(c.mapName) === floorTargetName);
      const floorOpened = floorChests.filter(c => checkedChests.has(c.id)).length;

      let floorOptions = '';
      for (let f = 1; f <= 50; f++) {
        const targetFloorName = 'ガラムマサラ' + f;
        const fc = allChestsInArea.filter(c => normalizeMapName(c.mapName) === targetFloorName);
        const fo = fc.filter(c => checkedChests.has(c.id)).length;
        const statusLabel = fc.length === 0 ? '(宝箱なし)' : (fo === fc.length ? `(${fo}/${fc.length}個済)` : `(${fo}/${fc.length}個)`);
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
  }

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

            
            ${renderAreaMapSection(areaName, planeName, areaChests, allChestsInArea)}
            <div class="chest-cards-grid">
        `;

        let displayedChests = areaChests;
        if (areaName === 'ガラムマサラ' && garamViewMode === 'floor' && !chestSearchQuery) {
          const targetFloor = 'ガラムマサラ' + garamSelectedFloor;
          displayedChests = areaChests.filter(c => normalizeMapName(c.mapName) === targetFloor);
        }
        if (displayedChests.length === 0) {
          html += `
            <div style="grid-column: 1 / -1; padding: 18px; text-align: center; background: #fff; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.88rem;">
              ガラムマサラ ${garamSelectedFloor}F には宝箱はありません（モンスター・ボス・フロア移動）。<br>
              上のフロア切り替えボタンまたはプルダウンメニューで前後の階をお選びください。
            </div>
          `;
        }
        displayedChests.forEach(c => {
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
                  ${c.shanilMark ? `<span class="badge badge-shanil-pos" title="相川ともき氏マップ上の対応位置: ${escapeHtml(c.shanilPlace || '')}">🗺️ マップ ${escapeHtml(c.shanilMark)}</span>` : ''}
                </div>
                <div class="chest-card-loc">
                  <span class="loc-map">📍 ${escapeHtml(c.mapName)}</span>
                  <span class="loc-coord">座標: <code>${escapeHtml(c.coord || '-')}</code></span>
                  ${c.shanilPlace ? `<span class="loc-shanil" title="相川ともき氏チャートでの場所表記">（マップ名: ${escapeHtml(c.shanilPlace)}）</span>` : ''}
                </div>
                ${c.note ? `<div class="chest-card-note">${escapeHtml(c.note)}</div>` : ''}
                ${c.diffNote ? `<div class="chest-diff-note">ℹ️ <strong>相川氏サイト照合:</strong> ${escapeHtml(c.diffNote)}</div>` : ''}
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


  function renderLevelingTab() {
    const container = document.getElementById('leveling-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>📈 最適レベリング（経験値稼ぎ）完全ガイド</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          Wikiに掲載されている解析データに基づく、ゲーム進行度別の最高効率レベリング狩り場と、裏技・システム仕様を活用した爆速育成テクニックのまとめです。
        </p>

        <!-- Warning Callout -->
        <div class="warning-callout">
          <h3>⚡ 爆速レベリング：魔法連打稼ぎテクニック</h3>
          <p>
            戦闘中に味方全体で<strong>消費MPの少ない低ランク魔法（単体魔法など）を1ターンに大量入力して戦闘を終える</strong>と、参加者全員の「魔法経験値」が爆発的に加算されます。<br>
            敵を物理攻撃だけで倒すのではなく、毎ターン必ず魔法を選択するのが早期育成の最大のコツです。
          </p>
        </div>

        <!-- Hunting Spots -->
        <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:20px; margin-bottom:12px;">
          🗺️ 進行度別・最高効率の狩り場一覧
        </h3>
        <div id="leveling-spots-list" style="display:flex; flex-direction:column; gap:12px;">
          ${LEVELING_DATA.spots.map(spot => `
            <div class="leveling-card">
              <div class="leveling-header">
                <div>
                  <span class="badge badge-plane">${escapeHtml(spot.phase)}</span>
                  <span class="badge" style="background:var(--bg-subtle); color:var(--text-secondary); margin-left:6px;">${escapeHtml(spot.plane)}</span>
                  <strong style="font-size:1rem; margin-left:8px; color:var(--text-primary);">${escapeHtml(spot.location)}</strong>
                </div>
                <span class="badge" style="background:#fef3c7; color:#92400e;">目安: ${escapeHtml(spot.recommended_lv)}</span>
              </div>
              <div class="leveling-body">
                <div><strong>🎯 狙い目モンスター:</strong> ${escapeHtml(spot.monsters)}</div>
                <div><strong>💡 稼ぎ方・特徴:</strong> ${escapeHtml(spot.basis)}</div>
                <div style="color:var(--text-muted); font-size:0.83rem;"><strong>⚠️ 備考・注意点:</strong> ${escapeHtml(spot.caution)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Boss Revival Exploit -->
        <div class="story-card missable" style="margin-top:24px;">
          <div style="font-weight:700; color:var(--warning-text); margin-bottom:4px; font-size:0.95rem;">
            Wiki明記・裏技仕様：ガラムマサラ ボス復活による無限経験値稼ぎ
          </div>
          <div style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5;">
            クリア後ダンジョン「ガラムマサラ」の特定の階層に出現するボスは、<strong>階層を移動して戻るか、ワープを挟むことで復活し何度でも再戦できる仕様</strong>が存在します。<br>
            ボスは通常敵の数十倍の破格の経験値とブラー（お金）を保有しているため、高レベル帯のレベリング速度が劇的に跳ね上がります。
          </div>
          <div style="font-size:0.83rem; color:var(--warning-text); margin-top:6px;">
            ⚠️ 注意点: ターニィが仲間になるボス#2など、一度倒すと二度と復活しないボスも存在します。詳細は各階層の攻略チャートを確認してください。
          </div>
        </div>

        <!-- Level Cap & EXP Table Specs -->
        <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:28px; margin-bottom:12px;">
          📊 レベル上限（LV999）とLV88以降の必要経験値仕様
        </h3>
        <div style="background-color:var(--bg-subtle); border-radius:var(--radius-md); padding:16px; font-size:0.88rem; line-height:1.6; color:var(--text-primary);">
          <ul style="padding-left:20px; margin-bottom:10px;">
            <li><strong>レベル上限:</strong> 本作の最大レベルは <strong>LV999</strong> です。</li>
            <li><strong>LV88以降の必要経験値:</strong> LV87まではレベルごとに必要経験値が増加しますが、<strong>LV88以降は次のレベルまでの必要経験値が一定（固定値）</strong>になります。そのため、後半〜クリア後は想像以上のハイペースでレベルが上がり続けます。</li>
            <li><strong>経験値分配の仕組み:</strong> 獲得経験値は生存メンバーの頭割りではなく、戦闘参加メンバー各員に基準値がしっかり入る仕様です。</li>
          </ul>
          <div style="font-size:0.8rem; color:var(--text-muted); text-align:right;">
            出典: <a href="https://wikiwiki.jp/magivaca/%E7%B5%8C%E9%A8%93%E5%80%A4%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB" target="_blank" rel="noopener noreferrer">経験値テーブル</a> |
            <a href="https://wikiwiki.jp/magivaca/%E9%AD%94%E6%B3%95%E7%B5%8C%E9%A8%93%E5%80%A4%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB" target="_blank" rel="noopener noreferrer">魔法経験値テーブル</a>
          </div>
        </div>
      </div>
    `;
  }

  // Render Scenario Chart Tab (完全復元・実データ構造 CHART_DATA.planes に完全合致)
  function renderChartTab() {
    const container = document.getElementById('chart-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>🗺️ シナリオ攻略チャート（全5プレーン）</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          物語の開始からクリア後「ガラムマサラ」までの進行手順、必須ボス、および<strong>取り返しのつかない要素</strong>をプレーン別に網羅しています。
        </p>

        <div class="chart-planes-tabs" id="chart-plane-tabs">
          <!-- Buttons for planes -->
        </div>

        <div id="chart-plane-display">
          <!-- Plane content injected here -->
        </div>
      </div>
    `;

    const tabsContainer = document.getElementById('chart-plane-tabs');
    const displayContainer = document.getElementById('chart-plane-display');

    if (tabsContainer && CHART_DATA.planes) {
      tabsContainer.innerHTML = '';
      CHART_DATA.planes.forEach((plane, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `filter-btn ${idx === 0 ? 'active' : ''}`;
        btn.textContent = plane.name;
        btn.addEventListener('click', () => {
          tabsContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderSinglePlane(plane);
        });
        tabsContainer.appendChild(btn);
      });

      renderSinglePlane(CHART_DATA.planes[0]);
    }

    function renderSinglePlane(plane) {
      if (!displayContainer) return;
      displayContainer.innerHTML = `
        <div style="margin-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-size:1.1rem; color:var(--accent);">${escapeHtml(plane.name)}</h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(plane.condition)}</span>
          </div>

          <div class="story-card" style="margin-bottom:16px;">
            <div style="font-weight:600; margin-bottom:4px;">📖 プレーン概要:</div>
            <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${escapeHtml(plane.summary)}</div>
          </div>

          <h4 style="font-size:0.95rem; margin-top:16px; margin-bottom:10px; color:var(--text-primary);">📌 重要イベントと進め方:</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${plane.events.map((ev, i) => `
              <div style="display:flex; gap:10px; font-size:0.88rem; background:white; padding:10px 14px; border:1px solid var(--border-light); border-radius:var(--radius-sm);">
                <span style="font-weight:bold; color:var(--accent); min-width:24px;">${i+1}.</span>
                <span>${escapeHtml(ev)}</span>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:16px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
            <div class="story-card" style="margin-bottom:0;">
              <strong style="color:var(--text-primary);">👾 出現ボス:</strong>
              <div style="margin-top:4px; font-size:0.88rem; color:var(--text-secondary);">${escapeHtml(plane.bosses)}</div>
            </div>
            <div class="story-card missable" style="margin-bottom:0;">
              <strong style="color:var(--warning-text);">⚠️ 取り返しのつかない要素:</strong>
              <div style="margin-top:4px; font-size:0.88rem; color:var(--warning-text);">${escapeHtml(plane.missable)}</div>
            </div>
          </div>

          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:14px; text-align:right;">
            出典: <a href="${escapeHtml(plane.url)}" target="_blank" rel="noopener noreferrer">Wiki「${escapeHtml(plane.name)}」</a>
          </div>
        </div>
      `;
    }
  }

  // Render Ofuro Set Chart Tab (完全復元・実データ構造 OFURO_CHART_DATA に完全合致)
  function renderOfuroTab() {
    const container = document.getElementById('ofuro-tab-content');
    if (!container || typeof OFURO_CHART_DATA === 'undefined') return;

    const data = OFURO_CHART_DATA;

    // Overview parts rows
    const partsRows = data.overview.parts.map(p => `
      <tr>
        <td style="font-weight:600;">${p.part}</td>
        <td style="font-weight:700; color:var(--accent);">${p.name}</td>
        <td>${p.single}</td>
        <td style="font-weight:600; color:#b45309;">${p.equipped}</td>
      </tr>
    `).join('');

    // Routes HTML
    const routesHtml = data.routes.map(r => `
      <div class="doc-card" style="margin-bottom:16px;">
        <div class="doc-card-header">
          <div class="doc-card-title">
            <span>✨ ${escapeHtml(r.name)}</span>
          </div>
        </div>
        <div class="doc-card-body">
          <p style="color:var(--text-secondary); margin-bottom:8px;">${escapeHtml(r.summary)}</p>
          
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${r.steps.map(st => `
              <div style="background-color:var(--bg-subtle); border-left:3px solid var(--accent); padding:10px 12px; border-radius:var(--radius-sm);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:var(--text-primary);">ステップ ${st.step}：${escapeHtml(st.action)}</strong>
                  <span class="doc-card-badge">${escapeHtml(st.location)}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-secondary); white-space:pre-line; line-height:1.55;">
                  ${escapeHtml(st.detail)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">♨️ ${escapeHtml(data.title)}</h2>
          <p class="section-desc">魔バスの『やさがし』乱数調整によって入手できる、全ステータス+51の超強力装備『おふろ装備一式』の入手手順チャートです。</p>
          <p class="section-source">
            一次情報出典: 
            <a href="${data.source_yasagashi}" target="_blank" rel="noopener noreferrer">やさがし</a> | 
            <a href="${data.source_equip}" target="_blank" rel="noopener noreferrer">装備アイテム</a> | 
            <a href="${data.source_beginner}" target="_blank" rel="noopener noreferrer">初心者向けプレイガイド</a>
          </p>
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:8px;">🛁 お風呂セット（おふろ装備一式）とは？</h3>
        <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-bottom:12px;">
          ${escapeHtml(data.overview.summary)}
        </p>

        <div class="data-table-wrapper" style="margin-bottom:20px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>部位</th>
                <th>アイテム名</th>
                <th>単体装備時の補正</th>
                <th>おふろ一式装備時（セット補正）</th>
              </tr>
            </thead>
            <tbody>
              ${partsRows}
            </tbody>
          </table>
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:8px;">📋 入手の前提条件</h3>
        <div class="info-block" style="margin-bottom:20px;">
          <ul style="margin-left:20px; font-size:0.86rem; display:flex; flex-direction:column; gap:4px;">
            ${data.prerequisites.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:8px;">⚠️ 取り返しのつかない要素・注意点</h3>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
          ${data.warnings.map(w => `
            <div class="warning-box">
              <span class="warning-icon">⚠️</span>
              <div>
                <strong>${escapeHtml(w.title)}:</strong><br>
                <span>${escapeHtml(w.desc)}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:10px;">🚀 入手手順チャート（ルート別）</h3>
        <div>
          ${routesHtml}
        </div>
      </div>
    `;
  }

  // Render System Tab (完全復元・実データ構造 SYSTEM_DATA.sections に完全合致)
  function renderSystemTab() {
    const container = document.getElementById('system-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>⚙️ システム仕様解説</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          Wiki記載のデータに基づく、仲間16名の性能、魔法属性の相性と精霊コンボ仕様、および重要システムの解説です。
        </p>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${SYSTEM_DATA.sections.map(sec => `
            <div class="story-card" style="margin-bottom:0;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="font-size:1.05rem; color:var(--accent); margin:0;">${escapeHtml(sec.title)}</h3>
                <a href="${escapeHtml(sec.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem;">Wiki該当節 ↗</a>
              </div>
              <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; white-space:pre-wrap;">${escapeHtml(sec.content)}</div>
            </div>
          `).join('')}
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          一次情報出典: 
          <a href="${escapeHtml(SYSTEM_DATA.party_url)}" target="_blank" rel="noopener noreferrer">仲間</a> | 
          <a href="${escapeHtml(SYSTEM_DATA.magic_url)}" target="_blank" rel="noopener noreferrer">魔法</a> | 
          <a href="${escapeHtml(SYSTEM_DATA.record_url)}" target="_blank" rel="noopener noreferrer">成績</a>
        </div>
      </div>
    `;
  }

  // Render Guides Tab (完全復元・実データ構造 PIRANHA_DATA, LIFESPAN_GUIDE に完全合致)
  function renderGuidesTab() {
    const container = document.getElementById('guides-tab-content');
    if (!container) return;

    const piranha = PIRANHA_DATA;
    const lifespan = LIFESPAN_GUIDE;

    container.innerHTML = `
      <div class="guide-section">
        <h2>🐟 ピラニア金貨銀貨・寿命ガイド</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          Wikiに掲載されているピラニアへのブラー（お金）投入によるコイン返還法則と、カエルグミ・ミミズグミ・まつぼっくりの寿命仕様です。
        </p>

        <!-- Piranha Rule -->
        <div class="filter-card" style="margin-bottom:20px;">
          <h3 style="font-size:1.05rem; color:var(--accent); margin-bottom:8px;">
            🐟 ${escapeHtml(piranha.title)}
          </h3>
          <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-bottom:12px;">
            ${escapeHtml(piranha.summary)}
          </p>
          <div style="font-size:0.83rem; color:var(--text-muted); margin-bottom:12px;">
            📍 出現場所: ${escapeHtml(piranha.location)}
          </div>
          <div class="warning-callout" style="margin-bottom:12px;">
            <strong>💡 最高効率の稼ぎテクニック:</strong><br>
            ${escapeHtml(piranha.tips)}
          </div>

          <h4 style="font-size:0.95rem; margin-top:14px; margin-bottom:8px; color:var(--text-primary);">📊 投入金額の剰余（あまり）と返還コイン対応表</h4>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>余り (あまり)</th>
                  <th>返還コイン</th>
                  <th>精霊契約での用途</th>
                </tr>
              </thead>
              <tbody>
                ${piranha.mod_table.map(t => `
                  <tr>
                    <td><strong>${escapeHtml(t.mod)}</strong></td>
                    <td><span class="badge badge-plane">${escapeHtml(t.coin)}</span></td>
                    <td style="font-size:0.82rem; color:var(--text-secondary);">${escapeHtml(t.use)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size:0.95rem; margin-top:16px; margin-bottom:8px; color:var(--text-primary);">📊 1回あたりの投入金額によるシフト法則表</h4>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>投入金額（ブラー）</th>
                  <th>シフト量</th>
                  <th>特徴・備考</th>
                </tr>
              </thead>
              <tbody>
                ${piranha.amount_table.map(t => `
                  <tr>
                    <td><strong>${escapeHtml(t.amount)}</strong></td>
                    <td>+${escapeHtml(t.shift)}</td>
                    <td style="font-size:0.82rem; color:var(--text-secondary);">${escapeHtml(t.feature)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Lifespan Specs -->
        <div class="filter-card">
          <h3 style="font-size:1.05rem; color:var(--accent); margin-bottom:8px;">
            ⏳ ${escapeHtml(lifespan.title)}
          </h3>
          <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-bottom:12px;">
            ${escapeHtml(lifespan.summary)}
          </p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${lifespan.details.map(r => `
              <div style="background:var(--bg-subtle); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem; border-left:3px solid var(--accent);">
                <strong>${escapeHtml(r.item)}:</strong> ${escapeHtml(r.rule)}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/%E3%83%94%E3%83%A9%E3%83%8B%E3%82%A2" target="_blank" rel="noopener noreferrer">ピラニア</a> |
          <a href="https://wikiwiki.jp/magivaca/%E5%9B%9E%E5%BE%A9%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0" target="_blank" rel="noopener noreferrer">回復アイテム（寿命）</a>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Tab: Missable Elements Integrated Timeline (Phase 10)
  // ==========================================================================
  function resolveTimelinePlacement(item) {
    // 既存データ（CHART_DATA.planes / STORY_CHOICES_DATA / CHESTS_DATA）の進行ステップに基づき機械的に配置を決定
    // チャート内に進行ステップが存在しない・または任意探索＋累積条件のみで前後関係が一意に定まらない項目は「順序未確定」に分類
    const loc = String(item.location || '');
    const plane = String(item.plane || '');

    // 1. 順序未確定（CHART_DATAの進行ステップに場所が存在しない・または累積条件のみで順序が機械的に決まらない項目）
    if (item.refId === '愛_5' || loc.includes('メースの家')) {
      return {
        groupKey: 'undetermined',
        groupTitle: '❓ 順序未確定（チャート進行順の特定不可・累積条件）',
        stepOrder: 901,
        stepLabel: '闇のプレーン / メースの家・クガンデ村',
        undeterminedReason: '既存のシナリオチャート・選択肢・宝箱データに「メースの家」「クガンデ村」の進行ステップが存在せず、闇のプレーン内の到達順序を機械的に特定できないため'
      };
    }
    if (item.refId === '光_4' || loc.includes('モイロロト村')) {
      return {
        groupKey: 'undetermined',
        groupTitle: '❓ 順序未確定（チャート進行順の特定不可・累積条件）',
        stepOrder: 902,
        stepLabel: '死のプレーン / モイロロト村・宿',
        undeterminedReason: '既存のシナリオチャート・選択肢データに「モイロロト村」の進行ステップが存在せず、かつ出現条件が「時間経過＋ニルヴァ4体以下」の累積制限であるため'
      };
    }
    if (item.refId === '光_5' || loc.includes('ラキューオ')) {
      return {
        groupKey: 'undetermined',
        groupTitle: '❓ 順序未確定（チャート進行順の特定不可・累積条件）',
        stepOrder: 903,
        stepLabel: '死のプレーン / ラキューオ7',
        undeterminedReason: '既存のシナリオチャート（CHART_DATA）の死のプレーン進行順に「ラキューオ」が含まれておらず（任意探索ダンジョン）、かつ条件が「ニルヴァ3体以下」の累積制限であるため'
      };
    }

    // 2. 物質のプレーン (CHART_DATA.planes[0])
    if (plane.includes('物質')) {
      if (loc.includes('ウィルオウィスプ') || loc.includes('図書室')) {
        return {
          groupKey: 'matter',
          groupTitle: '1️⃣ 物質のプレーン（ゲーム開始〜学校出発・海岸）',
          stepOrder: 101,
          stepLabel: 'Step 1-1: ウィルオウィスプ（魔法学校・校舎内）'
        };
      }
      return {
        groupKey: 'matter',
        groupTitle: '1️⃣ 物質のプレーン（ゲーム開始〜学校出発・海岸）',
        stepOrder: 102,
        stepLabel: 'Step 1-2: ヴァレンシア海岸・海岸の洞窟・カエルの林'
      };
    }

    // 3. 光のプレーン (CHART_DATA.planes[1] & STORY_CHOICES_DATA[1])
    if (plane.includes('光')) {
      if (loc.includes('トルーナ')) {
        return {
          groupKey: 'light',
          groupTitle: '2️⃣ 光のプレーン',
          stepOrder: 201,
          stepLabel: 'Step 2-1: トルーナ村'
        };
      }
      if (loc.includes('ベナコンチャ')) {
        return {
          groupKey: 'light',
          groupTitle: '2️⃣ 光のプレーン',
          stepOrder: 202,
          stepLabel: 'Step 2-2: ベナコンチャ遺跡（ボス『スノウヘア』撃破直後）'
        };
      }
      if (loc.includes('ワクティ') || loc.includes('レーミッツ')) {
        return {
          groupKey: 'light',
          groupTitle: '2️⃣ 光のプレーン',
          stepOrder: 203,
          stepLabel: 'Step 2-3: ワクティ村 ～ レーミッツ宮殿門'
        };
      }
      if (loc.includes('ピップルスタウン')) {
        return {
          groupKey: 'light',
          groupTitle: '2️⃣ 光のプレーン',
          stepOrder: 204,
          stepLabel: 'Step 2-4: ピップルスタウン'
        };
      }
      if (loc.includes('ラ・ロッシュ')) {
        return {
          groupKey: 'light',
          groupTitle: '2️⃣ 光のプレーン',
          stepOrder: 205,
          stepLabel: 'Step 2-5: ラ・ロッシュの塔'
        };
      }
    }

    // 4. ガラムマサラ・エクストラダンジョン（リドナヒー含む）(CHART_DATA.planes[4])
    if (plane.includes('ガラムマサラ') || loc.includes('リドナヒー') || loc.includes('ガラムマサラ')) {
      if (loc.includes('5F') || loc.includes('14F')) {
        return {
          groupKey: 'garam',
          groupTitle: '5️⃣ ガラムマサラ ＆ エクストラダンジョン（クリア後・深부）',
          stepOrder: 501,
          stepLabel: 'Step 5-1: ガラムマサラ 5F〜15F（カエルグミ擬態フロア）'
        };
      }
      if (loc.includes('50F')) {
        return {
          groupKey: 'garam',
          groupTitle: '5️⃣ ガラムマサラ ＆ エクストラダンジョン（クリア後・深部）',
          stepOrder: 502,
          stepLabel: 'Step 5-2: ガラムマサラ 50F（ディニレンドゥ戦）'
        };
      }
      if (loc.includes('リドナヒー')) {
        return {
          groupKey: 'garam',
          groupTitle: '5️⃣ ガラムマサラ ＆ エクストラダンジョン（クリア後・深部）',
          stepOrder: 503,
          stepLabel: 'Step 5-3: リドナヒー 10F（闇の魔法使い限定・光精霊7体目）'
        };
      }
    }

    // 5. 闇のプレーン (CHART_DATA.planes[2])
    if (plane.includes('闇')) {
      if (loc.includes('リギニオ密林')) {
        return {
          groupKey: 'dark',
          groupTitle: '3️⃣ 闇のプレーン',
          stepOrder: 301,
          stepLabel: 'Step 3-1: リギニオ密林（ボス『バダブーン』戦）'
        };
      }
      if (loc.includes('ずんどこ穴')) {
        return {
          groupKey: 'dark',
          groupTitle: '3️⃣ 闇のプレーン',
          stepOrder: 302,
          stepLabel: 'Step 3-2: ずんどこ穴（ドワーフ説得イベント）'
        };
      }
      if (loc.includes('アクアビット城')) {
        return {
          groupKey: 'dark',
          groupTitle: '3️⃣ 闇のプレーン',
          stepOrder: 303,
          stepLabel: 'Step 3-3: アクアビット城'
        };
      }
    }

    // 6. 死のプレーン (CHART_DATA.planes[3])
    if (plane.includes('死')) {
      if (loc.includes('ガスパチョ') || loc.includes('タンドーリ')) {
        return {
          groupKey: 'death',
          groupTitle: '4️⃣ 死のプレーン',
          stepOrder: 401,
          stepLabel: 'Step 4-1: ガスパチョ村 ～ タンドーリ（クライン割りイベント）'
        };
      }
      if (loc.includes('ピラミッド')) {
        return {
          groupKey: 'death',
          groupTitle: '4️⃣ 死のプレーン',
          stepOrder: 402,
          stepLabel: 'Step 4-2: ピラミッド'
        };
      }
      if (loc.includes('死の回廊') || loc.includes('暗闇の地')) {
        return {
          groupKey: 'death',
          groupTitle: '4️⃣ 死のプレーン',
          stepOrder: 403,
          stepLabel: 'Step 4-3: 死の回廊 ～ 暗闇の地（光の魔法使い覚醒）'
        };
      }
    }

    // 万一上記ステップに該当しない項目があれば推測せず「順序未確定」へ分類
    return {
      groupKey: 'undetermined',
      groupTitle: '❓ 順序未確定（チャート進行順の特定不可・累積条件）',
      stepOrder: 999,
      stepLabel: `${plane} / ${loc}`,
      undeterminedReason: '既存チャートの進行ステップと機械的に照合できないため'
    };
  }

  function buildMissableTimelineItems() {
    const items = [];

    // 1. 精霊データ (SPIRITS_DATA where s.missable)
    if (typeof SPIRITS_DATA !== 'undefined' && Array.isArray(SPIRITS_DATA)) {
      SPIRITS_DATA.filter(s => Boolean(s.missable)).forEach((s, idx) => {
        const planeLabel = Array.isArray(s.planes) && s.planes.length > 0
          ? s.planes.map(p => p.endsWith('のプレーン') ? p : `${p}のプレーン`).join('・')
          : '不明';
        const locLabel = `${s.locationClean || ''}${s.locationDetail ? '（' + s.locationDetail + '）' : ''}`;
        const rawItem = {
          timelineId: `tl_spirit_${s.id}`,
          category: 'spirit',
          categoryLabel: '🧚 精霊',
          refId: s.id,
          plane: planeLabel,
          location: locLabel,
          title: `${s.element}の精霊 ${s.spiritName} #${s.index}`,
          subMeta: [
            s.condition ? `出現条件: ${s.condition}` : '',
            s.requirement ? `要求: ${s.requirement}` : ''
          ].filter(Boolean).join(' ／ '),
          warningText: s.missable,
          sourceUrl: s.sourceUrl || 'https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A',
          sourceOrder: idx
        };
        const placement = resolveTimelinePlacement(rawItem);
        items.push(Object.assign(rawItem, placement));
      });
    }

    // 2. 宝箱データ (CHESTS_DATA where c.missable)
    if (typeof CHESTS_DATA !== 'undefined' && Array.isArray(CHESTS_DATA)) {
      CHESTS_DATA.filter(c => Boolean(c.missable)).forEach((c, idx) => {
        const locLabel = `${c.area} / ${c.mapName}${c.locationDetail ? '（' + c.locationDetail + '）' : ''}`;
        const rawItem = {
          timelineId: `tl_chest_${c.id}`,
          category: 'chest',
          categoryLabel: '🧰 宝箱',
          refId: c.id,
          plane: c.plane || '',
          location: locLabel,
          title: `宝箱：${c.item}（${c.mapName}）`,
          subMeta: c.locationDetail ? `詳細位置: ${c.locationDetail}` : '',
          warningText: c.missableReason || '期間限定の宝箱（取り返しがつかない）',
          sourceUrl: c.sourceUrl || 'https://wikiwiki.jp/magivaca/%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E6%8B%BE%E5%BE%97%E7%89%A9',
          sourceOrder: 100 + idx
        };
        const placement = resolveTimelinePlacement(rawItem);
        items.push(Object.assign(rawItem, placement));
      });
    }

    // 3. ストーリー選択肢データ (STORY_CHOICES_DATA where ev.missable)
    if (typeof STORY_CHOICES_DATA !== 'undefined' && Array.isArray(STORY_CHOICES_DATA)) {
      let evCounter = 0;
      STORY_CHOICES_DATA.forEach((p, pi) => {
        if (!Array.isArray(p.events)) return;
        p.events.forEach((ev, ei) => {
          if (!ev.missable) return;
          const choiceSummary = Array.isArray(ev.choices)
            ? ev.choices.map(c => `${c.action}: ${c.options}`).join(' ／ ')
            : '';
          const rawItem = {
            timelineId: `tl_story_${pi}_${ei}`,
            category: 'event',
            categoryLabel: '📜 イベント',
            refId: ev.scene,
            plane: p.plane || '',
            location: ev.location || '',
            title: ev.scene || '',
            subMeta: choiceSummary,
            warningText: ev.notes || '',
            sourceUrl: ev.url || p.url || 'https://wikiwiki.jp/magivaca/%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88',
            sourceOrder: 200 + (evCounter++)
          };
          const placement = resolveTimelinePlacement(rawItem);
          items.push(Object.assign(rawItem, placement));
        });
      });
    }

    // ソート: stepOrder 昇順 -> sourceOrder 昇順
    items.sort((a, b) => {
      if (a.stepOrder !== b.stepOrder) return a.stepOrder - b.stepOrder;
      return a.sourceOrder - b.sourceOrder;
    });

    return items;
  }
  window.buildMissableTimelineItems = buildMissableTimelineItems;

  function jumpFromTimelineToSource(category, refId) {
    if (category === 'spirit') {
      const spirit = (typeof SPIRITS_DATA !== 'undefined' ? SPIRITS_DATA : []).find(s => s.id === refId);
      currentFilters.element = 'all';
      currentFilters.plane = 'all';
      currentFilters.reqTag = 'all';
      currentFilters.onlyWarning = false;
      currentFilters.hideCompleted = false;
      currentFilters.planeProgressOnly = false;
      currentFilters.query = spirit ? spirit.locationClean : refId;
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = currentFilters.query;
      renderSpiritsList();
      window.switchTab('tab-spirits');
      return;
    }

    if (category === 'chest') {
      const chest = (typeof CHESTS_DATA !== 'undefined' ? CHESTS_DATA : []).find(c => c.id === refId);
      chestPlane = 'all';
      chestOnlyUnchecked = false;
      chestOnlyMissable = false;
      chestOnlyStar = false;
      chestSearchQuery = chest ? chest.item : refId;
      if (chest && collapsedAreas.has(chest.area)) {
        collapsedAreas.delete(chest.area);
      }
      renderChestsTab();
      window.switchTab('tab-chests');
      setTimeout(() => {
        if (typeof document !== 'undefined' && document.querySelector) {
          const card = document.querySelector(`[data-chest-id="${refId}"]`);
          if (card && card.scrollIntoView) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('chest-card-highlight');
            setTimeout(() => card.classList.remove('chest-card-highlight'), 2000);
          }
        }
      }, 100);
      return;
    }

    if (category === 'event') {
      storyPlane = 'all';
      renderStoryTab();
      window.switchTab('tab-story');
      setTimeout(() => {
        if (typeof document !== 'undefined' && document.querySelectorAll) {
          const cards = document.querySelectorAll('.story-card');
          for (const card of cards) {
            if (card.getAttribute && card.getAttribute('data-story-scene') === refId) {
              if (card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              break;
            }
          }
        }
      }, 100);
    }
  }
  window.jumpFromTimelineToSource = jumpFromTimelineToSource;

  function renderTimelineTab() {
    const container = document.getElementById('timeline-tab-content');
    if (!container) return;

    const allItems = buildMissableTimelineItems();
    const totalCount = allItems.length;
    const checkedCount = allItems.filter(it => checkedTimeline.has(it.timelineId)).length;
    const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    const spiritCount = allItems.filter(it => it.category === 'spirit').length;
    const chestCount = allItems.filter(it => it.category === 'chest').length;
    const eventCount = allItems.filter(it => it.category === 'event').length;
    const undeterminedCount = allItems.filter(it => it.groupKey === 'undetermined').length;

    const filteredItems = allItems.filter(it => {
      if (timelineCategoryFilter !== 'all' && it.category !== timelineCategoryFilter) return false;
      if (timelineGroupFilter !== 'all' && it.groupKey !== timelineGroupFilter) return false;
      if (timelineOnlyUnchecked && checkedTimeline.has(it.timelineId)) return false;
      return true;
    });

    // グループごとに束ねる（順序を維持）
    const groups = [];
    const groupMap = new Map();
    filteredItems.forEach(it => {
      if (!groupMap.has(it.groupKey)) {
        const g = {
          groupKey: it.groupKey,
          groupTitle: it.groupTitle,
          items: []
        };
        groupMap.set(it.groupKey, g);
        groups.push(g);
      }
      groupMap.get(it.groupKey).items.push(it);
    });

    let html = `
      <div class="guide-section">
        <h2>⏰ 取り返しのつかない要素（時限要素）統合タイムライン</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:14px;">
          サイト内の<strong>「精霊（${spiritCount}件）」「宝箱（${chestCount}件）」「ストーリー選択肢・イベント（${eventCount}件）」</strong>に散らばっている取り返しのつかない要素（計<strong>${totalCount}件</strong>）を、ストーリー進行順のタイムラインで一括確認・現地チェックできるページです。
        </p>

        <!-- Nintendo Switch Online 前提の注記 -->
        <div class="timeline-nso-callout" style="background:#eff6ff; border:1px solid #93c5fd; border-left:5px solid #2563eb; border-radius:var(--radius-md); padding:12px 16px; margin-bottom:16px; font-size:0.86rem; color:#1e3a8a; line-height:1.6;">
          <div style="font-weight:700; font-size:0.94rem; margin-bottom:4px;">🎮 Nintendo Switch Online（GBA版）でプレイ中の方へ</div>
          <div>
            Switch Online版の<strong>「どこでもセーブ（中断セーブ）」</strong>や<strong>「巻き戻し機能」</strong>を活用することで、直前の選択肢ミスや時間経過イベント（レーミッツ宮殿門の自動開封やガラムマサラ14Fの擬態消失など）のリスクは大幅に下げられます。<br>
            ただし、<strong>長期間進行してから発覚するフラグ消滅</strong>（スノウヘア撃破後のトルーナ村寄り道忘れ、ずんどこ穴のドワーフ説得前のトースト3未回収、カエルグミ累計捕獲数オーバー、闇精霊ニルヴァの仲間にしすぎ、タンドーリでのクライン割り、シサバレイ制覇前の光覚醒など）は巻き戻しだけでは戻れない場合があるため、原作仕様どおり全項目を掲載しています。
          </div>
        </div>

        <!-- タイムライン専用進捗バー -->
        <div class="collection-progress-bar-wrap" style="margin-bottom:16px;">
          <div>
            <strong>⏰ 時限要素の確認・回収進捗:</strong>
            <span style="font-size:1.1rem; font-weight:bold; color:var(--accent); margin-left:8px;">${checkedCount} / ${totalCount} 件 (${pct}%)</span>
            <span style="font-size:0.78rem; color:var(--text-muted); display:block; margin-top:2px;">
              ※タイムライン専用キー（<code>magivaca_timeline_checklist_v1</code>）で独立保存。精霊・宝箱タブの個別チェック状態は上書きせず「参照バッジ」として併記します。
            </span>
          </div>
          <div style="flex:1; max-width:280px;">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>
        </div>

        <!-- フィルターパネル -->
        <div class="filter-card" style="margin-bottom:18px; padding:12px 14px;">
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:10px;">
            <span style="font-size:0.82rem; font-weight:700; color:var(--text-secondary);">種別:</span>
            <button type="button" class="filter-btn tl-cat-btn ${timelineCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">すべて (${totalCount})</button>
            <button type="button" class="filter-btn tl-cat-btn ${timelineCategoryFilter === 'spirit' ? 'active' : ''}" data-cat="spirit">🧚 精霊 (${spiritCount})</button>
            <button type="button" class="filter-btn tl-cat-btn ${timelineCategoryFilter === 'chest' ? 'active' : ''}" data-cat="chest">🧰 宝箱 (${chestCount})</button>
            <button type="button" class="filter-btn tl-cat-btn ${timelineCategoryFilter === 'event' ? 'active' : ''}" data-cat="event">📜 イベント (${eventCount})</button>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between;">
            <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
              <span style="font-size:0.82rem; font-weight:700; color:var(--text-secondary);">進行帯:</span>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'all' ? 'active' : ''}" data-grp="all">全区間</button>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'matter' ? 'active' : ''}" data-grp="matter">物質</button>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'light' ? 'active' : ''}" data-grp="light">光</button>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'dark' ? 'active' : ''}" data-grp="dark">闇</button>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'death' ? 'active' : ''}" data-grp="death">死</button>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'garam' ? 'active' : ''}" data-grp="garam">クリア後</button>
              <button type="button" class="filter-btn tl-grp-btn ${timelineGroupFilter === 'undetermined' ? 'active' : ''}" data-grp="undetermined">❓ 順序未確定 (${undeterminedCount})</button>
            </div>
            <label class="checkbox-toggle-label">
              <input type="checkbox" id="tl-filter-unchecked" ${timelineOnlyUnchecked ? 'checked' : ''}>
              <span>未チェックのみ表示</span>
            </label>
          </div>
        </div>

        <div class="timeline-groups-container">
    `;

    if (groups.length === 0) {
      html += `
        <div class="empty-state" style="padding:28px; text-align:center; color:var(--text-muted);">
          条件に一致する時限要素はありません。
        </div>
      `;
    } else {
      groups.forEach(group => {
        const isUndetermined = group.groupKey === 'undetermined';
        html += `
          <div class="timeline-group-block ${isUndetermined ? 'timeline-group-undetermined' : ''}" style="margin-bottom:24px;">
            <h3 class="timeline-group-heading" style="font-size:1.05rem; color:${isUndetermined ? '#b45309' : 'var(--accent)'}; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${isUndetermined ? '#fcd34d' : 'var(--accent-light)'}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span>${escapeHtml(group.groupTitle)}</span>
              <span class="badge ${isUndetermined ? 'badge-warning' : 'badge-plane'}">${group.items.length} 件</span>
            </h3>
            ${isUndetermined ? `
              <div style="font-size:0.83rem; color:#92400e; background:#fffbeb; border:1px solid #fde68a; border-radius:var(--radius-sm); padding:8px 12px; margin-bottom:12px;">
                ⚠️ 以下の項目は、既存データ（シナリオチャート・選択肢・宝箱一覧）内に該当ロケーションの進行ステップが存在しない、またはプレイ時間・累積捕獲数等の全体条件であるため、推測で順序を作らず「順序未確定」として分離表示しています。
              </div>
            ` : ''}
            <div class="timeline-step-list" style="display:flex; flex-direction:column; gap:10px; border-left:3px solid ${isUndetermined ? '#f59e0b' : 'var(--accent)'}; padding-left:12px; margin-left:4px;">
        `;

        let lastStepLabel = '';
        group.items.forEach(item => {
          const isChecked = checkedTimeline.has(item.timelineId);
          if (item.stepLabel !== lastStepLabel) {
            lastStepLabel = item.stepLabel;
            html += `
              <div class="timeline-step-marker" style="font-size:0.84rem; font-weight:700; color:var(--text-secondary); margin-top:4px; display:flex; align-items:center; gap:6px;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${isUndetermined ? '#f59e0b' : 'var(--accent)'};"></span>
                <span>${escapeHtml(item.stepLabel)}</span>
              </div>
            `;
          }

          // 既存チェック（精霊・宝箱）の読み取り専用参照バッジ
          let refBadgeHtml = '';
          if (item.category === 'spirit') {
            const spiritChecked = checkedSpirits.has(item.refId);
            refBadgeHtml = `<span class="badge" style="font-size:0.74rem; background:${spiritChecked ? '#dcfce7' : '#f1f5f9'}; color:${spiritChecked ? '#166534' : '#475569'}; border:1px solid ${spiritChecked ? '#86efac' : '#cbd5e1'};">参照(精霊タブ): ${spiritChecked ? '✅ 仲間済' : '未チェック'}</span>`;
          } else if (item.category === 'chest') {
            const chestChecked = checkedChests.has(item.refId);
            refBadgeHtml = `<span class="badge" style="font-size:0.74rem; background:${chestChecked ? '#dcfce7' : '#f1f5f9'}; color:${chestChecked ? '#166534' : '#475569'}; border:1px solid ${chestChecked ? '#86efac' : '#cbd5e1'};">参照(宝箱タブ): ${chestChecked ? '✅ 開封済' : '未開封'}</span>`;
          }

          const jumpLabel = item.category === 'spirit'
            ? '🧚 精霊一覧へ移動'
            : (item.category === 'chest' ? '🧰 宝箱マップへ移動' : '📜 選択肢タブへ移動');

          html += `
            <div class="collection-card timeline-item-card ${isChecked ? 'checked' : ''} missable" data-timeline-id="${escapeHtml(item.timelineId)}" style="margin-bottom:0;">
              <input type="checkbox" class="collection-checkbox tl-item-chk" data-tl-id="${escapeHtml(item.timelineId)}" ${isChecked ? 'checked' : ''} aria-label="${escapeHtml(item.title)} を確認済みにする">
              <div class="collection-content" style="width:100%;">
                <div class="collection-header-row" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:6px;">
                  <div>
                    <span class="badge badge-warning" style="margin-right:6px;">${escapeHtml(item.categoryLabel)}</span>
                    <strong class="collection-title" style="font-size:0.95rem;">${escapeHtml(item.title)}</strong>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                    <span class="badge badge-plane">${escapeHtml(item.plane)}</span>
                    ${refBadgeHtml}
                  </div>
                </div>

                <div style="font-size:0.83rem; color:var(--text-secondary); margin-top:4px;">
                  📍 <strong>場所:</strong> ${escapeHtml(item.location)}
                  ${item.subMeta ? `<br>🔹 <span>${escapeHtml(item.subMeta)}</span>` : ''}
                </div>

                <div class="story-notes" style="margin-top:8px; padding:8px 10px; background:#fff1f2; border-left:3px solid #e11d48; border-radius:4px; font-size:0.84rem; color:#881337;">
                  <strong>⚠️ 時限・取り返し注意:</strong> ${escapeHtml(item.warningText)}
                </div>

                ${item.undeterminedReason ? `
                  <div style="margin-top:6px; font-size:0.79rem; color:#92400e; background:#fef3c7; padding:5px 8px; border-radius:4px;">
                    <strong>❓ 順序未確定の理由:</strong> ${escapeHtml(item.undeterminedReason)}
                  </div>
                ` : ''}

                <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-top:8px; padding-top:6px; border-top:1px dashed var(--border-color); font-size:0.8rem;">
                  <button type="button" class="btn btn-sm btn-outline tl-jump-btn" data-cat="${escapeHtml(item.category)}" data-ref="${escapeHtml(item.refId)}" style="padding:3px 10px; font-size:0.78rem;">
                    ${jumpLabel} →
                  </button>
                  <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">
                    📖 出典Wikiを確認 ↗
                  </a>
                </div>
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // イベントバインド
    container.querySelectorAll('.tl-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        timelineCategoryFilter = btn.dataset.cat;
        renderTimelineTab();
      });
    });

    container.querySelectorAll('.tl-grp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        timelineGroupFilter = btn.dataset.grp;
        renderTimelineTab();
      });
    });

    const unchkEl = document.getElementById('tl-filter-unchecked');
    if (unchkEl) {
      unchkEl.addEventListener('change', (e) => {
        timelineOnlyUnchecked = e.target.checked;
        renderTimelineTab();
      });
    }

    container.querySelectorAll('.tl-item-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        toggleTimelineItem(chk.dataset.tlId);
      });
    });

    container.querySelectorAll('.tl-jump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        jumpFromTimelineToSource(btn.dataset.cat, btn.dataset.ref);
      });
    });
  }
  window.renderTimelineTab = renderTimelineTab;

  // Update UI Function
  function updateUI() {
    updateProgressUI();
    renderSpiritsList();
    renderCompleteGuideTab();
    renderItemsTab();
    renderMonstersTab();
    renderStoryTab();
    renderCollectionsTab();
    renderChestsTab();
    renderLevelingTab();
    renderChartTab();
    renderOfuroTab();
    renderSystemTab();
    renderGuidesTab();
    renderTimelineTab();
  }
  window.updateUI = updateUI;
  window.renderMonstersTab = renderMonstersTab;
  window.renderStoryTab = renderStoryTab;

  // Escape HTML helper
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Setup Event Listeners
  function setupEvents() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        window.switchTab(btn.dataset.tab);
      });
    });

    // Element Filter Accordion Toggle (スマホ向け)
    const elemFilterToggle = document.getElementById('element-filter-toggle');
    const elemFilterAccordion = document.getElementById('element-filter-accordion');
    if (elemFilterToggle && elemFilterAccordion) {
      elemFilterToggle.addEventListener('click', () => {
        const isExp = elemFilterAccordion.classList.toggle('expanded');
        elemFilterToggle.setAttribute('aria-expanded', isExp ? 'true' : 'false');
      });
      elemFilterToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          elemFilterToggle.click();
        }
      });
    }

    // Search input (Spirits)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentFilters.query = e.target.value;
        renderSpiritsList();
      });
    }

    // Plane filter buttons (Spirits)
    const planeBtns = document.querySelectorAll('.plane-filter-btn');
    planeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        planeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.plane = btn.dataset.plane;
        renderSpiritsList();
      });
    });

    // Req Tag filter buttons (Spirits)
    const tagBtns = document.querySelectorAll('.tag-filter-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tagBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.reqTag = btn.dataset.tag;
        renderSpiritsList();
      });
    });

    // Toggle: Warning only
    const warnCheck = document.getElementById('filter-warning-only');
    if (warnCheck) {
      warnCheck.addEventListener('change', (e) => {
        currentFilters.onlyWarning = e.target.checked;
        renderSpiritsList();
      });
    }

    // Toggle: Hide completed
    const hideCheck = document.getElementById('filter-hide-completed');
    if (hideCheck) {
      hideCheck.addEventListener('change', (e) => {
        currentFilters.hideCompleted = e.target.checked;
        renderSpiritsList();
      });
    }

    // Toggle: Phase 5 Plane Progress Linked Filter (選択プレーンの未収集のみ)
    const planeProgCheck = document.getElementById('filter-plane-progress-only');
    if (planeProgCheck) {
      planeProgCheck.addEventListener('change', (e) => {
        currentFilters.planeProgressOnly = e.target.checked;
        renderSpiritsList();
      });
    }

    // Reset Checklist Button
    const resetBtn = document.getElementById('btn-reset-checklist');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (checkedSpirits.size === 0) {
          alert('現在チェックされている精霊はありません。');
          return;
        }
        if (confirm(`チェックした精霊（${checkedSpirits.size}体）をすべて解除しますか？この操作は元に戻せません。`)) {
          checkedSpirits.clear();
          saveState();
          updateUI();
        }
      });
    }

    // Backup / Export Modal
    const backupBtn = document.getElementById('btn-backup');
    const modal = document.getElementById('backup-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const exportTextarea = document.getElementById('backup-textarea');
    const copyBtn = document.getElementById('btn-copy-backup');
    const importBtn = document.getElementById('btn-import-backup');

    if (backupBtn && modal) {
      backupBtn.addEventListener('click', () => {
        modal.classList.add('active');
        if (exportTextarea) {
          const fullBackup = {
            version: '2.0',
            spirits: Array.from(checkedSpirits),
            magicNotes: Array.from(checkedMagicNotes),
            mimicCoins: Array.from(checkedMimicCoins),
            records: Array.from(checkedRecords),
            chests: Array.from(checkedChests),
            timeline: Array.from(checkedTimeline)
          };
          exportTextarea.value = JSON.stringify(fullBackup, null, 2);
        }
      });
    }

    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }

    if (copyBtn && exportTextarea) {
      copyBtn.addEventListener('click', () => {
        exportTextarea.select();
        navigator.clipboard.writeText(exportTextarea.value).then(() => {
          alert('クリップボードにバックアップデータをコピーしました。');
        }).catch(() => {
          alert('コピーに失敗しました。テキストエリアから手動でコピーしてください。');
        });
      });
    }

    if (importBtn && exportTextarea) {
      importBtn.addEventListener('click', () => {
        try {
          const val = exportTextarea.value.trim();
          if (!val) {
            alert('インポートするJSONデータを入力してください。');
            return;
          }
          const parsed = JSON.parse(val);

          // 従来の配列形式（精霊IDの配列）の互換サポート
          if (Array.isArray(parsed)) {
            checkedSpirits = new Set(parsed);
          } else if (typeof parsed === 'object' && parsed !== null) {
            // 新しい統合バックアップ形式
            if (Array.isArray(parsed.spirits)) checkedSpirits = new Set(parsed.spirits);
            if (Array.isArray(parsed.magicNotes)) checkedMagicNotes = new Set(parsed.magicNotes);
            if (Array.isArray(parsed.mimicCoins)) checkedMimicCoins = new Set(parsed.mimicCoins);
            if (Array.isArray(parsed.records)) checkedRecords = new Set(parsed.records);
            if (Array.isArray(parsed.chests)) checkedChests = new Set(parsed.chests);
            if (Array.isArray(parsed.timeline)) checkedTimeline = new Set(parsed.timeline);
          } else {
            alert('無効なデータ形式です。');
            return;
          }

          saveState();
          updateUI();
          modal.classList.remove('active');
          alert(`正常にインポートしました。\n・精霊: ${checkedSpirits.size}体\n・魔法の手帳: ${checkedMagicNotes.size}項目\n・ハズレコイン: ${checkedMimicCoins.size}枚\n・成績項目: ${checkedRecords.size}件\n・宝箱: ${checkedChests.size}個`);
        } catch (err) {
          alert('JSONの解析に失敗しました。正しいデータ形式か確認してください。');
        }
      });
    }
  }

  // Init
  function init() {
    loadState();
    setupEvents();
    updateUI();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
