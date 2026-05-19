"""
删除知识库中文件名本身是编码（不含中文字符）的课程
保留文件名包含中文字符的课程
"""
import json
import re
from pathlib import Path

# 路径配置
KNOWLEDGE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
COURSE_NAME_MAPPING_FILE = Path(__file__).parent / "course_name_mapping.json"
PROCESSED_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")

def has_chinese_chars(text):
    """检查是否包含中文字符"""
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def main():
    if not KNOWLEDGE_DIR.exists():
        print(f"知识库目录不存在: {KNOWLEDGE_DIR}")
        return
    
    txt_files = list(KNOWLEDGE_DIR.glob("*.txt"))
    print(f"知识库中共有 {len(txt_files)} 个课程文件")
    
    deleted_count = 0
    kept_count = 0
    deleted_files = []
    
    for txt_file in txt_files:
        filename_without_ext = txt_file.stem
        
        # 如果文件名不包含中文字符，删除
        if not has_chinese_chars(filename_without_ext):
            txt_file.unlink()
            deleted_count += 1
            deleted_files.append(txt_file.name)
            
            # 删除对应的processed json文件
            json_file = PROCESSED_DIR / f"{filename_without_ext}.json"
            if json_file.exists():
                json_file.unlink()
                print(f"  删除: {txt_file.name} (及processed json)")
            else:
                print(f"  删除: {txt_file.name}")
        else:
            kept_count += 1
    
    print(f"\n删除完成!")
    print(f"  已删除: {deleted_count} 个课程（文件名是编码）")
    print(f"  保留: {kept_count} 个课程（文件名包含中文）")
    
    if deleted_files:
        print(f"\n已删除的课程列表:")
        for f in deleted_files:
            print(f"  - {f}")

if __name__ == "__main__":
    main()
