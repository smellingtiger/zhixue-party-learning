#!/usr/bin/env python3
"""检查台风课程的videoUrl配置"""
import sys
sys.path.insert(0, 'src/app/ai-course')

# 由于无法直接import TypeScript，直接检查文件内容
with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找每个章节的type字段
import re
chapters = re.findall(r"title:\s*'([^']*)'.*?type:\s*'([^']*)'", content, re.DOTALL)

print("台风课程各章节type:")
for i, (title, ch_type) in enumerate(chapters):
    has_video = ch_type == 'video' or ch_type == 'mixed'
    print(f"  Chapter {i}: {title[:50]}")
    print(f"    type: '{ch_type}'")
    print(f"    可能有videoUrl: {has_video}")
    print()
