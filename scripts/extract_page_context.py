import re

with open('src/app/ai-course/typhoon-command-course-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

data_match = re.search(r'rawData.*?chapters:\s*\[', content, re.DOTALL)
if data_match:
    data_start = data_match.start()
    ch_parts = content[data_start:].split("content: ")
    
    for i, part in enumerate(ch_parts[1:6], 1):
        first_page = part.split("---PAGE---")[0] if "---PAGE---" in part else part
        first_page = first_page.strip().strip("'").strip()
        first_page = re.sub(r"\\n", " ", first_page)
        first_page = re.sub(r'\\([^n])', "", first_page)
        print(f"== Ch{i} first page (first 300 chars):")
        print(first_page[:300])
        print()
        
        # Find the specific page for each IMAGE
        pages = [p for p in part.split("---PAGE---") if p.strip()]
        img_count = 0
        for pi, page in enumerate(pages):
            imgs = re.findall(r'\[IMAGE:\s*([^\]]+)\]', page)
            if imgs:
                for img_text in imgs:
                    img_count += 1
                    page_text = page.strip().strip("'").strip()
                    page_text = re.sub(r"\\n", " ", page_text)
                    page_text = re.sub(r"\[IMAGE:[^\]]+\]", "", page_text)
                    page_text = re.sub(r'\\([^n])', "", page_text)
                    print(f"  IMG {img_count} (Page {pi}):")
                    print(f"  Page content: {page_text[:250]}...")
                    print()