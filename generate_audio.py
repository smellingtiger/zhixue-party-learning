#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 course-scripts/script.json 读取课程数据，
使用 gTTS 为每个章节生成 MP3 音频文件，
保存到 public/audio/ 目录供前端播放。
"""

from gtts import gTTS
import json
import os
import re

SCRIPT_PATH = os.path.join('public', 'course-scripts', 'script.json')
AUDIO_DIR = os.path.join('public', 'audio')

os.makedirs(AUDIO_DIR, exist_ok=True)

with open(SCRIPT_PATH, 'r', encoding='utf-8') as f:
    course = json.load(f)

print(f"课程: {course['courseName']}")
print(f"章节数: {len(course['chapters'])}")
print()

for idx, chapter in enumerate(course['chapters']):
    chapter_id = chapter.get('id', f'chapter{idx}')
    filename = os.path.join(AUDIO_DIR, f'{chapter_id}.mp3')

    if chapter.get('content'):
        text = chapter['content']
    elif chapter.get('sections'):
        text = '\n\n'.join(
            f"{s['title']}。{s['content']}" for s in chapter['sections']
        )
    else:
        print(f"  跳过 {chapter_id} (无内容)")
        continue

    text = re.sub(r'\n{2,}', '\n\n', text.strip())

    print(f"正在生成: {chapter_id}.mp3 ({len(text)} 字)")
    tts = gTTS(text=text, lang='zh-cn', slow=False)
    tts.save(filename)
    print(f"  已保存: {filename}")

print()
print("全部音频文件生成完成！")
