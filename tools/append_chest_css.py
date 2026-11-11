chest_css = """
/* ==========================================================================
   宝箱マップ (Chests Map) スタイル
   ========================================================================== */

.chest-summary-banner {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.chest-summary-banner h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chest-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 14px 0;
}

.chest-stat-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.chest-stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 4px;
}

.chest-stat-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.chest-filter-bar {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.plane-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.plane-pill-btn {
  padding: 6px 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.plane-pill-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.plane-pill-btn.active {
  background-color: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.chest-controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
}

.chest-search-input {
  flex: 1;
  min-width: 220px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background-color: var(--bg-page);
  color: var(--text-primary);
}

.chest-search-input:focus {
  border-color: var(--border-focus);
  outline: none;
  background-color: #fff;
}

.chest-checkbox-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.chest-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.chest-action-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* エリア別パネル */
.chest-area-panel {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.chest-area-header {
  padding: 12px 18px;
  background-color: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

.chest-area-header:hover {
  background-color: var(--bg-hover);
}

.chest-area-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chest-area-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.chest-area-progress-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chest-area-progress-bar-bg {
  width: 100px;
  height: 6px;
  background-color: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.chest-area-progress-bar-fill {
  height: 100%;
  background-color: var(--success-color);
  transition: width 0.2s ease;
}

.chest-area-progress-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 75px;
  text-align: right;
}

.chest-area-toggle-icon {
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.chest-area-panel.collapsed .chest-area-toggle-icon {
  transform: rotate(-90deg);
}

.chest-area-panel.collapsed .chest-cards-grid {
  display: none;
}

/* 宝箱カードグリッド */
.chest-cards-grid {
  padding: 14px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.chest-card {
  background-color: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: all 0.15s ease;
  position: relative;
}

.chest-card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.chest-card.is-opened {
  background-color: var(--bg-checked);
  border-color: var(--success-border);
}

.chest-card.is-opened .chest-item-name {
  color: var(--text-muted);
  text-decoration: line-through;
}

.chest-card.is-missable {
  border-left: 4px solid var(--warning-border);
}

.chest-card-checkbox {
  cursor: pointer;
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.chest-card-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--success-color);
}

.chest-card-body {
  flex: 1;
  min-width: 0;
}

.chest-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.chest-num {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-dim);
}

.chest-item-name {
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-right: 4px;
}

.badge-normal {
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
}

.badge-star {
  background-color: #fef3c7;
  border: 1px solid #fde047;
  color: #854d0e;
  font-weight: 700;
}

.chest-card-loc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chest-card-loc code {
  background: var(--bg-subtle);
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.chest-card-note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.4;
  background: var(--bg-page);
  padding: 4px 8px;
  border-radius: 3px;
  border-left: 2px solid var(--border-medium);
}

.chest-missable-reason {
  font-size: 0.78rem;
  color: var(--warning-text);
  background: var(--warning-bg);
  padding: 4px 8px;
  border-radius: 3px;
  margin-top: 6px;
  border: 1px solid var(--warning-border);
  line-height: 1.35;
}

@media (max-width: 600px) {
  .chest-cards-grid {
    grid-template-columns: 1fr;
    padding: 10px 10px;
  }
  .chest-area-progress-bar-bg {
    display: none;
  }
}
"""

with open("css/style.css", "a", encoding="utf-8") as f:
    f.write(chest_css)

print("Appended chest CSS to css/style.css successfully!")
