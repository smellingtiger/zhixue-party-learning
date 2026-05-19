"""
公务员在线学习平台 - 课程分类脚本
按照公务员培训标准,为2560门课程重新分类
"""

import os
import re
import json
from pathlib import Path

TXT_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")

# 公务员在线学习分类体系
# 每个分类包含关键词列表,用于匹配课程名称和内容
CATEGORIES = {
    "政治理论": {
        "description": "党的创新理论、新时代中国特色社会主义思想、马克思主义理论等",
        "keywords": [
            "习近平", "新时代", "中国特色社会主义", "马克思主义", "共产党", 
            "党建", "党风", "党性", "党支部", "党委", "党组",
            "思想政治", "四个自信", "四个意识", "两个维护", "两个确立",
            "二十大", "十九大", "十八大", "党代会", "全会精神",
            "不忘初心", "牢记使命", "主题教育", "党史", "新中国史",
            "改革开放史", "社会主义发展史", "四史",
            "中国梦", "伟大复兴", "理想信念", "共产主义",
            "马克思", "恩格斯", "列宁", "毛泽东思想", "邓小平理论",
            "三个代表", "科学发展观",
            "政治理论", "政治建设", "政治能力",
        ]
    },
    "法律法规": {
        "description": "宪法法律、行政法规、法治政府建设、执法规范等",
        "keywords": [
            "宪法", "法律", "法规", "法治", "立法", "司法", "执法",
            "民法典", "刑法", "行政法", "行政许可", "行政处罚",
            "依法行政", "法治政府", "法治社会", "依法治国",
            "权利义务", "合同", "物权", "侵权责任",
            "诉讼", "仲裁", "调解", "公证",
            "法理学", "法理学", "法学",
            "公务员法", "行政处罚法", "行政复议法",
        ]
    },
    "经济管理": {
        "description": "宏观经济、产业发展、财政金融、区域经济发展等",
        "keywords": [
            "经济", "产业", "财政", "金融", "税收", "预算",
            "宏观经济", "微观经济", "市场经济", "计划经济",
            "供给侧", "需求侧", "双循环", "新发展格局",
            "GDP", "增长", "通胀", "通缩", "货币政策", "财政政策",
            "银行业", "保险业", "证券", "股票", "债券",
            "国有企业", "民营企业", "外资", "营商环境",
            "乡村振兴", "三农", "农业", "农村", "农民",
            "城镇化", "城镇化建设", "城乡规划",
            "一带一路", "自贸区", "对外开放", "进出口", "贸易",
            "数字经济", "互联网", "大数据", "人工智能", "区块链",
            "创新驱动", "科技创新", "高技术", "制造业",
        ]
    },
    "社会治理": {
        "description": "基层治理、公共服务、应急管理、社会保障等",
        "keywords": [
            "治理", "基层", "社区", "村庄", "乡村治理",
            "公共服务", "社会保障", "医保", "社保", "养老",
            "教育", "医疗", "就业", "住房", "民生",
            "应急管理", "防灾减灾", "安全生产", "突发事件",
            "信访", "维稳", "矛盾纠纷", "调解",
            "网格化", "精细化", "智慧社区",
            "城市治理", "城管", "环境治理", "污染防治",
            "生态文明", "绿水青山", "碳达峰", "碳中和",
            "环境保护", "绿色发展", "可持续发展",
        ]
    },
    "党建实务": {
        "description": "党组织建设、党员教育管理、干部选拔任用等",
        "keywords": [
            "党建", "党组织", "党支部", "党委", "党组",
            "党员", "党员教育", "党员管理", "发展党员",
            "干部", "干部选拔", "干部任用", "干部考核",
            "组织生活", "三会一课", "主题党日", "民主生活会",
            "组织生活会", "民主评议党员",
            "党支部建设", "标准化", "规范化",
            "党务工作", "党费", "党籍",
            "群团工作", "工会", "共青团", "妇联",
            "统一战线", "政协", "民主党派",
        ]
    },
    "文化建设": {
        "description": "文化自信、传统文化、精神文明、意识形态等",
        "keywords": [
            "文化", "文明", "意识形态", "价值观", "核心价值",
            "传统文化", "中华文明", "民族文化", "地域文化",
            "精神文明", "道德建设", "文明创建",
            "文艺", "文学", "艺术", "影视", "出版",
            "媒体", "宣传", "舆论", "网络", "新媒体",
            "文化自信", "文化软实力", "文化强国",
            "红色文化", "革命文化", "社会主义先进文化",
            "历史", "古代", "近代", "现代史",
        ]
    },
    "国际视野": {
        "description": "国际形势、外交政策、全球治理、比较政治等",
        "keywords": [
            "国际", "外交", "全球", "世界", "大国关系",
            "联合国", "G20", "APEC", "金砖", "上合",
            "一带一路", "人类命运共同体",
            "国际关系", "地缘政治", "国际法",
            "美国", "欧洲", "俄罗斯", "日本", "韩国",
            "发展中国家", "新兴市场",
            "全球化", "逆全球化", "多边主义",
            "国际经济", "国际贸易", "国际金融",
        ]
    },
    "廉政建设": {
        "description": "党风廉政建设、反腐败、监督执纪、纪律教育等",
        "keywords": [
            "廉政", "反腐", "反腐败", "纪律", "监督",
            "党风廉政建设", "全面从严治党", "四风",
            "中央八项规定", "廉洁自律", "纪律处分",
            "监察", "巡视", "巡察", "审计",
            "腐败", "贪污", "受贿", "渎职",
            "警示", "以案促改", "廉政教育",
            "作风建设", "官僚主义", "形式主义",
        ]
    },
    "业务能力": {
        "description": "行政能力、沟通协调、调查研究、群众工作等",
        "keywords": [
            "能力", "技能", "业务", "行政", "管理",
            "沟通", "协调", "调研", "研究", "分析",
            "决策", "执行", "落实", "督查", "考核",
            "公文", "写作", "报告", "汇报", "总结",
            "群众工作", "群众路线", "联系群众",
            "服务意识", "服务水平", "服务质量",
            "创新", "改革", "优化", "提升",
            "应急处理", "危机管理", "风险防控",
        ]
    },
    "统一战线": {
        "description": "统一战线理论、民族宗教、港澳台侨、新的社会阶层等",
        "keywords": [
            "统战", "统一战线", "民族团结", "民族政策",
            "宗教", "宗教工作", "宗教政策",
            "港澳台", "一国两制", "祖国统一",
            "侨务", "华侨", "归侨", "侨眷",
            "新的社会阶层", "民营经济人士", "自由职业者",
            "党外知识分子", "民主党派", "无党派",
            "政协", "协商", "参政议政",
            "民族区域自治", "民族工作",
        ]
    },
}

# 分类优先级(关键词匹配时,优先级高的分类优先匹配)
CATEGORY_PRIORITY = [
    "廉政建设",    # 廉政类关键词优先
    "党建实务",    # 党建类次之
    "政治理论",    # 政治理论
    "法律法规",    # 法律
    "统一战线",    # 统战
    "国际视野",    # 国际
    "经济管理",    # 经济
    "社会治理",    # 社会治理
    "文化建设",    # 文化
    "业务能力",    # 业务能力
]


def classify_course(course_name: str, content: str) -> str:
    """根据课程名称和内容分类"""
    
    # 合并名称和内容用于匹配
    text = (course_name + " " + content[:2000]).lower()
    
    # 统计每个分类的匹配得分
    scores = {}
    
    for cat in CATEGORY_PRIORITY:
        cat_config = CATEGORIES[cat]
        score = 0
        
        for keyword in cat_config["keywords"]:
            keyword_lower = keyword.lower()
            # 名称中的关键词权重更高
            if keyword_lower in course_name.lower():
                score += 3
            # 内容中的关键词
            if keyword_lower in text:
                score += 1
        
        if score > 0:
            scores[cat] = score
    
    if not scores:
        return "未分类"
    
    # 返回得分最高的分类
    return max(scores, key=scores.get)


def reclassify_all():
    """重新分类所有课程"""
    
    print("=" * 60)
    print("公务员在线学习平台 - 课程分类系统")
    print("=" * 60)
    
    txt_files = sorted(TXT_DIR.glob("*.txt"))
    print(f"\n发现 {len(txt_files)} 个课程文件")
    
    # 分类结果统计
    new_categories = {}
    # 存储每个课程的新分类
    updates = []
    
    for i, txt_file in enumerate(txt_files):
        if (i + 1) % 100 == 0:
            print(f"处理中: {i + 1}/{len(txt_files)}")
        
        try:
            content = txt_file.read_text(encoding="utf-8")
            
            # 提取课程名称
            course_name = ""
            old_category = ""
            
            for line in content.split("\n")[:6]:
                m = re.search(r"【课程名称】(.+)", line)
                if m:
                    course_name = m.group(1).strip()
                m = re.search(r"【课程分类】(.+)", line)
                if m:
                    old_category = m.group(1).strip()
            
            if not course_name:
                course_name = txt_file.stem
            
            # 智能分类
            new_category = classify_course(course_name, content)
            
            # 统计
            new_categories[new_category] = new_categories.get(new_category, 0) + 1
            
            updates.append({
                "file": txt_file.name,
                "course_name": course_name,
                "old_category": old_category,
                "new_category": new_category,
            })
            
        except Exception as e:
            print(f"处理 {txt_file.name} 时出错: {e}")
            new_categories["未分类"] = new_categories.get("未分类", 0) + 1
    
    # 打印分类结果
    print("\n" + "=" * 60)
    print("分类完成!")
    print("=" * 60)
    
    print("\n新分类统计:")
    for cat in CATEGORY_PRIORITY:
        count = new_categories.get(cat, 0)
        if count > 0:
            print(f"  {cat}: {count}")
    
    if new_categories.get("未分类", 0) > 0:
        print(f"  未分类: {new_categories['未分类']}")
    
    print(f"\n总计: {sum(new_categories.values())}")
    
    # 保存分类结果
    result_file = TXT_DIR.parent / "classification_result.json"
    with open(result_file, "w", encoding="utf-8") as f:
        json.dump({
            "categories": new_categories,
            "updates": updates,
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n分类结果已保存到: {result_file}")
    
    return updates, new_categories


if __name__ == "__main__":
    reclassify_all()
