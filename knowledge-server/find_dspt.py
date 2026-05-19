"""
查找DSPTXYZY开头的课程，看看它们的名称是如何存储的
"""

import os
import re
from pathlib import Path

TXT_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")

# 查找所有DSPTXYZY开头的课程文件
count = 0
for txt_file in sorted(TXT_DIR.glob("*.txt")):
    try:
        content = txt_file.read_text(encoding="utf-8")
        # 检查课程名称是否是DSPTXYZY开头
        for line in content.split("\n")[:6]:
            m = re.search(r"【课程名称】(.+)", line)
            if m:
                name = m.group(1).strip()
                if name.startswith("DSPTXYZY"):
                    count += 1
                    if count <= 20:
                        # 打印前20个
                        print(f"\n文件: {txt_file.name}")
                        print(f"课程名称(编码): {name}")
                        # 尝试从内容中提取可能的真实名称
                        lines = content.split("\n")
                        # 打印前几行看看
                        for i, l in enumerate(lines[:15]):
                            if l.strip():
                                print(f"  行{i}: {l[:100]}")
                    break
    except:
        pass

print(f"\n\n总共找到 {count} 个DSPTXYZY开头的课程")
