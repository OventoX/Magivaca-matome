with open("js/app.js", "r", encoding="utf-8") as f:
    app_code = f.read()

# v4 から正確な renderOfuroTab を読み込む
with open("tools/app_v4.js", "r", encoding="utf-8") as f:
    v4_code = f.read()

lines_v4 = v4_code.split("\n")
start_ofuro = lines_v4.index("  function renderOfuroTab() {")
start_system = lines_v4.index("  // Render System Tab (優先3)")
ofuro_code = "\n".join(lines_v4[start_ofuro:start_system])

# 現在の app.js 内の renderOfuroTab を置換
lines_app = app_code.split("\n")
start_app_ofuro = [i for i, l in enumerate(lines_app) if "function renderOfuroTab()" in l][0]
start_app_system = [i for i, l in enumerate(lines_app) if "// Render System Tab" in l][0]

new_lines = lines_app[:start_app_ofuro] + [ofuro_code] + lines_app[start_app_system:]
with open("js/app.js", "w", encoding="utf-8") as f:
    f.write("\n".join(new_lines))

print("renderOfuroTab successfully replaced with v4 implementation.")
