from pathlib import Path
import sys
sys.path.insert(0, 'd:/TraeProject/zhixue-party-learning/knowledge-server')
from process_courses import process_single_course

test_file = Path(r'E:\社院课程stt\knowledge_base_txt\2018年政府工作报告.txt')
success = process_single_course(test_file)
print(f'\n测试完成: 成功={success}')
