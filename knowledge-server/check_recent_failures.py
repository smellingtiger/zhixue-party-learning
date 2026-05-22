"""检查当前脚本运行中失败的4个段落"""

import json
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
UNNAMED_PATTERNS = ["未命名段落", "未命名", ""]

def is_unnamed(title: str) -> bool:
    t = title.strip()
    return t in UNNAMED_PATTERNS or not t

# 检查最近处理的课程（按修改时间排序）
proc_files = sorted(PROC_DIR.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True)[:20]

print("检查最近处理的20个课程文件中的未命名段落：\n")

for f in proc_files:
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
        segments = data.get("segments", [])
        course_name = data.get("title", f.stem)
        title_gen_time = data.get("title_generated_at", "N/A")
        
        unnamed = [i for i, seg in enumerate(segments) if is_unnamed(seg.get("title", ""))]
        
        if unnamed:
            print(f"⚠️ {f.stem}")
            print(f"   课程: {course_name[:40]}")
            print(f"   未命名段落索引: {unnamed}")
            print(f"   标题生成时间: {title_gen_time}")
            # 显示失败的段落内容预览
            for idx in unnamed[:3]:
                content = segments[idx].get("content", "")[:80]
                print(f"   段落{idx}: '{content}...'")
            print()
    except Exception as e:
        print(f"❌ 读取 {f.name} 失败: {e}")

print("\n" + "=" * 60)
print("如果上面没有输出，说明最近处理的课程都没有未命名段落")
print("失败的4个可能是API返回格式不匹配导致的计数错误")
