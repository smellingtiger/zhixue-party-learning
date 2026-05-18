"""
LLM批量生成段落标题脚本
使用硅基流动 DeepSeek-V4-Flash 为565门课程的每个段落生成精炼小标题
"""

import os
import re
import json
import time
import asyncio
import aiohttp
from pathlib import Path
from datetime import datetime
from typing import Optional

KNOWLEDGE_BASE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
OUTPUT_DIR = Path(r"E:\社院课程stt\knowledge_base_titles")
OUTPUT_DIR.mkdir(exist_ok=True)

API_BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Flash"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 60
BATCH_SIZE = 5  # 每次处理段落数
RATE_LIMIT_DELAY = 0.5  # 请求间隔秒数

PROMPT_TEMPLATE = """你是一个课程大纲编辑专家。请为以下课程段落生成简短、精炼的小标题。

要求：
1. 每个小标题不超过12个汉字
2. 小标题要准确概括段落核心内容
3. 风格要正式、学术化
4. 保持标题的简洁性和可读性
5. 直接返回JSON数组，不要其他内容

课程名称：{course_name}

段落内容（需要生成标题）：
{paragraphs_json}

请以以下JSON格式返回：
[
  {{"title": "小标题1"}},
  {{"title": "小标题2"}},
  ...
]
"""


def parse_course_file(filepath: Path) -> dict:
    """解析课程文件，提取元数据和段落"""
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"  错误: 无法读取 {filepath.name}: {e}")
        return {}

    lines = text.split("\n")
    course_name = ""
    category = ""

    for line in lines[:6]:
        m = re.search(r"【课程名称】(.+)", line)
        if m:
            course_name = m.group(1).strip()
        m = re.search(r"【课程分类】(.+)", line)
        if m:
            category = m.group(1).strip()

    segments = []
    current_title = ""
    current_time = ""
    current_content = []

    seg_start = 0
    for i, line in enumerate(lines):
        if line.strip().startswith("=" * 10):
            seg_start = i + 1
            break

    for line in lines[seg_start:]:
        m_bg = re.match(r"【背景[：:]\s*(.+)", line)
        m_ti = re.match(r"【要求[：:]\s*(.+)", line)
        m_tm = re.match(r"\[时间\]\s*([\d:]+)", line)
        m_div = re.match(r"^={10,}", line)

        if m_bg or m_ti:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "time": current_time,
                    "content": " ".join(current_content).strip()
                })
            current_title = (m_bg or m_ti).group(1).strip()
            current_time = ""
            current_content = []
        elif m_tm:
            current_time = m_tm.group(1).strip()
        elif m_div:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "time": current_time,
                    "content": " ".join(current_content).strip()
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
            "content": " ".join(current_content).strip()
        })

    return {
        "course_name": course_name or filepath.stem,
        "category": category or "未分类",
        "segments": segments,
    }


async def call_llm_api(session: aiohttp.ClientSession, prompt: str) -> Optional[list]:
    """调用硅基流动API生成标题"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2000,
    }

    for retry in range(MAX_RETRIES):
        try:
            async with session.post(
                f"{API_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    # 解析JSON
                    return parse_json_response(content)
                elif response.status == 429:
                    wait = 2 ** retry
                    print(f"    频率限制，等待{wait}秒后重试...")
                    await asyncio.sleep(wait)
                else:
                    error_text = await response.text()
                    print(f"    API错误 {response.status}: {error_text[:100]}")
                    if retry < MAX_RETRIES - 1:
                        await asyncio.sleep(1)
        except asyncio.TimeoutError:
            print(f"    请求超时，重试 {retry+1}/{MAX_RETRIES}")
            await asyncio.sleep(1)
        except Exception as e:
            print(f"    请求异常: {e}")
            if retry < MAX_RETRIES - 1:
                await asyncio.sleep(1)

    return None


def parse_json_response(content: str) -> Optional[list]:
    """从LLM响应中解析JSON"""
    # 尝试直接解析
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # 尝试提取代码块
    import re
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # 尝试查找JSON数组
    start = content.find('[')
    end = content.rfind(']')
    if start != -1 and end != -1:
        try:
            return json.loads(content[start:end+1])
        except json.JSONDecodeError:
            pass

    print(f"    无法解析JSON: {content[:200]}")
    return None


async def process_course_batch(session: aiohttp.ClientSession, courses: list[dict], start_idx: int) -> list[dict]:
    """批量处理课程"""
    results = []

    for course in courses:
        segments = course["segments"]
        if not segments:
            results.append(course)
            continue

        # 分批处理段落
        all_titles = []
        batch_count = (len(segments) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"  处理 {course['course_name']} ({len(segments)}个段落, {batch_count}批)")

        for batch_idx in range(batch_count):
            start = batch_idx * BATCH_SIZE
            end = min(start + BATCH_SIZE, len(segments))
            batch_segments = segments[start:end]

            # 构建段落JSON
            paragraphs_json = json.dumps([
                {
                    "index": i,
                    "original_title": seg["title"],
                    "content": seg["content"][:300]  # 限制内容长度
                }
                for i, seg in enumerate(batch_segments)
            ], ensure_ascii=False, indent=2)

            prompt = PROMPT_TEMPLATE.format(
                course_name=course["course_name"],
                paragraphs_json=paragraphs_json
            )

            titles = await call_llm_api(session, prompt)

            if titles and len(titles) == len(batch_segments):
                for i, seg in enumerate(batch_segments):
                    all_titles.append(titles[i].get("title", seg["title"])[:15])
                print(f"    批次 {batch_idx+1}/{batch_count}: 成功生成 {len(titles)} 个标题")
            else:
                # 使用原标题
                for seg in batch_segments:
                    all_titles.append(seg["title"][:15])
                print(f"    批次 {batch_idx+1}/{batch_count}: 生成失败，使用原标题")

            await asyncio.sleep(RATE_LIMIT_DELAY)

        # 更新段落的标题
        for i, seg in enumerate(segments):
            if i < len(all_titles):
                seg["llm_title"] = all_titles[i]

        results.append(course)

    return results


async def main():
    print("=" * 60)
    print("  LLM批量生成课程段落标题")
    print("=" * 60)
    print()

    # 获取所有txt文件
    txt_files = sorted(KNOWLEDGE_BASE_DIR.glob("*.txt"))
    total_files = len(txt_files)
    print(f"发现 {total_files} 个课程文件")
    print()

    # 解析所有课程
    courses = []
    for i, f in enumerate(txt_files):
        course = parse_course_file(f)
        if course:
            courses.append(course)
        if (i + 1) % 100 == 0:
            print(f"  已解析 {i+1}/{total_files} 个文件")

    print(f"成功解析 {len(courses)} 个课程")
    print()

    # 批量处理
    BATCH_COURSES = 3  # 每次处理3门课程
    processed = 0
    start_time = time.time()

    async with aiohttp.ClientSession() as session:
        for i in range(0, len(courses), BATCH_COURSES):
            batch = courses[i:i+BATCH_COURSES]
            print(f"\n处理课程 {i+1}-{min(i+BATCH_COURSES, len(courses))}/{len(courses)}")

            results = await process_course_batch(session, batch, i)

            # 保存结果
            for course in results:
                output_file = OUTPUT_DIR / f"{course['course_name']}.json"
                output_data = {
                    "course_name": course["course_name"],
                    "category": course["category"],
                    "segments": [
                        {
                            "title": seg.get("llm_title", seg["title"]),
                            "original_title": seg["title"],
                            "time": seg["time"],
                            "content": seg["content"],
                        }
                        for seg in course["segments"]
                    ],
                    "generated_at": datetime.now().isoformat(),
                }

                output_file.write_text(
                    json.dumps(output_data, ensure_ascii=False, indent=2),
                    encoding="utf-8"
                )
                processed += 1

            elapsed = time.time() - start_time
            print(f"  已处理 {processed}/{len(courses)} 个课程，耗时 {elapsed:.1f}秒")

    print()
    print("=" * 60)
    print(f"  处理完成！共处理 {processed} 个课程")
    print(f"  输出目录: {OUTPUT_DIR}")
    print(f"  总耗时: {time.time() - start_time:.1f}秒")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())