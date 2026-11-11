import os

css_path = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\css\style.css"

new_css = """
/* ==========================================================================
   Phase 5 Components: Items, Monsters, Story Choices, Collections
   ========================================================================== */

/* Sub Tabs Navigation */
.sub-tab-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.sub-tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sub-tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-subtle);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.sub-tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

/* Data Tables */
.data-table-container {
  overflow-x: auto;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-surface);
  margin-top: 14px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.data-table th {
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-medium);
  white-space: nowrap;
}

.data-table td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background-color: #f8fafc;
}

/* Reverse Lookup Area */
.lookup-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.lookup-card h3 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}

.lookup-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.lookup-result-box {
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 0.88rem;
}

/* Story Choice Cards */
.story-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s ease;
}

.story-card.missable {
  border-left: 4px solid var(--warning-border);
}

.story-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 12px;
}

.story-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.story-card-location {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.story-choice-box {
  background-color: var(--bg-subtle);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 10px;
}

.story-choice-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.story-choice-row:last-child {
  margin-bottom: 0;
}

.story-choice-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.story-notes {
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-light);
}

.story-warning-text {
  color: var(--warning-text);
  font-weight: 600;
}

/* Collection Checklist Items */
.collection-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}

.collection-card.checked {
  background-color: var(--bg-checked);
  border-color: var(--success-border);
}

.collection-checkbox {
  width: 19px;
  height: 19px;
  cursor: pointer;
  margin-top: 2px;
}

.collection-content {
  flex: 1;
}

.collection-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.collection-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.collection-card.checked .collection-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.collection-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.collection-detail {
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 4px;
}

.collection-progress-bar-wrap {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 14px 20px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 7px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  line-height: 1.3;
}

.badge-missable {
  background-color: var(--warning-bg);
  border: 1px solid var(--warning-border);
  color: var(--warning-text);
}

.badge-plane {
  background-color: var(--accent-light);
  border: 1px solid var(--accent-border);
  color: var(--accent);
}

.badge-price {
  background-color: #fef3c7;
  border: 1px solid #fde047;
  color: #854d0e;
}
"""

with open(css_path, "a", encoding="utf-8") as f:
    f.write(new_css)

print("CSS appended successfully.")
