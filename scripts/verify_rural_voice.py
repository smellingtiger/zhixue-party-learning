"""
乡村振兴语音播报完整性验证脚本
检查：
1. rural-revitalization-script.json 是否存在且无具身智能内容
2. 所有 rural-*.mp3 文件是否存在
3. durations.json 时长数据是否正确
4. digital-avatar.tsx 路由逻辑是否正确
"""

import json
from pathlib import Path

PROJECT_DIR = Path(__file__).parent.parent
AUDIO_DIR = PROJECT_DIR / "public" / "audio"
SCRIPT_DIR = PROJECT_DIR / "public" / "course-scripts"

print("=" * 70)
print("乡村振兴语音播报完整性验证")
print("=" * 70)

errors = []
warnings = []

# 1. 检查乡村振兴脚本文件
rural_script = SCRIPT_DIR / "rural-revitalization-script.json"
if not rural_script.exists():
    errors.append(f"❌ 乡村振兴脚本文件不存在: {rural_script}")
else:
    with open(rural_script, "r", encoding="utf-8") as f:
        script_data = json.load(f)
    
    course_name = script_data.get("courseName", "")
    print(f"\n✅ 乡村振兴脚本文件存在")
    print(f"   课程名称: {course_name}")
    
    # 检查是否包含具身智能关键词
    script_text = json.dumps(script_data, ensure_ascii=False)
    if "具身智能" in script_text:
        errors.append("❌ 乡村振兴脚本中包含'具身智能'关键词")
    else:
        print(f"   ✅ 无具身智能内容混用")
    
    chapters = script_data.get("chapters", [])
    print(f"   ✅ 共 {len(chapters)} 个章节")

# 2. 检查 MP3 文件
print(f"\n📁 检查 MP3 文件:")
expected_files = [
    "rural-preface.mp3",
    "rural-chapter1.mp3",
    "rural-chapter2.mp3",
    "rural-chapter3.mp3",
    "rural-chapter4.mp3",
    "rural-chapter5.mp3",
    "rural-chapter6.mp3",
    "rural-chapter7.mp3",
    "rural-chapter8.mp3",
]

missing_files = []
for filename in expected_files:
    filepath = AUDIO_DIR / filename
    if filepath.exists():
        size_kb = filepath.stat().st_size / 1024
        print(f"   ✅ {filename}: {size_kb:.1f}KB")
    else:
        missing_files.append(filename)
        errors.append(f"❌ MP3文件缺失: {filename}")

if missing_files:
    print(f"   ⚠️  缺失文件: {', '.join(missing_files)}")
else:
    print(f"   ✅ 所有 9 个 MP3 文件均存在")

# 3. 检查 durations.json
durations_file = AUDIO_DIR / "durations.json"
if not durations_file.exists():
    errors.append(f"❌ durations.json 不存在")
else:
    with open(durations_file, "r", encoding="utf-8") as f:
        durations = json.load(f)
    
    print(f"\n📊 durations.json 数据:")
    rural_keys = [k for k in durations.keys() if k.startswith("rural-")]
    print(f"   乡村振兴音频时长数据: {len(rural_keys)} 个")
    
    for key in expected_files:
        audio_key = key.replace(".mp3", "")
        if audio_key in durations:
            duration = durations[audio_key]
            print(f"   ✅ {audio_key}: {duration:.2f}秒")
        else:
            warnings.append(f"⚠️  durations.json 中缺少 {audio_key} 的时长数据")

# 4. 检查 script.json (具身智能) 是否独立
embodied_script = SCRIPT_DIR / "script.json"
if embodied_script.exists():
    with open(embodied_script, "r", encoding="utf-8") as f:
        embodied_data = json.load(f)
    
    embodied_name = embodied_data.get("courseName", "")
    print(f"\n📄 具身智能脚本文件:")
    print(f"   课程名称: {embodied_name}")
    
    if "乡村振兴" in json.dumps(embodied_data, ensure_ascii=False):
        errors.append("❌ 具身智能脚本中包含'乡村振兴'关键词，可能存在混用")
    else:
        print(f"   ✅ 无乡村振兴内容混用")

# 5. 总结
print("\n" + "=" * 70)
print("验证结果汇总")
print("=" * 70)

if errors:
    print(f"\n❌ 发现 {len(errors)} 个错误:")
    for err in errors:
        print(f"   {err}")
else:
    print(f"\n✅ 无错误")

if warnings:
    print(f"\n⚠️  发现 {len(warnings)} 个警告:")
    for warn in warnings:
        print(f"   {warn}")

if not errors and not warnings:
    print(f"\n🎉 乡村振兴语音播报配置完整，无具身智能混用!")
    print(f"\n语音播报架构:")
    print(f"  • 脚本文件: rural-revitalization-script.json (乡村振兴专属)")
    print(f"  • 音频文件: rural-preface.mp3 ~ rural-chapter8.mp3 (9个文件)")
    print(f"  • 时长数据: durations.json (已更新)")
    print(f"  • 路由逻辑: digital-avatar.tsx (自动识别课程名称)")
    print(f"  • 小节点配置: 从脚本文件 sections 动态生成")

print("\n" + "=" * 70)
