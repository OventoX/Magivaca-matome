from bs4 import BeautifulSoup
import os

cache_dir = r"C:\Users\ar265\.gemini\antigravity\scratch\magivaca-guide\wiki_cache"

with open(os.path.join(cache_dir, "chart_garam.html"), 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Find text around 'レベル上げ'
text = soup.get_text()
idx = text.find('レベル上げ')
if idx != -1:
    print("=== chart_garam.html レベル上げ周辺 ===")
    print(text[idx-200:idx+600])

with open(os.path.join(cache_dir, "system_party.html"), 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("\n=== system_party.html 仲間一覧・見出し ===")
for h in soup.find_all(['h2', 'h3']):
    print(f"{h.name}: {h.get_text(strip=True)}")
