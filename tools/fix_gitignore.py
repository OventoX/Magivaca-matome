with open(".gitignore", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("test_*.js", "/test_*.js\n!tools/test_*.js")
with open(".gitignore", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated .gitignore")
