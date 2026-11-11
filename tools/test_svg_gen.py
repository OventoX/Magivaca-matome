import json
import html

def generate_svg_for_grid(area_name, defn, area_chests):
    grid = defn["grid"]
    nrows = len(grid)
    ncols = max(len(r) for r in grid)
    
    # Calculate cell counts and matching chests
    alias_to_chests = {}
    for r in grid:
        for node in r:
            if not node: continue
            matched = []
            for c in area_chests:
                for a in node["aliases"]:
                    if a == c["mapName"] or a in c["mapName"]:
                        matched.append(c)
                        break
            alias_to_chests[node["name"]] = matched
            
    cell_w = 120
    cell_h = 58
    gap_x = 18
    gap_y = 16
    pad_x = 16
    pad_y = 30
    
    total_w = pad_x * 2 + ncols * cell_w + (ncols - 1) * gap_x
    total_h = pad_y * 2 + nrows * cell_h + (nrows - 1) * gap_y + 24 # +24 for legend
    
    svg_parts = []
    svg_parts.append(f'<svg viewBox="0 0 {total_w} {total_h}" class="area-schematic-svg" xmlns="http://www.w3.org/2000/svg">')
    
    # Background
    svg_parts.append(f'<rect width="{total_w}" height="{total_h}" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>')
    
    # Legend at top
    svg_parts.append(f'<g transform="translate({pad_x}, 18)" font-size="10" font-family="sans-serif">')
    svg_parts.append('<circle cx="6" cy="-3" r="4" fill="#f59e0b"/>')
    svg_parts.append('<text x="14" y="0" fill="#475569">🎁 宝箱あり部屋</text>')
    svg_parts.append('<circle cx="110" cy="-3" r="4" fill="#3b82f6"/>')
    svg_parts.append('<text x="118" y="0" fill="#475569">🚪 出入口・通路</text>')
    svg_parts.append('<circle cx="210" cy="-3" r="4" fill="#94a3b8"/>')
    svg_parts.append('<text x="218" y="0" fill="#64748b">通常フロア</text>')
    svg_parts.append('</g>')
    
    # Connecting lines between adjacent non-empty cells
    for r in range(nrows):
        for c in range(len(grid[r])):
            if not grid[r][c]: continue
            x1 = pad_x + c * (cell_w + gap_x) + cell_w / 2
            y1 = pad_y + r * (cell_h + gap_y) + cell_h / 2
            
            # horizontal connection
            if c + 1 < len(grid[r]) and grid[r][c + 1]:
                x2 = pad_x + (c + 1) * (cell_w + gap_x) + cell_w / 2
                svg_parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y1}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="3,3"/>')
            # vertical connection
            if r + 1 < nrows and c < len(grid[r + 1]) and grid[r + 1][c]:
                y2 = pad_y + (r + 1) * (cell_h + gap_y) + cell_h / 2
                svg_parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x1}" y2="{y2}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="3,3"/>')

    # Draw nodes
    for r in range(nrows):
        for c in range(len(grid[r])):
            node = grid[r][c]
            if not node: continue
            
            x = pad_x + c * (cell_w + gap_x)
            y = pad_y + r * (cell_h + gap_y)
            
            name = node["name"]
            matched_chests = alias_to_chests.get(name, [])
            has_chests = len(matched_chests) > 0
            is_entrance = node.get("entrance", False)
            
            if has_chests:
                rect_fill = "#fffbeb"
                rect_stroke = "#f59e0b"
                stroke_w = "2"
                text_fill = "#92400e"
            elif is_entrance:
                rect_fill = "#eff6ff"
                rect_stroke = "#3b82f6"
                stroke_w = "1.5"
                text_fill = "#1e40af"
            else:
                rect_fill = "#ffffff"
                rect_stroke = "#cbd5e1"
                stroke_w = "1"
                text_fill = "#334155"
                
            svg_parts.append(f'<g class="schematic-node" transform="translate({x},{y})">')
            svg_parts.append(f'<rect width="{cell_w}" height="{cell_h}" rx="6" fill="{rect_fill}" stroke="{rect_stroke}" stroke-width="{stroke_w}"/>')
            
            # Shorten or wrap name if long
            disp_name = html.escape(name)
            if len(disp_name) > 9:
                line1 = disp_name[:8]
                line2 = disp_name[8:]
                svg_parts.append(f'<text x="{cell_w/2}" y="{cell_h/2 - 4}" font-size="10" font-weight="600" fill="{text_fill}" text-anchor="middle">{line1}</text>')
                svg_parts.append(f'<text x="{cell_w/2}" y="{cell_h/2 + 8}" font-size="9" fill="{text_fill}" text-anchor="middle">{line2}</text>')
            else:
                svg_parts.append(f'<text x="{cell_w/2}" y="{cell_h/2 + (0 if has_chests else 4)}" font-size="11" font-weight="600" fill="{text_fill}" text-anchor="middle">{disp_name}</text>')
                
            # Chest badge
            if has_chests:
                badge_text = f"🎁 {len(matched_chests)}個"
                svg_parts.append(f'<rect x="{cell_w/2 - 24}" y="{cell_h - 17}" width="48" height="13" rx="3" fill="#fef3c7" stroke="#f59e0b" stroke-width="0.8"/>')
                svg_parts.append(f'<text x="{cell_w/2}" y="{cell_h - 7}" font-size="9" font-weight="bold" fill="#b45309" text-anchor="middle">{badge_text}</text>')
            elif is_entrance:
                svg_parts.append(f'<text x="{cell_w/2}" y="{cell_h - 6}" font-size="8.5" fill="#3b82f6" text-anchor="middle">出入口</text>')
                
            svg_parts.append('</g>')
            
    svg_parts.append('</svg>')
    return "".join(svg_parts)

def main():
    with open("tools/chests_extracted.json", "r", encoding="utf-8") as fp:
        chests = json.load(fp)
    with open("tools/refined_schematics.json", "r", encoding="utf-8") as fp:
        schematics = json.load(fp)
        
    sample_area = "ベナコンチャ遺跡"
    sample_chests = [c for c in chests if c.get("area") == sample_area]
    svg = generate_svg_for_grid(sample_area, schematics[sample_area], sample_chests)
    print(f"Generated SVG for {sample_area} (length: {len(svg)}):")
    print(svg[:400], "...")

if __name__ == "__main__":
    main()
