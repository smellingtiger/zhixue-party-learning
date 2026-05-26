import re
import json

with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

IMAGE_RE = re.compile(r'\[IMAGE:\s*([^\]]+)\]')

# Extract chapter content blocks by finding "content: '" and reading until the next chapter
# Strategy: Find all chapter id markers, then find all IMAGE patterns in the file,
# and determine which chapter each IMAGE belongs to by position

# Find all chapter boundaries: line positions of "id: N," at start of lines
chapter_positions = []
for m in re.finditer(r'^\s*id:\s*(\d+),\s*$', content, re.MULTILINE):
    ch_id = int(m.group(1))
    chapter_positions.append((m.start(), ch_id))

print(f"Found {len(chapter_positions)} chapters: {[c[1] for c in chapter_positions]}")

# Find all IMAGE patterns with positions
image_matches = list(IMAGE_RE.finditer(content))
print(f"Found {len(image_matches)} IMAGE patterns")

# Assign each IMAGE to a chapter based on position
images = []
image_counters = {}

for img_match in image_matches:
    img_pos = img_match.start()
    prompt = img_match.group(1).strip()
    
    # Find which chapter this IMAGE belongs to
    ch_id = None
    for i in range(len(chapter_positions)):
        ch_start, ch_numeric_id = chapter_positions[i]
        next_ch_start = chapter_positions[i+1][0] if i+1 < len(chapter_positions) else len(content)
        if ch_start <= img_pos < next_ch_start:
            ch_id = ch_numeric_id
            break
    
    if ch_id is None:
        print(f"  WARNING: Could not determine chapter for IMAGE at pos {img_pos}")
        continue
    
    chapter_idx = ch_id - 1  # bakeImagePaths uses 0-based
    
    if chapter_idx not in image_counters:
        image_counters[chapter_idx] = 0 if chapter_idx == 0 else 1
    else:
        image_counters[chapter_idx] += 1
    
    counter = image_counters[chapter_idx]
    filename = f'11-{chapter_idx}-{counter}.png'
    path = f'public/knowledge-images/{filename}'
    images.append({
        'filename': filename,
        'path': path,
        'prompt': prompt,
        'chapter': chapter_idx,
        'counter': counter
    })
    print(f"Chapter {chapter_idx} (id:{ch_id}), Image {counter}: {filename}")
    print(f"  Prompt: {prompt[:200]}")
    print()

print(f"\n=== Total images: {len(images)} ===")

json_path = 'scripts/typhoon_command_images.json'
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(images, f, ensure_ascii=False, indent=2)
print(f"Saved to {json_path}")