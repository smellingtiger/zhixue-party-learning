"""
台风知识课程语音播报批量生成脚本
从 typhoon-knowledge-data.ts 读取 rawData，按章/页拆分，
使用 edge-tts (zh-CN-XiaoxiaoNeural) 生成 MP3 文件。

命名规则: 10-{chapterIdx}-{pageIdx}.mp3
chapterIdx 从 0 开始（第 0 章是前言）
"""

import sys
import re
import os
import asyncio
from pathlib import Path

import edge_tts

SCRIPT_DIR = Path(__file__).parent
TS_SOURCE = SCRIPT_DIR / "src" / "app" / "safety" / "typhoon-knowledge-data.ts"
AUDIO_DIR = SCRIPT_DIR / "public" / "audio" / "typhoon"
VOICE = "zh-CN-XiaoxiaoNeural"


def extract_raw_chapters(ts_path: Path) -> list[dict]:
    """从 TypeScript 源文件中提取 rawData.chapters 数组的各章内容"""
    text = ts_path.read_text(encoding="utf-8")

    # 定位 rawData 的 chapters 数组
    chapters_match = re.search(r'chapters:\s*\[(.*?)\]\s*,', text, re.DOTALL)
    if not chapters_match:
        print("错误：无法在源文件中找到 chapters 数组")
        sys.exit(1)

    chapters_block = chapters_match.group(1)

    # 使用正则匹配每个章节对象: { id: N, title: '...', duration: '...', type: 'mixed', content: '...' }
    chapter_pattern = re.compile(
        r"\{\s*id:\s*(\d+)\s*,\s*title:\s*'([^']*)'\s*,\s*duration:\s*'([^']*)'\s*,\s*type:\s*'([^']*)'\s*,\s*content:\s*'((?:[^'\\]|\\.)*)'\s*\}",
        re.DOTALL,
    )

    chapters = []
    for match in chapter_pattern.finditer(chapters_block):
        chapter_id = int(match.group(1))
        title = match.group(2)
        duration = match.group(3)
        content_raw = match.group(5)
        # 还原转义字符
        content = content_raw.replace("\\n", "\n").replace("\\'", "'").replace("\\\\", "\\")
        chapters.append({
            "id": chapter_id,
            "title": title,
            "duration": duration,
            "content": content,
        })

    # 按 id 排序确保顺序
    chapters.sort(key=lambda c: c["id"])
    return chapters


def split_pages(content: str) -> list[str]:
    """按 ---PAGE--- 将章节内容拆分为页面列表"""
    pages = content.split("---PAGE---")
    return [p.strip() for p in pages if p.strip()]


def clean_for_tts(text: str) -> str:
    """清洗文本，移除 TTS 不需要的标记，只保留纯朗读文本"""
    # 1. 移除 [IMAGE: ...] 和 [VIDEO: ...] 标记
    text = re.sub(r'\[IMAGE:\s*[^\]]+\]', '', text)
    text = re.sub(r'\[VIDEO:\s*[^\]]+\]', '', text)

    # 2. 移除 ---PAGE--- 分隔符（可能残留）
    text = text.replace('---PAGE---', '')

    # 3. 移除 Markdown 表格行（包含 | 的行和分隔行）
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # 跳过表格行（以 | 开头或以 | 结尾，或完全是 |--| 格式）
        if re.match(r'^\|.*\|$', stripped):
            continue
        if re.match(r'^\|?[\s:|-]+\|', stripped):
            continue
        cleaned_lines.append(line)
    text = '\n'.join(cleaned_lines)

    # 4. 移除 Markdown 标题标记 (##, ###, ####)
    text = re.sub(r'^#{2,4}\s+', '', text, flags=re.MULTILINE)

    # 5. 移除 ** 加粗标记（保留文本内容）
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)

    # 6. 移除 Markdown 链接，保留链接文本
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)

    # 7. 移除 * / _ 斜体标记
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)

    # 8. 移除残存的 → 箭头（TTS 无法朗读）
    text = text.replace('→', '，')

    # 9. 合并连续空行为单个空行
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 10. 去除首尾空白
    text = text.strip()

    return text


async def generate_mp3(text: str, output_path: str) -> dict:
    """使用 edge-tts 生成 MP3 文件"""
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    if output_file.exists():
        output_file.unlink()

    communicate = edge_tts.Communicate(text, VOICE)
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
        clean_text = text.replace(" ", "").replace("\n", "").replace("\r", "")
        total_duration = len(clean_text) / 4.25

    return {
        "success": True,
        "file_path": str(output_file),
        "duration": round(total_duration, 2),
        "size_bytes": output_file.stat().st_size if output_file.exists() else 0,
    }


async def main():
    print("=" * 60)
    print("台风知识课程语音播报批量生成")
    print("=" * 60)

    if not TS_SOURCE.exists():
        print(f"错误：找不到源文件 {TS_SOURCE}")
        sys.exit(1)

    print(f"\n源文件: {TS_SOURCE}")
    print(f"输出目录: {AUDIO_DIR}")
    print(f"语音角色: {VOICE}\n")

    chapters = extract_raw_chapters(TS_SOURCE)
    print(f"共解析到 {len(chapters)} 个章节\n")

    total_pages = 0
    success_count = 0
    fail_count = 0
    results = []

    for chapter_idx, chapter in enumerate(chapters):
        chapter_title = chapter["title"]
        pages = split_pages(chapter["content"])
        print(f"[chapterIdx={chapter_idx}] {chapter_title} ({len(pages)} 页)")
        total_pages += len(pages)

        for page_idx, page_content in enumerate(pages):
            filename = f"10-{chapter_idx}-{page_idx}.mp3"
            output_path = AUDIO_DIR / filename

            # 清洗文本用于 TTS
            clean_text = clean_for_tts(page_content)
            text_length = len(clean_text.replace(" ", "").replace("\n", ""))

            if text_length == 0:
                print(f"  ├─ P{page_idx}: 跳过（清洗后无文本）")
                continue

            print(f"  ├─ P{page_idx}: {filename} ({text_length} 字符) ... ", end="", flush=True)

            try:
                result = await generate_mp3(clean_text, str(output_path))
                success_count += 1
                results.append({
                    "filename": filename,
                    "chapter": chapter_title,
                    "page": page_idx,
                    "duration": result["duration"],
                    "size_kb": round(result["size_bytes"] / 1024, 1),
                    "text_length": text_length,
                    "success": True,
                })
                print(f"OK ({result['duration']}s, {round(result['size_bytes']/1024, 1)}KB)")
            except Exception as e:
                fail_count += 1
                results.append({
                    "filename": filename,
                    "chapter": chapter_title,
                    "page": page_idx,
                    "success": False,
                    "error": str(e),
                })
                print(f"FAILED: {e}")

        print()

    print("=" * 60)
    print("生成结果汇总")
    print("=" * 60)
    print(f"\n总页数: {total_pages}")
    print(f"成功: {success_count}, 失败: {fail_count}\n")

    for r in results:
        if r["success"]:
            print(f"  ✅ {r['filename']} ({r['chapter']} P{r['page']}): {r['duration']}s, {r['size_kb']}KB")
        else:
            print(f"  ❌ {r['filename']} ({r['chapter']} P{r['page']}): {r['error']}")

    print(f"\n音频文件已保存至: {AUDIO_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())