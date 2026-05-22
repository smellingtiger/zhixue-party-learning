"""
AI批量生成未命名段落标题脚本
- 使用硅基流动 DeepSeek-V4-Flash 为未命名段落生成精炼小标题
- 实时监控处理进度
- 更新 processed JSON 文件
- 顺序处理，稳定可靠
"""

import re
import json
import time
import sys
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional

KB_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
PROC_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
STATS_FILE = Path(__file__).parent / "unnamed_segments_stats.json"
LOG_FILE = Path(__file__).parent / "generate_titles_log.txt"
PROGRESS_FILE = Path(__file__).parent / "generate_titles_progress.json"

API_BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
MODEL_NAME = "deepseek-ai/DeepSeek-V3"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 60
BATCH_SIZE = 5
RATE_LIMIT_DELAY = 0.3

UNNAMED_PATTERNS = ["未命名段落", "未命名", ""]

_display_line = ""

def progress_bar(pct: float, width: int = 25) -> str:
    filled = min(int(width * pct / 100), width)
    return "█" * filled + "░" * (width - filled)

def render_display(total, done, total_courses, done_courses, generated, failed, elapsed, course_name=""):
    global _display_line
    pct = done / total * 100 if total > 0 else 0
    pct_c = done_courses / total_courses * 100 if total_courses > 0 else 0
    bar = progress_bar(pct)
    bar_c = progress_bar(pct_c, 18)
    speed = done / elapsed * 60 if elapsed > 0 else 0
    remaining = (total - done) / speed * 60 if speed > 0 else 0
    if remaining > 0:
        h = int(remaining / 60)
        m = int(remaining % 60)
        eta = f"ETA {h}h{m:02d}m" if h > 0 else f"ETA {m}min"
    else:
        eta = "即将完成" if done > 0 else "ETA --"
    eh = int(elapsed / 3600)
    em = int((elapsed % 3600) / 60)
    es = int(elapsed % 60)
    name_part = f" | {course_name[:30]}" if course_name else ""
    _display_line = (
        f"\r课程 {bar_c} {done_courses}/{total_courses} | "
        f"段落 {bar} {pct:5.1f}% ({done}/{total}) | "
        f"成功 {generated} 失败 {failed} | "
        f"速度 {speed:.0f}/分 | {eta} | 用时 {eh}h{em:02d}m{es:02d}s{name_part}  "
    )
    sys.stdout.write("\033[7m" + _display_line + "\033[0m")
    sys.stdout.flush()

PROMPT_TEMPLATE = """你是一个课程大纲编辑专家。请为以下课程中的未命名段落生成简短、精炼的小标题。

要求：
1. 每个小标题不超过15个汉字
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
    print("\r\033[K" + line)
    if _display_line:
        sys.stdout.write("\033[7m" + _display_line + "\033[0m")
        sys.stdout.flush()
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def is_unnamed(title: str) -> bool:
    t = title.strip()
    return t in UNNAMED_PATTERNS or not t


def parse_course_file(filepath: Path) -> dict:
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception as e:
        log(f"  错误: 无法读取 {filepath.name}: {e}")
        return {}

    lines = text.split("\n")
    course_name = ""

    for line in lines[:6]:
        m = re.search(r"【课程名称】(.+)", line)
        if m:
            course_name = m.group(1).strip()

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
        m_general = re.match(r"【(.+?)】", line)
        m_tm = re.match(r"\[时间\]\s*([\d:]+)", line)
        m_div = re.match(r"^={10,}", line)

        if m_bg or m_ti:
            if current_title and current_content:
                segments.append({"title": current_title, "time": current_time, "content": " ".join(current_content).strip()})
            current_title = (m_bg or m_ti).group(1).strip()
            current_time = ""
            current_content = []
        elif m_general and not m_tm:
            if current_title and current_content:
                segments.append({"title": current_title, "time": current_time, "content": " ".join(current_content).strip()})
            current_title = m_general.group(1).strip()
            current_time = ""
            current_content = []
        elif m_tm:
            current_time = m_tm.group(1).strip()
        elif m_div:
            if current_title and current_content:
                segments.append({"title": current_title, "time": current_time, "content": " ".join(current_content).strip()})
            current_title = ""
            current_time = ""
            current_content = []
        elif current_title:
            stripped = line.strip()
            if stripped:
                current_content.append(stripped)

    if current_title and current_content:
        segments.append({"title": current_title, "time": current_time, "content": " ".join(current_content).strip()})

    return {"course_name": course_name or filepath.stem, "segments": segments}


def load_processed_json(stem: str) -> Optional[dict]:
    proc_file = PROC_DIR / f"{stem}.json"
    if proc_file.exists():
        try:
            return json.loads(proc_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return None


def save_processed_json(stem: str, data: dict):
    PROC_DIR.mkdir(parents=True, exist_ok=True)
    proc_file = PROC_DIR / f"{stem}.json"
    proc_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


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


def call_llm_api(prompt: str, display_fn=None, disp_args=None) -> Optional[list]:
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

    prompt_chars = len(prompt)
    log(f"    API请求: prompt长度={prompt_chars}字")

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
                log(f"    API响应: {elapsed:.1f}s, 回复{len(content)}字")
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

        # During retries, refresh the display
        if display_fn and disp_args:
            display_fn(*disp_args)

    return None


def save_progress(progress: dict):
    PROGRESS_FILE.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8")


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        try:
            return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def main():
    log("=" * 70)
    log("  AI批量生成未命名段落标题")
    log("=" * 70)

    if not STATS_FILE.exists():
        log("错误: 未找到统计文件，请先运行 count_unnamed_segments.py")
        return

    stats = json.loads(STATS_FILE.read_text(encoding="utf-8"))
    total_unnamed = stats["total_unnamed"]
    courses_with_unnamed = stats["courses_with_unnamed"]
    course_details = stats["course_details"]

    progress = load_progress()
    completed_stems = set(progress.get("completed_stems", []))
    start_idx = progress.get("last_index", 0)

    generated_total = progress.get("generated_total", 0)
    failed_total = progress.get("failed_total", 0)
    api_calls_total = progress.get("api_calls_total", 0)
    processed_unnamed = progress.get("processed_unnamed", 0)
    processed_courses = len(completed_stems)

    log(f"待处理: {courses_with_unnamed} 门课程, {total_unnamed} 个未命名段落")
    log(f"API: {API_BASE_URL} | 模型: {MODEL_NAME}")
    log(f"批次大小: {BATCH_SIZE}")
    if start_idx > 0:
        log(f"断点续传: 从第 {start_idx + 1} 门课程继续, 已完成 {processed_courses} 门")
    log("")

    start_time = time.time()

    # Initial display
    render_display(total_unnamed, processed_unnamed, courses_with_unnamed, processed_courses,
                   generated_total, failed_total, 0.01)

    for idx in range(start_idx, len(course_details)):
        course_info = course_details[idx]
        stem = course_info["stem"]
        course_name = course_info["name"]

        if stem in completed_stems:
            continue

        proc_data = load_processed_json(stem)
        if proc_data:
            segments = proc_data.get("segments", [])
            if not segments:
                txt_file = KB_DIR / f"{stem}.txt"
                if txt_file.exists():
                    parsed = parse_course_file(txt_file)
                    if parsed:
                        segments = parsed["segments"]
                        course_name = parsed["course_name"]
        else:
            txt_file = KB_DIR / f"{stem}.txt"
            if txt_file.exists():
                parsed = parse_course_file(txt_file)
                if parsed:
                    segments = parsed["segments"]
                    course_name = parsed["course_name"]
                    proc_data = {"title": course_name, "category": "", "segments": segments}
                else:
                    completed_stems.add(stem)
                    processed_courses += 1
                    continue
            else:
                completed_stems.add(stem)
                processed_courses += 1
                continue

        unnamed_indices = [i for i, seg in enumerate(segments) if is_unnamed(seg.get("title", ""))]
        if not unnamed_indices:
            completed_stems.add(stem)
            processed_courses += 1
            continue

        course_generated = 0
        course_failed = 0
        log(f"▶ [{idx + 1}/{len(course_details)}] {course_name[:35]} | {len(unnamed_indices)}个未命名段落")

        for batch_start in range(0, len(unnamed_indices), BATCH_SIZE):
            batch_indices = unnamed_indices[batch_start:batch_start + BATCH_SIZE]
            batch_segments = [segments[i] for i in batch_indices]

            paragraphs_json = json.dumps([
                {"index": j, "content": seg.get("content", "")[:150]}
                for j, seg in enumerate(batch_segments)
            ], ensure_ascii=False, indent=2)

            prompt = PROMPT_TEMPLATE.format(course_name=course_name, paragraphs_json=paragraphs_json)

            api_calls_total += 1
            titles = call_llm_api(
                prompt,
                display_fn=render_display,
                disp_args=(total_unnamed, processed_unnamed, courses_with_unnamed, processed_courses,
                           generated_total, failed_total, time.time() - start_time, course_name)
            )

            if titles and len(titles) == len(batch_segments):
                title_map = {}
                for t in titles:
                    i_val = t.get("index", -1)
                    if 0 <= i_val < len(batch_segments):
                        title_map[i_val] = t.get("title", "")[:15]

                for j, orig_idx in enumerate(batch_indices):
                    if j in title_map and title_map[j]:
                        segments[orig_idx]["title"] = title_map[j]
                        course_generated += 1
                        generated_total += 1
                    else:
                        course_failed += 1
                        failed_total += 1
            else:
                course_failed += len(batch_segments)
                failed_total += len(batch_segments)

            processed_unnamed += len(batch_segments)

            # Update display after each batch
            render_display(total_unnamed, processed_unnamed, courses_with_unnamed, processed_courses,
                           generated_total, failed_total, time.time() - start_time, course_name)

            time.sleep(RATE_LIMIT_DELAY)

        if proc_data:
            proc_data["segments"] = segments
            proc_data["title_generated_at"] = datetime.now().isoformat()
            save_processed_json(stem, proc_data)
        else:
            save_processed_json(stem, {
                "title": course_name,
                "category": "",
                "segments": segments,
                "title_generated_at": datetime.now().isoformat(),
            })

        completed_stems.add(stem)
        processed_courses += 1

        save_progress({
            "last_index": idx + 1,
            "completed_stems": list(completed_stems),
            "generated_total": generated_total,
            "failed_total": failed_total,
            "api_calls_total": api_calls_total,
            "processed_unnamed": processed_unnamed,
        })

    elapsed = time.time() - start_time
    # Clear display line
    sys.stdout.write("\r\033[K")
    sys.stdout.flush()
    log("")
    log("=" * 70)
    log(f"  处理完成!")
    log(f"  总耗时: {elapsed:.1f}秒 ({elapsed / 60:.1f}分钟)")
    log(f"  处理课程: {processed_courses}/{courses_with_unnamed}")
    log(f"  处理段落: {processed_unnamed}/{total_unnamed}")
    log(f"  成功生成: {generated_total} 个标题")
    log(f"  生成失败: {failed_total} 个标题")
    log(f"  API调用: {api_calls_total} 次")
    log(f"  日志文件: {LOG_FILE}")
    log("=" * 70)


if __name__ == "__main__":
    main()
