"""检查知识库加载状态和失败原因"""
import urllib.request
import json
import os
import sys
import re
import random
from pathlib import Path

# 1. 检查知识服务状态
try:
    resp = urllib.request.urlopen('http://localhost:8080/api/info')
    data = json.loads(resp.read())
    print('=== 知识库服务状态 ===')
    print(f"总文件数: {data['total_files']}")
    print(f"总段落数: {data['total_paragraphs']}")
    print()
    print('=== 分类统计 ===')
    for cat in data['categories']:
        cats_count = data['category_counts'][cat]
        paras_count = data['category_paragraph_counts'].get(cat, 0)
        print(f"  {cat}: {cats_count} 课程, {paras_count} 段落")
    print()
    print(f"未分类课程: {data['category_counts'].get('未分类', 0)}")
    print(f"未分类段落: {data['category_paragraph_counts'].get('未分类', 0)}")
except Exception as e:
    print(f"无法连接知识服务: {e}")
    sys.exit(1)

# 2. 检查目录文件数量
txt_dir = Path(r"E:\社院课程stt\knowledge_base_txt")
json_dir = Path(r"E:\社院课程stt\新建文件夹\output_funasr")

txt_count = len(list(txt_dir.glob("*.txt")))
json_count = len([f for f in json_dir.glob("*.json") if f.stem != "enhance_progress"])

print(f"\n=== 文件系统检查 ===")
print(f"TXT目录: {txt_count} 个文件")
print(f"JSON源目录: {json_count} 个文件")

# 3. 随机抽取几个新导入的文件检查内容完整性
all_txt = list(txt_dir.glob("*.txt"))

# 找一些看起来是新导入的文件（文件名是ID格式而非中文标题）
new_style_files = [f for f in all_txt if re.match(r'^[A-Z]{2,4}[0-9]', f.stem)]
print(f"\n新导入ID格式文件: {len(new_style_files)} 个")

if new_style_files:
    print("\n=== 抽样检查10个新导入文件 ===")
    sample = random.sample(new_style_files, min(10, len(new_style_files)))
    for f in sorted(sample):
        try:
            content = f.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            # 检查是否有正确的header
            has_name = any('【课程名称】' in l for l in lines[:5])
            has_para = any('【段落数量】' in l for l in lines[:5])
            has_separator = any('='*10 in l for l in lines)
            
            # 检查段落数量
            paras = 0
            in_content = False
            for l in lines:
                if l.strip().startswith('='*10):
                    in_content = True
                    continue
                if in_content and l.strip().startswith('【') and not l.strip().startswith('【课程'):
                    paras += 1
            
            status = "OK" if has_name and has_para and paras > 0 else "PROBLEM"
            print(f"  {f.name[:40]:40} 段落数={paras:3} 状态={status}")
            if status == "PROBLEM":
                print(f"    问题: name={has_name}, para_count={has_para}, separator={has_separator}")
        except Exception as e:
            print(f"  {f.name[:40]:40} 读取失败: {e}")

# 4. 通过API测试加载几个文件
print("\n=== API加载测试 ===")
try:
    resp = urllib.request.urlopen('http://localhost:8080/api/files?sort=date')
    files_data = json.loads(resp.read())
    
    # 测试前几个最新文件
    test_files = files_data['files'][:5]
    for f in test_files:
        try:
            resp_detail = urllib.request.urlopen(f"http://localhost:8080/api/files/{f['id']}")
            detail = json.loads(resp_detail.read())
            print(f"  {f['title'][:40]:40} 加载成功, 段落数={len(detail.get('segments', []))}")
        except Exception as e:
            print(f"  {f['title'][:40]:40} API加载失败: {e}")
except Exception as e:
    print(f"API测试失败: {e}")
