// マジカルバケーション 攻略サポート - アプリケーションロジック
// 端末内 localStorage で進捗を管理（外部通信なし）

(function() {
  'use strict';

  // 既存のキーと形式を完全維持
  const STORAGE_KEY = 'magivaca_spirit_checklist_v1';

  // State
  let checkedSpirits = new Set();
  let currentFilters = {
    element: 'all',
    plane: 'all',
    reqTag: 'all',
    onlyWarning: false,
    hideCompleted: false,
    query: ''
  };

  // Load state from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          checkedSpirits = new Set(arr);
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  // Save state to localStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedSpirits)));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  // Toggle spirit checked
  function toggleSpirit(id) {
    if (checkedSpirits.has(id)) {
      checkedSpirits.delete(id);
    } else {
      checkedSpirits.add(id);
    }
    saveState();
    updateUI();
  }

  // Progress calculations
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
    
    // Overall
    const countEl = document.getElementById('overall-progress-count');
    const barEl = document.getElementById('overall-progress-bar');
    if (countEl) {
      countEl.textContent = `${prog.checkedCount} / ${prog.total} (${prog.percent}%)`;
    }
    if (barEl) {
      barEl.style.width = `${prog.percent}%`;
    }

    // Element chips
    const gridEl = document.getElementById('element-tracker-grid');
    if (gridEl) {
      gridEl.innerHTML = '';
      
      // "All" chip
      const allChip = document.createElement('div');
      allChip.className = `element-chip ${currentFilters.element === 'all' ? 'selected' : ''}`;
      allChip.innerHTML = `
        <div class="chip-left">
          <span class="elem-badge-icon" style="background:#334155;">全</span>
          <span class="elem-name">全属性</span>
        </div>
        <span class="chip-count ${prog.checkedCount === prog.total ? 'done' : ''}">${prog.checkedCount}/${prog.total}</span>
      `;
      allChip.addEventListener('click', () => {
        setElementFilter('all');
      });
      gridEl.appendChild(allChip);

      for (const elemName in ELEMENT_META) {
        const meta = ELEMENT_META[elemName];
        const ec = prog.elemCounts[elemName] || { total: 7, checked: 0 };
        const isSelected = currentFilters.element === elemName;
        const isDone = ec.checked >= ec.total;

        const chip = document.createElement('div');
        chip.className = `element-chip ${isSelected ? 'selected' : ''} ${isDone ? 'completed' : ''}`;
        chip.innerHTML = `
          <div class="chip-left">
            <span class="elem-badge-icon" style="background:${meta.color};">${meta.symbol}</span>
            <span class="elem-name">${elemName}</span>
          </div>
          <span class="chip-count ${isDone ? 'done' : ''}">${ec.checked}/${ec.total}</span>
        `;
        chip.addEventListener('click', () => {
          setElementFilter(elemName);
        });
        gridEl.appendChild(chip);
      }
    }
  }

  function setElementFilter(elem) {
    currentFilters.element = elem;
    updateUI();
  }

  // Filter Spirits
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

      // Keyword Search
      if (q) {
        const searchTarget = [
          s.element,
          s.spiritName,
          s.locationRaw,
          s.locationDetail,
          s.condition,
          s.requirement,
          s.remarks,
          s.missable || ''
        ].join(' ').toLowerCase();

        if (!searchTarget.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }

  // Render Spirits Cards
  function renderSpiritsList() {
    const container = document.getElementById('spirits-container');
    const summaryEl = document.getElementById('filter-results-summary');
    if (!container) return;

    const filtered = getFilteredSpirits();

    if (summaryEl) {
      summaryEl.textContent = `表示中: ${filtered.length} 体 / 全 112 体`;
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
      const planeBadges = s.planes.map(p => `<span class="plane-badge plane-${p}">${p}</span>`).join(' ');

      // Warning HTML
      const warningHtml = s.missable ? `
        <div class="warning-box">
          <span class="warning-icon">⚠️</span>
          <span>${escapeHtml(s.missable)}</span>
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
        <div class="detail-row">
          <span class="detail-key">備考</span>
          <span class="detail-val">${escapeHtml(s.remarks)}</span>
        </div>
      ` : '';

      card.innerHTML = `
        <div class="card-header">
          <div class="card-title-group">
            <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''} aria-label="${s.element}の精霊${s.index}チェック">
            <span class="elem-badge-icon" style="background:${meta.color};">${meta.symbol}</span>
            <div class="spirit-title">
              <div class="spirit-main-name">
                ${s.element}の精霊 ${s.spiritName}
              </div>
              <span class="spirit-sub-num">${s.element} #${s.index}</span>
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
          <span>タグ: ${s.reqTags.join(', ')}</span>
          <a href="${s.sourceUrl}" target="_blank" rel="noopener noreferrer" class="source-link" title="一次情報Wikiの該当節を開く">
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
        if (e.target.tagName.toLowerCase() === 'a') return;
        toggleSpirit(s.id);
      });

      container.appendChild(card);
    });
  }

  // Render Complete Guide Tab with Dynamic Warnings
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
        <div class="warning-box" style="margin-bottom: 16px; padding: 12px;">
          <span class="warning-icon" style="font-size: 1.2rem;">⚠️</span>
          <div>
            <strong>【重要警告】現在、闇の精霊（ニルヴァ）が ${darkChecked} 体チェックされています！</strong>
            <p style="font-size:0.83rem; margin-top:4px;">
              光の精霊（ルクス）は、仲間にしているニルヴァの数が多いと出現・加入しなくなります（最も厳しいリドナヒー10は『ニルヴァ1体以下』）。
              <strong>必ず光の精霊7体をコンプリートしてから、残りの闇精霊を仲間にしてください。</strong>
            </p>
          </div>
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
      ${dynamicAlertHtml}
      ${fireAlertHtml}

      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">🏆 精霊コンプリートの手順と必須ルール</h2>
          <p class="section-desc">取り返しのつかない要素や加入制限が非常に多いため、必ず以下の順序を守って進行してください。</p>
          <p class="section-source">一次情報出典: <a href="https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A#k55e4a54" target="_blank" rel="noopener noreferrer">攻略Wiki 精霊コンプリート節</a></p>
        </div>

        <div class="info-block">
          <div class="info-block-title">推奨コンプリート順序</div>
          <div class="info-block-text">
            <strong>1. 愛の精霊（カエル捕獲0個〜少数） ➔ 2. 光の精霊（ニルヴァ1体以下〜） ➔ 3. 闇の精霊（カエル大量捕獲）</strong>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${COMP_GUIDE.critical_rules.map(r => `
            <div class="doc-card" style="border-left: 4px solid var(--warning-border);">
              <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">${escapeHtml(r.title)}</div>
              <div style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5;">${escapeHtml(r.desc)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render Leveling Tab (NEW - 優先1)
  function renderLevelingTab() {
    const container = document.getElementById('leveling-tab-content');
    if (!container) return;

    const spotsHtml = LEVELING_DATA.spots.map(s => `
      <div class="doc-card">
        <div class="doc-card-header">
          <div class="doc-card-title">
            <span>📍 ${escapeHtml(s.location)}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <span class="doc-card-badge">${escapeHtml(s.phase)}</span>
            <span class="doc-card-badge" style="background-color:var(--accent-light); color:var(--accent);">${escapeHtml(s.plane)}</span>
          </div>
        </div>
        <div class="doc-card-body">
          <div class="doc-meta-row">
            <div class="doc-meta-item">
              <span class="doc-meta-label">推奨レベル:</span>
              <span class="doc-meta-value">${escapeHtml(s.recommended_lv)}</span>
            </div>
            <div class="doc-meta-item">
              <span class="doc-meta-label">出現モンスター:</span>
              <span>${escapeHtml(s.monsters)}</span>
            </div>
          </div>
          <div>
            <strong>効率の根拠:</strong> ${escapeHtml(s.basis)}
          </div>
          <div style="color:var(--warning-text); font-size:0.82rem;">
            <strong>⚠️ 注意点:</strong> ${escapeHtml(s.caution)}
          </div>
        </div>
      </div>
    `).join('');

    const expTableRows = LEVELING_DATA.exp_table_sample.map(r => `
      <tr>
        <td style="font-weight:600;">LV ${r.lv}</td>
        <td>${r.next}</td>
        <td>${r.total.toLocaleString()}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">📈 ${escapeHtml(LEVELING_DATA.title)}</h2>
          <p class="section-desc">キャラクターおよび魔法の効率的な育成場所・経験値仕様をWikiデータに基づき整理したガイドです。</p>
          <p class="section-source">
            一次情報出典: 
            <a href="${LEVELING_DATA.source_url}" target="_blank" rel="noopener noreferrer">経験値テーブル</a> | 
            <a href="${LEVELING_DATA.magic_source_url}" target="_blank" rel="noopener noreferrer">魔法経験値テーブル</a> | 
            <a href="${LEVELING_DATA.garam_source_url}" target="_blank" rel="noopener noreferrer">ガラムマサラ</a>
          </p>
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:10px;">⚙️ 経験値・レベリングの重要仕様</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:24px;">
          ${LEVELING_DATA.mechanics.map(m => `
            <div class="info-block" style="margin-bottom:0;">
              <div class="info-block-title">${escapeHtml(m.title)}</div>
              <div class="info-block-text">${escapeHtml(m.desc)}</div>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:10px;">🗺️ 進行度・レベル帯別おすすめ狩り場（全7箇所）</h3>
        <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:12px;">
          ※Wikiに直接推奨記載のあるガラムマサラを除き、モンスター図鑑およびダンジョン出現データから算出した適地です。
        </p>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:24px;">
          ${spotsHtml}
        </div>

        <h3 style="font-size:1.05rem; margin-bottom:8px;">📊 キャラクター必要経験値推移（抜粋）</h3>
        <div class="data-table-wrapper" style="max-width:500px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>レベル</th>
                <th>次のレベルまで</th>
                <th>累計必要経験値</th>
              </tr>
            </thead>
            <tbody>
              ${expTableRows}
            </tbody>
          </table>
        </div>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">
          ※LV88以降はLV999まで次のレベルまでの必要経験値が99,999で一定となります。
        </p>
      </div>
    `;
  }

  // Render Chart Tab (NEW - 優先2)
  function renderChartTab() {
    const container = document.getElementById('chart-tab-content');
    if (!container) return;

    const planesHtml = CHART_DATA.planes.map(p => `
      <div class="doc-card">
        <div class="doc-card-header">
          <div class="doc-card-title">
            <span>🌐 ${escapeHtml(p.name)}</span>
          </div>
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="source-link">Wiki詳細チャート ↗</a>
        </div>
        <div class="doc-card-body">
          <div>
            <strong>到達条件:</strong> ${escapeHtml(p.condition)}
          </div>
          <div style="color:var(--text-secondary);">
            ${escapeHtml(p.summary)}
          </div>
          
          <div style="background-color:var(--bg-subtle); padding:10px 12px; border-radius:var(--radius-sm);">
            <strong>主要進行ルート・重要イベント:</strong>
            <ul style="margin-left:20px; margin-top:4px; font-size:0.84rem; display:flex; flex-direction:column; gap:3px;">
              ${p.events.map(ev => `<li>${escapeHtml(ev)}</li>`).join('')}
            </ul>
          </div>

          <div>
            <strong>ボスモンスター:</strong> ${escapeHtml(p.bosses)}
          </div>

          ${p.missable ? `
            <div class="warning-box" style="margin-top:4px;">
              <span class="warning-icon">⚠️</span>
              <div>
                <strong>取り返しのつかない要素・注意:</strong><br>
                ${escapeHtml(p.missable).replace(/\n/g, '<br>')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">🗺️ ${escapeHtml(CHART_DATA.title)}</h2>
          <p class="section-desc">全プレーンの到達条件、重要イベント、ボス、取り返しのつかない要素をWikiに基づき整理した攻略チャートです。</p>
          <p class="section-source">一次情報出典: <a href="https://wikiwiki.jp/magivaca/" target="_blank" rel="noopener noreferrer">マジカルバケーション攻略Wiki チャート各節</a></p>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;">
          ${planesHtml}
        </div>
      </div>
    `;
  }

  // Render System Tab (NEW - 優先3)
  function renderSystemTab() {
    const container = document.getElementById('system-tab-content');
    if (!container) return;

    const sectionsHtml = SYSTEM_DATA.sections.map(sec => `
      <div class="doc-card">
        <div class="doc-card-header">
          <div class="doc-card-title">
            <span>⚙️ ${escapeHtml(sec.title)}</span>
          </div>
          <a href="${sec.url}" target="_blank" rel="noopener noreferrer" class="source-link">Wiki詳細ページ ↗</a>
        </div>
        <div class="doc-card-body" style="white-space: pre-line; line-height:1.6;">
          ${escapeHtml(sec.content)}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">⚙️ ${escapeHtml(SYSTEM_DATA.title)}</h2>
          <p class="section-desc">仲間・魔法・成績・アミーゴ（通信要素）などのゲーム基本仕様と特殊ルールを解説します。</p>
          <p class="section-source">
            一次情報出典: 
            <a href="${SYSTEM_DATA.party_url}" target="_blank" rel="noopener noreferrer">仲間</a> | 
            <a href="${SYSTEM_DATA.magic_url}" target="_blank" rel="noopener noreferrer">魔法</a> | 
            <a href="${SYSTEM_DATA.record_url}" target="_blank" rel="noopener noreferrer">成績</a>
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;">
          ${sectionsHtml}
        </div>
      </div>
    `;
  }

  // Render Guides Tab (Piranha & Lifespan)
  function renderGuidesTab() {
    const container = document.getElementById('guides-tab-content');
    if (!container) return;

    const modRows = PIRANHA_DATA.mod_table.map(m => `
      <tr>
        <td style="font-weight:600;">余り ${m.rem}</td>
        <td style="color:#b45309; font-weight:700;">${m.coin}</td>
      </tr>
    `).join('');

    const amtRows = PIRANHA_DATA.amount_table.map(a => `
      <tr>
        <td style="font-weight:600;">${a.amount}</td>
        <td>${a.shift}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">🐟 ${escapeHtml(PIRANHA_DATA.title)}</h2>
          <p class="section-desc">${escapeHtml(PIRANHA_DATA.summary)}</p>
          <p class="section-source">一次情報出典: <a href="https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A#jdadf45f" target="_blank" rel="noopener noreferrer">攻略Wiki ピラニア節</a></p>
        </div>

        <p style="font-size:0.88rem; margin-bottom:12px;">
          📍 <strong>おすすめ場所</strong>: ${escapeHtml(PIRANHA_DATA.location)}
        </p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          <div>
            <h4 style="font-size:0.9rem; margin-bottom:4px;">【余りと貰えるコインの対応表】</h4>
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>余り</th><th>入手する金貨銀貨</th></tr>
                </thead>
                <tbody>
                  ${modRows}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style="font-size:0.9rem; margin-bottom:4px;">【入金額による余りの変化法則】</h4>
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>入金額</th><th>直前の種類から次の入手先</th></tr>
                </thead>
                <tbody>
                  ${amtRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="info-block" style="margin-top:16px;">
          <div class="info-block-title">💡 効率的な集め方（Wiki推奨テクニック）</div>
          <div class="info-block-text">${escapeHtml(PIRANHA_DATA.tips)}</div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">🌱 ${escapeHtml(LIFESPAN_GUIDE.title)}</h2>
          <p class="section-desc">${escapeHtml(LIFESPAN_GUIDE.summary)}</p>
          <p class="section-source">一次情報出典: <a href="https://wikiwiki.jp/magivaca/%E7%B2%BE%E9%9C%8A#ja6e4485" target="_blank" rel="noopener noreferrer">攻略Wiki グミ寿命節</a></p>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${LIFESPAN_GUIDE.details.map(d => `
            <div class="doc-card">
              <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">${escapeHtml(d.name)}の仕様</div>
              <div style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5;">${escapeHtml(d.rule)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Update UI components
  function updateUI() {
    updateProgressUI();
    renderSpiritsList();
    renderCompleteGuideTab();
    renderLevelingTab();
    renderChartTab();
    renderSystemTab();
    renderGuidesTab();
  }

  // Escape HTML utility
  function escapeHtml(str) {
    if (!str) return '';
    return str
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
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tc => {
          tc.classList.remove('active');
        });
        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentFilters.query = e.target.value;
        renderSpiritsList();
      });
    }

    // Plane filter buttons
    const planeBtns = document.querySelectorAll('.plane-filter-btn');
    planeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        planeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.plane = btn.dataset.plane;
        renderSpiritsList();
      });
    });

    // Req Tag filter buttons
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
          exportTextarea.value = JSON.stringify(Array.from(checkedSpirits));
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
          const arr = JSON.parse(val);
          if (Array.isArray(arr)) {
            checkedSpirits = new Set(arr);
            saveState();
            updateUI();
            modal.classList.remove('active');
            alert(`正常にインポートしました。（チェック数: ${checkedSpirits.size}体）`);
          } else {
            alert('無効なデータ形式です。配列形式のJSONを入力してください。');
          }
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
