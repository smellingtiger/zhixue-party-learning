import re

# 读取课程数据
with open('d:/TraeProject/zhixue-party-learning/src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取所有章节的 content 字段
# 找到 chapters 数组
chapters_start = content.find('chapters: [')
if chapters_start == -1:
    print("未找到 chapters 数组")
    exit(1)

# 简单的解析：找到每个 chapter 对象
# 查找 content: '...' 模式，考虑转义字符
# 使用正则匹配 content 字段

# 先找到所有 title 和 content
title_pattern = r"title:\s*'([^']*)'"
content_pattern = r"content:\s*'((?:[^'\\]|\\.)*)'"

titles = re.findall(title_pattern, content[chapters_start:])
contents_raw = re.findall(content_pattern, content[chapters_start:])

print(f"找到 {len(titles)} 个章节\n")

for i, (title, content_raw) in enumerate(zip(titles, contents_raw)):
    # 处理转义
    content_decoded = content_raw.replace("\\n", "\n").replace("\\'", "'").replace("\\\\", "\\")
    
    # 按 ---PAGE--- 分割
    pages = content_decoded.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"第{i+1}章: {title}")
    print(f"  总页数: {len(pages)}")
    
    # 提取每页的标题
    for j, page in enumerate(pages):
        # 查找 ## 第 X 章｜P Y：标题 模式
        title_match = re.search(r'##\s*第\s*\d+\s*章[·｜]\s*P\d+：\s*([^\n\\]+)', page)
        if title_match:
            page_title = title_match.group(1).strip()
        elif page.startswith('【学习目标】'):
            page_title = '【学习目标】'
        elif page.startswith('## 学习目标'):
            page_title = '【学习目标】'
        else:
            # 找第一个 ## 标题
            title_match2 = re.search(r'##\s+([^\n]+)', page)
            if title_match2:
                page_title = title_match2.group(1).strip()[:30]
            else:
                page_title = f'第{j+1}页(无标题)'
        
        print(f"  P{j}: {page_title}")
    print()
