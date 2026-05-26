"""
台风课程语音播报内容转换脚本 v2
将SOP表格/密集列表转换为口语化播报内容
"""
import json
import re
from pathlib import Path

PROJECT_DIR = Path(__file__).parent.parent
SCRIPT_JSON = PROJECT_DIR / "public" / "course-scripts" / "typhoon-command-script.json"

TRANSITION_WORDS = ["首先", "其次", "接着", "然后", "此外", "还有", "另外", "再者",
                    "还有一点", "还有一个", "除此之外", "另外需要注意的是",
                    "需要强调的是", "特别要注意的是", "同时", "与此同时", "另外"]

def split_by_numbered_items(content):
    """将'第一，...第二，...'格式拆分为各项"""
    pattern = r'(第[一二三四五六七八九十]+[项条]?[，,])'
    parts = re.split(pattern, content)
    items = []
    i = 0
    while i < len(parts):
        if re.match(pattern, parts[i]) if i < len(parts) else False:
            if i+1 < len(parts) and parts[i+1].strip():
                items.append((parts[i].rstrip('，,'), parts[i+1].strip().rstrip('，。')))
                i += 2
            else:
                i += 1
        else:
            i += 1
    return items

def make_conversational_sop(content):
    """将编号列表转为口语化过渡词"""
    items = split_by_numbered_items(content)
    if len(items) < 2:
        return content

    result_parts = []
    for idx, (_, text) in enumerate(items):
        transition = TRANSITION_WORDS[min(idx, len(TRANSITION_WORDS)-1)]
        cleaned = clean_sop_item(text)
        if idx == 0:
            result_parts.append(f"首先是{cleaned}")
        else:
            result_parts.append(f"{transition}，{cleaned}")
    
    return "。".join(result_parts) + "。"

def clean_sop_item(text):
    """清理SOP单条"""
    t = text
    t = re.sub(r'[，,]\s*即时执行\s*$', '', t)
    t = re.sub(r'[，,]\s*即时\s*$', '', t)
    t = re.sub(r'，\s*达标即发\s*$', '，达标即发布', t)
    t = re.sub(r'，\s*持续监测\s*$', '，需要持续监测', t)
    t = re.sub(r'，\s*持续监控\s*$', '，需要持续监控', t)
    t = re.sub(r'，\s*持续研判\s*$', '，需要持续研判', t)
    t = re.sub(r'，\s*预备执行\s*$', '，需预先准备', t)
    t = re.sub(r'，\s*灾后执行\s*$', '，在灾后实施', t)
    t = re.sub(r'，\s*每\d+小时\s*\d*\s*次\s*$', '，需定期更新', t)
    t = re.sub(r'，\s*\d+小时内完成\s*$', '，需在规定时间内完成', t)
    t = re.sub(r'，\s*\d+分钟\s*响应\s*$', '，需快速响应', t)
    t = re.sub(r'，\s*\d+分钟\s*直报\s*$', '，需第一时间直报', t)
    t = re.sub(r'，\s*二十四小时加强$', '，全天候加强', t)
    t = re.sub(r'，\s*二十四小时在岗$', '，全天候在岗', t)
    return t

def convert_sop_text(content):
    """主转换：SOP内容口语化"""
    m = re.match(r'^(.+?)(?:的标准操作流程)?包括([零一二三四五六七八九十]+)项[：:]', content)
    if not m:
        return content
    
    prefix = m.group(1)
    count = m.group(2)
    rest = content[m.end():]
    
    # 改写前导句
    intro = f"{prefix}需要落实{count}项关键动作。"
    
    body = make_conversational_sop(rest)
    return intro + body

def convert_learning_objective(content):
    """学习目标改写"""
    content = re.sub(r'^本章学习目标包括[：:]', '本章学习目标是，', content)
    return content

def convert_section(section):
    """转换单个小节"""
    content = section.get('content', '')
    title = section.get('title', '')
    orig = content

    if 'SOP' in title:
        content = convert_sop_text(content)
    elif '学习目标' in title:
        content = convert_learning_objective(content)
    
    # 通用清理
    content = content.strip()
    if content == orig and len(content) < 20:
        pass  # unchanged short section
    
    return {**section, 'content': content}

with open(SCRIPT_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

for chapter in data['chapters']:
    if 'sections' in chapter:
        chapter['sections'] = [convert_section(s) for s in chapter['sections']]

with open(SCRIPT_JSON, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

total_sections = sum(len(ch.get('sections', [])) for ch in data['chapters'])
print(f"转换完成！共处理 {len(data['chapters'])} 章 {total_sections} 节")