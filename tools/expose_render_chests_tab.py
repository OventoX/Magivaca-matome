with open("js/app.js", "r", encoding="utf-8") as f:
    code = f.read()

if "window.renderChestsTab = renderChestsTab;" not in code:
    code = code.replace(
        "window.toggleMapCollapse = toggleMapCollapse;",
        "window.toggleMapCollapse = toggleMapCollapse;\n  window.renderChestsTab = renderChestsTab;"
    )
    with open("js/app.js", "w", encoding="utf-8") as f:
        f.write(code)
    print("Exposed window.renderChestsTab.")
else:
    print("Already exposed.")
