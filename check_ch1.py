import re
import json

with open(r'd:\TraeProject\zhixue-party-learning\src\app\ai-course\typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

with open(r'd:\TraeProject\zhixue-party-learning\public\course-scripts\typhoon-command-script.json', 'r', encoding='utf-8') as f:
    js = json.load(f)

ch1_start = ts.find("title: '第1章：台风灾害导致城市运行中断")
ch1_end = ts.find("{\n      id: 3,", ch1_start)
ch1_block = ts[ch1_start:ch1_end]

content_match = re.search(r"content:\s*'((?:[^'\\]|\\.)*)'", ch1_block)
if content_match:
    raw = content_match.group(1)
    content = raw.encode().decode('unicode_escape')
    pages = content.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"TypeScript 第1章 slides: {len(pages)} 个")
    for i, p in enumerate(pages):
        lo = '学习目标' in p[:40]
        pm = re.search(r'第\s*1\s*章[｜|]\s*P\d+[：:]\s*([^\n]+)', p)
        title = pm.group(1).strip() if pm else ''
        if lo:
            print(f"  slide[{i}]: 学习目标")
        elif title:
            print(f"  slide[{i}]: P页面 - {title}")
        else:
            print(f"  slide[{i}]: (未识别) '{p[:50]}...'")
    
    print(f"\nJSON 第1章 sections: {len(js['chapters'][1]['sections'])} 个")
    for i, s in enumerate(js['chapters'][1]['sections']):
        print(f"  section[{i}]: {s['title']}")
    
    print(f"\n匹配检查: slides={len(pages)}, sections={len(js['chapters'][1]['sections'])}")
    if len(pages) == len(js['chapters'][1]['sections']):
        print("✓ 数量一致")
    else:
        print("✗ 数量不一致!")
else:
    print("无法提取第1章content")
