import os
import glob

target_path = r"E:\社院课程stt\新建文件夹"

print(f"扫描目录: {target_path}\n")
print("="*80)

# 获取所有文件和子文件夹
total_files = 0
total_size = 0
video_extensions = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.wmv', '.webm']
audio_extensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac']

# 列出所有子文件夹
print("\n子文件夹列表:")
print("-"*80)

if os.path.exists(target_path):
    subdirs = [d for d in os.listdir(target_path) if os.path.isdir(os.path.join(target_path, d))]
    
    for subdir in sorted(subdirs):
        subdir_path = os.path.join(target_path, subdir)
        print(f"\n📁 {subdir}")
        
        # 获取该子文件夹中的文件
        files = []
        for root, dirs, filenames in os.walk(subdir_path):
            for filename in filenames:
                files.append(filename)
        
        # 统计文件类型
        video_count = sum(1 for f in files if os.path.splitext(f)[1].lower() in video_extensions)
        audio_count = sum(1 for f in files if os.path.splitext(f)[1].lower() in audio_extensions)
        other_count = len(files) - video_count - audio_count
        
        # 获取文件夹大小
        size = 0
        for root, dirs, filenames in os.walk(subdir_path):
            for filename in filenames:
                try:
                    filepath = os.path.join(root, filename)
                    size += os.path.getsize(filepath)
                except:
                    pass
        
        size_gb = round(size / (1024**3), 2)
        
        print(f"   文件数: {len(files)} (视频: {video_count}, 音频: {audio_count}, 其他: {other_count})")
        print(f"   大小: {size_gb} GB")
        
        # 列出前5个视频/音频文件
        media_files = [f for f in files if os.path.splitext(f)[1].lower() in video_extensions + audio_extensions]
        if media_files:
            print(f"   媒体文件示例:")
            for f in media_files[:5]:
                ext = os.path.splitext(f)[1]
                print(f"      - {f}")
            if len(media_files) > 5:
                print(f"      ... 还有 {len(media_files) - 5} 个文件")

print("\n" + "="*80)
print("\n判断建议:")
print("- 如果是视频文件（.mp4, .avi等），通常是待转写的课程视频")
print("- 如果是音频文件（.mp3, .wav等），可能是已转写提取的音频或待转写音频")
print("- 如果是文本文件（.txt, .srt等），可能是转写后的字幕/文稿")
