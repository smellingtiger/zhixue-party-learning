"""
台风岗位指挥课程语音播报批量生成脚本
从 typhoon-command-script.json 读取文稿，使用 edge-tts 生成专属 MP3 文件
"""

import sys
import json
import asyncio
from pathlib import Path
import edge_tts

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
SCRIPT_JSON = PROJECT_DIR / "public" / "course-scripts" / "typhoon-command-script.json"
AUDIO_DIR = PROJECT_DIR / "public" / "audio" / "typhoon-command"
VOICE = "zh-CN-XiaoxiaoNeural"

async def generate_tts(text: str, output_path: str, voice: str = VOICE) -> dict:
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    if output_file.exists():
        output_file.unlink()

    communicate = edge_tts.Communicate(text, voice)
    total_duration = 0.0

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            with open(output_file, "ab") as f:
                f.write(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            offset_sec = chunk.get("offset", 0) / 1e7
            if offset_sec > total_duration:
                total_duration = offset_sec

    if total_duration <= 0 and output_file.exists():
        chars_per_sec = 4.25
        clean_text = text.replace(" ", "").replace("\n", "").replace("\r", "")
        total_duration = len(clean_text) / chars_per_sec

    return {
        "success": True,
        "file_path": str(output_file),
        "duration": round(total_duration, 2),
        "size_bytes": output_file.stat().st_size if output_file.exists() else 0,
    }


def get_chapter_audio_text(chapter: dict) -> str:
    if "content" in chapter:
        return chapter["content"]

    if "sections" in chapter:
        parts = []
        for section in chapter["sections"]:
            title = section.get("title", "")
            content = section.get("content", "")
            if title:
                parts.append(f"{title}。{content}")
            else:
                parts.append(content)
        return "\n\n".join(parts)

    return ""


async def main():
    print("=" * 60)
    print("台风岗位指挥课程语音播报批量生成")
    print("=" * 60)

    if not SCRIPT_JSON.exists():
        print(f"错误：找不到脚本文件 {SCRIPT_JSON}")
        sys.exit(1)

    with open(SCRIPT_JSON, "r", encoding="utf-8") as f:
        script_data = json.load(f)

    chapters = script_data.get("chapters", [])
    print(f"\n共找到 {len(chapters)} 个章节需要生成语音\n")

    durations = {}
    results = []
    file_idx = 0

    for i, chapter in enumerate(chapters):
        chapter_id = chapter.get("id", f"chapter{i}")
        chapter_title = chapter.get("title", f"第{i}章")

        if "content" in chapter and chapter["content"]:
            audio_filename = f"11-{i}-0.mp3"
            output_path = AUDIO_DIR / audio_filename
            audio_key = audio_filename.replace(".mp3", "")

            audio_text = chapter["content"]
            if not audio_text.strip():
                print(f"[跳过] {chapter_title} - 无音频内容")
                continue

            text_length = len(audio_text.replace(" ", "").replace("\n", ""))
            print(f"[{file_idx+1}] 生成: {chapter_title}")
            print(f"  文件: {audio_filename}")
            print(f"  文本长度: {text_length} 字符")

            try:
                result = await generate_tts(audio_text, str(output_path), VOICE)
                durations[audio_key] = result["duration"]
                results.append({
                    "chapter": chapter_title,
                    "file": audio_filename,
                    "duration": result["duration"],
                    "size_kb": round(result["size_bytes"] / 1024, 1),
                    "success": True,
                })
                print(f"  成功 - 时长: {result['duration']}s, 大小: {round(result['size_bytes']/1024, 1)}KB")
            except Exception as e:
                results.append({
                    "chapter": chapter_title,
                    "file": audio_filename,
                    "success": False,
                    "error": str(e),
                })
                print(f"  失败: {e}")

            file_idx += 1
            print()

        elif "sections" in chapter:
            for j, section in enumerate(chapter["sections"]):
                section_title = section.get("title", f"第{j+1}节")
                section_content = section.get("content", "")

                if not section_content.strip():
                    print(f"[跳过] {chapter_title} - {section_title} - 无音频内容")
                    continue

                audio_filename = f"11-{i}-{j}.mp3"
                output_path = AUDIO_DIR / audio_filename
                audio_key = audio_filename.replace(".mp3", "")

                audio_text = f"{section_title}。{section_content}"
                text_length = len(audio_text.replace(" ", "").replace("\n", ""))
                print(f"[{file_idx+1}] 生成: {chapter_title} - {section_title}")
                print(f"  文件: {audio_filename}")
                print(f"  文本长度: {text_length} 字符")

                try:
                    result = await generate_tts(audio_text, str(output_path), VOICE)
                    durations[audio_key] = result["duration"]
                    results.append({
                        "chapter": f"{chapter_title} - {section_title}",
                        "file": audio_filename,
                        "duration": result["duration"],
                        "size_kb": round(result["size_bytes"] / 1024, 1),
                        "success": True,
                    })
                    print(f"  成功 - 时长: {result['duration']}s, 大小: {round(result['size_bytes']/1024, 1)}KB")
                except Exception as e:
                    results.append({
                        "chapter": f"{chapter_title} - {section_title}",
                        "file": audio_filename,
                        "success": False,
                        "error": str(e),
                    })
                    print(f"  失败: {e}")

                file_idx += 1
                print()

    durations_path = AUDIO_DIR / "durations.json"
    with open(durations_path, "w", encoding="utf-8") as f:
        json.dump(durations, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print("生成结果汇总")
    print("=" * 60)

    success_count = sum(1 for r in results if r.get("success"))
    fail_count = sum(1 for r in results if not r.get("success"))

    print(f"\n成功: {success_count} 个, 失败: {fail_count} 个\n")

    for r in results:
        if r.get("success"):
            print(f"  {r['chapter']}: {r['file']} ({r['duration']}s, {r['size_kb']}KB)")
        else:
            print(f"  {r['chapter']}: {r.get('error', '未知错误')}")

    print(f"\ndurations.json 已更新，共 {len(durations)} 个音频时长数据")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
