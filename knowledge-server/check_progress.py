"""监控批量生成标题的进度"""

import json
from pathlib import Path

OUTPUT_DIR = Path(r"E:\社院课程stt\knowledge_base_titles")

def check_progress():
    if not OUTPUT_DIR.exists():
        print("输出目录不存在")
        return

    json_files = list(OUTPUT_DIR.glob("*.json"))
    total = 565
    processed = len(json_files)

    print(f"=" * 50)
    print(f"  批量生成标题进度监控")
    print(f"=" * 50)
    print(f"已完成: {processed}/{total} ({processed/total*100:.1f}%)")
    print()

    if processed > 0:
        print("已处理的课程:")
        for i, f in enumerate(sorted(json_files)[:10]):
            print(f"  {i+1}. {f.stem}")
        if processed > 10:
            print(f"  ... 还有 {processed-10} 个")

        # 检查第一个文件的内容
        first = sorted(json_files)[0]
        data = json.loads(first.read_text(encoding="utf-8"))
        print(f"\n示例 - {data['course_name']}:")
        for i, seg in enumerate(data['segments'][:5]):
            print(f"  {i+1}. [{seg.get('title', '无')}]")
        if len(data['segments']) > 5:
            print(f"  ... 共 {len(data['segments'])} 个段落")

    print()
    print(f"=" * 50)

if __name__ == "__main__":
    check_progress()