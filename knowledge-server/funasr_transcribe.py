"""
FUNASR本地语音转写脚本
用于在FUNASR HTTP服务不可用时，直接调用本地FUNASR模型进行转写
"""

import sys
import json
import time
from pathlib import Path

def transcribe_with_funasr(audio_path: str, output_path: str):
    """
    使用本地FUNASR进行语音转写
    
    参数:
        audio_path: 音频文件路径
        output_path: 输出JSON文件路径
    """
    try:
        from funasr import AutoModel
        
        print(f"正在加载FUNASR模型...")
        print("进度: 5%")
        
        model = AutoModel(
            model="paraformer-zh",
            vad_model="fsmn-vad",
            punc_model="ct-punc",
            device="cuda:0",
        )
        
        print(f"开始转写: {audio_path}")
        print("进度: 15%")
        
        result = model.generate(
            input=audio_path,
            batch_size_s=300,
            hotword="",
        )
        
        print("进度: 85%")
        
        paragraphs = []
        if result and len(result) > 0:
            res = result[0]
            text = res.get("text", "")
            
            sentences = text.split("。")
            current_time = 0.0
            
            for i, sentence in enumerate(sentences):
                sentence = sentence.strip()
                if not sentence:
                    continue
                
                duration = 3.0
                paragraphs.append({
                    "paragraph_index": i + 1,
                    "start_time_second": current_time,
                    "end_time_second": current_time + duration,
                    "content": sentence + "。",
                })
                current_time += duration
        
        print("进度: 95%")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(paragraphs, f, ensure_ascii=False, indent=2)
        
        print(f"转写完成，共{len(paragraphs)}段")
        print("进度: 100%")
        
    except ImportError:
        print("错误: FUNASR未安装，请运行: pip install funasr", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"转写失败: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python funasr_transcribe.py <音频路径> <输出JSON路径>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not Path(audio_file).exists():
        print(f"错误: 音频文件不存在: {audio_file}")
        sys.exit(1)
    
    transcribe_with_funasr(audio_file, output_file)
