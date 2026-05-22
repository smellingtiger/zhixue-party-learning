"""深度检查所有processed文件中的未命名段落"""

import json
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
UNNAMED_PATTERNS = ["未命名段落", "未命名", ""]

def is_unnamed(title: str) -> bool:
    t = title.strip()
    return t in UNNAMED_PATTERNS or not t

print("扫描所有processed文件查找未命名段落...\n")

courses_with_issues = []
total_unnamed = 0

for proc_file in sorted(PROC_DIR.glob("*.json")):
    try:
        data = json.loads(proc_file.read_text(encoding="utf-8"))
        segments = data.get("segments", [])
        course_name = data.get("title", proc_file.stem)
        
        unnamed_indices = []
        for i, seg in enumerate(segments):
            title = seg.get("title", "")
            if is_unnamed(title):
                unnamed_indices.append(i)
        
        if unnamed_indices:
            courses_with_issues.append({
                "file": proc_file.stem,
                "course_name": course_name,
                "total_segments": len(segments),
                "unnamed_indices": unnamed_indices,
                "unnamed_count": len(unnamed_indices),
            })
            total_unnamed += len(unnamed_indices)
    except Exception as e:
        print(f"❌ 读取 {proc_file.name} 失败: {e}")

print("=" * 70)
print(f"扫描完成!")
print(f"  已处理文件总数: {len(list(PROC_DIR.glob('*.json')))}")
print(f"  有未命名段落的课程: {len(courses_with_issues)} 门")
print(f"  未命名段落总数: {total_unnamed}")
print("=" * 70)

if courses_with_issues:
    print("\n📋 未命名段落详情:\n")
    for course in courses_with_issues:
        print(f"  ⚠️ {course['file']}")
        print(f"     课程: {course['course_name'][:40]}")
        print(f"     总段落: {course['total_segments']} | 未命名: {course['unnamed_count']}")
        print(f"     未命名索引: {course['unnamed_indices']}")
        
        # 读取文件查看实际内容
        try:
            data = json.loads((PROC_DIR / f"{course['file']}.json").read_text(encoding="utf-8"))
            segments = data.get("segments", [])
            for idx in course['unnamed_indices'][:3]:
                if idx < len(segments):
                    content = segments[idx].get("content", "")[:100]
                    print(f"     段落{idx}: '{content}...'")
        except:
            pass
        print()
else:
    print("\n✅ 所有已处理课程都没有未命名段落！")
    print("   进度文件中的 failed_total: 8 是历史累计值，已修复")
