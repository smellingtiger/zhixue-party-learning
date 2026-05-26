import json

with open('public/course-scripts/typhoon-command-script.json', encoding='utf-8') as f:
    data = json.load(f)

for ch in data['chapters']:
    sections = ch.get('sections', [])
    print(f"{ch['title']}: {len(sections)} 个 sections")
    for i, sec in enumerate(sections):
        print(f"  [{i}] {sec['title']}")
