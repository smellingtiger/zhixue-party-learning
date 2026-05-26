import json

# 读取 script JSON
with open('public/course-scripts/typhoon-command-script.json', 'r', encoding='utf-8') as f:
    script = json.load(f)

# 读取 course-data.ts 中的 slides 数量
# 我们需要确认 script.json 中每章的 sections 数量是否与 course-data.ts 中每章的 slides 数量匹配

print("=" * 80)
print("验证 script.json sections 与 course-data.ts slides 的映射关系")
print("=" * 80)

# course-data.ts 中的 slides 数量（从之前的分析结果）
course_slides = {
    0: 2,   # 前言：2页
    1: 11,  # 第1章：11页
    2: 12,  # 第2章：12页
    3: 17,  # 第3章：17页
    4: 21,  # 第4章：21页
}

# script.json 中的 sections 数量
for ch_idx, ch in enumerate(script['chapters']):
    sections = ch.get('sections', [])
    expected = course_slides.get(ch_idx, 0)
    # 前言不分 section，所以 expected=2 但 sections=0 是正确的
    is_preface = ch_idx == 0
    
    match = "✅" if (is_preface and len(sections) == 0) or len(sections) == expected else "❌"
    status = "前言不分section" if is_preface else f"应有 {expected} 个 section"
    
    print(f"\n第{ch_idx}章: {ch['title']}")
    print(f"  course-data slides: {expected} 页")
    print(f"  script.json sections: {len(sections)} 个 ({status})")
    print(f"  匹配: {match}")
    
    if not is_preface:
        # 打印 sections 与 slides 的对应关系
        print(f"  映射关系:")
        for s_idx, sec in enumerate(sections):
            print(f"    section[{s_idx}] = {sec['title']}")
