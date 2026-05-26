#!/usr/bin/env python3
"""
精确验证 TypeScript 解析结果与 JSON sections 的对应关系
"""
import json

# 读取 TypeScript 课程数据文件
with open(r'd:\TraeProject\zhixue-party-learning\src\app\ai-course\typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# 读取 JSON 文件
with open(r'd:\TraeProject\zhixue-party-learning\public\course-scripts\typhoon-command-script.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# 提取第1章 content 字符串（从 ts_content 中提取）
import re

# 找到第1章的定义
ch1_match = re.search(r"title:\s*'第1章[^']*'.*?content:\s*'((?:[^'\\]|\\.)*)'", ts_content)
if ch1_match:
    ch1_raw = ch1_match.group(1)
    # 解码转义字符
    ch1_content = ch1_raw.encode().decode('unicode_escape')
    
    # 按 ---PAGE--- 分割
    pages = ch1_content.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"第1章通过 '---PAGE---' 分割后得到 {len(pages)} 个段落块")
    
    # 解析每个段落
    slides = []
    for idx, page in enumerate(pages):
        trimmed = page.strip()
        
        # 检查是否是学习目标
        is_lo = ('学习目标' in trimmed[:30] or 
                 '学习目标' in trimmed[:50] or
                 trimmed.startswith('## 第 1 章·学习目标'))
        
        # 检查是否包含 P 标题
        has_p = bool(re.search(r'P\d+', trimmed))
        
        # 提取标题
        p_match = re.search(r'第\s*1\s*章[|｜]\s*P\d+[：:]\s*([^\n]+)', trimmed)
        title = p_match.group(1).strip() if p_match else ''
        
        if is_lo:
            slides.append({'type': '学习目标', 'title': '学习目标'})
        elif has_p and title:
            slides.append({'type': 'P页面', 'title': title})
        elif has_p:
            # 包含P数字但没有提取到标题，尝试其他方式
            slides.append({'type': 'P页面(无标题)', 'title': '(未识别)'})
        else:
            slides.append({'type': '纯文本', 'title': '(未识别)'})
        
        print(f"  段落[{idx}]: {slides[-1]['type']} - '{slides[-1]['title'][:40]}'")
    
    print(f"\n共生成 {len(slides)} 个幻灯片")
    
    # JSON sections
    json_ch1 = json_data['chapters'][1]
    json_sections = json_ch1['sections']
    print(f"\nJSON 第1章有 {len(json_sections)} 个 sections:")
    for i, s in enumerate(json_sections):
        print(f"  section[{i}]: {s['title']}")
    
    # 对比
    print("\n" + "="*60)
    print("对应关系对比:")
    print("="*60)
    
    if len(slides) == len(json_sections):
        print(f"✓ 数量一致: {len(slides)} = {len(json_sections)}")
        for i in range(len(slides)):
            slide_info = f"{slides[i]['type']}: {slides[i]['title'][:30]}"
            json_info = json_sections[i]['title']
            print(f"  slide[{i}] vs section[{i}]")
            print(f"    slide: {slide_info}")
            print(f"    json:  {json_info}")
    else:
        print(f"✗ 数量不一致: slides={len(slides)}, sections={len(json_sections)}")
        # 找出第一个不匹配的位置
        for i in range(min(len(slides), len(json_sections))):
            slide_info = slides[i]['title']
            json_info = json_sections[i]['title']
            if slide_info not in json_info and json_info not in slide_info:
                print(f"\n第一个不匹配位置: index {i}")
                print(f"  slide[{i}]: {slide_info}")
                print(f"  section[{i}]: {json_info}")
                break
else:
    print("无法从 TypeScript 文件中提取第1章内容")
