// マジカルバケーション 攻略サポート - アプリケーションロジック
// 端末内 localStorage で進捗を管理（外部通信なし・完全静的）

(function() {
  'use strict';

  // LocalStorage Keys
  const STORAGE_KEY = 'magivaca_spirit_checklist_v1';
  const STORAGE_KEY_MAGIC_NOTES = 'magivaca_magic_notes_v1';
  const STORAGE_KEY_MIMIC_COINS = 'magivaca_mimic_coins_v1';
  const STORAGE_KEY_RECORDS = 'magivaca_records_v1';

  // State: Checklists
  let checkedSpirits = new Set();
  let checkedMagicNotes = new Set();
  let checkedMimicCoins = new Set();
  let checkedRecords = new Set();

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
    tabBtns.forEach(b => {
      if (b.dataset.tab === tabId) {
        b.classList.add('active');
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
  }

  function setElementFilter(elem) {
    currentFilters.element = elem;
    updateProgressUI();
    renderSpiritsList();
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
  // Tab: Monsters & Drop Rates (Phase 5 - Priority 1)
  // ==========================================================================
  function renderMonstersTab() {
    const container = document.getElementById('monsters-tab-content');
    if (!container) return;

    container.innerHTML = `
      <div class="guide-section">
        <h2>👾 モンスター図鑑 ＆ ドロップ確率一覧</h2>
        <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:16px;">
          ゲーム内の図鑑機能およびWikiで解析されたモンスターデータ・ドロップ仕様のまとめです。
        </p>

        <!-- Warning Callout for Monster Completing -->
        <div class="warning-callout" style="margin-bottom:20px;">
          <h3>⚠️ モンスター図鑑コンプリートの重大警告</h3>
          <p>
            ガラムマサラ（ずんどこ穴）50Fのボス#1<strong>「ディニレンドゥ」</strong>は、難易度「オニ」で文鳥を仲間にした時点で<strong>難易度に関わらず二度とフィールド上に出現しなくなります</strong>。<br>
            モンスター図鑑を埋めたい場合は、<strong>必ず1周目に難易度「ヌル」または「ナミ」で50階まで進め、ディニレンドゥを倒して図鑑登録してからオニに挑んでください</strong>。
          </p>
        </div>

        <!-- Boss Monsters -->
        <h3 style="font-size:1.05rem; color:var(--text-primary); margin-bottom:8px;">
          👑 図鑑非掲載モンスター・ボス一覧 (${BOSS_MONSTERS_DATA.length}体)
        </h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:10px;">
          ゲーム内のモンスター図鑑には番号が掲載されないボス格モンスターの一覧です。
        </p>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>モンスター名</th>
                <th>レベル</th>
                <th>属性</th>
                <th>出現場所</th>
                <th>出現確率</th>
              </tr>
            </thead>
            <tbody>
              ${BOSS_MONSTERS_DATA.map(b => `
                <tr>
                  <td><strong>${escapeHtml(b.name)}</strong></td>
                  <td>LV ${escapeHtml(b.level)}</td>
                  <td><span class="badge badge-plane">${escapeHtml(b.element)}</span></td>
                  <td>${escapeHtml(b.location)}</td>
                  <td>${escapeHtml(b.rate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Monster Encyclopedia Links -->
        <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:24px; margin-bottom:8px;">
          📚 モンスター図鑑（全288種）属性別Wikiインデックス
        </h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">
          詳細なステータス・獲得経験値・使用魔法・出現PT編成は各Wikiページでご確認いただけます。
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:10px; margin-bottom:24px;">
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/01" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🔥 001～014 (火)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/02" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🌪️ 015～028 (風)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/03" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>☠️ 029～042 (毒)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/04" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>💄 043～056 (美)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/05" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>⚔️ 057～070 (刃)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/06" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🔔 071～084 (音)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/07" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🪨 085～098 (石)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/08" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🐛 099～112 (虫)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/09" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🌲 113～126 (木)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/10" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🐺 127～140 (獣)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/11" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>💧 141～154 (水)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/12" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>⚡ 155～168 (雷)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/13" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🏺 169～183 (古)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/14" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>🌑 184～220 (闇)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/15" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>✨ 221～230 (光)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/16" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>💖 231～240 (愛)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/MonsterList/17" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>❓ 241～288 (その他)</strong> ↗
          </a>
          <a class="filter-card" href="https://wikiwiki.jp/magivaca/%E7%A8%AE%E6%97%8F%E5%9B%B3%E9%91%91" target="_blank" rel="noopener noreferrer" style="text-decoration:none; padding:10px 14px;">
            <strong>📖 種族図鑑（全22種）</strong> ↗
          </a>
        </div>

        <!-- Drop Specification Explanation -->
        <h3 style="font-size:1.05rem; color:var(--text-primary); margin-top:20px; margin-bottom:8px;">
          📊 ドロップ確率と「期待値」の仕様
        </h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
          マジカルバケーションでは、1回の戦闘で同じアイテムを2個以上ドロップすることがあります。<br>
          例えば「森の洞窟でのカエルグミ緑」の場合、入手個数0個が76.51%、1個が21.69%、2個が1.76%、3個が0.04%となっており、戦闘100回あたりの平均入手期待値は <strong>25.33個</strong> となります。<br>
          （アイテム逆引き検索では、ドロップ率またはこの期待値が表示されます）
        </p>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; text-align:right;">
          出典: <a href="https://wikiwiki.jp/magivaca/MonsterList" target="_blank" rel="noopener noreferrer">モンスター図鑑</a> |
          <a href="https://wikiwiki.jp/magivaca/%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener noreferrer">アイテムドロップ一覧</a>
        </div>
      </div>
    `;
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
          <div class="story-card ${ev.missable ? 'missable' : ''}">
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

  // Update UI Function
  function updateUI() {
    updateProgressUI();
    renderSpiritsList();
    renderCompleteGuideTab();
    renderItemsTab();
    renderMonstersTab();
    renderStoryTab();
    renderCollectionsTab();
    renderLevelingTab();
    renderChartTab();
    renderOfuroTab();
    renderSystemTab();
    renderGuidesTab();
  }

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
            records: Array.from(checkedRecords)
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
          } else {
            alert('無効なデータ形式です。');
            return;
          }

          saveState();
          updateUI();
          modal.classList.remove('active');
          alert(`正常にインポートしました。\n・精霊: ${checkedSpirits.size}体\n・魔法の手帳: ${checkedMagicNotes.size}項目\n・ハズレコイン: ${checkedMimicCoins.size}枚\n・成績項目: ${checkedRecords.size}件`);
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
