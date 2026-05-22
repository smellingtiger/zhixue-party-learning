"""
检查processed文件和API文件名的对应关系
"""

import json
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
TXT_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")

# 查看processed目录中的文件名格式
proc_files = sorted(list(PROC_DIR.glob("*.json"))[:10])
print("📁 processed目录中的文件名示例:")
for f in proc_files:
    print(f"  {f.name}")

# 查看txt目录中的文件名格式
txt_files = sorted(list(TXT_DIR.glob("*.txt"))[:10])
print("\n📁 txt目录中的文件名示例:")
for f in txt_files:
    print(f"  {f.name}")

# 检查GC03I0916015_1602这个课程
stem = "GC03I0916015_1602"
proc_file = PROC_DIR / f"{stem}.json"
txt_file = TXT_DIR / f"{stem}.txt"

print(f"\n🔍 检查 {stem}:")
print(f"  processed文件存在: {proc_file.exists()}")
print(f"  txt文件存在: {txt_file.exists()}")

if txt_file.exists():
    content = txt_file.read_text(encoding="utf-8")
    first_5 = content.split("\n")[:5]
    print(f"  原始txt前5行:")
    for line in first_5:
        print(f"    {line}")

# 统计processed和txt的文件名对应情况
proc_stems = {f.stem for f in PROC_DIR.glob("*.json")}
txt_stems = {f.stem for f in TXT_DIR.glob("*.txt")}

both = proc_stems & txt_stems
only_proc = proc_stems - txt_stems
only_txt = txt_stems - proc_stems

print(f"\n📊 统计:")
print(f"  processed文件数: {len(proc_stems)}")
print(f"  txt文件数: {len(txt_stems)}")
print(f"  同时存在的: {len(both)}")
print(f"  仅processed(无对应txt): {len(only_proc)}")
print(f"  仅txt(未处理): {len(only_txt)}")

if only_proc:
    print(f"\n  仅processed的前10个:")
    for s in sorted(list(only_proc))[:10]:
        print(f"    {s}")

if only_txt:
    print(f"\n  仅txt(未处理)的前10个:")
    for s in sorted(list(only_txt))[:10]:
        print(f"    {s}")
