import json
from pathlib import Path

data = json.load(open(r'E:\社院课程stt\classification_result.json', encoding='utf-8'))
print(f'分类统计:')
print(json.dumps(data['categories'], ensure_ascii=False, indent=2))
print(f'\n更新条目数: {len(data["updates"])}')
