import asyncio
import edge_tts
import json
import os
import re

CHAPTER_IDS = ['preface', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6', 'chapter7', 'chapter8']
VOICE = "zh-CN-YunxiNeural"
AUDIO_DIR = os.path.join('public', 'audio')
SCRIPT_PATH = os.path.join('public', 'course-scripts', 'script.json')

os.makedirs(AUDIO_DIR, exist_ok=True)

with open(SCRIPT_PATH, 'r', encoding='utf-8') as f:
    course = json.load(f)

existing = set(os.listdir(AUDIO_DIR))

async def generate(chapter_id, text):
    filename = os.path.join(AUDIO_DIR, f'{chapter_id}.mp3')
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(filename)
    return filename

async def main():
    print(f"课程: {course['courseName']}")
    print(f"章节总数: {len(course['chapters'])}")
    print()

    for idx, chapter in enumerate(course['chapters']):
        chapter_id = CHAPTER_IDS[idx] if idx < len(CHAPTER_IDS) else f'chapter{idx}'
        fname = f'{chapter_id}.mp3'

        if chapter.get('content'):
            text = chapter['content']
        elif chapter.get('sections'):
            text = '\n\n'.join(f"{s['title']}。{s['content']}" for s in chapter['sections'])
        else:
            print(f"  跳过 {chapter_id} (无内容)")
            continue

        text = re.sub(r'\n{2,}', '\n\n', text.strip())
        print(f"正在生成: {fname} ({len(text)} 字) ...", end='', flush=True)

        try:
            await generate(chapter_id, text)
            print(" OK")
        except Exception as e:
            print(f" FAILED: {e}")

    print()
    print("全部完成！重新生成 durations.json ...")

    from mutagen.mp3 import MP3
    durations = {}
    for f in sorted(os.listdir(AUDIO_DIR)):
        if f.endswith('.mp3'):
            try:
                mp3 = MP3(os.path.join(AUDIO_DIR, f))
                durations[f.replace('.mp3','')] = round(mp3.info.length, 2)
            except:
                pass
    with open(os.path.join(AUDIO_DIR, 'durations.json'), 'w', encoding='utf-8') as f:
        json.dump(durations, f, ensure_ascii=False, indent=2)
    for k, v in durations.items():
        print(f"  {k}: {v}s")

asyncio.run(main())
