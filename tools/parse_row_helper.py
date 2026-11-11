import re

def parse_row(cells, current_map):
    # cells: list of text
    n = len(cells)
    if n == 0:
        return None, current_map
        
    coord_pattern = re.compile(r'^\d+,\d+$')
    
    # 判定
    if n >= 6:
        m = cells[0]
        coord = cells[1]
        look = cells[2]
        num = cells[3]
        item = cells[4]
        note = cells[5]
        return (m, coord, look, num, item, note), m
    elif n == 5:
        if coord_pattern.match(cells[0]):
            coord = cells[0]
            look = cells[1]
            num = cells[2]
            item = cells[3]
            note = cells[4]
            return (current_map, coord, look, num, item, note), current_map
        else:
            m = cells[0]
            coord = cells[1]
            look = cells[2]
            num = cells[3]
            item = cells[4]
            return (m, coord, look, num, item, ""), m
    elif n == 4:
        if coord_pattern.match(cells[0]):
            coord = cells[0]
            look = cells[1]
            num = cells[2]
            item = cells[3]
            return (current_map, coord, look, num, item, ""), current_map
    return None, current_map
