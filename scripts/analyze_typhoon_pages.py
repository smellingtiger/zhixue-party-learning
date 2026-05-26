import re

with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find chapter boundaries by looking for id: N, lines
ch_starts = []
ch_nums = []
for m in re.finditer(r'^\s*id:\s*(\d+),\s*$', content, re.MULTILINE):
    ch_starts.append(m.start())
    ch_nums.append(int(m.group(1)))

# Process each chapter
for i, ch_start in enumerate(ch_starts):
    ch_num = ch_nums[i]
    next_ch_start = ch_starts[i+1] if i+1 < len(ch_starts) else len(content)
    ch_text = content[ch_start:next_ch_start]
    
    # Extract title
    title_match = re.search(r"title:\s*'([^']+)'", ch_text)
    title = title_match.group(1) if title_match else 'Unknown'
    
    # Count pages
    page_count = ch_text.count('---PAGE---') + 1
    
    # Find IMAGE tags and which page they're on
    # Split content into pages
    content_match = re.search(r"content:\s*'", ch_text)
    if content_match:
        content_start = content_match.end()
        content_text = ch_text[content_start:]
        # Find the end of the content string (closing quote)
        # The content is a long single-quoted string
        pages = content_text.split('---PAGE---')
        
        images_info = []
        for pidx, page in enumerate(pages):
            imgs = re.findall(r'\[IMAGE:\s*([^\]]+)\]', page)
            for img in imgs:
                images_info.append((pidx, img))
        
        print(f"[{title}] (id:{ch_num}): {page_count} pages")
        for pidx, img in images_info:
            print(f"  Page {pidx}: IMAGE: {img[:120]}...")
        print()