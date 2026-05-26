import json
import re

# 读取 script JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    script = json.load(f)

print("=" * 80)
print("typhoon-command-script.json 结构")
print("=" * 80)

for ch_idx, ch in enumerate(script['chapters']):
    sections = ch.get('sections', [])
    print(f"\n【第{ch_idx}章】{ch['title']}")
    print(f"  sections 数量: {len(sections)}")
    
    for s_idx, sec in enumerate(sections):
        print(f"    Section[{s_idx}]: {sec['title']}")

# 对比 course-data.ts 中的 slides
print("\n" + "=" * 80)
print("\n分析 typhoon-command-course-data.ts")
print("=" * 80)

with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 chapters 数组
chapters_start = content.find('chapters: [')
chapters_section = content[chapters_start:]

# 提取每个 chapter 的 content 字段
chapters_matches = []
pattern = r"\{\s*id:\s*\d+,\s*title:\s*'([^']*)',[^}]*content:\s*'((?:[^'\\]|\\.)*)'"
for match in re.finditer(pattern, chapters_section):
    title = match.group(1)
    raw_content = match.group(2)
    if '章' in title or '前言' in title:
        chapters_matches.append((title, raw_content))

for ch_idx, (title, raw_content) in enumerate(chapters_matches):
    decoded = raw_content.replace("\\n", "\n").replace("\\'", "'").replace("\\\\", "\\")
    pages = decoded.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"\n【第{ch_idx}章】{title}")
    print(f"  实际页数: {len(pages)}")
    
    for p_idx, page in enumerate(pages):
        title_match = re.search(r'##\s*第\s*\d+\s*章[·｜]\s*P\d+：\s*([^\n\\]+)', page)
        if title_match:
            page_title = title_match.group(1).strip()
        elif page.startswith('【学习目标】') or '学习目标' in page[:100]:
            page_title = '【学习目标】'
        else:
            title_match2 = re.search(r'##\s+([^\n]+)', page)
            page_title = title_match2.group(1).strip()[:40] if title_match2 else '未知'
        
        print(f"    Slide[{p_idx}]: {page_title}")
