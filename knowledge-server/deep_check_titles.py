"""
深度检查API返回数据和processed JSON文件的匹配情况
"""

import json
import requests
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
API_BASE = "http://localhost:8080"

# 获取所有课程列表
r = requests.get(f"{API_BASE}/api/files", timeout=5)
files = r.json()["files"]

print(f"API返回 {len(files)} 个课程\n")

# 检查前10个课程的API数据和processed JSON文件对比
for i, f in enumerate(files[:15]):
    doc_id = f["id"]
    api_title = f["title"]
    
    # 获取API详情
    r2 = requests.get(f"{API_BASE}/api/files/{doc_id}", timeout=5)
    if r2.status_code != 200:
        continue
    
    detail = r2.json()
    segments = detail.get("segments", [])
    
    # 统计API中的未命名段落
    api_unnamed = sum(1 for s in segments if s.get("title", "") in ["未命名段落", "未命名", ""])
    api_titled = sum(1 for s in segments if s.get("title", "") and s.get("title", "") not in ["未命名段落", "未命名", ""])
    
    # 查找对应的processed JSON文件
    stem = f["filename"].replace(".txt", "")
    proc_file = PROC_DIR / f"{stem}.json"
    
    has_proc = proc_file.exists()
    proc_unnamed = 0
    proc_titled = 0
    proc_time = "N/A"
    
    if has_proc:
        proc_data = json.loads(proc_file.read_text(encoding="utf-8"))
        proc_segments = proc_data.get("segments", [])
        proc_unnamed = sum(1 for s in proc_segments if s.get("title", "") in ["未命名段落", "未命名", ""])
        proc_titled = sum(1 for s in proc_segments if s.get("title", "") and s.get("title", "") not in ["未命名段落", "未命名", ""])
        proc_time = proc_data.get("title_generated_at", "N/A")
    
    # 如果API和processed文件不一致，标记
    mismatch = has_proc and (api_unnamed != proc_unnamed or api_titled != proc_titled)
    
    status = "⚠️" if mismatch else ("✅" if has_proc and api_unnamed == 0 else "❌" if api_unnamed > 0 else "ℹ️")
    
    print(f"{status} {api_title[:35]}")
    print(f"   stem: {stem} | 已处理: {'是' if has_proc else '否'}")
    
    if has_proc:
        print(f"   API: {api_titled}有标题/{api_unnamed}未命名 | JSON: {proc_titled}有标题/{proc_unnamed}未命名")
        if mismatch:
            print(f"   ❌ 不匹配! 标题生成时间: {proc_time}")
            # 显示前3个段落的对比
            for j in range(min(3, len(segments))):
                api_t = segments[j].get("title", "")
                proc_t = proc_data["segments"][j].get("title", "") if j < len(proc_data["segments"]) else "N/A"
                match = "✅" if api_t == proc_t else "❌"
                print(f"   段落{j+1}: API='{api_t}' | JSON='{proc_t}' {match}")
        else:
            print(f"   标题生成时间: {proc_time}")
    else:
        print(f"   API: {api_titled}有标题/{api_unnamed}未命名 | 无processed JSON")
    print()
