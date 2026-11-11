import os
import re

def update_css():
    css_path = "css/style.css"
    with open(css_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "/* 宝箱マップ エリア内マップ（実マップ画像・模式図）スタイル */" in content:
        print("CSS already updated.")
        return
        
    # Append before the last line or at the end
    css_block = """
/* ==========================================================================
   宝箱マップ エリア内マップ（実マップ画像・模式図）スタイル
   ========================================================================== */

.chest-area-panel.collapsed .chest-area-map-container {
  display: none;
}

.chest-area-map-container {
  margin: 12px 16px 14px 16px;
  padding: 14px 16px;
  background-color: var(--bg-page);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
}

.chest-map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.chest-map-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chest-map-title-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.badge-map-real {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.badge-map-schematic {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.chest-map-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.schematic-notice {
  font-size: 0.76rem;
  color: var(--text-muted);
  background: #ffffff;
  border-left: 3px solid #94a3b8;
  padding: 5px 10px;
  margin-bottom: 12px;
  border-radius: 0 4px 4px 0;
  line-height: 1.4;
}

.area-schematic-svg-wrap {
  width: 100%;
  overflow-x: auto;
  text-align: center;
  margin: 10px 0;
  -webkit-overflow-scrolling: touch;
}

.area-schematic-svg {
  display: inline-block;
  max-width: 100%;
  height: auto;
  min-width: 280px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chest-real-map-wrapper {
  text-align: center;
  margin: 10px 0;
  background: #0f172a;
  padding: 12px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

.chest-real-map-img {
  max-width: 100%;
  max-height: 480px;
  height: auto;
  border-radius: 4px;
  display: inline-block;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.chest-floor-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 10px 0 12px 0;
}

.chest-floor-select {
  padding: 5px 10px;
  font-size: 0.85rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background-color: #ffffff;
  color: var(--text-primary);
  font-weight: 600;
}

.map-credit-box {
  font-size: 0.74rem;
  color: var(--text-muted);
  text-align: right;
  margin-top: 6px;
}

.map-credit-box a {
  color: var(--accent);
  text-decoration: underline;
}

.map-subtabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.map-subtab-btn {
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background-color: #ffffff;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.map-subtab-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.map-subtab-btn.active {
  background-color: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}
"""
    new_content = content + css_block
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Updated css/style.css with map styles.")

if __name__ == "__main__":
    update_css()
