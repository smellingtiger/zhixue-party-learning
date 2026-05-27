#!/usr/bin/env python3
"""模拟修复后的 slides 生成逻辑"""
import re

# 第2章的完整content（简化版）
content = r'''## 第 2 章·学习目标

- 掌握Ⅲ级响应的升级触发条件

---PAGE---

[IMAGE: III级响应新增岗位协同网络图，中心为分管副市长...]

## 第 2 章｜P1：Ⅲ级响应启动背景

台风强度增强为强热带风暴...

---PAGE---

## 第 2 章｜P2：组织指挥体系及职责

指挥体系架构：
...

---PAGE---

## 第 2 章｜P3：副市长（Ⅲ级）

| 动作 | 内容 | 阈值/时限 |
...

---PAGE---

## 第 2 章｜P4：市公安局（Ⅲ级）

...
'''

# 按 ---PAGE--- 分割
page_sections = [p.strip() for p in content.split('---PAGE---') if p.strip()]

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
    
    # 检测是否是 P 段落
    is_p_section = (
        re.search(r'【P\d+', trimmed) or
        re.match(r'^##\s*第\s*\d+\s*章｜P\d+', trimmed)
    )
    
    # 检测是否是纯图片描述
    is_image_only = trimmed.startswith('[IMAGE:')
    
    # 提取标题（第一行）
    title = trimmed.split('\n')[0][:60]
    
    if is_learning_objective:
        slides.append(('learning_objective', title, 0))
        print(f"Slide [{len(slides)-1}]: {title} [学习目标]")
    elif is_p_section:
        pIndex += 1
        slides.append(('mixed', title, pIndex))
        print(f"Slide [{len(slides)-1}]: {title} [P{pIndex}]")
    elif is_image_only:
        # 跳过纯图片描述
        print(f"[跳过]: {title} [纯图片描述]")
    else:
        slides.append(('text', title, 0))
        print(f"Slide [{len(slades)-1}]: {title} [文本]")

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
]

for i, (slide_type, title, p_num) in enumerate(slides):
    section_title = sections[i] if i < len(sections) else "(无)"
    match = "✓" if section_title in title or title.replace("## 第 2 章｜P" + str(p_num) + "：", "") == section_title.replace("SOP", "") else "?"
    print(f"  Slide[{i}] (P{p_num if p_num else '?'}) {title[:40]}")
    print(f"    Section[{i}] {section_title} {match}")
