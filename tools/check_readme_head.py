with open("README.md", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.splitlines()
print(f"Total lines in README.md: {len(lines)}")
for l in lines[:40]:
    print(l)
