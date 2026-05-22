import requests
import time
import json

API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
API_URL = "https://api.siliconflow.cn/v1/chat/completions"

prompt = """请为以下2个段落生成小标题，直接返回JSON数组[{"index":0,"title":"标题"}]:
1. 习近平新时代中国特色社会主义思想是当代中国马克思主义
2. 坚持和发展中国特色社会主义是实现中华民族伟大复兴的必由之路"""

headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

for model in ["deepseek-ai/DeepSeek-V4-Flash", "deepseek-ai/DeepSeek-V3"]:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 200,
        "temperature": 0.3,
    }
    try:
        t = time.time()
        r = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        elapsed = time.time() - t
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"][:150]
            print(f"OK {model}: {elapsed:.1f}s -> {content}")
        else:
            print(f"ERR {model}: {elapsed:.1f}s -> {r.status_code} {r.text[:80]}")
    except Exception as e:
        print(f"FAIL {model}: {e}")

# 测试5段内容的V4-Flash
prompt5 = """请为以下5个段落生成小标题，直接返回JSON数组[{"index":0,"title":"标题"}]:
1. 习近平新时代中国特色社会主义思想是当代中国马克思主义，是中华文化和中国精神的时代精华
2. 坚持和发展中国特色社会主义是实现中华民族伟大复兴的必由之路
3. 全面深化改革是决定当代中国命运的关键一招
4. 全面依法治国是国家治理的一场深刻革命
5. 全面从严治党是党永葆生机活力的根本保证"""

payload5 = {
    "model": "deepseek-ai/DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": prompt5}],
    "max_tokens": 300,
    "temperature": 0.3,
}
try:
    t = time.time()
    r = requests.post(API_URL, headers=headers, json=payload5, timeout=120)
    elapsed = time.time() - t
    if r.status_code == 200:
        content = r.json()["choices"][0]["message"]["content"][:200]
        print(f"OK V4-Flash 5段: {elapsed:.1f}s -> {content}")
    else:
        print(f"ERR V4-Flash 5段: {elapsed:.1f}s -> {r.status_code}")
except Exception as e:
    print(f"FAIL V4-Flash 5段: {e}")
