"""
对比D盘和E盘相同文件夹的文件完整性
检查是否有文件损坏或不一致
"""
import os
import hashlib

def compare_folders(e_path, d_path, folder_name):
    """对比两个文件夹的文件"""
    print(f"\n{'='*80}")
    print(f"📁 {folder_name}")
    print(f"{'='*80}")
    
    e_files = set()
    d_files = set()
    
    # 收集E盘文件
    for root, dirs, files in os.walk(e_path):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), e_path)
            e_files.add(rel)
    
    # 收集D盘文件
    for root, dirs, files in os.walk(d_path):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), d_path)
            d_files.add(rel)
    
    only_in_e = e_files - d_files
    only_in_d = d_files - e_files
    common = e_files & d_files
    
    print(f"  E盘文件数: {len(e_files)}")
    print(f"  D盘文件数: {len(d_files)}")
    print(f"  共同文件: {len(common)}")
    print(f"  仅E盘有: {len(only_in_e)}")
    print(f"  仅D盘有: {len(only_in_d)}")
    
    if only_in_e:
        print(f"\n  ⚠️ 仅在E盘的文件 (前20个):")
        for f in sorted(only_in_e)[:20]:
            try:
                size = os.path.getsize(os.path.join(e_path, f))
                print(f"    {f} ({size/1024/1024:.1f} MB)")
            except:
                print(f"    {f}")
        if len(only_in_e) > 20:
            print(f"    ... 还有 {len(only_in_e) - 20} 个")
    
    if only_in_d:
        print(f"\n  📎 仅在D盘的文件 (前20个):")
        for f in sorted(only_in_d)[:20]:
            try:
                size = os.path.getsize(os.path.join(d_path, f))
                print(f"    {f} ({size/1024/1024:.1f} MB)")
            except:
                print(f"    {f}")
        if len(only_in_d) > 20:
            print(f"    ... 还有 {len(only_in_d) - 20} 个")
    
    # 抽样检查共同文件的一致性
    if common:
        print(f"\n  🔍 抽样检查文件一致性 (前10个)...")
        sample = sorted(common)[:10]
        mismatches = 0
        for f in sample:
            try:
                e_size = os.path.getsize(os.path.join(e_path, f))
                d_size = os.path.getsize(os.path.join(d_path, f))
                if e_size != d_size:
                    mismatches += 1
                    print(f"    ⚠️ {f}: E={e_size}, D={d_size}")
            except:
                pass
        if mismatches == 0:
            print(f"    ✅ 抽样文件全部一致")

base_e = r"E:\PythonDemo"
base_d = r"D:\PythonDemo"

# 获取两个盘都有的子文件夹
e_subdirs = set()
d_subdirs = set()

for item in os.listdir(base_e):
    if os.path.isdir(os.path.join(base_e, item)):
        e_subdirs.add(item)

for item in os.listdir(base_d):
    if os.path.isdir(os.path.join(base_d, item)):
        d_subdirs.add(item)

common_subdirs = sorted(e_subdirs & d_subdirs)

print("="*80)
print("E盘 vs D盘 文件完整性检查")
print("="*80)
print(f"\nE盘独有文件夹: {e_subdirs - d_subdirs}")
print(f"D盘独有文件夹: {d_subdirs - e_subdirs}")
print(f"共同文件夹: {len(common_subdirs)} 个")

for folder in common_subdirs:
    compare_folders(
        os.path.join(base_e, folder),
        os.path.join(base_d, folder),
        folder
    )
