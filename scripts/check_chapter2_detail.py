#!/usr/bin/env python3
"""检查第2章的详细对应关系"""
import json

# 读取JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

ch2_json = json_data['chapters'][2]
sections = ch2_json['sections']

print("第2章 JSON Sections (12个):")
for i, sec in enumerate(sections):
    print(f"  [{i:2d}] {sec['title']}")

# 第2章的TypeScript slides
slides_content = """
## 第 2 章·学习目标
---PAGE---
## 第 2 章｜P1：Ⅲ级响应启动背景
---PAGE---
## 第 2 章｜P2：组织指挥体系及职责
---PAGE---
## 第 2 章｜P3：副市长（Ⅲ级）
---PAGE---
## 第 2 章｜P4：市公安局（Ⅲ级）
---PAGE---
## 第 2 章｜P5：市海事局（Ⅲ级）
---PAGE---
## 第 2 章｜P6：市农业农村局（Ⅲ级）
---PAGE---
## 第 2 章｜P7：市卫健委（Ⅲ级）
---PAGE---
## 第 2 章｜P8：市应急局（Ⅲ级）
---PAGE---
## 第 2 章｜P9：市城管局（Ⅲ级）
---PAGE---
## 第 2 章｜P10：市交通局（Ⅲ级）
---PAGE---
## 第 2 章｜P11：市气象局（Ⅲ级）
""".strip()

slides = [s.strip().replace('## ', '') for s in slides_content.split('---PAGE---') if s.strip()]

print("\n第2章 TypeScript Slides (12个):")
for i, slide in enumerate(slides):
    print(f"  [{i:2d}] {slide}")

print("\n映射验证:")
for i in range(len(sections)):
    sec_title = sections[i]['title']
    slide_title = slides[i] if i < len(slides) else '(无)'
    
    # 检查匹配
    if '学习目标' in sec_title and '学习目标' in slide_title:
        match = "✓"
    elif 'Ⅲ级响应启动背景' in sec_title and 'Ⅲ级响应启动背景' in slide_title:
        match = "✓"
    elif '组织指挥体系' in sec_title and '组织指挥体系' in slide_title:
        match = "✓"
    elif '副市长SOP' in sec_title and '副市长' in slide_title:
        match = "✓"
    elif '市公安局SOP' in sec_title and '市公安局' in slide_title:
        match = "✓"
    elif '市海事局SOP' in sec_title and '市海事局' in slide_title:
        match = "✓"
    elif '市农业农村局SOP' in sec_title and '市农业农村局' in slide_title:
        match = "✓"
    elif '市卫健委SOP' in sec_title and '市卫健委' in slide_title:
        match = "✓"
    elif '市应急局SOP' in sec_title and '市应急局' in slide_title:
        match = "✓"
    elif '市城管局SOP' in sec_title and '市城管局' in slide_title:
        match = "✓"
    elif '市交通局SOP' in sec_title and '市交通局' in slide_title:
        match = "✓"
    elif '市气象局SOP' in sec_title and '市气象局' in slide_title:
        match = "✓"
    else:
        match = "✗"
    
    if match == "✗":
        print(f"  [{i:2d}] ✗ MISMATCH: '{sec_title}' -> '{slide_title}'")
    else:
        print(f"  [{i:2d}] ✓ {sec_title[:30]:<30} -> {slide_title[:30]}")

print("\n关键测试：点击'副市长SOP'(section[3])应该跳转到slide[3]='副市长（Ⅲ级）'")
print(f"  section[3] = '{sections[3]['title']}'")
print(f"  slide[3] = '{slides[3]}'")
print(f"  匹配: {'✓' if '副市长' in slides[3] else '✗'}")
