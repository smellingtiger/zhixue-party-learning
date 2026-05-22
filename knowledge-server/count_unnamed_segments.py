"""
统计知识库中未命名段落的情况
"""
import json
import re
from pathlib import Path

KB_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")

unnamed_patterns = ["未命名段落", "未命名", ""]

total_courses = 0
courses_with_unnamed = 0
total_segments = 0
total_unnamed = 0
course_details = []

txt_files = sorted(KB_DIR.glob("*.txt"))
print(f"扫描目录: {KB_DIR}")
print(f"发现文件: {len(txt_files)} 个")
print()

for f in txt_files:
    total_courses += 1
    stem = f.stem

    proc_file = PROC_DIR / f"{stem}.json"
    segments = []
    course_name = stem

    if proc_file.exists():
        try:
            data = json.loads(proc_file.read_text(encoding="utf-8"))
            course_name = data.get("title", stem)
            segments = data.get("segments", [])
        except Exception:
            pass

    if not segments:
        try:
            text = f.read_text(encoding="utf-8")
            for line in text.split("\n")[:6]:
                m = re.search(r"【课程名称】(.+)", line)
                if m:
                    course_name = m.group(1).strip()

            seg_start = 0
            lines = text.split("\n")
            for i, line in enumerate(lines):
                if line.strip().startswith("=" * 10):
                    seg_start = i + 1
                    break

            current_title = ""
            current_content = []
            for line in lines[seg_start:]:
                m_bg = re.match(r"【背景[：:]\s*(.+)", line)
                m_ti = re.match(r"【要求[：:]\s*(.+)", line)
                m_general = re.match(r"【(.+?)】", line)
                m_div = re.match(r"^={10,}", line)

                if m_bg or m_ti:
                    if current_title:
                        segments.append({"title": current_title, "content": " ".join(current_content).strip()})
                    current_title = (m_bg or m_ti).group(1).strip()
                    current_content = []
                elif m_general and not re.match(r"\[时间\]", line):
                    if current_title:
                        segments.append({"title": current_title, "content": " ".join(current_content).strip()})
                    current_title = m_general.group(1).strip()
                    current_content = []
                elif m_div:
                    if current_title:
                        segments.append({"title": current_title, "content": " ".join(current_content).strip()})
                    current_title = ""
                    current_content = []
                elif current_title:
                    stripped = line.strip()
                    if stripped:
                        current_content.append(stripped)

            if current_title:
                segments.append({"title": current_title, "content": " ".join(current_content).strip()})
        except Exception:
            continue

    unnamed_count = 0
    for seg in segments:
        title = seg.get("title", "").strip()
        if title in unnamed_patterns or not title:
            unnamed_count += 1

    total_segments += len(segments)
    total_unnamed += unnamed_count

    if unnamed_count > 0:
        courses_with_unnamed += 1
        course_details.append({
            "name": course_name,
            "stem": stem,
            "total_segs": len(segments),
            "unnamed_segs": unnamed_count,
        })

print("=" * 60)
print("  知识库未命名段落统计报告")
print("=" * 60)
print(f"总课程数: {total_courses}")
print(f"总段落数: {total_segments}")
print(f"含未命名段落的课程数: {courses_with_unnamed}")
print(f"未命名段落总数: {total_unnamed}")
if total_segments > 0:
    print(f"未命名占比: {total_unnamed / total_segments * 100:.1f}%")
print()

course_details.sort(key=lambda x: x["unnamed_segs"], reverse=True)
print("课程明细（按未命名数量降序）:")
print("-" * 70)
for i, c in enumerate(course_details):
    name = c["name"][:30]
    print(f"  {i+1:3d}. {name:30s} | 总段:{c['total_segs']:3d} | 未命名:{c['unnamed_segs']:3d}")

# 保存统计结果供后续脚本使用
stats_file = Path(__file__).parent / "unnamed_segments_stats.json"
with open(stats_file, "w", encoding="utf-8") as fp:
    json.dump({
        "total_courses": total_courses,
        "total_segments": total_segments,
        "courses_with_unnamed": courses_with_unnamed,
        "total_unnamed": total_unnamed,
        "course_details": course_details,
    }, fp, ensure_ascii=False, indent=2)
print(f"\n统计结果已保存到: {stats_file}")
