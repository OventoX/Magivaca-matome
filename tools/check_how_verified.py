with open("tools/test_full_verification.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find("renderChestsTab")
if idx != -1:
    print(text[idx-200:idx+300])
else:
    print("renderChestsTab not in test_full_verification.js")
