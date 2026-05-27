#!/usr/bin/env python3
"""完整对比第3章的 sections 和 slides"""
import json

# 读取 JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

ch3_json = json_data['chapters'][3]
sections = ch3_json['sections']

print("=" * 80)
print("第3章 JSON Sections (17个)")
print("=" * 80)
for i, sec in enumerate(sections):
    print(f"[{i:2d}] {sec['title']}")

# 手动从 TypeScript 提取（简化版）
slides_content = """
## 第 3 章·学习目标
---PAGE---
## 第 3 章｜P1：Ⅱ级响应启动背景
---PAGE---
## 第 3 章｜P2：组织指挥体系及职责
---PAGE---
## 第 3 章｜P3：市长（Ⅱ级）
---PAGE---
## 第 3 章｜P4：市自然资源局（Ⅱ级）
---PAGE---
## 第 3 章｜P5：市通信办（Ⅱ级）
---PAGE---
## 第 3 章｜P6：市供电公司（Ⅱ级）
---PAGE---
## 第 3 章｜P7：市委网信办（Ⅱ级）
---PAGE---
## 第 3 章｜P8：市教育局（Ⅱ级）
---PAGE---
## 第 3 章｜P9：市文旅局（Ⅱ级）
---PAGE---
## 第 3 章｜P10：武警部队（Ⅱ级）
---PAGE---
## 第 3 章｜P11：市城管局/住建局（Ⅱ级）
---PAGE---
## 第 3 章｜P12：市交通局（Ⅱ级）
---PAGE---
## 第 3 章｜P13：市水利局（Ⅱ级）
---PAGE---
## 第 3 章｜P14：市气象局（Ⅱ级）
---PAGE---
## 第 3 章｜P15：市海事局（Ⅱ级）
---PAGE---
## 第 3 章｜P16：市卫健委（Ⅱ级）
""".strip()

slides = [s.strip().replace('## ', '').split('\n')[0] for s in slides_content.split('---PAGE---') if s.strip()]

print("\n" + "=" * 80)
print("第3章 TypeScript Slides (17个)")
print("=" * 80)
for i, slide in enumerate(slides):
    print(f"[{i:2d}] {slide}")

print("\n" + "=" * 80)
print("映射关系验证")
print("=" * 80)

# 检查每个 section 是否能找到对应的 slide
for i in range(len(sections)):
    sec_title = sections[i]['title']
    slide_title = slides[i] if i < len(slides) else '(无)'
    
    # 检查匹配
    # 学习目标
    if '学习目标' in sec_title and '学习目标' in slide_title:
        match = "✓"
    # SOP 对应关系
    elif '市长SOP' in sec_title and '市长' in slide_title:
        match = "✓"
    elif '市自然资源局SOP' in sec_title and '市自然资源局' in slide_title:
        match = "✓"
    elif '市通信办SOP' in sec_title and '市通信办' in slide_title:
        match = "✓"
    elif '市供电公司SOP' in sec_title and '市供电公司' in slide_title:
        match = "✓"
    elif '市委网信办SOP' in sec_title and '市委网信办' in slide_title:
        match = "✓"
    elif '市教育局SOP' in sec_title and '市教育局' in slide_title:
        match = "✓"
    elif '市文旅局SOP' in sec_title and '市文旅局' in slide_title:
        match = "✓"
    elif '武警部队SOP' in sec_title and '武警部队' in slide_title:
        match = "✓"
    elif '市城管局SOP' in sec_title and '市城管局' in slide_title:
        match = "✓"
    elif '市交通局SOP' in sec_title and '市交通局' in slide_title:
        match = "✓"
    elif '市水利局SOP' in sec_title and '市水利局' in slide_title:
        match = "✓"
    elif '市气象局SOP' in sec_title and '市气象局' in slide_title:
        match = "✓"
    elif '市海事局SOP' in sec_title and '市海事局' in slide_title:
        match = "✓"
    elif '市卫健委SOP' in sec_title and '市卫健委' in slide_title:
        match = "✓"
    elif 'Ⅱ级响应启动背景' in sec_title and 'Ⅱ级响应启动背景' in slide_title:
        match = "✓"
    elif '组织指挥体系及职责' in sec_title and '组织指挥体系及职责' in slide_title:
        match = "✓"
    else:
        match = "✗"
    
    if match == "✗":
        print(f"[{i:2d}] ✗ MISMATCH: '{sec_title}' -> '{slide_title}'")
    else:
        print(f"[{i:2d}] ✓ {sec_title[:30]:<30} -> {slide_title[:30]}")

print("\n" + "=" * 80)
print("关键检查：副市长SOP在第3章存在吗？")
print("=" * 80)

# 检查"副市长SOP"是否在第3章
has_deputy_mayor = any('副市长' in sec['title'] for sec in sections)
print(f"第3章有'副市长SOP': {has_deputy_mayor}")

# 检查"指挥体系架构"是否在第3章
has_command_system = any('指挥体系' in sec['title'] for sec in sections)
print(f"第3章有'指挥体系'相关: {has_command_system}")

# 搜索包含"指挥体系"的内容
print("\n第3章中包含'指挥'的sections:")
for i, sec in enumerate(sections):
    if '指挥' in sec['title']:
        print(f"  [{i}] {sec['title']}")
