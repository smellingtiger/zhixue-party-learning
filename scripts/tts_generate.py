import sys
import json
import asyncio
import argparse
from pathlib import Path
import edge_tts

async def generate_tts(text: str, output_path: str, voice: str = "zh-CN-XiaoxiaoNeural") -> dict:
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

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

    result = {
        "success": True,
        "file_path": str(output_file),
        "duration": round(total_duration, 2),
        "size_bytes": output_file.stat().st_size if output_file.exists() else 0,
    }
    return result


def main():
    parser = argparse.ArgumentParser(description="使用 edge-tts 生成中文语音")
    parser.add_argument("--text", required=True, help="要转语音的文本内容")
    parser.add_argument("--output", required=True, help="输出 MP3 文件路径")
    parser.add_argument("--voice", default="zh-CN-XiaoxiaoNeural",
                        help="语音角色 (默认: zh-CN-XiaoxiaoNeural)")
    args = parser.parse_args()

    try:
        result = asyncio.run(generate_tts(args.text, args.output, args.voice))
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()