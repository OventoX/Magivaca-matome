with open("js/app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(1719, min(1805, len(lines))):
    print(f"{i+1}: {lines[i].rstrip()}")
