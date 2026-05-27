import re

# 读取TypeScript文件
with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到第3章的content
# 提取第3章的content部分
chapter3_pattern = r"title:\s*'第3章：响应升级[^']*'.*?content:\s*'((?:[^'\\]|\\.|'(?!\s*,\s*type:))*?)'"
match = re.search(chapter3_pattern, content, re.DOTALL)

if match:
    ch3_content = match.group(1)
    # 转义字符处理
    ch3_content = ch3_content.replace('\\n', '\n').replace("\\'", "'")
    
    # 按---PAGE---分割
    pages = ch3_content.split('---PAGE---')
    pages = [p.strip() for p in pages if p.strip()]
    
    print(f"第3章共有 {len(pages)} 个slide")
    print()
    
    for i, page in enumerate(pages):
        # 提取第一个非空行作为标题
        lines = page.split('\n')
        title_line = ''
        for line in lines:
            line = line.strip()
            if line and not line.startswith('[IMAGE'):
                title_line = line[:60]
                break
        
        has_image = '[IMAGE' in page
        print(f"Slide [{i:2d}]: {title_line} {'[含图片]' if has_image else ''}")
else:
    print("未找到第3章内容")
