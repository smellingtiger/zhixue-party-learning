#!/usr/bin/env python3
"""模拟 getChapterSections 的行为"""
import json

# 读取JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# 模拟 getChapterSections 函数
def get_chapter_sections(chapter):
    # 如果 chapter.content 有值，或者没有 sections，返回空数组
    if chapter.get('content') or not chapter.get('sections'):
        return []
    
    return chapter['sections']

# 检查所有章节
for ch_idx in range(5):
    chapter = json_data['chapters'][ch_idx]
    sections = get_chapter_sections(chapter)
    
    has_content = bool(chapter.get('content'))
    
    print(f"Chapter {ch_idx}: {chapter['title'][:40]}")
    print(f"  content字段: {'有值' if has_content else '空字符串'}")
    print(f"  sections数量: {len(chapter['sections'])}")
    print(f"  getChapterSections返回: {len(sections)} 个")
    
    if len(sections) > 0:
        print(f"  Sections:")
        for i, sec in enumerate(sections[:5]):  # 只显示前5个
            print(f"    [{i}] {sec['title']}")
        if len(sections) > 5:
            print(f"    ... ({len(sections) - 5} more)")
    
    print()
