"""全面检查所有文件的加载状态"""
import urllib.request
import json
import re
from pathlib import Path
import random

print("=== 全面知识库健康检查 ===\n")

# 获取API信息
resp = urllib.request.urlopen('http://localhost:8080/api/info')
info = json.loads(resp.read())

print(f"总文件数: {info['total_files']}")
print(f"总段落数: {info['total_paragraphs']}")
print()

# 检查各分类的段落数是否合理
print("=== 各分类统计 ===")
problem_categories = []
for cat in info['categories']:
    count = info['category_counts'][cat]
    paras = info['category_paragraph_counts'].get(cat, 0)
    avg_paras = paras / count if count > 0 else 0
    status = "✓" if avg_paras > 1 else "⚠"
    print(f"{status} {cat}: {count}课程, {paras}段落, 平均{avg_paras:.1f}段/课")
    if avg_paras < 2:
        problem_categories.append((cat, count, paras))

# 抽样测试各分类中的文件
print("\n=== 随机抽样测试 ===")
resp_files = urllib.request.urlopen('http://localhost:8080/api/files')
files_data = json.loads(resp_files.read())
all_files = files_data['files']

# 从每个分类中随机抽1个文件测试
tested_categories = set()
empty_segment_files = []
success_count = 0
fail_count = 0

random.shuffle(all_files)

for f in all_files[:50]:  # 测试前50个随机文件
    cat = f.get('category', '')
    if cat not in tested_categories or len(tested_categories) < 12:
        try:
            resp_detail = urllib.request.urlopen(f"http://localhost:8080/api/files/{f['id']}")
            detail = json.loads(resp_detail.read())
            seg_count = len(detail.get('segments', []))
            
            if seg_count == 0:
                empty_segment_files.append(f['title'])
                fail_count += 1
            else:
                success_count += 1
            
            tested_categories.add(cat)
            
            # 只打印每个分类的第一个
            if f not in [x for x in all_files[:all_files.index(f)]]:
                status = "✅" if seg_count > 0 else "❌"
                print(f"{status} [{cat}] {f['title'][:35]} → {seg_count}段")
        except Exception as e:
            print(f"❌ 错误: {f['title'][:35]} - {e}")
            fail_count += 1

print(f"\n=== 抽样结果 ===")
print(f"成功: {success_count}, 失败(空段落): {fail_count}")

if empty_segment_files:
    print(f"\n⚠️ 空段落文件 ({len(empty_segment_files)}个):")
    for name in empty_segment_files[:10]:
        print(f"  - {name}")

# 特别检查"未分类"的文件
print("\n=== 未分类详情 ===")
resp_uncat = urllib.request.urlopen('http://localhost:8080/api/files?category=未分类')
uncat_data = json.loads(resp_uncat.read())

if uncat_data['files']:
    print(f"未分类文件数: {len(uncat_data['files'])}")
    for f in uncat_data['files']:
        resp_detail = urllib.request.urlopen(f"http://localhost:8080/api/files/{f['id']}")
        detail = json.loads(resp_detail.read())
        seg_count = len(detail.get('segments', []))
        print(f"  {f['title']} → {seg_count}段")
else:
    print("未分类: 0 个文件")

# 总结
print("\n" + "="*50)
if fail_count == 0 and len(empty_segment_files) == 0:
    print("✅ 所有抽样的文件都正常加载!")
elif fail_count < 3:
    print(f"⚠️ 少量文件({fail_count})可能有问题，建议进一步检查")
else:
    print(f"❌ 发现较多问题文件，需要深入调查")
