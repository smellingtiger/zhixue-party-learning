import json
with open('public/course-scripts/typhoon-command-script.json', encoding='utf-8') as f:
    data = json.load(f)
for ch in data['chapters']:
    content_val = ch.get('content', '')
    sections = ch.get('sections', [])
    content_preview = content_val[:30] if content_val else '空'
    is_truthy = bool(content_val)
    print(f"{ch['title']}: content='{content_preview}', sections数量={len(sections)}, content_truthy={is_truthy}")
