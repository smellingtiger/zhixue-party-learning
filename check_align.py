import re
import json

# Read TypeScript file
with open(r'd:\TraeProject\zhixue-party-learning\src\app\ai-course\typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

# Read JSON file
with open(r'd:\TraeProject\zhixue-party-learning\public\course-scripts\typhoon-command-script.json', 'r', encoding='utf-8') as f:
    js = json.load(f)

# Find chapter 1 content
ch1_match = re.search(r"title: '第1章.*?'\s*,\s*duration:.*?,\s*type:.*?,\s*content: '((?:[^'\\]|\\.)*)'", ts)

if not ch1_match:
    # Try without the closing quote before content
    ch1_match = re.search(r"title: '第1章[^']*'\s*,\s*[^,]*,\s*[^,]*,\s*content: '((?:[^'\\]|\\.)*)'", ts)

if ch1_match:
    raw = ch1_match.group(1)
    content = raw.encode().decode('unicode_escape')
    pages = content.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"TypeScript 第1章: {len(pages)} 个 slides")
    for i, p in enumerate(pages):
        lo = '学习目标' in p[:50]
        pm = re.search(r'第\s*1\s*章[｜|]\s*P\d+[：:]\s*([^\n]+)', p)
        if lo:
            print(f"  slide[{i}]: 学习目标")
        elif pm:
            print(f"  slide[{i}]: {pm.group(1).strip()}")
        else:
            print(f"  slide[{i}]: (???) '{p[:30]}...'")
    
    print(f"\nJSON 第1章: {len(js['chapters'][1]['sections'])} 个 sections")
    for i, s in enumerate(js['chapters'][1]['sections']):
        print(f"  section[{i}]: {s['title']}")
    
    print(f"\n对比: slides={len(pages)}, sections={len(js['chapters'][1]['sections'])}")
    
    # Check each pair
    if len(pages) == len(js['chapters'][1]['sections']):
        print("数量一致!")
        print("\n逐一对应:")
        for i in range(len(pages)):
            p = pages[i]
            s = js['chapters'][1]['sections'][i]
            
            # Extract slide title
            lo = '学习目标' in p[:50]
            pm = re.search(r'第\s*1\s*章[｜|]\s*P\d+[：:]\s*([^\n]+)', p)
            slide_title = '学习目标' if lo else (pm.group(1).strip() if pm else '???')
            json_title = s['title']
            
            # Check if they match
            match = slide_title in json_title or json_title in slide_title or (lo and json_title == '学习目标')
            status = "✓" if match else "✗"
            print(f"  [{i}] slide:'{slide_title}' vs section:'{json_title}' {status}")
    else:
        print("数量不一致! 这是问题所在!")
else:
    print("Failed to extract chapter 1 content from TypeScript file")
    # Let's try a different approach
    idx = ts.find("title: '第1章：台风灾害")
    if idx >= 0:
        print(f"Found at index {idx}")
        print(ts[idx:idx+500])
    else:
        print("Could not find chapter 1 at all")
