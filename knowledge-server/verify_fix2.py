"""验证修复后的知识服务"""
import urllib.request
import json
import time

time.sleep(2)

# 测试修复后的解析
try:
    resp = urllib.request.urlopen('http://localhost:8080/api/info')
    data = json.loads(resp.read())
    print('修复后知识库服务状态')
    print(f"总文件数: {data['total_files']}")
    print(f"总段落数: {data['total_paragraphs']}")
    print()
    print('分类统计')
    for cat in data['categories']:
        cats_count = data['category_counts'][cat]
        paras_count = data['category_paragraph_counts'].get(cat, 0)
        print(f"  {cat}: {cats_count} 课程, {paras_count} 段落")
    print()
    print(f"未分类课程: {data['category_counts'].get('未分类', 0)}")
    print(f"未分类段落: {data['category_paragraph_counts'].get('未分类', 0)}")
    
    # 测试加载几个新导入的文件
    print("\n测试加载新导入文件")
    resp_files = urllib.request.urlopen('http://localhost:8080/api/files?q=GC02I0115015_1503')
    files_data = json.loads(resp_files.read())
    
    if files_data['files']:
        for f in files_data['files'][:3]:
            resp_detail = urllib.request.urlopen(f"http://localhost:8080/api/files/{f['id']}")
            detail = json.loads(resp_detail.read())
            print(f"  文件: {f['title'][:40]}, 段落数={len(detail.get('segments', []))}, 分类={detail.get('category', '未知')}")
            if detail.get('segments'):
                print(f"    第一段: {detail['segments'][0]['title'][:30]}")
except Exception as e:
    print(f"测试失败: {e}")
