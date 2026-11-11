with open("css/style.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if "chest" in line.lower():
        print(f"Line {i}: {line.strip()[:80]}")
        break
