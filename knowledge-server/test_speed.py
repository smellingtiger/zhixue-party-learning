import requests
import time

API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
API_URL = "https://api.siliconflow.cn/v1/chat/completions"

prompt = "请为以下5个段落生成小标题，直接返回JSON数组：\n1. 习近平新时代中国特色社会主义思想\n2. 坚持和发展中国特色社会主义\n3. 全面深化改革\n4. 全面依法治国\n5. 全面从严治党"

for model in ["deepseek-ai/DeepSeek-V3", "Pro/deepseek-ai/DeepSeek-V3.2"]:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 300,
        "temperature": 0.3,
    }
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    try:
        t = time.time()
        r = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        elapsed = time.time() - t
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"][:80]
            print(f"✅ {model}: {elapsed:.2f}s | {content}")
        else:
            print(f"❌ {model}: {r.status_code} {r.text[:80]}")
    except Exception as e:
        print(f"❌ {model}: {e}")
