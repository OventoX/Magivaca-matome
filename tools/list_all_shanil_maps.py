import os
from PIL import Image

def main():
    maps_dir = "tools/shanil_maps"
    files = sorted(os.listdir(maps_dir))
    print(f"Total Shanil map images: {len(files)}")
    for f in files:
        fpath = os.path.join(maps_dir, f)
        im = Image.open(fpath)
        print(f"  {f:20s}: {im.size[0]:3d}x{im.size[1]:3d} ({im.format})")

if __name__ == "__main__":
    main()
