#!/usr/bin/env python3
"""验证第2章的真实slides数量"""
import re

# 第2章的真实content格式（[IMAGE]和P1在同一段落）
content_lines = r'''## 第 2 章·学习目标

- 掌握Ⅲ级响应的升级触发条件

---PAGE---

[IMAGE: III级响应新增岗位协同网络图...]

## 第 2 章｜P1：Ⅲ级响应启动背景

台风强度增强为强热带风暴...

---PAGE---

## 第 2 章｜P2：组织指挥体系及职责

指挥体系架构...

---PAGE---

## 第 2 章｜P3：副市长（Ⅲ级）

...

---PAGE---

## 第 2 章｜P4：市公安局（Ⅲ级）

...

---PAGE---

## 第 2 章｜P5：市海事局（Ⅲ级）

...

---PAGE---

## 第 2 章｜P6：市农业农村局（Ⅲ级）

...

---PAGE---

## 第 2 章｜P7：市卫健委（Ⅲ级）

...

---PAGE---

## 第 2 章｜P8：市应急局（Ⅲ级）

...

---PAGE---

## 第 2 章｜P9：市城管局（Ⅲ级）

...

---PAGE---

## 第 2 章｜P10：市交通局（Ⅲ级）

...

---PAGE---

## 第 2 章｜P11：市气象局（Ⅲ级）

...
'''

# 按 ---PAGE--- 分割
page_sections = [p.strip() for p in content_lines.split('---PAGE---') if p.strip()]

print(f"共有 {len(page_sections)} 个 page sections\n")

slides = []
pIndex = 0

for i, section in enumerate(page_sections):
    trimmed = section.strip()
    
    # 检测是否是学习目标
    is_learning_objective = (
        trimmed.startswith('【学习目标】') or
        re.match(r'^##\s*第\s*\d+\s*章·学习目标', trimmed) or
        re.match(r'^##\s*学习目标', trimmed)
    )
    
    # 检测是否是 P 段落（匹配 "## 第X章｜P数字" 或 "【P数字"）
    is_p_section = (
        re.search(r'【P\d+', trimmed) or
        re.match(r'^##\s*第\s*\d+\s*章｜P\d+', trimmed) or
        re.search(r'##\s*第\s*\d+\s*章\|P\d+', trimmed)  # 注意 | 也需要转义或匹配全角
    )
    
    # 如果段落中包含 "P数字："，也认为是P段落
    if not is_p_section:
        is_p_section = bool(re.search(r'P\d+：', trimmed))
    
    # 检测是否是纯图片描述（段落只包含[IMAGE]而没有P标题）
    is_image_only = trimmed.startswith('[IMAGE:') and not is_p_section
    
    # 提取标题（取第一个非空行，跳过[IMAGE]行）
    lines = [l.strip() for l in trimmed.split('\n') if l.strip() and not l.strip().startswith('[IMAGE')]
    first_line = lines[0] if lines else trimmed.split('\n')[0]
    title = first_line[:60]
    
    if is_learning_objective:
        slides.append(('learning_objective', title))
        print(f"Slide [{len(slides)-1}]: {title} [学习目标]")
    elif is_p_section:
        pIndex += 1
        slides.append(('mixed', title))
        print(f"Slide [{len(slides)-1}]: {title} [P{pIndex}]")
    elif is_image_only:
        print(f"[跳过]: {title} [纯图片]")
    else:
        slides.append(('text', title))
        print(f"Slide [{len(slides)-1}]: {title} [文本]")

print(f"\n{'='*60}")
print(f"最终 slides 数量: {len(slides)}")
print(f"{'='*60}")

# 对比 JSON sections
print("\nJSON Sections (应该与slides一一对应):")
sections = [
    "学习目标",
    "Ⅲ级响应启动背景",
    "组织指挥体系及职责",
    "副市长SOP",
    "市公安局SOP",
    "市海事局SOP",
    "市农业农村局SOP",
    "市卫健委SOP",
    "市应急局SOP",
    "市城管局SOP",
    "市交通局SOP",
    "市气象局SOP",
]

print(f"\nSections 数量: {len(sections)}")
print(f"Slides 数量: {len(slides)}")

if len(sections) == len(slides):
    print("\n✅ 数量匹配！")
    print("\n一一对照:")
    for i, (slide_type, slide_title) in enumerate(slides):
        sec_title = sections[i] if i < len(sections) else "(无)"
        print(f"  Slide[{i}] <-> Section[{i}]: {sec_title}")
else:
    print(f"\n❌ 数量不匹配！差 {len(sections) - len(slides)}")
