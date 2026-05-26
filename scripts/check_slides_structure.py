import re

with open('d:/TraeProject/zhixue-party-learning/src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取第1章的 content 字段
# 找到第1章的位置
ch1_start = content.find("title: '第1章：")
if ch1_start == -1:
    print("未找到第1章")
    exit(1)

# 找到 content 开始
content_start = content.find("content: '", ch1_start)
if content_start == -1:
    print("未找到 content")
    exit(1)

content_start += len("content: '")

# 找到 content 结束（下一个 } 或 chapters 的下一个对象）
# 简单处理：查找 ---PAGE--- 分割
content_section = content[content_start:]

# 查找 pages
pages = content_section.split('---PAGE---')
pages = [p.strip() for p in pages if p.strip()]

print(f"第1章总页数: {len(pages)}")
for i, page in enumerate(pages):
    # 提取标题
    title_match = re.search(r'##\s*第\s*\d+\s*章[·｜]\s*P\d+：\s*([^\n\\]+)', page)
    if title_match:
        page_title = title_match.group(1).strip()
    elif page.startswith('【学习目标】') or page.startswith('## 学习目标'):
        page_title = '【学习目标】'
    else:
        page_title = '未知'
    
    # 检查是否有图片占位符
    has_img = '[IMG:' in page
    
    print(f"  Slide[{i}]: {page_title} {'[含图片]' if has_img else ''}")
