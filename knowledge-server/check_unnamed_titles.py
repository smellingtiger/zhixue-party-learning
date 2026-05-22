"""检查已处理的课程中是否还有未命名段落"""

import json
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")

UNNAMED_PATTERNS = ["未命名段落", "未命名", ""]

def is_unnamed(title: str) -> bool:
    t = title.strip()
    return t in UNNAMED_PATTERNS or not t

json_files = sorted(PROC_DIR.glob("*.json"))
total_files = len(json_files)
courses_with_unnamed = []
total_unnamed_found = 0

print(f"扫描目录: {PROC_DIR}")
print(f"找到 {total_files} 个已处理文件\n")

for f in json_files:
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
        segments = data.get("segments", [])
        course_name = data.get("title", f.stem)
        
        unnamed = []
        for i, seg in enumerate(segments):
            title = seg.get("title", "")
            if is_unnamed(title):
                unnamed.append({
                    "index": i,
                    "title": title,
                    "content_preview": seg.get("content", "")[:50]
                })
        
        if unnamed:
            courses_with_unnamed.append({
                "stem": f.stem,
                "course_name": course_name,
                "total_segments": len(segments),
                "unnamed_count": len(unnamed),
                "unnamed_segments": unnamed
            })
            total_unnamed_found += len(unnamed)
    except Exception as e:
        print(f"  读取 {f.name} 失败: {e}")

print("=" * 70)
print(f"扫描完成!")
print(f"  已处理课程总数: {total_files}")
print(f"  还有未命名段落的课程: {len(courses_with_unnamed)} 门")
print(f"  未命名段落总数: {total_unnamed_found}")
print("=" * 70)

if courses_with_unnamed:
    print(f"\n📋 未命名段落详情:")
    for course in courses_with_unnamed:
        print(f"\n  [{course['stem']}] {course['course_name'][:40]}")
        print(f"    总段落: {course['total_segments']} | 未命名: {course['unnamed_count']}")
        for seg in course['unnamed_segments'][:5]:
            print(f"    - 第{seg['index']+1}段: '{seg['title']}' | 内容: {seg['content_preview']}...")
        if course['unnamed_count'] > 5:
            print(f"    ... 还有 {course['unnamed_count'] - 5} 个未命名段落")
else:
    print("\n✅ 所有已处理课程都没有未命名段落！")
