import re

with open("js/app.js", "r", encoding="utf-8") as f:
    code = f.read()

matches = re.findall(r'window\.(\w+)\s*=', code)
print("Exposed window functions:", sorted(list(set(matches))))
