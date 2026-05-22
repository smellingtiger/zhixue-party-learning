"""
重试生成失败的段落标题
- 扫描所有processed JSON文件，找出仍有未命名段落的课程
- 对未命名段落重新调用AI生成标题
"""

import re
import json
import time
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional

PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
KB_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
LOG_FILE = Path(__file__).parent / "retry_titles_log.txt"

API_BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
MODEL_NAME = "deepseek-ai/DeepSeek-V3"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 60
BATCH_SIZE = 5
RATE_LIMIT_DELAY = 0.3

UNNAMED_PATTERNS = ["未命名段落", "未命名", ""]

PROMPT_TEMPLATE = """你是一个课程大纲编辑专家。请为以下课程中的未命名段落生成简短、精炼的小标题。

要求：
1. 每个小标题不超过12个汉字
2. 小标题要准确概括段落核心内容
3. 风格要正式、学术化
4. 保持标题的简洁性和可读性
5. 直接返回JSON数组，不要其他内容

课程名称：{course_name}

未命名段落内容：
{paragraphs_json}

请以以下JSON格式返回（index对应段落序号）：
[
  {{"index": 0, "title": "小标题1"}},
  {{"index": 1, "title": "小标题2"}}
]
"""


def log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def is_unnamed(title: str) -> bool:
    t = title.strip()
    return t in UNNAMED_PATTERNS or not t


def call_llm_api(prompt: str) -> Optional[list]:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1000,
    }

    for retry in range(MAX_RETRIES):
        try:
            t0 = time.time()
            resp = requests.post(
                f"{API_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=REQUEST_TIMEOUT,
            )
            elapsed = time.time() - t0
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                return parse_json_response(content)
            elif resp.status_code == 429:
                wait = 2 ** retry
                log(f"    频率限制，等待{wait}秒后重试...")
                time.sleep(wait)
            else:
                log(f"    API错误 {resp.status_code}: {resp.text[:100]}")
                if retry < MAX_RETRIES - 1:
                    time.sleep(1)
        except requests.exceptions.Timeout:
            log(f"    请求超时，重试 {retry + 1}/{MAX_RETRIES}")
            time.sleep(2)
        except Exception as e:
            log(f"    请求异常: {e}")
            if retry < MAX_RETRIES - 1:
                time.sleep(1)

    return None


def parse_json_response(content: str) -> Optional[list]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    start = content.find('[')
    end = content.rfind(']')
    if start != -1 and end != -1:
        try:
            return json.loads(content[start:end + 1])
        except json.JSONDecodeError:
            pass

    return None


def retry_course(stem: str, course_name: str, segments: list) -> dict:
    unnamed_indices = [i for i, seg in enumerate(segments) if is_unnamed(seg.get("title", ""))]
    if not unnamed_indices:
        return {"success": 0, "failed": 0, "total": 0}

    total = len(unnamed_indices)
    success = 0
    failed = 0

    for batch_start in range(0, len(unnamed_indices), BATCH_SIZE):
        batch_indices = unnamed_indices[batch_start:batch_start + BATCH_SIZE]
        batch_segments = [segments[i] for i in batch_indices]

        paragraphs_json = json.dumps([
            {"index": j, "content": seg.get("content", "")[:150]}
            for j, seg in enumerate(batch_segments)
        ], ensure_ascii=False, indent=2)

        prompt = PROMPT_TEMPLATE.format(course_name=course_name, paragraphs_json=paragraphs_json)

        titles = call_llm_api(prompt)

        if titles and len(titles) == len(batch_segments):
            title_map = {}
            for t in titles:
                i_val = t.get("index", -1)
                if 0 <= i_val < len(batch_segments):
                    title_map[i_val] = t.get("title", "")[:15]

            for j, orig_idx in enumerate(batch_indices):
                if j in title_map and title_map[j]:
                    segments[orig_idx]["title"] = title_map[j]
                    success += 1
                else:
                    failed += 1
        else:
            failed += len(batch_segments)

        time.sleep(RATE_LIMIT_DELAY)

    return {"success": success, "failed": failed, "total": total}


def main():
    log("=" * 70)
    log("  重试生成失败的段落标题（使用DeepSeek-V3快速模型）")
    log("=" * 70)

    json_files = sorted(PROC_DIR.glob("*.json"))
    total_files = len(json_files)
    log(f"扫描目录: {PROC_DIR}")
    log(f"找到 {total_files} 个processed文件")

    courses_needing_retry = []
    total_unnamed_found = 0

    for f in json_files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            segments = data.get("segments", [])
            course_name = data.get("title", f.stem)

            unnamed = [seg for seg in segments if is_unnamed(seg.get("title", ""))]
            if unnamed:
                courses_needing_retry.append({
                    "stem": f.stem,
                    "course_name": course_name,
                    "segments": segments,
                    "unnamed_count": len(unnamed),
                })
                total_unnamed_found += len(unnamed)
        except Exception as e:
            log(f"  读取 {f.name} 失败: {e}")

    log(f"\n发现 {len(courses_needing_retry)} 门课程仍有未命名段落")
    log(f"未命名段落总数: {total_unnamed_found}")
    log(f"使用模型: {MODEL_NAME}")
    log("")

    if not courses_needing_retry:
        log("没有需要重试的课程，所有段落标题都已生成！")
        return

    start_time = time.time()
    total_generated = 0
    total_failed = 0

    for idx, course in enumerate(courses_needing_retry):
        log(f"▶ [{idx + 1}/{len(courses_needing_retry)}] {course['course_name'][:35]} | {course['unnamed_count']}个待生成")

        result = retry_course(course["stem"], course["course_name"], course["segments"])

        log(f"  ✓ 成功 {result['success']} 失败 {result['failed']}")

        total_generated += result["success"]
        total_failed += result["failed"]

        # 保存更新后的数据
        proc_file = PROC_DIR / f"{course['stem']}.json"
        proc_file.write_text(json.dumps({
            "title": course["course_name"],
            "category": "",
            "segments": course["segments"],
            "title_generated_at": datetime.now().isoformat(),
            "retry_at": datetime.now().isoformat(),
        }, ensure_ascii=False, indent=2), encoding="utf-8")

        elapsed = time.time() - start_time
        processed = sum(c["unnamed_count"] for c in courses_needing_retry[:idx + 1])
        pct = processed / total_unnamed_found * 100
        speed = processed / elapsed * 60 if elapsed > 0 else 0
        remaining = (total_unnamed_found - processed) / speed * 60 if speed > 0 else 0

        bar_len = 25
        filled = int(bar_len * pct / 100)
        bar = "█" * filled + "░" * (bar_len - filled)

        log(f"  [{bar}] {pct:.1f}% | 段落 {processed}/{total_unnamed_found} | 速度 {speed:.0f}段/分 | 剩余 ~{remaining:.0f}分")

    elapsed = time.time() - start_time
    log("")
    log("=" * 70)
    log(f"  重试完成!")
    log(f"  总耗时: {elapsed:.1f}秒 ({elapsed / 60:.1f}分钟)")
    log(f"  处理课程: {len(courses_needing_retry)} 门")
    log(f"  成功生成: {total_generated} 个标题")
    log(f"  仍失败: {total_failed} 个标题")
    log(f"  日志文件: {LOG_FILE}")
    log("=" * 70)


if __name__ == "__main__":
    main()
