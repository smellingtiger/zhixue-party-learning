import re

# 读取课程数据文件
with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找 chapters 数组的位置
chapters_start = content.find('chapters: [')
if chapters_start == -1:
    print("未找到 chapters 数组")
    exit(1)

# 提取 chapters 数组的内容
chapters_section = content[chapters_start:]

# 简单提取 title 和 content
# 找到每个 { id: ..., title: '...', content: '...' } 对象
titles = []
raw_contents = []

# 使用更简单的方法：按 'title:' 分割
parts = chapters_section.split("title: '")
for i, part in enumerate(parts[1:], 1):  # 跳过第一个空的部分
    # 提取 title
    title_end = part.find("',")
    if title_end == -1:
        continue
    title = part[:title_end]
    
    # 检查是否是章节的 title（不是 section 或其他内容的 title）
    # 章节 title 应该在 id 后面，且包含 '章' 或 '前言'
    if '章' not in title and '前言' not in title:
        continue
    
    titles.append(title)
    
    # 从这部分找到 content
    content_pos = part.find("content: '")
    if content_pos == -1:
        raw_contents.append("")
        continue
    
    content_start = content_pos + len("content: '")
    # 找到 content 的结束位置（下一个 id: 或 }）
    content_section = part[content_start:]
    
    # 找到 content 的结束（下一个 ',\n  或者 '},\n）
    content_end = content_section.find("',\n")
    if content_end == -1:
        content_end = content_section.find("', ")
    if content_end == -1:
        content_end = len(content_section)
    
    raw_content = content_section[:content_end]
    raw_contents.append(raw_content)

print("=" * 80)
print(f"找到 {len(titles)} 个章节")
print("=" * 80)

for ch_idx, (title, raw_content) in enumerate(zip(titles, raw_contents)):
    # 处理转义字符
    decoded_content = raw_content.replace("\\n", "\n").replace("\\'", "'").replace("\\\\", "\\")
    
    # 按 ---PAGE--- 分割
    pages = decoded_content.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"\n【第{ch_idx}章】{title}")
    print(f"  总页数: {len(pages)}")
    
    for p_idx, page in enumerate(pages):
        # 提取标题
        title_match = re.search(r'##\s*第\s*\d+\s*章[·｜]\s*P\d+：\s*([^\n\\]+)', page)
        if title_match:
            page_title = title_match.group(1).strip()
        elif page.startswith('【学习目标】') or '学习目标' in page[:100]:
            page_title = '【学习目标】'
        else:
            title_match2 = re.search(r'##\s+([^\n]+)', page)
            if title_match2:
                page_title = title_match2.group(1).strip()[:40]
            else:
                page_title = '未知'
        
        has_img = '[IMG:' in page
        print(f"    Slide[{p_idx}]: {page_title} {'[含图片]' if has_img else ''}")
