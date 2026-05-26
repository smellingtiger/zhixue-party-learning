"""
从 typhoon-command-course-data.ts 提取所有章节内容，生成用于 TTS 的脚本 JSON
"""
import re
import json
from pathlib import Path

PROJECT_DIR = Path(__file__).parent.parent

# Read the course data file
data_file = PROJECT_DIR / "src" / "app" / "ai-course" / "typhoon-command-course-data.ts"
with open(data_file, "r", encoding="utf-8") as f:
    content = f.read()

# Extract the rawData content between the first { and the last }
# We need to parse the TypeScript to extract content values
# Simpler approach: use regex to find all content: '...' patterns

# Find all content strings
content_pattern = r"content:\s*'([^']*(?:\\n[^']*)*)'"
matches = re.findall(content_pattern, content)

# Clean up content: remove markdown formatting for audio
def clean_for_audio(text):
    # Unescape newlines
    text = text.replace("\\n", "\n")
    # Remove image placeholders
    text = re.sub(r'\[IMAGE:\s*[^\]]+\]', '', text)
    # Remove markdown headers
    text = re.sub(r'^## .*$', '', text, flags=re.MULTILINE)
    # Remove bold markers
    text = text.replace('**', '')
    # Remove page separators
    text = re.sub(r'---PAGE---', '', text)
    # Remove table formatting (keep the content)
    text = re.sub(r'\|:---\|', '', text)
    text = re.sub(r'\|---\|', '', text)
    # Remove list markers
    text = re.sub(r'^- ', '', text, flags=re.MULTILINE)
    # Clean up multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text

chapters_data = []

# The structure is: preface (content string), then chapters 1-4 (content strings)
# Let's parse more carefully by looking at the structure

# Actually let's parse the raw data more carefully
# Find the chapters array
chapters_match = re.search(r'chapters:\s*\[', content)
if not chapters_match:
    print("Could not find chapters array")
    exit(1)

# Parse each chapter's content
# Each chapter has: id, title, duration, type, content
chapter_pattern = r"""id:\s*(\d+),\s*
\s*title:\s*'([^']*)',\s*
\s*duration:\s*'[^']*',\s*
\s*type:\s*'[^']*',\s*
\s*content:\s*'((?:[^'\\]|\\.)*)'"""

chapters = re.findall(chapter_pattern, content, re.VERBOSE | re.DOTALL)

print(f"Found {len(chapters)} chapters")

for idx, (ch_id, title, raw_content) in enumerate(chapters):
    cleaned = clean_for_audio(raw_content)
    chapters_data.append({
        "id": int(ch_id),
        "title": title,
        "content": cleaned
    })
    print(f"Chapter {ch_id}: {title} - {len(cleaned)} chars")

# Now extract image placeholders
image_pattern = r'\[IMAGE:\s*([^\]]+)\]'
all_images = re.findall(image_pattern, content)

print(f"\nFound {len(all_images)} image placeholders")
for i, img in enumerate(all_images):
    print(f"  Image {i+1}: {img[:80]}...")

# Extract test questions count
test_pattern = r'testQuestions:\s*\['
test_match = re.search(test_pattern, content)
if test_match:
    # Count test questions by finding id: patterns within testQuestions
    test_section = content[test_match.start():]
    test_ids = re.findall(r'id:\s*(\d+)', test_section[:2000])
    print(f"\nFound {len(test_ids)} test questions")

# Generate the script JSON
script_data = {
    "courseName": "台风应急标准化处置岗位指挥课程",
    "chapters": []
}

for ch in chapters_data:
    chapter_entry = {
        "id": f"chapter{ch['id']}",
        "title": ch['title'],
        "sections": []
    }
    
    # Split content by PAGE separators to get sections
    sections = re.split(r'\n\s*\n', ch['content'])
    current_section_title = ""
    current_content = []
    
    for line in sections:
        line = line.strip()
        if not line:
            continue
        
        # Check if this is a section header
        header_match = re.match(r'^第\s+\d+\s*章[｜\|]\s*P\d+：(.+)$', line)
        if header_match:
            # Save previous section
            if current_content:
                chapter_entry["sections"].append({
                    "title": current_section_title or f"第{len(chapter_entry['sections'])+1}节",
                    "content": "\n".join(current_content).strip()
                })
            current_section_title = header_match.group(1)
            current_content = []
        elif re.match(r'^第\s+\d+\s*章·学习目标', line):
            if current_content:
                chapter_entry["sections"].append({
                    "title": current_section_title or "学习目标",
                    "content": "\n".join(current_content).strip()
                })
            current_section_title = "学习目标"
            current_content = []
        else:
            current_content.append(line)
    
    # Save last section
    if current_content:
        chapter_entry["sections"].append({
            "title": current_section_title or f"第{len(chapter_entry['sections'])+1}节",
            "content": "\n".join(current_content).strip()
        })
    
    # Remove empty content sections
    chapter_entry["sections"] = [s for s in chapter_entry["sections"] if s["content"]]
    
    script_data["chapters"].append(chapter_entry)

# Write the script JSON
output_file = PROJECT_DIR / "public" / "course-scripts" / "typhoon-command-script.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(script_data, f, ensure_ascii=False, indent=2)

print(f"\nScript written to {output_file}")
print(f"Total chapters: {len(script_data['chapters'])}")
total_sections = sum(len(ch["sections"]) for ch in script_data["chapters"])
print(f"Total sections: {total_sections}")

# Count total characters
total_chars = sum(len(s["content"].replace(" ", "").replace("\n", "")) 
                  for ch in script_data["chapters"] 
                  for s in ch["sections"])
print(f"Total characters: {total_chars}")

# Write image placeholders to a separate file
images_file = PROJECT_DIR / "scripts" / "typhoon_images.txt"
with open(images_file, "w", encoding="utf-8") as f:
    f.write("台风岗位指挥课程 - 图片占位符清单\n")
    f.write("=" * 60 + "\n\n")
    for i, img in enumerate(all_images):
        f.write(f"图片 {i+1}:\n")
        f.write(f"  描述: {img}\n")
        f.write(f"  建议路径: /knowledge-images/11-{i//2 + (0 if i < 2 else 1)}-{(i%2)+1}.png\n\n")

print(f"\nImage placeholders written to {images_file}")
