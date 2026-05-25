export const forestFireGraphData = {
  id: 'forest-fire',
  label: '森林火灾',
  type: 'root',
  description: '森林火灾防灾减灾知识体系',
  children: [
    {
      id: 'fire-grade-by-area',
      label: '火灾分级（受害面积）',
      type: 'category',
      description: '按受害森林面积划分四个等级',
      children: [
        {
          id: 'general-fire',
          label: '一般森林火灾',
          type: 'subcategory',
          description: '受害森林面积在1公顷以下或者其他林地起火',
          children: [
            { id: 'general-area-standard', label: '面积标准', type: 'detail', description: '受害森林面积<1公顷或死亡1-3人或重伤1-10人' },
            { id: 'general-response-level', label: '响应级别', type: 'detail', description: '县级政府启动应急响应组织扑救' },
          ],
        },
        {
          id: 'larger-fire',
          label: '较大森林火灾',
          type: 'subcategory',
          description: '受害森林面积在1公顷以上100公顷以下',
          children: [
            { id: 'larger-area-standard', label: '面积标准', type: 'detail', description: '1公顷≤受害面积<100公顷或死亡3-10人或重伤10-50人' },
            { id: 'larger-response-level', label: '响应级别', type: 'detail', description: '设区市级政府启动III级或II级响应' },
            { id: 'larger-force-deploy', label: '力量部署', type: 'detail', description: '调动专业森林消防队伍和地方半专业队协同作战' },
          ],
        },
        {
          id: 'major-fire',
          label: '重大森林火灾',
          type: 'subcategory',
          description: '受害森林面积在100公顷以上1000公顷以下',
          children: [
            { id: 'major-area-standard', label: '面积标准', type: 'detail', description: '100公顷≤受害面积<1000公顷或死亡10-30人或重伤50人以上' },
            { id: 'major-response-level', label: '响应级别', type: 'detail', description: '省级政府启动II级或I级响应成立前线指挥部' },
            { id: 'major-cross-region-support', label: '跨区域支援', type: 'detail', description: '调派邻近地区森林消防力量和航空消防支援' },
          ],
        },
        {
          id: 'extraordinary-fire',
          label: '特别重大森林火灾',
          type: 'subcategory',
          description: '受害森林面积在1000公顷以上',
          children: [
            { id: 'extra-area-standard', label: '面积标准', type: 'detail', description: '受害面积≥1000公顷或死亡30人以上或造成特别重大社会影响' },
            { id: 'extra-response-level', label: '响应级别', type: 'detail', description: '国家层面启动I级响应国务院工作组现场指导' },
            { id: 'extra-national-support', label: '全国增援', type: 'detail', description: '全国范围内调集森林消防航空应急救援等力量' },
            { id: 'extra-international-assistance', label: '国际援助协调', type: 'detail', description: '必要时请求国际救援力量协助边境火灾扑救' },
          ],
        },
      ],
    },
    {
      id: 'fire-danger-rating',
      label: '火险气象等级',
      type: 'category',
      description: '森林火险气象预警五级体系',
      children: [
        {
          id: 'low-risk-level',
          label: '低度危险（一二级）',
          type: 'subcategory',
          description: '不易发生森林火灾',
          children: [
            { id: 'level-one-two', label: '一二等级特征', type: 'detail', description: '一级不燃二级难燃可燃物含水率高不易着火' },
            { id: 'low-risk-measure', label: '日常防范', type: 'detail', description: '正常巡护火源管理保持常规防火状态即可' },
          ],
        },
        {
          id: 'moderate-risk-level',
          label: '中度危险（三级）',
          type: 'subcategory',
          description: '较易发生森林火灾',
          children: [
            { id: 'level-three-feature', label: '三级特征', type: 'detail', description: '可燃物较干燥能燃烧但蔓延速度有限' },
            { id: 'moderate-patrol', label: '加强巡护', type: 'detail', description: '增加巡查频次重点区域派人值守严控野外用火' },
          ],
        },
        {
          id: 'high-risk-level',
          label: '高度危险（四级）',
          type: 'subcategory',
          description: '容易发生森林火灾',
          children: [
            { id: 'level-four-feature', label: '四级特征', type: 'detail', description: '可燃物干燥易燃火势蔓延速度快难以控制' },
            { id: 'high-ban-outdoor-fire', label: '禁火措施', type: 'detail', description: '发布禁火令严禁一切野外用火加强入山检查' },
            { id: 'high-preposition', label: '前置备勤', type: 'detail', description: '消防队伍靠前驻防直升机随时待命起飞' },
          ],
        },
        {
          id: 'extreme-risk-level',
          label: '极度危险（五级）',
          type: 'subcategory',
          description: '极易发生森林火灾',
          children: [
            { id: 'level-five-feature', label: '五级特征', type: 'detail', description: '极度干燥遇火即燃且迅速蔓延形成高强度树冠火' },
            { id: 'extreme-total-ban', label: '全面封山', type: 'detail', description: '全面禁止进入林区关闭景区停止一切林内活动' },
            { id: 'extreme-air-patrol', label: '空中监测', type: 'detail', description: '无人机直升机全时段空中巡逻监测做到早发现早处置' },
          ],
        },
      ],
    },
    {
      id: 'fire-prevention',
      label: '防火措施',
      type: 'category',
      description: '森林火灾预防管理体系',
      children: [
        {
          id: 'fire-source-control',
          label: '火源管控',
          type: 'subcategory',
          description: '分类管控各类火源杜绝人为引发火灾',
          children: [
            { id: 'production-fire-control', label: '生产性火源管控', type: 'detail', description: '农事用火祭祀用火施工用火等实行审批报备制度' },
            { id: 'non-production-fire-control', label: '非生产性火源管控', type: 'detail', description: '吸烟野炊烧烤放孔明灯等行为严格禁止违者重罚' },
            { id: 'lightning-fire-monitoring', label: '雷击火监测', type: 'detail', description: '雷电定位系统实时监测雷击点雷后48小时重点巡查' },
          ],
        },
        {
          id: 'firebreak-system',
          label: '防火隔离带系统',
          type: 'subcategory',
          description: '构建物理阻隔网络阻止火势蔓延',
          children: [
            { id: 'biological-firebreak', label: '生物防火林带', type: 'detail', description: '种植木荷杨梅等难燃树种形成天然防火屏障宽度30-50米' },
            { id: 'engineering-firebreak', label: '工程防火隔离带', type: 'detail', description: '开设生土带道路河流等人工隔离带定期清理维护' },
            { id: 'planning-layout', label: '规划布局', type: 'detail', description: '按网格化布局确保任何一点距隔离带不超过合理距离' },
          ],
        },
        {
          id: 'monitoring-detection',
          label: '监测预警',
          type: 'subcategory',
          description: '多手段立体化火灾监测体系',
          children: [
            { id: 'ground-patrol', label: '地面巡护', type: 'detail', description: '护林员徒步或摩托车巡护重点时段加密巡查' },
            { id: 'tower-watch', label: '瞭望塔监视', type: 'detail', description: '制高点瞭望塔24小时值班配合望远镜红外探测仪' },
            { id: 'aerial-satellite', label: '空天监测', type: 'detail', description: '卫星遥感热点识别无人机巡航监测直升机空中侦察' },
          ],
        },
      ],
    },
    {
      id: 'fire-fighting-tactics',
      label: '扑救战术与技术',
      type: 'category',
      description: '森林火灾扑救的战术原则和技术方法',
      children: [
        {
          id: 'tactical-principles',
          label: '战术原则',
          type: 'subcategory',
          description: '森林火灾扑救的基本战术指导思想',
          children: [
            { id: 'attack-early-small', label: '打早打小打了', type: 'detail', description: '发现即出动小火当大火打将火灾消灭在初发阶段' },
            { id: 'unified-command', label: '统一指挥', type: 'detail', description: '建立统一指挥体系避免多头指挥造成混乱和伤亡' },
            { id: 'safety-first', label: '安全第一', type: 'detail', description: '始终把人员安全放在首位严禁盲目冒险扑救' },
          ],
        },
        {
          id: 'direct-attack-methods',
          label: '直接灭火法',
          type: 'subcategory',
          description: '直接与火线交战的扑救方法',
          children: [
            { id: 'manual-attack', label: '人工扑打', type: 'detail', description: '使用二号三号扑火工具沿火线边缘轮流扑打窒息灭火' },
            { id: 'wind-machine', label: '风力灭火机', type: 'detail', description: '利用高速气流吹散可燃气体降低温度达到灭火效果' },
            { id: 'water-extinguish', label: '以水灭火', type: 'detail', description: '使用消防水车水泵水枪高压喷射水流冷却降温灭火' },
          ],
        },
        {
          id: 'indirect-attack-methods',
          label: '间接灭火法',
          type: 'subcategory',
          description: '不直接接触火线的扑救方法',
          children: [
            { id: 'backfire', label: '以火攻火', type: 'detail', description: '在控制线内点火迎面烧向火头消耗燃料使主火熄灭' },
            { id: 'firebreak-construction', label: '开设隔离带', type: 'detail', description: '在火线前方一定距离清理出无燃料带阻止蔓延' },
            { id: 'air-drop', label: '航空灭火', type: 'detail', description: '飞机直升机投洒水和阻燃剂从空中压制火头' },
          ],
        },
      ],
    },
    {
      id: 'escape-self-rescue',
      label: '逃生自救',
      type: 'category',
      description: '被森林火灾围困时的逃生和自救方法',
      children: [
        {
          id: 'escape-route-selection',
          label: '安全转移路线',
          type: 'subcategory',
          description: '选择正确的撤离方向和路线',
          children: [
            { id: 'upwind-direction', label: '逆风方向撤离', type: 'detail', description: '始终向逆风或侧风方向移动切勿顺风逃跑' },
            { id: 'use-existing-routes', label: '利用现有道路', type: 'detail', description: '优先沿公路小道河滩等开阔地带撤离避开密林' },
            { id: 'avoid-valley-canyon', label: '避开沟谷峡谷', type: 'detail', description: '山谷是烟尘聚集地和火势快速通道绝不可进入' },
          ],
        },
        {
          id: 'emergency-shelter-methods',
          label: '紧急避险方法',
          type: 'subcategory',
          description: '无法及时撤离时的紧急避险技术',
          children: [
            { id: 'burnout-zone', label: '进入火烧迹地', type: 'detail', description: '冲过火线进入已烧过的区域注意防止余火烫伤' },
            { id: 'water-source-shelter', label: '水源避险', type: 'detail', description: '跳入附近河流池塘用水浸湿衣物保护口鼻呼吸' },
            { id: 'open-clearing', label: '空旷地带卧倒', type: 'detail', description: '选择无植被的空地趴下用湿衣物捂住口鼻' },
          ],
        },
        {
          id: 'injury-first-aid',
          label: '烧伤急救处理',
          type: 'subcategory',
          description: '火灾造成的烧伤紧急处置方法',
          children: [
            { id: 'cool-burn-wound', label: '冷水冲洗', type: 'detail', description: '立即用流动清水冲洗创面15-30分钟降低热损伤' },
            { id: 'protect-blister', label: '保护水泡', type: 'detail', description: '不要挑破水泡用干净纱布轻轻覆盖防止感染' },
            { id: 'smoke-inhalation', label: '烟雾吸入处置', type: 'detail', description: '移至新鲜空气处保持呼吸道通畅严重者立即送医' },
          ],
        },
      ],
    },
    {
      id: 'post-fire-management',
      label: '灾后处置',
      type: 'category',
      description: '火灾扑灭后的各项后续管理工作',
      children: [
        {
          id: 'fire-site-guarding',
          label: '火场看守',
          type: 'subcategory',
          description: '明火熄灭后的持续看守防止复燃',
          children: [
            { id: 'patrol-period', label: '看守时限', type: 'detail', description: '一般至少看守24-72小时大风干旱天气需延长至5天以上' },
            { id: 'hidden-fire-check', label: '隐患排查', type: 'detail', description: '彻底清理烟点暗火树根火地下腐殖层火等隐蔽火源' },
          ],
        },
        {
          id: 'damage-assessment',
          label: '损失评估',
          type: 'subcategory',
          description: '全面统计火灾损失情况',
          children: [
            { id: 'forest-resource-loss', label: '林木资源损失', type: 'detail', description: '调查过火面积林木蓄积损失树种组成及分布' },
            { id: 'ecological-impact', label: '生态影响评估', type: 'detail', description: '评估对水土流失水源涵养生物多样性的长期影响' },
            { id: 'economic-loss-statistics', label: '经济损失统计', type: 'detail', description: '包括直接经济损失扑火费用灾后重建费用等' },
          ],
        },
        {
          id: 'restoration-recovery',
          label: '恢复重建',
          type: 'subcategory',
          description: '火烧迹地的生态修复和功能恢复',
          children: [
            { id: 'natural-regeneration', label: '自然恢复', type: 'detail', description: '轻度火烧区依靠种子库萌芽能力自然更新恢复' },
            { id: 'artificial-reforestation', label: '人工造林', type: 'detail', description: '重度火烧区进行整地造林选择适生乡土树种' },
            { id: 'soil-conservation', label: '水土保持', type: 'detail', description: '采取工程措施防止水土流失为植被恢复创造条件' },
          ],
        },
      ],
    },
  ],
};
