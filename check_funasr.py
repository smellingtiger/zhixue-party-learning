import os
import glob
from collections import Counter

target_path = r"E:\社院课程stt\新建文件夹\output_funasr"

print(f"扫描目录: {target_path}\n")
print("="*80)

# 获取所有文件的扩展名统计
ext_counter = Counter()
files_list = []

for root, dirs, filenames in os.walk(target_path):
    for filename in filenames:
        ext = os.path.splitext(filename)[1].lower()
        ext_counter[ext] += 1
        files_list.append(filename)

print("\n文件扩展名统计:")
print("-"*60)
for ext, count in ext_counter.most_common():
    size_mb = 0
    for f in files_list:
        if os.path.splitext(f)[1].lower() == ext:
            filepath = os.path.join(target_path, f)
            try:
                size_mb += os.path.getsize(filepath) / (1024*1024)
            except:
                pass
    print(f"{ext or '(无扩展名)':<20} {count:>6} 个文件    总计: {round(size_mb, 2)} MB")

# 列出前20个文件名示例
print("\n" + "="*80)
print("\n文件名示例（前20个）:")
print("-"*60)
for f in sorted(files_list)[:20]:
    size_kb = round(os.path.getsize(os.path.join(target_path, f)) / 1024, 1)
    print(f"  {f}  ({size_kb} KB)")

print(f"\n... 共 {len(files_list)} 个文件")
