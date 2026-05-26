import re
import json

# Read TS file
with open(r'd:\TraeProject\zhixue-party-learning\src\app\ai-course\typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

# Read JSON file
with open(r'd:\TraeProject\zhixue-party-learning\public\course-scripts\typhoon-command-script.json', 'r', encoding='utf-8') as f:
    js = json.load(f)

# Find ch1 content in ts
ch1_match = re.search(r"title: '第1章[^']*',\s*duration: '[^']*',\s*type: '[^']*',\s*content: '((?:[^'\\]|\\.)*)'", ts)
if not ch1_match:
    ch1_match = re.search(r"title: '第1章[^']*'.*?content: '((?:[^'\\]|\\.)*)'", ts, re.DOTALL)

if ch1_match:
    raw = ch1_match.group(1)
    content = raw.encode().decode('unicode_escape')
    
    # Split by ---PAGE---
    pages = [p.strip() for p in content.split('---PAGE---') if p.strip()]
    
    # Extract slide titles
    ts_titles = []
    for i, p in enumerate(pages):
        if '学习目标' in p[:60]:
            ts_titles.append('学习目标')
        else:
            m = re.search(r'第\s*1\s*章[｜|]\s*P\d+[：:]\s*([^\n]+)', p)
            if m:
                ts_titles.append(m.group(1).strip())
            else:
                ts_titles.append(f'(未识别P{i})')
    
    # JSON sections
    json_secs = js['chapters'][1]['sections']
    json_titles = [s['title'] for s in json_secs]
    
    print(f"TypeScript slides: {len(ts_titles)}")
    for i, t in enumerate(ts_titles):
        print(f"  slide[{i}]: {t}")
    
    print(f"\nJSON sections: {len(json_titles)}")
    for i, t in enumerate(json_titles):
        print(f"  section[{i}]: {t}")
    
    print(f"\n数量: slides={len(ts_titles)}, sections={len(json_titles)}")
    
    if len(ts_titles) == len(json_titles):
        print("✓ 数量一致")
        print("\n逐一对应检查:")
        for i in range(len(ts_titles)):
            st = ts_titles[i]
            jt = json_titles[i]
            match = (st == jt or st in jt or jt in st or 
                     (st == '学习目标' and jt == '学习目标'))
            print(f"  [{i}] slide:'{st}' <-> section:'{jt}' {'✓' if match else '✗'}")
    else:
        print("✗ 数量不一致! 这就是问题所在!")
        # Find which indices are off
        min_len = min(len(ts_titles), len(json_titles))
        for i in range(min_len):
            st = ts_titles[i]
            jt = json_titles[i]
            match = (st == jt or st in jt or jt in st)
            if not match:
                print(f"  第一个不匹配: [{i}] slide:'{st}' vs section:'{jt}'")
                break
else:
    print("Could not extract ch1 content")
