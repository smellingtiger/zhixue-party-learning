"""
检查processed JSON文件的内容，看看是否和对应的txt文件内容一致
"""

import json
import re
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
TXT_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")

# 找到所有processed文件
proc_files = sorted(list(PROC_DIR.glob("*.json")))

mismatch_count = 0
match_count = 0
no_txt_count = 0

print(f"检查 {len(proc_files)} 个processed文件与txt的对应关系...\n")

for proc_file in proc_files[:50]:  # 检查前50个
    stem = proc_file.stem
    
    # 尝试找到对应的txt
    txt_file = TXT_DIR / f"{stem}.txt"
    
    if not txt_file.exists():
        # 检查JSON中的title字段，看看是不是中文名称
        data = json.loads(proc_file.read_text(encoding="utf-8"))
        title = data.get("title", "")
        segments = data.get("segments", [])
        seg_count = len(segments)
        
        # 尝试通过title查找txt
        found_txt = None
        for txt_f in TXT_DIR.glob("*.txt"):
            try:
                content = txt_f.read_text(encoding="utf-8")
                # 检查第一行是否有课程名称匹配
                first_line = content.split("\n")[0]
                m = re.search(r"【课程名称】(.+)", first_line)
                if m and m.group(1).strip() == title:
                    found_txt = txt_f
                    break
            except:
                pass
        
        if found_txt:
            print(f"📝 {stem} -> 找到对应txt: {found_txt.name}")
            print(f"   JSON title: {title[:40]} | 段落数: {seg_count}")
            match_count += 1
        else:
            # 检查是否是旧格式（无标题字段或格式不同）
            has_segments = seg_count > 0
            if has_segments:
                print(f"❌ {stem} -> 无对应txt, title: {title[:40]} | 段落: {seg_count}")
                mismatch_count += 1
            else:
                print(f"ℹ️ {stem} -> 无对应txt, title: {title[:40]} (空文件?)")
                no_txt_count += 1
    else:
        # 有对应txt，检查内容是否一致
        try:
            txt_content = txt_file.read_text(encoding="utf-8")
            txt_paras = txt_content.count("=" * 10) + 1  # 估算段落数
            data = json.loads(proc_file.read_text(encoding="utf-8"))
            json_paras = len(data.get("segments", []))
            json_title = data.get("title", "")
            title_gen = data.get("title_generated_at", "N/A")
            
            # 检查txt中的课程名称
            m = re.search(r"【课程名称】(.+)", txt_content[:500])
            txt_course_name = m.group(1).strip() if m else "N/A"
            
            print(f"✅ {stem} -> txt存在")
            print(f"   JSON title: {json_title[:40]} | txt课程名: {txt_course_name[:40]}")
            print(f"   JSON段落: {json_paras} | txt估算段落: ~{txt_paras}")
            print(f"   标题生成时间: {title_gen}")
            match_count += 1
        except Exception as e:
            print(f"⚠️ {stem} -> 检查失败: {e}")
            mismatch_count += 1

print(f"\n" + "=" * 60)
print(f"匹配: {match_count} | 不匹配: {mismatch_count} | 无txt: {no_txt_count}")
print("=" * 60)
