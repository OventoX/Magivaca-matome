// マジカルバケーション 攻略サポート - アプリケーションロジック
// 端末内 localStorage で進捗を管理（外部通信なし）

(function() {
  'use strict';

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
          <span class="elem-badge-icon" style="background:#5c6bc0;">全</span>
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
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: 8px; color: var(--text-sub);">
          <p>該当する精霊が見つかりませんでした。</p>
          <p style="font-size: 0.85rem; margin-top: 6px;">条件やキーワードを変更して再検索してください。</p>
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
      const planeBadges = s.planes.map(p => `<span class="plane-badge plane-${p}">${p}のプレーン</span>`).join(' ');

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
            <div class="check-container">
              <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''} aria-label="${s.element}の精霊${s.index}仲間にしたチェック">
            </div>
            <span class="elem-badge-icon" style="background:${meta.color}; width:28px; height:28px; font-size:0.85rem;">${meta.symbol}</span>
            <div class="spirit-title">
              <div class="spirit-main-name">
                ${s.element}の精霊 ${s.spiritName}
              </div>
              <span class="spirit-sub-num">${s.element} #${s.index} (ID: ${s.id})</span>
            </div>
          </div>
          <div class="card-badges">
            ${planeBadges}
          </div>
        </div>

        <div class="card-body">
          <div class="detail-row">
            <span class="detail-key">居場所</span>
            <span class="detail-val"><strong>${escapeHtml(s.locationClean)}</strong> ${s.locationDetail ? `<span style="color:var(--text-sub);">(${escapeHtml(s.locationDetail)})</span>` : ''}</span>
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
          <span style="font-size:0.75rem; color:var(--text-muted);">タグ: ${s.reqTags.join(', ')}</span>
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

  // Render Complete Guide Tab with Dynamic Progress Warnings
  function renderCompleteGuideTab() {
    const container = document.getElementById('complete-guide-tab-content');
    if (!container) return;

    // Check current progress status
    const prog = calculateProgress();
    const darkChecked = prog.elemCounts['闇'] ? prog.elemCounts['闇'].checked : 0;
    const lightChecked = prog.elemCounts['光'] ? prog.elemCounts['光'].checked : 0;
    const loveChecked = prog.elemCounts['愛'] ? prog.elemCounts['愛'].checked : 0;
    const fire3Checked = checkedSpirits.has('火_3');

    // Dynamic warning alert
    let dynamicAlertHtml = '';
    if (darkChecked > 0 && lightChecked < 7) {
      dynamicAlertHtml = `
        <div style="background: rgba(229, 62, 62, 0.2); border: 2px solid #e53e3e; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; color: #fed7d7;">
          <h4 style="color: #fc8181; display:flex; align-items:center; gap:8px; font-size:1rem; margin-bottom:6px;">
            ⚠️ 【警告】現在、闇の精霊（ニルヴァ）が ${darkChecked} 体チェックされています！
          </h4>
          <p style="font-size:0.88rem; line-height:1.5;">
            光の精霊（ルクス）は、仲間にしているニルヴァの数が多いと出現・加入しなくなります（最も厳しいリドナヒー10は『ニルヴァ1体以下』）。
            <strong>必ず光の精霊7体をコンプリートしてから、残りの闇の精霊を仲間にしてください。</strong>
          </p>
        </div>
      `;
    }

    let fireAlertHtml = '';
    if (!fire3Checked) {
      fireAlertHtml = `
        <div style="background: rgba(246, 173, 85, 0.15); border: 1px solid #f6ad55; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; color: #feebc8;">
          <h4 style="color: #fbd38d; display:flex; align-items:center; gap:8px; font-size:0.95rem; margin-bottom:4px;">
            🔔 ずんどこ穴のトースト（火_3）はまだ未チェックです
          </h4>
          <p style="font-size:0.85rem; line-height:1.4;">
            闇のプレーン「ずんどこ穴」でドワーフを1人でも説得すると二度と出現しなくなります。ドワーフ説得前に必ずミーロリ銀貨4枚を渡して仲間にしてください。
          </p>
        </div>
      `;
    }

    container.innerHTML = `
      ${dynamicAlertHtml}
      ${fireAlertHtml}

      <div class="guide-section">
        <h3 class="guide-title">
          <span>🏆 精霊コンプリートの手順と必須ルール</span>
        </h3>
        <p style="color:var(--text-sub); font-size:0.9rem; margin-bottom:14px;">
          『マジカルバケーション』の精霊集めは取り返しのつかない要素や加入制限が非常に多く、事前の手順把握が必須です。
        </p>

        <div class="guide-order-box">
          <span>推奨コンプ順序：</span>
          <span class="order-step">1. 愛の精霊（カエル0〜少数）</span>
          <span class="order-arrow">➔</span>
          <span class="order-step">2. 光の精霊（闇1体以下〜）</span>
          <span class="order-arrow">➔</span>
          <span class="order-step">3. 闇の精霊（カエル大量捕獲）</span>
        </div>

        <div class="rules-list">
          ${COMP_GUIDE.critical_rules.map(r => `
            <div class="rule-card danger">
              <div class="rule-card-title">${escapeHtml(r.title)}</div>
              <div class="rule-card-desc">${escapeHtml(r.desc)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render Guides Tab (Piranha & Lifespan)
  function renderGuidesTab() {
    const container = document.getElementById('guides-tab-content');
    if (!container) return;

    // Mod Table Rows
    const modRows = PIRANHA_DATA.mod_table.map(m => `
      <tr>
        <td style="text-align:center; font-weight:700;">余り ${m.rem}</td>
        <td style="color:#ffcc80; font-weight:600;">${m.coin}</td>
      </tr>
    `).join('');

    // Amount Table Rows
    const amtRows = PIRANHA_DATA.amount_table.map(a => `
      <tr>
        <td style="font-weight:600;">${a.amount}</td>
        <td>${a.shift}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="guide-section">
        <h3 class="guide-title">
          <span>🐟 ${escapeHtml(PIRANHA_DATA.title)}</span>
        </h3>
        <p style="color:var(--text-sub); font-size:0.9rem; margin-bottom:8px;">
          ${escapeHtml(PIRANHA_DATA.summary)}
        </p>
        <p style="color:var(--text-sub); font-size:0.85rem; margin-bottom:14px;">
          📍 <strong>おすすめ場所</strong>: ${escapeHtml(PIRANHA_DATA.location)}
        </p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          <div>
            <h4 style="font-size:0.9rem; margin-bottom:6px; color:#fff;">【余りと貰えるコインの対応表】</h4>
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
            <h4 style="font-size:0.9rem; margin-bottom:6px; color:#fff;">【入金額による余りの変化法則】</h4>
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

        <div class="tips-box">
          💡 <strong>効率的な集め方（Wiki推奨テクニック）</strong><br>
          ${escapeHtml(PIRANHA_DATA.tips)}
        </div>
      </div>

      <div class="guide-section">
        <h3 class="guide-title">
          <span>🌱 ${escapeHtml(LIFESPAN_GUIDE.title)}</span>
        </h3>
        <p style="color:var(--text-sub); font-size:0.9rem; margin-bottom:14px;">
          ${escapeHtml(LIFESPAN_GUIDE.summary)}
        </p>

        <div class="rules-list">
          ${LIFESPAN_GUIDE.details.map(d => `
            <div class="rule-card">
              <div class="rule-card-title">${escapeHtml(d.name)}の仕様</div>
              <div class="rule-card-desc">${escapeHtml(d.rule)}</div>
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
