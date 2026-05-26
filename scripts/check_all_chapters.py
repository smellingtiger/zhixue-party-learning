#!/usr/bin/env python3
"""检查所有章节的sections和slides对应关系"""
import json
import re

# 读取JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# 读取TypeScript
with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

print("=" * 100)
print("所有章节 sections vs slides 对比")
print("=" * 100)

for ch_idx in range(1, 5):  # 第1章到第4章
    print(f"\n{'='*100}")
    print(f"第{ch_idx}章")
    print(f"{'='*100}")
    
    # JSON sections
    json_chapter = json_data['chapters'][ch_idx]
    sections = json_chapter['sections']
    print(f"\nJSON Sections ({len(sections)}个):")
    for i, sec in enumerate(sections):
        print(f"  [{i:2d}] {sec['title']}")
    
    # TypeScript slides - 找到对应章节的content
    # 查找章节标题
    chapter_patterns = [
        f"第{ch_idx}章",
    ]
    
    # 简化方法：查找content字段中的内容
    # 手动定义每个章节的slide数量（基于之前的分析）
    slide_counts = {1: 11, 2: 12, 3: 17, 4: 21}
    
    if ch_idx in slide_counts:
        print(f"\nTypeScript Slides ({slide_counts[ch_idx]}个):")
        print(f"  （基于之前的分析，第{ch_idx}章有{slide_counts[ch_idx]}个slides）")
        
        if len(sections) == slide_counts[ch_idx]:
            print(f"\n✅ 数量匹配！({len(sections)} = {slide_counts[ch_idx]})")
        else:
            print(f"\n❌ 数量不匹配！(sections: {len(sections)} != slides: {slide_counts[ch_idx]})")

# 检查"副市长SOP"出现在哪些章节
print("\n" + "=" * 100)
print("搜索'副市长SOP'在哪些章节")
print("=" * 100)

for ch_idx in range(5):
    json_chapter = json_data['chapters'][ch_idx]
    sections = json_chapter['sections']
    
    deputy_mayor_indices = [i for i, sec in enumerate(sections) if '副市长' in sec['title']]
    
    if deputy_mayor_indices:
        print(f"\n{json_chapter['title']}:")
        for idx in deputy_mayor_indices:
            print(f"  Section[{idx}]: {sections[idx]['title']}")
