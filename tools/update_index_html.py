import os

index_path = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\index.html"

with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. ナビゲーションタブの更新
old_nav_tabs = """        <button type="button" class="tab-btn active" data-tab="tab-spirits">
          <span>🧚 精霊一覧・チェック</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-complete-guide">
          <span>⚠️ 精霊コンプ手順</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-leveling">
          <span>📈 レベリング（経験値稼ぎ）</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-chart">
          <span>🗺️ シナリオチャート</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-ofuro">
          <span>♨️ お風呂セット入手</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-system">
          <span>⚙️ システム解説</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-guides">
          <span>🐟 稼ぎ・寿命ガイド</span>
        </button>"""

new_nav_tabs = """        <button type="button" class="tab-btn active" data-tab="tab-spirits">
          <span>🧚 精霊一覧・チェック</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-complete-guide">
          <span>⚠️ 精霊コンプ手順</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-items">
          <span>📦 アイテム図鑑・逆引き</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-monsters">
          <span>👾 モンスター＆ドロップ</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-story">
          <span>📜 ストーリー選択肢</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-collections">
          <span>📋 収集チェックリスト</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-leveling">
          <span>📈 レベリング</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-chart">
          <span>🗺️ シナリオチャート</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-ofuro">
          <span>♨️ お風呂セット</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-system">
          <span>⚙️ システム解説</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-guides">
          <span>🐟 稼ぎ・寿命ガイド</span>
        </button>"""

if old_nav_tabs in html:
    html = html.replace(old_nav_tabs, new_nav_tabs)
else:
    print("Warning: old_nav_tabs not found")

# 2. 精霊フィルターの更新（進行度連動チェックボックスを追加）
old_filter_row = """          <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
            <label class="checkbox-toggle-label">
              <input type="checkbox" id="filter-warning-only">
              <span>⚠️ 取り返しのつかない要素のみ</span>
            </label>
            <label class="checkbox-toggle-label">
              <input type="checkbox" id="filter-hide-completed">
              <span>仲間済みを非表示</span>
            </label>
          </div>"""

new_filter_row = """          <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
            <label class="checkbox-toggle-label">
              <input type="checkbox" id="filter-warning-only">
              <span>⚠️ 取り返しのつかない要素のみ</span>
            </label>
            <label class="checkbox-toggle-label">
              <input type="checkbox" id="filter-hide-completed">
              <span>仲間済みを非表示</span>
            </label>
            <label class="checkbox-toggle-label" title="選択中プレーンでまだ仲間にできていない精霊のみに絞り込みます">
              <input type="checkbox" id="filter-plane-progress-only">
              <span>🎯 選択プレーンの未収集のみ</span>
            </label>
          </div>"""

if old_filter_row in html:
    html = html.replace(old_filter_row, new_filter_row)
else:
    print("Warning: old_filter_row not found")

# 3. 新規タブセクションの追加（tab-items, tab-monsters, tab-story, tab-collections）
target_insert_point = """    <!-- Tab 3: Leveling Guide -->"""

new_sections = """    <!-- Tab: Items Database & Reverse Lookup -->
    <section id="tab-items" class="tab-content" aria-labelledby="tab-items">
      <div id="items-tab-content">
        <!-- Injected by app.js -->
      </div>
    </section>

    <!-- Tab: Monsters & Drop Rates -->
    <section id="tab-monsters" class="tab-content" aria-labelledby="tab-monsters">
      <div id="monsters-tab-content">
        <!-- Injected by app.js -->
      </div>
    </section>

    <!-- Tab: Story Choices & Dialogue -->
    <section id="tab-story" class="tab-content" aria-labelledby="tab-story">
      <div id="story-tab-content">
        <!-- Injected by app.js -->
      </div>
    </section>

    <!-- Tab: Collections Checklist (Magic Notes, Mimic Coins, Records) -->
    <section id="tab-collections" class="tab-content" aria-labelledby="tab-collections">
      <div id="collections-tab-content">
        <!-- Injected by app.js -->
      </div>
    </section>

"""

if target_insert_point in html:
    html = html.replace(target_insert_point, new_sections + target_insert_point)
else:
    raise Exception(f"target_insert_point not found in index.html")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(html)

print("index.html updated successfully!")
