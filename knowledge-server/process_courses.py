"""
课程智能处理 - 文本清洗 + 智能分段 + 标题提炼
读取原始课程文本，调用LLM进行：
1. 文本清洗：去除语气词、口语化表达、重复内容、错字错词
2. 智能分段：根据课程大纲标准进行逻辑分段
3. 标题提炼：为每个段落生成精炼小标题
"""

import os
import re
import json
import time
import requests
from pathlib import Path
from typing import Optional

SOURCE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
OUTPUT_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")

API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
API_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Flash"

OUTPUT_DIR.mkdir(exist_ok=True)


def parse_course(filepath: Path) -> Optional[dict]:
    """解析原始课程文本，提取基本信息"""
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception:
        return None

    lines = text.split("\n")
    title = ""
    category = ""

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
    current_title = ""
    current_time = ""
    current_content = []

    for line in lines[seg_start:]:
        m_bg = re.match(r"【背景[：:]\s*(.+?)[】]", line)
        m_ti = re.match(r"【要求[：:]\s*(.+?)[】]", line)
        m_tm = re.match(r"\[时间\]\s*([\d:]+)", line)
        m_div = re.match(r"^={10,}", line)

        if m_bg or m_ti:
            if current_title and current_content:
                segments.append({
                    "original_title": current_title,
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
                    "original_title": current_title,
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
            "original_title": current_title,
            "time": current_time,
            "content": " ".join(current_content).strip()
        })

    return {
        "title": title or filepath.stem,
        "category": category or "未分类",
        "segments": segments
    }


def call_llm(prompt: str, max_tokens: int = 4000) -> Optional[str]:
    """调用硅基流动LLM API"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "你是一个专业的课程内容处理助手，擅长文本清洗、智能分段和标题提炼。请严格按照要求输出，不要添加任何额外说明。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3,
        "top_p": 0.9
    }

    for retry in range(3):
        try:
            response = requests.post(API_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"    请求失败 (重试 {retry+1}/3): {e}")
            time.sleep(2 * (retry + 1))

    return None


def process_course_segments(segments: list[dict], course_name: str) -> Optional[dict]:
    """
    对一门课程的所有段落进行：文本清洗 + 智能分段 + 标题提炼
    将课程分成多个批次，每3个段落为一批处理
    """
    batch_size = 3
    all_new_segments = []

    for batch_start in range(0, len(segments), batch_size):
        batch_end = min(batch_start + batch_size, len(segments))
        batch = segments[batch_start:batch_end]

        batch_text = ""
        for i, seg in enumerate(batch):
            time_info = f"[{seg.get('time', '')}]" if seg.get('time') else ""
            batch_text += f"\n--- 段落{i+1} ---\n{time_info}\n原始标题: {seg['original_title']}\n{seg['content']}"

        prompt = f"""请对以下课程内容进行处理，课程名称：{course_name}

【处理要求】
1. 文本清洗：
   - 去除语气词（啊、呢、吧、嘛、呀等）
   - 去除口语化表达（这个、那个、就是说、那么、嗯等）
   - 去除重复内容（说话时重复的关键词句）
   - 修正明显的错字错词（语音识别错误）
   - 保持专业性和准确性

2. 智能分段：
   - 根据内容逻辑重新划分段落
   - 段落划分应符合课程大纲标准
   - 每个段落主题明确、内容连贯
   - 可以适当合并或拆分原始段落

3. 标题提炼：
   - 为每个新段落生成精炼小标题
   - 标题简洁明了，突出核心主题
   - 标题长度控制在15字以内

【输出格式】（严格按JSON格式，不要添加其他内容）
[
  {{
    "title": "精炼小标题",
    "original_titles": ["被合并的原始标题1", "原始标题2"],
    "time_start": "开始时间",
    "time_end": "结束时间",
    "content": "清洗后的段落内容"
  }}
]

【待处理内容】
{batch_text}

请直接输出JSON，不要有任何解释。"""

        result = call_llm(prompt, max_tokens=6000)
        if result:
            try:
                json_match = re.search(r'\[.*\]', result, re.DOTALL)
                if json_match:
                    new_segs = json.loads(json_match.group())
                    all_new_segments.extend(new_segs)
                    print(f"    批次 {batch_start//batch_size + 1}: 成功处理 {len(new_segs)} 个段落")
                else:
                    for seg in batch:
                        cleaned_content = clean_text_fallback(seg['content'])
                        all_new_segments.append({
                            "title": seg['original_title'],
                            "original_titles": [seg['original_title']],
                            "time_start": seg.get('time', ''),
                            "time_end": seg.get('time', ''),
                            "content": cleaned_content
                        })
                    print(f"    批次 {batch_start//batch_size + 1}: 提取JSON失败，使用原标题")
            except json.JSONDecodeError:
                for seg in batch:
                    cleaned_content = clean_text_fallback(seg['content'])
                    all_new_segments.append({
                        "title": seg['original_title'],
                        "original_titles": [seg['original_title']],
                        "time_start": seg.get('time', ''),
                        "time_end": seg.get('time', ''),
                        "content": cleaned_content
                    })
                print(f"    批次 {batch_start//batch_size + 1}: JSON解析失败，使用原标题")
            except Exception as e:
                print(f"    批次 {batch_start//batch_size + 1}: 处理异常 {e}")
        else:
            for seg in batch:
                cleaned_content = clean_text_fallback(seg['content'])
                all_new_segments.append({
                    "title": seg['original_title'],
                    "original_titles": [seg['original_title']],
                    "time_start": seg.get('time', ''),
                    "time_end": seg.get('time', ''),
                    "content": cleaned_content
                })
            print(f"    批次 {batch_start//batch_size + 1}: API调用失败，使用原标题")

        time.sleep(0.5)

    return {
        "course_name": course_name,
        "segments": all_new_segments,
        "segment_count": len(all_new_segments)
    }


def clean_text_fallback(text: str) -> str:
    """简单的文本清洗（作为LLM失败的备用方案）"""
    text = re.sub(r'\s+', ' ', text).strip()
    for word in ['啊', '呢', '吧', '嘛', '呀', '哦', '呃', '嗯']:
        text = text.replace(word + '，', '，')
        text = text.replace(word + '。', '。')
    return text


def process_single_course(filepath: Path) -> bool:
    """处理单门课程"""
    course = parse_course(filepath)
    if not course:
        return False

    print(f"\n处理课程: {course['title']} ({len(course['segments'])}个段落)")

    result = process_course_segments(course['segments'], course['title'])
    if not result:
        return False

    output_file = OUTPUT_DIR / f"{filepath.stem}.json"
    output_data = {
        "title": course['title'],
        "category": course['category'],
        "processed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "segments": result['segments'],
        "segment_count": result['segment_count']
    }

    output_file.write_text(
        json.dumps(output_data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"  保存成功: {output_file.name}")
    return True


def main():
    """批量处理所有课程"""
    separator = "=" * 55
    print(f"\n{separator}")
    print(f"  课程智能处理: 文本清洗 + 智能分段 + 标题提炼")
    print(f"{separator}")
    print(f"\n数据源: {SOURCE_DIR}")
    print(f"输出目录: {OUTPUT_DIR}")

    files = sorted(SOURCE_DIR.glob("*.txt"))
    print(f"\n发现 {len(files)} 个课程文件")

    processed_files = {f.stem for f in OUTPUT_DIR.glob("*.json")}
    remaining_files = [f for f in files if f.stem not in processed_files]

    print(f"已处理: {len(processed_files)}")
    print(f"待处理: {len(remaining_files)}")

    if not remaining_files:
        print("\n所有课程已处理完成！")
        return

    start_time = time.time()
    success_count = 0
    fail_count = 0

    for i, filepath in enumerate(remaining_files):
        try:
            success = process_single_course(filepath)
            if success:
                success_count += 1
            else:
                fail_count += 1

            elapsed = time.time() - start_time
            remaining = len(remaining_files) - (i + 1)
            avg_time = elapsed / (i + 1)
            est_remaining = remaining * avg_time

            print(f"\n  进度: {success_count + fail_count}/{len(files)} "
                  f"(成功:{success_count}, 失败:{fail_count})")
            print(f"  已用时: {elapsed:.0f}秒, "
                  f"预计剩余: {est_remaining/3600:.1f}小时")

        except KeyboardInterrupt:
            print("\n\n用户中断，退出处理")
            break
        except Exception as e:
            print(f"\n处理失败: {filepath.name} - {e}")
            fail_count += 1

    print(f"\n{separator}")
    print(f"  处理完成!")
    print(f"  成功: {success_count}, 失败: {fail_count}")
    print(f"  总用时: {time.time() - start_time:.0f}秒")
    print(f"{separator}")


if __name__ == "__main__":
    main()
