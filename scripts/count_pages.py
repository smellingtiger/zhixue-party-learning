import re

with open('d:/TraeProject/zhixue-party-learning/src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找所有章节的页面标题
pattern = r'## 第 (\d+) 章[·｜|]P(\d+)：([^\n\\]+)'
matches = re.findall(pattern, content)

chapters = {}
for ch_num, p_num, title in matches:
    ch_num = int(ch_num)
    p_num = int(p_num)
    if ch_num not in chapters:
        chapters[ch_num] = []
    chapters[ch_num].append((p_num, title.strip()))

for ch_num in sorted(chapters.keys()):
    pages = chapters[ch_num]
    print(f"第{ch_num}章: {len(pages)} 页")
    for p_num, title in pages:
        print(f"  P{p_num}: {title}")
    print()
