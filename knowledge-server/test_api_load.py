"""通过具体文件ID测试API加载"""
import urllib.request
import json
import re
from pathlib import Path

txt_dir = Path(r"E:\社院课程\stt\knowledge_base_txt")

# 找一个确定存在的新文件
test_file = txt_dir / "GC02I0115015_1503.txt"
if not test_file.exists():
    # 尝试其他路径
    test_file = Path(r"E:\社院课程stt\knowledge_base_txt\GC02I0115015_1503.txt")

print(f"测试文件: {test_file}")
print(f"文件存在: {test_file.exists()}")
print()

# 1. 先获取文件列表
try:
    resp = urllib.request.urlopen('http://localhost:8080/api/files?sort=date')
    files_data = json.loads(resp.read())
    print(f"API返回总文件数: {files_data['total']}")
    
    # 找到目标文件
    target = None
    for f in files_data['files']:
        if 'GC02I0115015' in f.get('title', '') or 'GC02I0115015' in f.get('filename', ''):
            target = f
            break
    
    if target:
        print(f"\n找到目标文件:")
        print(f"  ID: {target['id']}")
        print(f"  标题: {target['title']}")
        print(f"  文件名: {target['filename']}")
        print(f"  分类: {target['category']}")
        print(f"  段落数(header): {target['paragraph_count']}")
        
        # 2. 获取详情
        print("\n获取详情...")
        resp_detail = urllib.request.urlopen(f"http://localhost:8080/api/files/{target['id']}")
        detail = json.loads(resp_detail.read())
        
        actual_segments = len(detail.get('segments', []))
        print(f"\n详情结果:")
        print(f"  实际段落数: {actual_segments}")
        print(f"  分类: {detail.get('category')}")
        
        if actual_segments > 0:
            print(f"\n前3个段落:")
            for i, seg in enumerate(detail['segments'][:3]):
                print(f"  {i+1}. {seg.get('title', '无标题')[:40]}")
                print(f"     时间: {seg.get('time', '无')}, 内容长度: {len(seg.get('content', ''))}字")
            print("\n✅ 文件加载成功!")
        else:
            print("\n❌ 段落为空 - 解析失败!")
            
            # 显示原始内容帮助调试
            if test_file.exists():
                content = test_file.read_text(encoding='utf-8')
                lines = content.split('\n')
                print(f"\n原始文件前20行:")
                for i, l in enumerate(lines[:20]):
                    print(f"  L{i+1}: {l[:70]}")
    else:
        print(f"\n未在API列表中找到 GC02I0115015")
        print(f"\n最新10个文件:")
        for f in files_data['files'][:10]:
            print(f"  {f['title']} (分类:{f['category']}, 段落:{f['paragraph_count']})")
            
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
