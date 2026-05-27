#!/usr/bin/env python3
"""模拟实际的跳转逻辑"""
import json

# 读取JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

print("=" * 100)
print("模拟章节跳转测试")
print("=" * 100)

# 测试每个章节的section -> slide跳转
for ch_idx in range(1, 5):
    json_chapter = json_data['chapters'][ch_idx]
    sections = json_chapter['sections']
    
    print(f"\n第{ch_idx}章: {json_chapter['title']}")
    print(f"  sections数量: {len(sections)}")
    print(f"  测试: 点击各个section，应该跳转到对应的slide")
    print()
    
    # 模拟点击测试
    test_indices = [0, 2, 4, len(sections)//2, len(sections)-1]
    
    for idx in test_indices:
        if idx < len(sections):
            section_title = sections[idx]['title']
            print(f"  点击 section[{idx}]: {section_title[:40]}")
            print(f"    -> 应该跳转到 slide[{idx}]")
