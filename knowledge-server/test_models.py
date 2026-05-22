import requests
import time

API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
API_URL = "https://api.siliconflow.cn/v1/chat/completions"

prompt = """请为以下3个段落生成小标题，直接返回JSON数组[{"index":0,"title":"标题"}]:
1. 习近平新时代中国特色社会主义思想是当代中国马克思主义
2. 坚持和发展中国特色社会主义是实现中华民族伟大复兴的必由之路
3. 全面深化改革是决定当代中国命运的关键一招"""

models = [
    "Qwen/Qwen2.5-7B-Instruct",
    "deepseek-ai/DeepSeek-V3",
    "THUDM/glm-4-9b-chat",
    "deepseek-ai/DeepSeek-V4-Flash",
]

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

for model in models:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 200,
        "temperature": 0.3,
    }
    try:
        t = time.time()
        r = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        elapsed = time.time() - t
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"][:100]
            print(f"✓ {model}: {elapsed:.1f}s -> {content}")
        else:
            print(f"✗ {model}: {elapsed:.1f}s -> ERR {r.status_code} {r.text[:80]}")
    except Exception as e:
        print(f"✗ {model}: 超时/异常 -> {e}")
