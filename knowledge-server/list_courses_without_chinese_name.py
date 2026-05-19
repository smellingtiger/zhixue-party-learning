"""
列出知识库中没有中文名映射的课程，检查是编码名还是中文名
"""
import json
import re
from pathlib import Path

# 路径配置
KNOWLEDGE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
COURSE_NAME_MAPPING_FILE = Path(__file__).parent / "course_name_mapping.json"

def load_course_name_mapping():
    if COURSE_NAME_MAPPING_FILE.exists():
        try:
            return json.loads(COURSE_NAME_MAPPING_FILE.read_text(encoding="utf-8"))
        except:
            return {}
    return {}

def has_chinese_chars(text):
    """检查是否包含中文字符"""
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def main():
    name_mapping = load_course_name_mapping()
    print(f"已加载 {len(name_mapping)} 个课程的中文名映射")
    
    if not KNOWLEDGE_DIR.exists():
        print(f"知识库目录不存在")
        return
    
    txt_files = list(KNOWLEDGE_DIR.glob("*.txt"))
    print(f"\n知识库中共有 {len(txt_files)} 个课程文件")
    
    encoding_name_count = 0
    chinese_name_count = 0
    encoding_files = []
    chinese_files = []
    
    for txt_file in txt_files:
        course_code = txt_file.stem
        
        if course_code not in name_mapping:
            if has_chinese_chars(course_code):
                chinese_name_count += 1
                chinese_files.append(txt_file.name)
            else:
                encoding_name_count += 1
                encoding_files.append(txt_file.name)
    
    print(f"\n无中文名映射的课程分类:")
    print(f"  编码名称: {encoding_name_count} 个（将删除）")
    print(f"  中文名称: {chinese_name_count} 个（保留，但不在映射中）")
    
    if encoding_files:
        print(f"\n【编码名称】课程（将被删除）:")
        for i, f in enumerate(encoding_files[:30], 1):
            print(f"  {i:3d}. {f}")
    
    if chinese_files:
        print(f"\n【中文名称】课程（不在映射中，但已有中文名，不删除）:")
        for i, f in enumerate(chinese_files[:20], 1):
            print(f"  {i:3d}. {f}")
        if len(chinese_files) > 20:
            print(f"  ... 共 {len(chinese_files)} 个")

if __name__ == "__main__":
    main()
