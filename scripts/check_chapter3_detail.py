#!/usr/bin/env python3
"""详细分析第3章的section和slide对应关系"""
import json

# 读取JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ch3 = data['chapters'][3]
print("第3章 Sections:")
for i, s in enumerate(ch3['sections']):
    print(f"  [{i}] {s['title']}")

# 手动从TypeScript文件提取slides（简单文本处理）
content_lines = """## 第 3 章·学习目标
---PAGE---
P1：Ⅱ级响应启动背景
---PAGE---
P2：组织指挥体系及职责
---PAGE---
P3：市长（Ⅱ级）
---PAGE---
P4：市自然资源局（Ⅱ级）
---PAGE---
P5：市通信办（Ⅱ级）
---PAGE---
P6：市供电公司（Ⅱ级）
---PAGE---
P7：市委网信办（Ⅱ级）
---PAGE---
P8：市教育局（Ⅱ级）
---PAGE---
P9：市文旅局（Ⅱ级）
---PAGE---
P10：武警部队（Ⅱ级）
---PAGE---
P11：市城管局/住建局（Ⅱ级）
---PAGE---
P12：市交通局（Ⅱ级）
---PAGE---
P13：市水利局（Ⅱ级）
---PAGE---
P14：市气象局（Ⅱ级）
---PAGE---
P15：市海事局（Ⅱ级）
---PAGE---
P16：市卫健委（Ⅱ级）"""

slides = content_lines.split('---PAGE---')
slides = [s.strip().split('\n')[0].replace('## ', '') for s in slides if s.strip()]

print("\n课程数据 Slides:")
for i, s in enumerate(slides):
    print(f"  [{i}] {s}")

print("\n=== 对比 ===")
print(f"Sections: {len(ch3['sections'])}")
print(f"Slides: {len(slides)}")

print("\n一一映射:")
for i in range(max(len(ch3['sections']), len(slides))):
    sec = ch3['sections'][i]['title'] if i < len(ch3['sections']) else '(无)'
    sld = slides[i] if i < len(slides) else '(无)'
    match = "✓" if sec in sld or sld in sec or '学习目标' in sec else "?"
    print(f"  [{i}] {sec[:25]:<25} -> {sld[:30]:<30} {match}")
