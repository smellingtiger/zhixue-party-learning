import json

# 验证 JSON 结构
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("验证 typhoon-command-script.json 的 sections 结构")
print("=" * 60)

for ch_idx, ch in enumerate(data['chapters']):
    content_val = ch.get('content', None)
    sections = ch.get('sections', None)
    
    # 模拟 getChapterSections 的逻辑
    # if (chapter.content || !chapter.sections) return [];
    # 在 JavaScript 中，空字符串 '' 是 falsy
    has_content = bool(content_val)  # Python 中空字符串也是 falsy
    has_sections = sections is not None and len(sections) > 0
    
    returns_empty = has_content or not has_sections
    
    print(f"\n第{ch_idx}章: {ch['title']}")
    print(f"  content 存在: {has_content} (值: {repr(content_val[:30]) if content_val else '空/无'})")
    print(f"  sections 存在: {has_sections} (数量: {len(sections) if sections else 0})")
    print(f"  getChapterSections 返回: {'空数组 []' if returns_empty else f'{len(sections)} 个 sections'}")
