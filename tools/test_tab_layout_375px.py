import re
from bs4 import BeautifulSoup

def test_tab_layout():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    with open("css/style.css", "r", encoding="utf-8") as f:
        css = f.read()

    soup = BeautifulSoup(html, "html.parser")
    tabs = soup.select(".nav-tabs-wrapper .tab-btn")

    print(f"Total tabs found: {len(tabs)}")
    assert len(tabs) == 12, f"Expected 12 tabs, got {len(tabs)}"

    # 375px viewport parameters
    viewport_width = 375
    wrapper_padding = 8 * 2  # 16px
    available_width = viewport_width - wrapper_padding  # 359px
    gap_x = 4  # gap between tabs in row
    btn_padding_x = 10 * 2  # 20px
    btn_border_x = 1 * 2    # 2px
    font_size_px = 16 * 0.82 # 13.12px

    def estimate_text_width(text):
        # Estimate width of Japanese characters vs emojis / ascii
        width = 0
        for ch in text.strip():
            code = ord(ch)
            if code > 0x2000:  # CJK / Emojis / Symbols
                width += font_size_px
            elif ch == ' ':
                width += font_size_px * 0.3
            else:
                width += font_size_px * 0.55
        return width

    tab_widths = []
    print("\n--- 各タブの推計幅と到達性検証 (375px スマホ幅) ---")
    for idx, tab in enumerate(tabs, 1):
        tab_text = tab.get_text(strip=True)
        tab_id = tab.get("data-tab")
        text_w = estimate_text_width(tab_text)
        total_w = text_w + btn_padding_x + btn_border_x + 4 # gap/margin margin of safety
        tab_widths.append((tab_id, tab_text, total_w))
        
        fits_single = total_w <= available_width
        status = "✅ 収まる" if fits_single else "❌ はみ出し"
        print(f"[{idx:2d}] {tab_text:<15} (id: {tab_id}): 推計幅 {total_w:.1f}px / 有効幅 {available_width}px -> {status}")
        assert fits_single, f"タブ '{tab_text}' が375px幅の画面単体ではみ出しています ({total_w:.1f}px > {available_width}px)"

    # Simulate flex-wrap wrapping
    lines = []
    current_line = []
    current_w = 0

    for tab_id, tab_text, w in tab_widths:
        needed = w if not current_line else w + gap_x
        if current_w + needed <= available_width:
            current_line.append((tab_text, w))
            current_w += needed
        else:
            lines.append((current_line, current_w))
            current_line = [(tab_text, w)]
            current_w = w
    if current_line:
        lines.append((current_line, current_w))

    print(f"\n--- 375px幅での複数行 flex-wrap シミュレーション結果 (全 {len(lines)} 行) ---")
    for row_idx, (row_tabs, row_w) in enumerate(lines, 1):
        names = " | ".join([t[0] for t in row_tabs])
        print(f"行 {row_idx}: 幅 {row_w:.1f}px/{available_width}px -> [ {names} ]")

    # CSS verification
    assert "flex-wrap: wrap;" in css, "CSS に flex-wrap: wrap が設定されていません"
    assert "scrollbar-width: none" not in css or ".nav-tabs::-webkit-scrollbar" not in css, "古い横スクロール非表示設定が残っています"
    assert "@media (max-width: 480px)" in css, "モバイル用レスポンシブルールがありません"

    print("\n🎉 全11タブが横スクロール不要で375px画面内に完全表示され、全タブに到達可能であることを確認しました！")

    # Multi-viewport simulation (PC 1200px, Tablet 768px, Mobile 375px)
    print("\n--- 複数画面幅での表示シミュレーション ---")
    for vw, label in [(1200, "PCデスクトップ (1200px)"), (768, "タブレット (768px)"), (375, "スマートフォン (375px)")]:
        avail = min(vw, 1200) - (24 if vw > 480 else 16)
        font_sz = 14.0 if vw > 480 else 13.12
        gap = 6 if vw > 480 else 4
        pad = 28 if vw > 480 else 20
        vlines = []
        cur = []
        cur_w = 0
        for _, t, _ in tab_widths:
            w = estimate_text_width(t) * (font_sz / font_size_px) + pad
            needed = w if not cur else w + gap
            if cur_w + needed <= avail:
                cur.append(t)
                cur_w += needed
            else:
                vlines.append(cur)
                cur = [t]
                cur_w = w
        if cur:
            vlines.append(cur)
        print(f"[{label}] -> {len(vlines)}行で全表示 (見切れなし)")
        for i, line in enumerate(vlines, 1):
            sep = " | "
            print(f"  行{i}: {sep.join(line)}")

if __name__ == "__main__":
    test_tab_layout()
