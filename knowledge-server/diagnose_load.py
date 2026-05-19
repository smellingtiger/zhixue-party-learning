"""深度诊断：测试单个新导入文件的加载"""
import urllib.request
import json
import os
from pathlib import Path

# 直接用 Python 解析逻辑模拟知识服务的行为
import re

def parse_txt_like_server(filepath):
    """模拟 main.py 的 _parse() 方法"""
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception as e:
        return {"error": str(e), "segments": []}

    lines = text.split("\n")
    title = ""
    category = ""
    para_count = 0

    for line in lines[:6]:
        m = re.search(r"【课程名称】(.+)", line)
        if m:
            title = m.group(1).strip()
        m = re.search(r"【课程分类】(.+)", line)
        if m:
            category = m.group(1).strip()
        m = re.search(r"【段落数量】(.+)", line)
        if m:
            try:
                para_count = int(m.group(1).strip())
            except ValueError:
                pass

    seg_start = 0
    for i, line in enumerate(lines):
        if line.strip().startswith("=" * 10):
            seg_start = i + 1
            break

    segments = []
    current_title = ""
    current_time = ""
    current_content = []

    for line in lines[seg_start:]:
        m_bg = re.match(r"【背景[：:]\s*(.+?)[】]", line)
        m_ti = re.match(r"【要求[：:]\s*(.+?)[】]", line)
        m_general = re.match(r"【(.+?)】", line)
        m_tm = re.match(r"\[时间\]\s*([\d:]+)", line)
        m_div = re.match(r"^={10,}", line)

        if m_bg or m_ti:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "time": current_time,
                    "content": "".join(current_content).strip()
                })
            current_title = (m_bg or m_ti).group(1).strip()
            current_time = ""
            current_content = []
        elif m_general and not m_tm:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "time": current_time,
                    "content": "".join(current_content).strip()
                })
            current_title = m_general.group(1).strip()
            current_time = ""
            current_content = []
        elif m_tm:
            current_time = m_tm.group(1).strip()
        elif m_div:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "time": current_time,
                    "content": "".join(current_content).strip()
                })
            current_title = ""
            current_time = ""
            current_content = []
        elif current_title:
            stripped = line.strip()
            if stripped:
                current_content.append(stripped)

    if current_title and current_content:
        segments.append({
            "title": current_title,
            "time": current_time,
            "content": "".join(current_content).strip()
        })

    return {
        "title": title or filepath.stem,
        "category": category or "未分类",
        "paragraph_count": para_count or len(segments),
        "segments": segments,
        "total_lines": len(lines),
        "seg_start_line": seg_start,
    }

# 测试几个新导入的文件
txt_dir = Path(r"E:\社院课程stt\knowledge_base_txt")

# 找一些新导入的ID格式文件
new_files = sorted([f for f in txt_dir.glob("*.txt") if re.match(r'^GC\d', f.name)])[:5]

print("=== 本地解析测试 ===\n")
for f in new_files:
    result = parse_txt_like_server(f)
    print(f"文件: {f.name}")
    print(f"  标题: {result['title']}")
    print(f"  分类: {result['category']}")
    print(f"  header段落数: {result['paragraph_count']}")
    print(f"  实际解析段落数: {len(result['segments'])}")
    
    # 显示前3个段落标题
    for i, seg in enumerate(result['segments'][:3]):
        print(f"    段落{i+1}: {seg['title'][:40]} (内容{len(seg['content'])}字)")
    
    if not result['segments']:
        print("  *** 警告: 段落为空! ***")
        # 显示前20行内容帮助调试
        print("  前15行内容:")
        for i, l in enumerate(result.get('raw_lines', [])[:15]):
            print(f"    L{i+1}: {l[:60]}")
    print()

# 同时通过API测试
print("\n=== API加载测试 ===\n")
try:
    resp = urllib.request.urlopen('http://localhost:8080/api/files?sort=date')
    files_data = json.loads(resp.read())
    
    # 找一个新格式的文件
    test_file = None
    for f in files_data['files']:
        if re.match(r'^GC\d|NGC\d|HGC\d', f['title']):
            test_file = f
            break
    
    if test_file:
        resp_detail = urllib.request.urlopen(f"http://localhost:8080/api/files/{test_file['id']}")
        detail = json.loads(resp_detail.read())
        print(f"API文件: {test_file['title']}")
        print(f"  API返回段落数: {len(detail.get('segments', []))}")
        print(f"  API返回分类: {detail.get('category')}")
        if detail.get('segments'):
            print(f"  第一段标题: {detail['segments'][0]['title'][:40]}")
        else:
            print("  *** API返回段落为空! ***")
except Exception as e:
    print(f"API测试失败: {e}")

# 检查 processed 目录是否有对应的处理文件
print("\n=== processed目录检查 ===")
proc_dir = Path(r"E:\社院课程stt\knowledge_base_processed")
if proc_dir.exists():
    processed_files = list(proc_dir.glob("*.json"))
    print(f"已处理文件数: {len(processed_files)}")
    
    # 检查新导入文件是否有对应的处理文件
    matched = [f for f in processed_files if any(f.stem == nf.stem for nf in new_files)]
    print(f"新导入文件中已有处理的: {len(matched)}/{len(new_files)}")
else:
    print("processed目录不存在")
