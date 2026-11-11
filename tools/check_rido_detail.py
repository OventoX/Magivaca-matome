import os

def main():
    base_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"
    with open(os.path.join(base_dir, "chart_garam.html"), "r", encoding="utf-8", errors="ignore") as fp:
        html = fp.read()
    
    idx = html.find("map-rido04")
    if idx != -1:
        print(html[idx-300:idx+400])

if __name__ == "__main__":
    main()
