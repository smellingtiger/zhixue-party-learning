import os

def get_folder_size(folder_path):
    """获取文件夹大小（GB）"""
    total_size = 0
    try:
        for dirpath, dirnames, filenames in os.walk(folder_path):
            for filename in filenames:
                try:
                    filepath = os.path.join(dirpath, filename)
                    total_size += os.path.getsize(filepath)
                except:
                    pass
    except:
        pass
    return round(total_size / (1024**3), 2)

def scan_directory(target_path):
    """扫描目录下各文件夹占用"""
    if not os.path.exists(target_path):
        print(f"路径不存在: {target_path}")
        return
    
    print(f"\n{'='*60}")
    print(f"扫描目录: {target_path}")
    print(f"{'='*60}")
    
    items = []
    try:
        for item in os.listdir(target_path):
            item_path = os.path.join(target_path, item)
            if os.path.isdir(item_path):
                print(f"正在扫描: {item}...")
                size_gb = get_folder_size(item_path)
                items.append({
                    'name': item,
                    'size_gb': size_gb
                })
    except Exception as e:
        print(f"扫描出错: {e}")
        return
    
    # 按大小排序
    items.sort(key=lambda x: x['size_gb'], reverse=True)
    
    # 打印结果
    print(f"\n{'文件夹名称':<50} {'占用(GB)':>10}")
    print(f"{'-'*50} {'-'*10}")
    for item in items:
        print(f"{item['name']:<50} {item['size_gb']:>10.2f}")
    
    total = sum(item['size_gb'] for item in items)
    print(f"{'-'*50} {'-'*10}")
    print(f"{'总计':<50} {total:>10.2f} GB")

# 扫描两个目录
scan_directory(r"E:\社院课程stt")
scan_directory(r"E:\PythonDemo")
