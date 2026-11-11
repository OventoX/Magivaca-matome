import os
import struct

def get_png_dimensions(file_path):
    with open(file_path, "rb") as f:
        data = f.read(24)
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            w, h = struct.unpack('>LL', data[16:24])
            return w, h
    return None

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\img\maps"
    for fname in ["map_riginio.png", "map-rido04-0.png", "map-garam01-0.png", "map-garam50-0.png"]:
        p = os.path.join(base_dir, fname)
        if os.path.exists(p):
            dims = get_png_dimensions(p)
            print(f"{fname}: {dims}, size={os.path.getsize(p)} bytes")

if __name__ == "__main__":
    main()
