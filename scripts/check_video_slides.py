import json
import re

# 读取 course-learn 页面中构建 slides 的逻辑
with open('src/app/library/course-learn/[id]/page.tsx', 'r', encoding='utf-8') as f:
    page_content = f.read()

# 查找 video slide 插入逻辑
print("查找 video slide 插入逻辑")
print("=" * 60)

# 查找 slide type 为 video 的插入位置
video_pattern = r"type:\s*'video'"
video_matches = list(re.finditer(video_pattern, page_content))

print(f"\n找到 {len(video_matches)} 个 video slide 插入点")

for match in video_matches:
    start = max(0, match.start() - 200)
    end = min(len(page_content), match.end() + 100)
    context = page_content[start:end]
    
    # 提取附近的课程代码判断
    code_pattern = r"courseCode\s*===\s*'(\d+)'"
    code_match = re.search(code_pattern, context)
    
    chapter_pattern = r"ch\.id\s*===\s*(\d+)"
    chapter_match = re.search(chapter_pattern, context)
    
    pindex_pattern = r"pIndex\s*===\s*(\d+)"
    pindex_match = re.search(pindex_pattern, context)
    
    print(f"\nVideo slide 插入点:")
    if code_match:
        print(f"  课程代码: {code_match.group(1)}")
    if chapter_match:
        print(f"  章节 ID: {chapter_match.group(1)}")
    if pindex_match:
        print(f"  页面索引: {pindex_match.group(1)}")
    print(f"  上下文: ...{context.replace(chr(10), ' ')}...")

# 检查台风课程（courseCode=11）是否有 video slide
print("\n" + "=" * 60)
print("检查 courseCode=11（台风岗位指挥）是否有 video slide")
print("=" * 60)

typhoon_video_pattern = r"courseCode\s*===\s*'11'|courseCode\s*===\s*\"11\""
typhoon_matches = list(re.finditer(typhoon_video_pattern, page_content))

print(f"找到 {len(typhoon_matches)} 个 courseCode=11 的引用")

# 查找 courseCode=11 附近的 video 插入
for match in typhoon_matches:
    start = max(0, match.start() - 500)
    end = min(len(page_content), match.end() + 500)
    context = page_content[start:end]
    
    if 'video' in context:
        print(f"\nCourseCode=11 附近有 video 相关代码:")
        print(context[:500].replace(chr(10), ' '))
