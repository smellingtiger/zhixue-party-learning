import json

with open('public/course-scripts/typhoon-command-script.json', encoding='utf-8') as f:
    data = json.load(f)

ch = data['chapters'][3]
print(f'Chapter 3 content type: {type(ch["content"])}')
print(f'Chapter 3 content empty: {ch["content"] == ""}')
print(f'Chapter 3 content is truthy: {bool(ch["content"])}')
print(f'Chapter 3 sections count: {len(ch["sections"])}')

print('\ngetChapterSections would return:')
if ch["content"] or not ch["sections"]:
    print('  [] (空数组，因为content有值或sections不存在)')
else:
    print(f'  sections数组，共{len(ch["sections"])}个')
