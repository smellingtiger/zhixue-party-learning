"""
将 FunASR JSON 文件批量转换为知识库 TXT 格式
读取 E:\社院课程stt\新建文件夹\output_funasr\ 下的所有 JSON 文件
转换为标准 TXT 格式写入 E:\社院课程stt\knowledge_base_txt\
"""

import json
import os
import re
import time
import sys
from pathlib import Path

SOURCE_DIR = Path(r"E:\社院课程stt\新建文件夹\output_funasr")
TARGET_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")

TARGET_DIR.mkdir(parents=True, exist_ok=True)


def format_time(time_str: str) -> str:
    """将 HH:MM:SS,mmm 格式转换为 HH:MM:SS"""
    if not time_str:
        return ""
    match = re.match(r"(\d{2}:\d{2}:\d{2})", time_str)
    return match.group(1) if match else time_str


def convert_json_to_txt(json_path: Path) -> bool:
    """将单个 JSON 文件转换为 TXT 格式"""
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, Exception) as e:
        print(f"  [跳过] {json_path.name}: JSON解析失败 - {e}")
        return False

    if not isinstance(data, list) or len(data) == 0:
        print(f"  [跳过] {json_path.name}: 空数据或格式不正确")
        return False

    file_id = json_path.stem
    segment_count = len(data)

    lines = []
    lines.append(f"【课程名称】{file_id}")
    lines.append("【课程分类】未分类")
    lines.append(f"【段落数量】{segment_count}")
    lines.append("=" * 50)
    lines.append("")

    for seg in data:
        title = seg.get("title", "").strip()
        start_time = format_time(seg.get("start_time", ""))
        content = seg.get("content", "").strip()

        if not content:
            continue

        lines.append(f"【{title}】" if title else "【未命名段落】")
        if start_time:
            lines.append(f"[时间] {start_time}")
        lines.append(content)
        lines.append("")

    txt_path = TARGET_DIR / f"{file_id}.txt"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return True


def main():
    """批量转换所有 JSON 文件"""
    separator = "=" * 55
    print(f"\n{separator}")
    print(f"  FunASR JSON → 知识库 TXT 批量转换")
    print(f"{separator}")
    print(f"\n  源目录: {SOURCE_DIR}")
    print(f"  目标目录: {TARGET_DIR}")

    json_files = sorted([f for f in SOURCE_DIR.glob("*.json") if f.stem != "enhance_progress"])
    total = len(json_files)
    print(f"\n  发现 {total} 个 JSON 文件（已排除 enhance_progress.json）")

    existing_txt = {f.stem for f in TARGET_DIR.glob("*.txt")}
    new_files = [f for f in json_files if f.stem not in existing_txt]
    print(f"  已存在 TXT: {len(existing_txt)}")
    print(f"  需要转换: {len(new_files)}")

    if not new_files:
        print("\n  所有文件已转换完成！")
        return

    print(f"\n  开始转换 {len(new_files)} 个文件...\n")

    start_time = time.time()
    success_count = 0
    fail_count = 0

    for i, json_path in enumerate(new_files):
        try:
            if convert_json_to_txt(json_path):
                success_count += 1
            else:
                fail_count += 1

            if (i + 1) % 100 == 0 or i == len(new_files) - 1:
                elapsed = time.time() - start_time
                rate = (i + 1) / elapsed if elapsed > 0 else 0
                remaining = (len(new_files) - (i + 1)) / rate if rate > 0 else 0
                print(f"  进度: {i+1}/{len(new_files)} "
                      f"(成功:{success_count}, 失败:{fail_count}) "
                      f"速度:{rate:.0f}个/秒 "
                      f"预计剩余:{remaining:.0f}秒")

        except Exception as e:
            print(f"  [错误] {json_path.name}: {e}")
            fail_count += 1

    elapsed = time.time() - start_time
    print(f"\n{separator}")
    print(f"  转换完成!")
    print(f"  成功: {success_count}, 失败: {fail_count}")
    print(f"  总用时: {elapsed:.0f}秒")
    print(f"  所有 TXT 文件总数: {len(list(TARGET_DIR.glob('*.txt')))}")
    print(f"{separator}")


if __name__ == "__main__":
    main()