"""测试单门课程LLM生成标题效果"""

import re
import json
import asyncio
import aiohttp
from pathlib import Path

KNOWLEDGE_BASE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
TEST_FILE = KNOWLEDGE_BASE_DIR / "2018年政府工作报告.txt"

API_BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Flash"

PROMPT = """你是一个课程大纲编辑专家。请为以下课程段落生成简短、精炼的小标题。

要求：
1. 每个小标题不超过12个汉字
2. 小标题要准确概括段落核心内容
3. 风格要正式、学术化
4. 保持标题的简洁性和可读性
5. 直接返回JSON数组，不要其他内容

课程名称：2018年政府工作报告

段落内容（需要生成标题）：
[
  {
    "index": 0,
    "original_title": "各位代表现在我代表国务院向大会报告",
    "content": "各位代表：现在，我代表国务院，向大会报告政府工作，请予审议，并请全国政协各位委员提出意见。"
  },
  {
    "index": 1,
    "original_title": "铁网络电子商务移动服务共享经济等引领世界潮流",
    "content": "五年来，经济实力跃上新台阶。国内生产总值从54万亿元增加到82.7万亿元，年均增长7.1%，占世界经济比重从11.4%提高到15%左右，对世界经济增长贡献率超过30%。财政收入增加到17.3万亿元。铁路运营里程从9.8万公里增加到12.7万公里，其中高铁从1.6万公里增加到2.5万公里，占世界高铁总量的66.3%。电子商务、移动支付、共享经济等引领世界潮流。"
  },
  {
    "index": 2,
    "original_title": "脱贫攻坚取得决定性进展贫困人口减少6800多万",
    "content": "脱贫攻坚取得决定性进展，贫困人口减少6800多万，易地扶贫搬迁830万人，贫困发生率由10.2%下降到3.1%。"
  }
]

请以以下JSON格式返回：
[
  {"title": "小标题1"},
  {"title": "小标题2"},
  {"title": "小标题3"}
]
"""


async def test_llm():
    print("="*50)
    print("  测试LLM生成段落标题")
    print("="*50)
    print()

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": PROMPT}],
        "temperature": 0.3,
        "max_tokens": 500,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{API_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=aiohttp.ClientTimeout(total=60)
        ) as response:
            if response.status == 200:
                data = await response.json()
                content = data["choices"][0]["message"]["content"].strip()
                print("LLM响应:")
                print(content)
                print()

                # 尝试解析
                try:
                    titles = json.loads(content)
                    print("解析成功!")
                    print(f"生成了 {len(titles)} 个标题:")
                    for i, t in enumerate(titles):
                        print(f"  {i+1}. {t['title']}")
                except json.JSONDecodeError:
                    # 尝试从代码块中提取
                    import re
                    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
                    if match:
                        try:
                            titles = json.loads(match.group(1))
                            print("从代码块解析成功!")
                            for i, t in enumerate(titles):
                                print(f"  {i+1}. {t['title']}")
                        except:
                            print("解析失败")
                    else:
                        print("解析失败")
            else:
                error_text = await response.text()
                print(f"API错误 {response.status}: {error_text}")


if __name__ == "__main__":
    asyncio.run(test_llm())