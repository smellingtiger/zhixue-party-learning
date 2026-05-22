"""检查NGC95I3322115_2211课程的处理情况"""

import json
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")

f = PROC_DIR / "NGC95I3322115_2211.json"
data = json.loads(f.read_text(encoding="utf-8"))
segments = data.get("segments", [])

print(f"课程: {data.get('title', 'N/A')}")
print(f"总段落数: {len(segments)}")
print(f"标题生成时间: {data.get('title_generated_at', 'N/A')}")
print()

# 检查每个段落的标题
for i, seg in enumerate(segments):
    title = seg.get("title", "")
    is_unnamed = title in ["未命名段落", "未命名", ""]
    status = "❌" if is_unnamed else "✅"
    print(f"  {status} [{i}] {title}")
    if is_unnamed:
        print(f"      内容: {seg.get('content', '')[:100]}...")

print(f"\n未命名段落数: {sum(1 for s in segments if s.get('title', '') in ['未命名段落', '未命名', ''])}")
