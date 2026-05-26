#!/usr/bin/env python3
"""
完整模拟运行时行为，验证 onSectionChange 索引映射
"""
import json

# 读取 JSON 文件
with open(r'd:\TraeProject\zhixue-party-learning\public\course-scripts\typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# 读取 TypeScript 课程数据
ts_chapters = []

# 第1章的精确内容（从 typhoon-command-course-data.ts 复制）
ch1_content = '## 第 1 章·学习目标\n\n- 了解该市地理概况及易形成台风灾害的原因\n- 掌握Ⅳ级响应的启动条件与组织指挥体系\n- 掌握Ⅳ级响应下7个核心岗位的SOP应急指挥卡\n- 建立"提前预判、主动防御"的防台思维\n\n---PAGE---\n\n[IMAGE: 该市地理概况地图，标注220公里海岸线、东江西溪南山河等主要河流、沿海低洼区域（平均海拔不足5米）、山洪地质灾害隐患点87处分布，城市建成区范围，东南沿海城市风格，写实地图绘制]\n\n## 第 1 章｜P1：该市地理概况\n\n该市总面积7446平方公里...\n\n---PAGE---\n\n## 第 1 章｜P2：Ⅳ级响应启动背景\n\n热带低压或热带风暴已在西北太平洋生成并向本地移动...\n\n---PAGE---\n\n[IMAGE: IV级响应组织指挥体系架构图...]\n\n## 第 1 章｜P3：组织指挥体系及职责\n\n指挥体系架构：...\n\n---PAGE---\n\n## 第 1 章｜P4：副市长（Ⅳ级）\n\n| 动作 | 内容 | 阈值/时限 |\n...\n\n---PAGE---\n\n## 第 1 章｜P5：市应急局（Ⅳ级）\n...\n\n---PAGE---\n\n## 第 1 章｜P6：市气象局（Ⅳ级）\n...\n\n---PAGE---\n\n## 第 1 章｜P7：市水利局（Ⅳ级）\n...\n\n---PAGE---\n\n## 第 1 章｜P8：市交通局（Ⅳ级）\n...\n\n---PAGE---\n\n## 第 1 章｜P9：市城管局/住建局（Ⅳ级）\n...\n\n---PAGE---\n\n## 第 1 章｜P10：属地街道（Ⅳ级）\n...'

# 模拟解析
page_sections = ch1_content.split('---PAGE---')
page_sections = [p.strip() for p in page_sections if p.strip()]

print("JSON sections (第1章):")
json_ch1 = json_data['chapters'][1]
for i, s in enumerate(json_ch1['sections']):
    print(f"  [{i}] {s['title']}")

print(f"\n共 {len(json_ch1['sections'])} 个 sections")

# 模拟幻灯片生成（简化版，只关注标题）
slides = []
pIndex = 0
for section in page_sections:
    trimmed = section.strip()
    if '学习目标' in trimmed[:30]:
        slides.append('学习目标')
    elif 'P1' in trimmed[:100]:
        slides.append('P1: 该市地理概况')
        pIndex = 1
    elif 'P2' in trimmed[:100]:
        slides.append('P2: Ⅳ级响应启动背景')
        pIndex = 2
    elif 'P3' in trimmed[:100]:
        slides.append('P3: 组织指挥体系及职责')
        pIndex = 3
    elif 'P4' in trimmed[:100]:
        slides.append('P4: 副市长（Ⅳ级）')
        pIndex = 4
    elif 'P5' in trimmed[:100]:
        slides.append('P5: 市应急局（Ⅳ级）')
        pIndex = 5
    elif 'P6' in trimmed[:100]:
        slides.append('P6: 市气象局（Ⅳ级）')
        pIndex = 6
    elif 'P7' in trimmed[:100]:
        slides.append('P7: 市水利局（Ⅳ级）')
        pIndex = 7
    elif 'P8' in trimmed[:100]:
        slides.append('P8: 市交通局（Ⅳ级）')
        pIndex = 8
    elif 'P9' in trimmed[:100]:
        slides.append('P9: 市城管局/住建局（Ⅳ级）')
        pIndex = 9
    elif 'P10' in trimmed[:100]:
        slides.append('P10: 属地街道（Ⅳ级）')
        pIndex = 10

print(f"\n生成的 slides (第1章):")
for i, s in enumerate(slides):
    print(f"  [{i}] {s}")

print(f"\n共 {len(slides)} 个 slides")

print("\n" + "="*80)
print("索引对应验证:")
print("="*80)
for i in range(len(json_ch1['sections'])):
    json_title = json_ch1['sections'][i]['title']
    slide_title = slides[i] if i < len(slides) else 'N/A'
    print(f"  section[{i}] '{json_title}' <-> slide[{i}] '{slide_title}'")
