import json
import urllib.request
import urllib.parse
import os
import time
import sys

os.makedirs('public/knowledge-images', exist_ok=True)

with open('scripts/typhoon_command_images.json', 'r', encoding='utf-8') as f:
    all_images = json.load(f)

# Filter out false matches - only keep chapters 0-4 (the actual course chapters)
images = [img for img in all_images if img['chapter'] < 5]

print(f"Generating {len(images)} images for typhoon command course...\n")

API_BASE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

success_count = 0
fail_count = 0

for i, img in enumerate(images):
    filename = os.path.join('public/knowledge-images', img['filename'])
    
    if os.path.exists(filename):
        print(f"[{i+1}/{len(images)}] SKIP: {img['filename']} already exists")
        success_count += 1
        continue
    
    # Choose image size based on content type
    prompt_lower = img['prompt'].lower()
    is_architecture = any(kw in prompt_lower for kw in ['架构图', '体系图', '网络图', '拓扑图', '流程图'])
    is_scene = any(kw in prompt_lower for kw in ['摄影', '场景', '纪实'])
    
    if is_architecture:
        image_size = 'landscape_16_9'
    elif is_scene:
        image_size = 'landscape_16_9'
    else:
        image_size = 'landscape_16_9'
    
    # Build English-enhanced prompt for better SDXL results
    full_prompt = img['prompt'] + ', high quality, detailed, professional illustration'
    
    encoded_prompt = urllib.parse.quote(full_prompt, safe='')
    url = f"{API_BASE}?prompt={encoded_prompt}&image_size={image_size}"
    
    print(f"[{i+1}/{len(images)}] Generating: {img['filename']}")
    print(f"  Size: {image_size}")
    print(f"  Prompt: {img['prompt'][:100]}...")
    
    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        
        with urllib.request.urlopen(req, timeout=120) as response:
            img_data = response.read()
            
        if len(img_data) < 1000:
            print(f"  ERROR: Response too small ({len(img_data)} bytes), may not be an image")
            fail_count += 1
            continue
            
        with open(filename, 'wb') as f:
            f.write(img_data)
        
        file_size_kb = len(img_data) / 1024
        print(f"  OK: Saved {filename} ({file_size_kb:.1f} KB)")
        success_count += 1
        
    except Exception as e:
        print(f"  ERROR: {e}")
        fail_count += 1
    
    # Rate limiting between requests
    if i < len(images) - 1:
        time.sleep(2)

print(f"\n=== Done: {success_count} success, {fail_count} failed ===")