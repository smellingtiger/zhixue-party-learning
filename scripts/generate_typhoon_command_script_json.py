"""
从台风岗位指挥课程数据生成 typhoon-command-script.json
确保 sections 数量与实际课程页面数量匹配
"""
import json
import re
import os
import sys

# 导入课程数据
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'app', 'ai-course'))

# 直接读取 TypeScript 文件并提取 content 字段
ts_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'app', 'ai-course', 'typhoon-command-course-data.ts')

with open(ts_file, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# 提取章节内容（简单解析）
# 查找 content: '...' 模式
chapters_data = []

# 使用正则表达式提取每个章节的 title 和 content
# 注意：这是一个简化的解析器，可能需要根据实际情况调整
chapter_pattern = r"{\s*id:\s*\d+,\s*title:\s*'([^']*)',\s*duration:\s*'[^']*',\s*type:\s*'[^']*',\s*content:\s*'((?:[^'\\]|\\.)*)',?\s*}"

matches = re.findall(chapter_pattern, ts_content, re.DOTALL)

for title, content in matches:
    # 处理转义字符
    content = content.replace("\\n", "\n").replace("\\'", "'").replace("\\\\", "\\")
    
    # 按 ---PAGE--- 分割
    pages = content.split("---PAGE---")
    pages = [p.strip() for p in pages if p.strip()]
    
    # 生成 sections
    sections = []
    for i, page in enumerate(pages):
        # 提取标题
        # 查找类似 "## 第 1 章｜P1：该市地理概况" 的模式
        title_match = re.search(r"##\s*[^#\n]*[｜|]\s*P\d+：\s*([^\n]+)", page)
        if title_match:
            section_title = title_match.group(1).strip()
        else:
            # 使用其他标题
            title_match2 = re.search(r"##\s+([^\n]+)", page)
            if title_match2:
                section_title = title_match2.group(1).strip()
            else:
                section_title = f"第{i+1}页"
        
        # 清理内容（移除图片占位符）
        page_content = re.sub(r"\[IMG:[^\]]+\]", "", page)
        page_content = re.sub(r"##\s*[^#\n]*[｜|]\s*P\d+：[^\n]*\n?", "", page_content)
        page_content = page_content.strip()
        
        if page_content:
            sections.append({
                "title": section_title,
                "content": page_content
            })
    
    chapters_data.append({
        "title": title,
        "sections": sections,
        "page_count": len(pages)
    })
    
    print(f"{title}: {len(pages)} 页, {len(sections)} 个 sections")

# 生成 JSON 结构
script_data = {
    "courseName": "台风应急标准化处置岗位指挥课程",
    "chapters": []
}

for ch in chapters_data:
    chapter_script = {
        "id": ch["title"].split("：")[0] if "：" in ch["title"] else f"chapter{len(script_data['chapters'])}",
        "title": ch["title"],
        "content": "",  # 章节级内容（如果有）
        "sections": ch["sections"]
    }
    
    # 如果是前言，使用 content 而不是 sections
    if ch["title"].startswith("前言"):
        chapter_script["sections"] = []
    
    script_data["chapters"].append(chapter_script)

# 输出到 JSON 文件
output_file = os.path.join(os.path.dirname(__file__), '..', 'public', 'course-scripts', 'typhoon-command-script.json')

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(script_data, f, ensure_ascii=False, indent=2)

print(f"\n已生成: {output_file}")
print(f"总章节数: {len(script_data['chapters'])}")
for ch in script_data['chapters']:
    print(f"  - {ch['title']}: {len(ch['sections'])} 个 sections")
