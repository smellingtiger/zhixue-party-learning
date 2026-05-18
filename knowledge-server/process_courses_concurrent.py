"""
课程智能处理 - 并发版
文本清洗 + 智能分段 + 标题提炼
支持多课程并发处理，大幅提升速度
"""

import re
import json
import time
import httpx
import asyncio
from pathlib import Path
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

SOURCE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
OUTPUT_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")

API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
API_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Flash"
MAX_CONCURRENCY = 15  # 最大并发课程数
BATCH_SIZE = 3  # 每批处理段落数

OUTPUT_DIR.mkdir(exist_ok=True)


def parse_course(filepath: Path) -> Optional[dict]:
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception:
        return None

    lines = text.split("\n")
    title, category = "", ""
    for line in lines[:6]:
        m = re.search(r"【课程名称】(.+)", line)
        if m:
            title = m.group(1).strip()
        m = re.search(r"【课程分类】(.+)", line)
        if m:
            category = m.group(1).strip()

    seg_start = 0
    for i, line in enumerate(lines):
        if line.strip().startswith("=" * 10):
            seg_start = i + 1
            break

    segments = []
    current_title, current_time, current_content = "", "", []

    for line in lines[seg_start:]:
        m_bg = re.match(r"【背景[：:]\s*(.+?)[】]", line)
        m_ti = re.match(r"【要求[：:]\s*(.+?)[】]", line)
        m_tm = re.match(r"\[时间\]\s*([\d:]+)", line)
        m_div = re.match(r"^={10,}", line)

        if m_bg or m_ti:
            if current_title and current_content:
                segments.append({"original_title": current_title, "time": current_time, "content": " ".join(current_content).strip()})
            current_title = (m_bg or m_ti).group(1).strip()
            current_time = ""
            current_content = []
        elif m_tm:
            current_time = m_tm.group(1).strip()
        elif m_div:
            if current_title and current_content:
                segments.append({"original_title": current_title, "time": current_time, "content": " ".join(current_content).strip()})
            current_title = ""
            current_time = ""
            current_content = []
        elif current_title:
            stripped = line.strip()
            if stripped:
                current_content.append(stripped)

    if current_title and current_content:
        segments.append({"original_title": current_title, "time": current_time, "content": " ".join(current_content).strip()})

    return {"title": title or filepath.stem, "category": category or "未分类", "segments": segments}


def call_llm_api(prompt: str, max_tokens: int = 4000) -> Optional[str]:
    """同步调用LLM API（用于线程池）"""
    import requests
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "你是专业的课程内容处理助手，擅长文本清洗、智能分段和标题提炼。请严格按JSON格式输出。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3,
        "top_p": 0.9
    }
    for retry in range(3):
        try:
            response = requests.post(API_URL, json=payload, headers=headers, timeout=45)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            time.sleep(1 * (retry + 1))
    return None


def process_course_batch(batch_text: str, course_name: str) -> list:
    """处理一批段落"""
    prompt = f"""请对以下课程内容进行处理，课程名称：{course_name}

【处理要求】
1. 文本清洗：去除语气词（啊、呢、吧、嘛、呀等）、去除口语化表达（这个、那个、就是说等）、去除重复内容、修正语音识别错字
2. 智能分段：根据内容逻辑重新划分段落，符合课程大纲标准
3. 标题提炼：为每个段落生成精炼小标题，15字以内

【输出格式】（严格JSON数组）
[
  {{"title": "精炼小标题", "original_titles": ["原始标题1"], "time_start": "开始时间", "time_end": "结束时间", "content": "清洗后内容"}}
]

【待处理内容】
{batch_text}

直接输出JSON，不要解释。"""

    result = call_llm_api(prompt, max_tokens=5000)
    if result:
        try:
            json_match = re.search(r'\[.*\]', result, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
    return []


def clean_text_fallback(text: str) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    for word in ['啊', '呢', '吧', '嘛', '呀', '哦', '呃', '嗯']:
        text = text.replace(word + '，', '，').replace(word + '。', '。')
    return text


def process_course_sync(filepath: Path) -> bool:
    """单门课程处理（同步版，用于线程池）"""
    course = parse_course(filepath)
    if not course:
        return False

    segments = course['segments']
    course_name = course['title']
    all_new_segments = []

    # 分批处理
    for batch_start in range(0, len(segments), BATCH_SIZE):
        batch = segments[batch_start:batch_start + BATCH_SIZE]
        batch_text = ""
        for i, seg in enumerate(batch):
            time_info = f"[{seg.get('time', '')}]" if seg.get('time') else ""
            batch_text += f"\n--- 段落{i+1} ---\n{time_info}\n原始标题: {seg['original_title']}\n{seg['content']}"

        new_segs = process_course_batch(batch_text, course_name)

        if new_segs:
            all_new_segments.extend(new_segs)
        else:
            # API失败，使用原标题
            for seg in batch:
                all_new_segments.append({
                    "title": seg['original_title'],
                    "original_titles": [seg['original_title']],
                    "time_start": seg.get('time', ''),
                    "time_end": seg.get('time', ''),
                    "content": clean_text_fallback(seg['content'])
                })

        time.sleep(0.2)  # 小幅间隔

    # 保存结果
    output_file = OUTPUT_DIR / f"{filepath.stem}.json"
    output_data = {
        "title": course['title'],
        "category": course['category'],
        "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "segments": all_new_segments,
        "segment_count": len(all_new_segments)
    }
    output_file.write_text(json.dumps(output_data, ensure_ascii=False, indent=2), encoding="utf-8")
    return True


def process_course_thread(filepath: Path, idx: int, total: int, start_time: float):
    """线程包装器"""
    try:
        success = process_course_sync(filepath)
        elapsed = time.time() - start_time
        status = "成功" if success else "失败"
        print(f"  [{idx}/{total}] {filepath.stem} - {status} (已用时: {elapsed:.0f}秒)")
        return success
    except Exception as e:
        print(f"  [{idx}/{total}] {filepath.stem} - 异常: {e}")
        return False


def main():
    separator = "=" * 60
    print(f"\n{separator}")
    print(f"  课程智能处理（并发版）: 清洗 + 分段 + 标题")
    print(f"  并发数: {MAX_CONCURRENCY}")
    print(f"{separator}")

    files = sorted(SOURCE_DIR.glob("*.txt"))
    processed_files = {f.stem for f in OUTPUT_DIR.glob("*.json")}
    remaining_files = [f for f in files if f.stem not in processed_files]

    print(f"\n总课程: {len(files)}")
    print(f"已处理: {len(processed_files)}")
    print(f"待处理: {len(remaining_files)}")

    if not remaining_files:
        print("\n所有课程已处理完成！")
        return

    start_time = time.time()

    # 使用线程池并发处理
    with ThreadPoolExecutor(max_workers=MAX_CONCURRENCY) as executor:
        futures = []
        for i, filepath in enumerate(remaining_files):
            future = executor.submit(process_course_thread, filepath, i + 1, len(remaining_files), start_time)
            futures.append(future)
            # 控制提交速度，避免瞬间创建太多连接
            time.sleep(0.1)

        # 等待所有任务完成
        results = [f.result() for f in futures]

    success_count = sum(1 for r in results if r)
    fail_count = len(results) - success_count

    print(f"\n{separator}")
    print(f"  处理完成!")
    print(f"  成功: {success_count}, 失败: {fail_count}")
    print(f"  总用时: {time.time() - start_time:.0f}秒 ({(time.time() - start_time)/3600:.1f}小时)")
    print(f"{separator}")


if __name__ == "__main__":
    main()
