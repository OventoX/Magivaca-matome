with open("js/data.js", "r", encoding="utf-8") as f:
    lines = f.readlines()
print(f"Total lines in js/data.js: {len(lines)}")
for l in lines[-15:]:
    print(l.rstrip())
