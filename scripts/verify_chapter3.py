#!/usr/bin/env python3
"""验证第3章的sections和slides是否匹配"""
import json

# 读取JSON脚本文件
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    script_data = json.load(f)

# 第3章（索引2，包含前言的话是索引3）
# chapter3在JSON中是索引3（0=前言, 1=第1章, 2=第2章, 3=第3章）
print("=== 检查第3章（响应升级——Ⅲ级升级到Ⅱ级响应） ===\n")

chapter3 = script_data['chapters'][3]  # 第3章是索引3
print(f"章节标题: {chapter3['title']}")
print(f"Sections数量: {len(chapter3['sections'])}")
print()

# 列出所有sections
print("所有Sections:")
for i, section in enumerate(chapter3['sections']):
    print(f"  [{i}] {section['title']}")

print(f"\n=== 检查课程数据中的slides ===")

# 读取课程数据
import sys
sys.path.append('src/app/ai-course')
from typhoon_command_course_data import chapters

# 找到第3章（title包含"第3章"）
for idx, chapter in enumerate(chapters):
    if '第3章' in chapter['title']:
        print(f"\n课程数据中第3章的索引: {idx}")
        print(f"章节标题: {chapter['title']}")
        
        # 计算slides数量
        content = chapter.get('content', '')
        slides = content.split('---PAGE---')
        slides = [s.strip() for s in slides if s.strip()]
        
        print(f"Slides数量: {len(slides)}")
        print()
        
        print("所有Slides:")
        for i, slide in enumerate(slides):
            # 提取标题（第一行）
            title = slide.split('\n')[0][:50]
            print(f"  [{i}] {title}")
        
        print(f"\n=== 对比分析 ===")
        print(f"Sections数量: {len(chapter3['sections'])}")
        print(f"Slides数量: {len(slides)}")
        
        if len(chapter3['sections']) == len(slides):
            print("✅ 数量匹配！")
            print("\n逐一对照:")
            for i in range(len(slides)):
                section_title = chapter3['sections'][i]['title'] if i < len(chapter3['sections']) else '(无)'
                slide_title = slides[i].split('\n')[0][:30] if i < len(slides) else '(无)'
                match = "✓" if section_title in slide_title or slide_title in section_title else "✗"
                print(f"  [{i}] Section: {section_title[:30]}")
                print(f"       Slide: {slide_title}")
                print(f"       匹配: {match}")
        else:
            print("❌ 数量不匹配！")
        break
