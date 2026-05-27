import re

with open('src/app/library/course-learn/[id]/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

# 查找 onSectionChange 相关的代码
print("查找 onSectionChange 处理逻辑")
print("=" * 60)

# 找到所有 onSectionChange 的定义
pattern = r"onSectionChange=\{[^}]+\}"
matches = list(re.finditer(pattern, page, re.DOTALL))

print(f"\n找到 {len(matches)} 个 onSectionChange 定义")

for i, match in enumerate(matches):
    start = max(0, match.start() - 200)
    end = min(len(page), match.end() + 50)
    context = page[start:end]
    
    # 提取上下文中的章节信息
    chapter_pattern = r"currentChapter.*?(\d+)"
    slide_pattern = r"slides\.length.*?(\d+)"
    
    print(f"\nonSectionChange #{i+1}:")
    # 打印附近的代码
    lines = context.split('\n')
    for line in lines[-10:]:  # 最后10行
        print(f"  {line.strip()[:100]}")

# 检查 typhoon-command-course-data.ts 的章节结构
print("\n" + "=" * 60)
print("检查 course-data.ts 中的章节结构")
print("=" * 60)

with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    data = f.read()

# 查找 chapters 数组
chapters_start = data.find('chapters: [')
chapters_section = data[chapters_start:]

# 提取每个 chapter 的 title 和 content
chapters = []
pattern = r"\{\s*id:\s*(\d+),\s*title:\s*'([^']*)',\s*duration:\s*'[^']*',\s*type:\s*'[^']*',\s*content:\s*'((?:[^'\\]|\\.)*)'"

for match in re.finditer(pattern, chapters_section):
    ch_id = match.group(1)
    title = match.group(2)
    content = match.group(3).replace("\\n", "\n").replace("\\'", "'").replace("\\\\", "\\")
    
    # 按 ---PAGE--- 分割
    pages = content.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    chapters.append({
        'id': ch_id,
        'title': title,
        'pages': pages
    })

for ch in chapters:
    print(f"\n章节 ID: {ch['id']}")
    print(f"标题: {ch['title']}")
    print(f"页数: {len(ch['pages'])}")
    
    for p_idx, page in enumerate(ch['pages']):
        # 提取标题
        title_match = re.search(r'##\s*第\s*\d+\s*章[·｜]\s*P\d+：\s*([^\n\\]+)', page)
        if title_match:
            page_title = title_match.group(1).strip()
        elif page.startswith('【学习目标】') or '学习目标' in page[:100]:
            page_title = '【学习目标】'
        else:
            title_match2 = re.search(r'##\s+([^\n]+)', page)
            page_title = title_match2.group(1).strip()[:40] if title_match2 else '未知'
        
        print(f"  Slide[{p_idx}]: {page_title}")
