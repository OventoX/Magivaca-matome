import os

app_js_path = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\js\app.js"

with open(app_js_path, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("document.getElementById('spirits-list')", "document.getElementById('spirits-container')")
code = code.replace("document.getElementById('guide-tab-content')", "document.getElementById('complete-guide-tab-content')")

with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(code)

print("IDs in app.js fixed successfully.")
