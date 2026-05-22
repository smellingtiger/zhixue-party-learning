"""修复处理失败的课程中剩余的未命名段落"""

import json
import requests
import time
from pathlib import Path

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
API_BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
MODEL_NAME = "deepseek-ai/DeepSeek-V3"

UNNAMED_PATTERNS = ["未命名段落", "未命名", ""]

PROMPT_TEMPLATE = """你是一个课程大纲编辑专家。请为以下课程中的未命名段落生成简短、精炼的小标题。

要求：
1. 每个小标题不超过12个汉字
2. 小标题要准确概括段落核心内容
3. 风格要正式、学术化
4. 直接返回JSON数组格式，例如：[{{"index":0,"title":"标题1"}},{{"index":1,"title":"标题2"}}]
5. index从0开始，对应下面列出的段落顺序

课程名称：{course_name}

未命名段落内容：
{paragraphs_json}

请返回JSON数组："""


def is_unnamed(title: str) -> bool:
    t = title.strip()
    return t in UNNAMED_PATTERNS or not t


def call_llm(prompt: str, max_retries=3):
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 500,
    }
    
    for attempt in range(max_retries):
        try:
            resp = requests.post(f"{API_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=30)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"].strip()
                # 尝试解析JSON
                import re
                # 尝试多种JSON提取方式
                for pattern in [r'```(?:json)?\s*([\s\S]*?)\s*```', r'\[.*\]']:
                    match = re.search(pattern, content, re.DOTALL)
                    if match:
                        try:
                            return json.loads(match.group(1) if pattern.startswith(r'```') else match.group(0))
                        except:
                            pass
                # 如果都不行，尝试直接解析
                start = content.find('[')
                end = content.rfind(']')
                if start != -1 and end != -1:
                    try:
                        return json.loads(content[start:end+1])
                    except:
                        pass
                print(f"  解析失败，原始回复: {content[:200]}")
                return None
            else:
                print(f"  API错误 {resp.status_code}: {resp.text[:100]}")
                time.sleep(2)
        except Exception as e:
            print(f"  请求异常: {e}")
            time.sleep(2)
    return None


# 查找所有有未命名段落的课程
courses_with_issues = []
for proc_file in PROC_DIR.glob("*.json"):
    try:
        data = json.loads(proc_file.read_text(encoding="utf-8"))
        segments = data.get("segments", [])
        unnamed_indices = [i for i, seg in enumerate(segments) if is_unnamed(seg.get("title", ""))]
        if unnamed_indices:
            courses_with_issues.append({
                "file": proc_file,
                "data": data,
                "segments": segments,
                "unnamed_indices": unnamed_indices,
            })
    except:
        pass

if not courses_with_issues:
    print("✅ 所有课程都没有未命名段落！")
    exit(0)

print(f"发现 {len(courses_with_issues)} 门课程仍有未命名段落\n")

for course in courses_with_issues:
    proc_file = course["file"]
    data = course["data"]
    segments = course["segments"]
    unnamed_indices = course["unnamed_indices"]
    course_name = data.get("title", proc_file.stem)
    
    print(f"🔧 修复: {proc_file.stem}")
    print(f"   课程: {course_name[:40]}")
    print(f"   未命名段落数: {len(unnamed_indices)}")
    
    # 获取未命名段落内容
    unnamed_segments = [segments[i] for i in unnamed_indices]
    paragraphs_json = json.dumps([
        {"index": j, "content": seg.get("content", "")[:200]}
        for j, seg in enumerate(unnamed_segments)
    ], ensure_ascii=False, indent=2)
    
    prompt = PROMPT_TEMPLATE.format(course_name=course_name, paragraphs_json=paragraphs_json)
    
    titles = call_llm(prompt)
    
    if titles and isinstance(titles, list):
        print(f"   ✅ AI返回了 {len(titles)} 个标题")
        # 应用标题
        for t in titles:
            if isinstance(t, dict) and "index" in t and "title" in t:
                idx = t["index"]
                if 0 <= idx < len(unnamed_segments):
                    actual_idx = unnamed_indices[idx]
                    segments[actual_idx]["title"] = t["title"][:15]
                    print(f"      [{actual_idx}] -> {t['title']}")
        
        # 保存更新
        data["segments"] = segments
        data["title_fixed_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        proc_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"   ✅ 已保存")
    else:
        print(f"   ❌ AI未能返回有效标题")
    
    print()

# 最终统计
remaining = 0
for proc_file in PROC_DIR.glob("*.json"):
    try:
        data = json.loads(proc_file.read_text(encoding="utf-8"))
        segments = data.get("segments", [])
        unnamed = sum(1 for s in segments if is_unnamed(s.get("title", "")))
        remaining += unnamed
    except:
        pass

print("=" * 60)
print(f"修复完成！剩余未命名段落: {remaining}")
print("=" * 60)
