import json

mapping = json.load(open('course_name_mapping.json', encoding='utf-8'))
print(f'DSPTXYZY20041710 在映射中: {mapping.get("DSPTXYZY20041710", "未找到")}')

# 查找包含20041710的编码
for code, name in mapping.items():
    if '20041710' in code:
        print(f'找到: {code} -> {name}')
