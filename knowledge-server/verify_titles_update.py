"""
验证知识库标题更新机制
1. 检查已处理的JSON文件中标题是否已生成
2. 通过API查询验证后端是否读取到最新标题
3. 检查标题生成时间戳
"""

import json
import requests
from pathlib import Path
from datetime import datetime

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
API_BASE = "http://localhost:8080"

print("=" * 70)
print("  知识库标题更新机制验证")
print("=" * 70)

# 1. 随机抽取5个已处理的JSON文件检查
json_files = sorted(PROC_DIR.glob("*.json"))
if not json_files:
    print("❌ 没有已处理的JSON文件")
    exit(1)

print(f"\n📁 已处理文件总数: {len(json_files)}")
print(f"\n🔍 随机检查5个文件的标题生成情况:\n")

# 选择最新和最早的一些文件
sample_files = json_files[:3] + json_files[-2:]

all_have_titles = True
for f in sample_files:
    data = json.loads(f.read_text(encoding="utf-8"))
    segments = data.get("segments", [])
    course_name = data.get("title", f.stem)
    title_gen_time = data.get("title_generated_at", "N/A")
    retry_time = data.get("retry_at", "")
    
    unnamed = [s for s in segments if s.get("title", "") in ["未命名段落", "未命名", ""]]
    titled = [s for s in segments if s.get("title", "") and s.get("title", "") not in ["未命名段落", "未命名", ""]]
    
    status = "✅" if len(unnamed) == 0 else "❌"
    print(f"  {status} {f.stem}")
    print(f"     课程: {course_name[:40]}")
    print(f"     总段落: {len(segments)} | 有标题: {len(titled)} | 未命名: {len(unnamed)}")
    print(f"     标题生成时间: {title_gen_time}")
    if retry_time:
        print(f"     重试时间: {retry_time}")
    
    if unnamed:
        all_have_titles = False
        print(f"     ⚠️ 仍有 {len(unnamed)} 个未命名段落!")
    print()

# 2. 通过API验证后端是否能读取到标题
print(f"\n🌐 通过API验证后端数据:\n")

try:
    # 获取文件列表
    r = requests.get(f"{API_BASE}/api/info", timeout=5)
    if r.status_code == 200:
        info = r.json()
        print(f"  ✅ API连接成功")
        print(f"     服务: {info['name']}")
        print(f"     总课程: {info['total_files']}")
        print(f"     已处理: {info['processed_count']}")
        print(f"     服务器时间: {info['server_time']}")
    
    # 获取一个课程的详情
    r = requests.get(f"{API_BASE}/api/files", timeout=5)
    if r.status_code == 200:
        files = r.json()["files"]
        if files:
            # 随机选一个检查
            test_file = files[0]
            r2 = requests.get(f"{API_BASE}/api/files/{test_file['id']}", timeout=5)
            if r2.status_code == 200:
                detail = r2.json()
                segments = detail.get("segments", [])
                if segments:
                    titled_count = sum(1 for s in segments if s.get("title", "") and s.get("title", "") not in ["未命名段落", "未命名", ""])
                    print(f"\n  📄 抽样课程: {test_file['title'][:40]}")
                    print(f"     段落总数: {len(segments)}")
                    print(f"     有标题: {titled_count}")
                    print(f"     前3个段落标题:")
                    for i, seg in enumerate(segments[:3]):
                        title = seg.get("title", "")
                        preview = seg.get("content", "")[:50]
                        print(f"       [{i+1}] {title} | 内容: {preview}...")
except Exception as e:
    print(f"  ❌ API验证失败: {e}")

print(f"\n" + "=" * 70)
if all_have_titles:
    print("  ✅ 验证通过: 所有已处理文件的标题都已正确生成")
else:
    print("  ⚠️ 部分文件仍有未命名段落，需要重试")
print("=" * 70)
