#!/usr/bin/env python3
"""模拟 slides 生成逻辑"""
import re

# 第2章的content
content = r'''## 第 2 章·学习目标

- 掌握Ⅲ级响应的升级触发条件
- 理解从7个岗位扩展到9个岗位的协同联动机制
- 掌握4个新增岗位（市公安局/市海事局/市农业农村局/市卫健委）的核心职责
- 掌握Ⅲ级响应下9个岗位的SOP应急指挥卡

---PAGE---

[IMAGE: III级响应新增岗位协同网络图...]

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
'''

# 按 ---PAGE--- 分割
page_sections = [p.strip() for p in content.split('---PAGE---') if p.strip()]

print(f"共有 {len(page_sections)} 个 page sections\n")

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
        re.match(r'^##\s*第\s*\d+\s*章｜P\d+', trimmed)  # 注意这里的 | 是正则的"或"
    )
    
    # 提取标题（第一行）
    title = trimmed.split('\n')[0][:60]
    
    slide_type = 'learning_objective' if is_learning_objective else ('mixed' if is_p_section else 'text')
    
    print(f"Slide [{i}]: {title}")
    print(f"  Type: {slide_type}")
    print(f"  isLearningObjective: {bool(is_learning_objective)}")
    print(f"  isPSection: {bool(is_p_section)}")
    print()
