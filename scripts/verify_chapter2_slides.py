#!/usr/bin/env python3
"""验证第2章的slides数量"""
import re

# 第2章的完整content（从TypeScript文件提取）
content_lines = r'''## 第 2 章·学习目标

- 掌握Ⅲ级响应的升级触发条件
- 理解从7个岗位扩展到9个岗位的协同联动机制
- 掌握4个新增岗位（市公安局/市海事局/市农业农村局/市卫健委）的核心职责
- 掌握Ⅲ级响应下9个岗位的SOP应急指挥卡

---PAGE---

[IMAGE: III级响应新增岗位协同网络图，中心为分管副市长，原有6个部门（应急局、气象局、水利局、交通局、城管局、属地街道）用蓝色节点标注，新增3个部门（公安局、海事局、农业农村局、卫健委）用橙色节点标注，连线显示协同关系，网络拓扑图风格]

## 第 2 章｜P1：Ⅲ级响应启动背景

台风强度增强为强热带风暴或台风级别，预计24—36小时内影响本市。中心附近最大风力10—13级，沿海或陆地平均风力达到8—10级并可能持续。气象局已发布台风黄色预警。预计出现暴雨到大暴雨，沿海出现大浪和风暴潮，海上作业、滨海景区、低洼区域需要限制或关闭。Ⅳ级响应措施已不足以应对升级风险，根据市防汛防台应急预案此时需启动Ⅲ级响应。

---PAGE---

## 第 2 章｜P2：组织指挥体系及职责

指挥体系架构：
...

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
    
    # 检测是否是 P 段落
    is_p_section = (
        re.search(r'【P\d+', trimmed) or
        re.match(r'^##\s*第\s*\d+\s*章｜P\d+', trimmed)
    )
    
    # 检测是否是纯图片描述
    is_image_only = trimmed.startswith('[IMAGE:')
    
    # 提取标题
    first_line = trimmed.split('\n')[0]
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
print("\nJSON Sections:")
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
else:
    print(f"\n❌ 数量不匹配！差 {len(sections) - len(slides)}")
