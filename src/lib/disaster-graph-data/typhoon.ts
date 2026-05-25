export const typhoonGraphData = {
  id: 'typhoon',
  label: '台风',
  type: 'root',
  description: '台风灾害知识体系',
  children: [
    {
      id: 'typhoon-grade',
      label: '台风分级',
      type: 'category',
      description: '按底层中心附近最大风力划分6个等级',
      children: [
        {
          id: 'tropical-depression',
          label: '热带低压（TD）',
          type: 'subcategory',
          description: '底层中心附近最大风力6-7级（10.8-17.1m/s）',
          children: [
            { id: 'td-wind-standard', label: '风力标准', type: 'detail', description: '风速10.8-17.1米/秒，海面浪高1-2米' },
            { id: 'td-characteristic', label: '主要特征', type: 'detail', description: '热带气旋初期阶段结构松散云系不完整' },
            { id: 'td-influence', label: '影响程度', type: 'detail', description: '一般带来阵雨和大风对沿海影响有限' },
          ],
        },
        {
          id: 'tropical-storm',
          label: '热带风暴（TS）',
          type: 'subcategory',
          description: '底层中心附近最大风力8-9级（17.2-24.4m/s）',
          children: [
            { id: 'ts-wind-standard', label: '风力标准', type: 'detail', description: '风速17.2-24.4米/秒，海面浪高2.5-4米' },
            { id: 'ts-naming', label: '命名规则', type: 'detail', description: '达到此级别后正式获得命名如杜鹃海葵等' },
            { id: 'ts-warning', label: '预警发布', type: 'detail', description: '气象部门开始发布台风蓝色预警信号' },
          ],
        },
        {
          id: 'severe-tropical-storm',
          label: '强热带风暴（STS）',
          type: 'subcategory',
          description: '底层中心附近最大风力10-11级（24.5-32.6m/s）',
          children: [
            { id: 'sts-wind-standard', label: '风力标准', type: 'detail', description: '风速24.5-32.6米/秒，海面浪高4-6米' },
            { id: 'sts-damage', label: '破坏能力', type: 'detail', description: '可吹倒树木损坏广告牌小型建筑受损' },
            { id: 'sts-response', label: '应对措施', type: 'detail', description: '沿海地区启动防风III级应急响应停止海上作业' },
          ],
        },
        {
          id: 'typhoon-level',
          label: '台风（TY）',
          type: 'subcategory',
          description: '底层中心附近最大风力12-13级（32.7-41.4m/s）',
          children: [
            { id: 'ty-wind-standard', label: '风力标准', type: 'detail', description: '风速32.7-41.4米/秒，海面浪高6-9米' },
            { id: 'ty-eye-feature', label: '台风眼特征', type: 'detail', description: '可能形成清晰的台风眼结构眼区天气反而晴朗' },
            { id: 'ty-serious-damage', label: '严重破坏', type: 'detail', description: '可摧毁简易房屋拔起大树电力通信设施大面积中断' },
          ],
        },
        {
          id: 'severe-typhoon',
          label: '强台风（STY）',
          type: 'subcategory',
          description: '底层中心附近最大风力14-15级（41.5-50.9m/s）',
          children: [
            { id: 'sty-wind-standard', label: '风力标准', type: 'detail', description: '风速41.5-50.9米/秒，海面浪高9-12米' },
            { id: 'sty-coastal-threat', label: '沿海威胁', type: 'detail', description: '风暴潮叠加天文大潮可能导致海水倒灌' },
            { id: 'sty-evacuation', label: '人员转移', type: 'detail', description: '危险区域人员必须全部转移至安全地带' },
          ],
        },
        {
          id: 'super-typhoon',
          label: '超强台风（Super TY）',
          type: 'subcategory',
          description: '底层中心附近最大风力≥16级（≥51.0m/s）',
          children: [
            { id: 'st-wind-standard', label: '风力标准', type: 'detail', description: '风速≥51.0米/秒，海面浪高超过14米' },
            { id: 'st-catastrophic', label: '毁灭性破坏', type: 'detail', description: '钢筋混凝土建筑也可能受损基础设施全面瘫痪' },
            { id: 'st-highest-response', label: '最高级别响应', type: 'detail', description: '启动I级防台应急响应全面停工停课停业' },
            { id: 'st-mass-evacuation', label: '大规模转移', type: 'detail', description: '组织数十万甚至上百万人紧急转移安置' },
          ],
        },
      ],
    },
    {
      id: 'typhoon-warning-signal',
      label: '预警信号',
      type: 'category',
      description: '气象部门发布的四级台风预警信号体系',
      children: [
        {
          id: 'blue-signal',
          label: '蓝色预警信号',
          type: 'subcategory',
          description: '24小时内可能受台风影响平均风力达6级以上',
          children: [
            { id: 'bs-condition', label: '发布条件', type: 'detail', description: '24小时内可能或者已经受热带气旋影响沿海或陆地平均风力达6级以上' },
            { id: 'bs-defense', label: '防御指南', type: 'detail', description: '做好防台风准备注意收听收看媒体报道了解最新动态' },
          ],
        },
        {
          id: 'yellow-signal',
          label: '黄色预警信号',
          type: 'subcategory',
          description: '24小时内可能受台风影响平均风力达8级以上',
          children: [
            { id: 'ys-condition', label: '发布条件', type: 'detail', description: '24小时内可能或者已经受热带气旋影响沿海或陆地平均风力达8级以上' },
            { id: 'ys-defense', label: '防御指南', type: 'detail', description: '进入防风状态建议幼儿园托儿所停课高空户外作业停止' },
            { id: 'ys-public-action', label: '公众行动', type: 'detail', description: '加固门窗收起阳台物品船舶回港避风' },
          ],
        },
        {
          id: 'orange-signal',
          label: '橙色预警信号',
          type: 'subcategory',
          description: '12小时内可能受台风影响平均风力达10级以上',
          children: [
            { id: 'os-condition', label: '发布条件', type: 'detail', description: '12小时内可能或者已经受热带气旋影响沿海或陆地平均风力达10级以上' },
            { id: 'os-defense', label: '防御指南', type: 'detail', description: '进入紧急防风状态中小学停课居民切勿随意外出' },
            { id: 'os-evacuation', label: '人员转移', type: 'detail', description: '居住在危房的人员及时转移至安全场所' },
          ],
        },
        {
          id: 'red-signal',
          label: '红色预警信号',
          type: 'subcategory',
          description: '6小时内可能或者已受台风影响平均风力达12级以上',
          children: [
            { id: 'rs-condition', label: '发布条件', type: 'detail', description: '6小时内可能或者已经受热带气旋影响沿海或陆地平均风力达12级以上' },
            { id: 'rs-defense', label: '防御指南', type: 'detail', description: '进入特别紧急防风状态应停课停业除特殊行业外' },
            { id: 'rs-emergency', label: '应急措施', type: 'detail', description: '人员应留在安全场所不要随意外出相关应急处置部门和抢险单位随时准备启动抢险应急方案' },
          ],
        },
      ],
    },
    {
      id: 'typhoon-path',
      label: '路径与移动',
      type: 'category',
      description: '台风的移动路径和预测方法',
      children: [
        {
          id: 'path-types',
          label: '常见路径类型',
          type: 'subcategory',
          description: '影响我国的台风主要路径分类',
          children: [
            { id: 'westward-path', label: '西行路径', type: 'detail', description: '从菲律宾以东洋面向西移动影响海南广东广西' },
            { id: 'northwest-path', label: '西北行路径', type: 'detail', description: '向西北方向移动登陆台湾福建浙江等地' },
            { id: 'recurve-path', label: '转向路径', type: 'detail', description: '先西北行后在副热带高压边缘转向东北影响日韩' },
          ],
        },
        {
          id: 'forecast-methods',
          label: '预报方法',
          type: 'subcategory',
          description: '台风路径预报的主要技术手段',
          children: [
            { id: 'numerical-model', label: '数值天气预报模式', type: 'detail', description: '使用超级计算机运行大气方程组计算未来路径概率' },
            { id: 'satellite-monitoring', label: '卫星监测', type: 'detail', description: '气象卫星实时跟踪台风位置云图形态和强度变化' },
            { id: 'radar-detection', label: '雷达探测', type: 'detail', description: '多普勒雷达探测台风内部风场结构和降雨分布' },
          ],
        },
      ],
    },
    {
      id: 'defense-measures',
      label: '防御措施',
      type: 'category',
      description: '台风来临前后各阶段的防护工作',
      children: [
        {
          id: 'before-arrival',
          label: '台风来临前',
          type: 'subcategory',
          description: '提前48小时以上的准备工作',
          children: [
            { id: 'supply-stockpile', label: '物资储备', type: 'detail', description: '储备3天饮用水食物手电筒蜡烛急救药品充电宝等' },
            { id: 'home-protection', label: '房屋加固', type: 'detail', description: '检查加固门窗阳台花盆空调外机太阳能热水器等易被风吹动物品' },
            { id: 'drainage-check', label: '排水检查', type: 'detail', description: '清理屋顶阳台地漏排水沟确保排水通畅防止积水' },
            { id: 'info-collection', label: '信息收集', type: 'detail', description: '关注官方发布的台风路径预警信息和防御指引' },
          ],
        },
        {
          id: 'during-typhoon',
          label: '台风期间',
          type: 'subcategory',
          description: '台风影响期间的避险要点',
          children: [
            { id: 'stay-indoor-safe', label: '室内避险', type: 'detail', description: '远离窗户玻璃门避免被破碎玻璃伤害躲在内侧房间' },
            { id: 'avoid-dangerous-area', label: '避开危险区域', type: 'detail', description: '远离广告牌大树脚手架临时建筑电线杆等倒塌风险物' },
            { id: 'no-outdoor-activity', label: '禁止外出活动', type: 'detail', description: '台风影响最强时段绝对不要外出即使风雨暂时减弱也不要大意' },
          ],
        },
        {
          id: 'after-passing',
          label: '台风过后',
          type: 'subcategory',
          description: '台风过境后的注意事项',
          children: [
            { id: 'check-safety-first', label: '安全检查优先', type: 'detail', description: '先检查房屋是否有结构性损伤燃气管道是否泄漏再进入室内' },
            { id: 'beware-secondary-disaster', label: '警惕次生灾害', type: 'detail', description: '警惕山洪滑坡泥石流等次生灾害不要立即返回危险区域' },
            { id: 'food-water-safety', label: '饮食饮水安全', type: 'detail', description: '被洪水浸泡过的食物必须丢弃自来水需煮沸后饮用' },
          ],
        },
      ],
    },
    {
      id: 'secondary-disasters',
      label: '次生灾害',
      type: 'category',
      description: '台风引发的各类次生灾害',
      children: [
        {
          id: 'storm-surge',
          label: '风暴潮',
          type: 'subcategory',
          description: '台风导致的海水异常升降现象',
          children: [
            { id: 'surge-mechanism', label: '形成机制', type: 'detail', description: '台风低气压使海面隆起加上大风推动海水涌向海岸' },
            { id: 'surge-warning', label: '预警监测', type: 'detail', description: '海洋站实时监测潮位变化发布风暴潮预警报' },
            { id: 'surge-defense', label: '防御措施', type: 'detail', description: '沿海堤坝加固海塘巡查低洼地区人员提前撤离' },
          ],
        },
        {
          id: 'torrential-rain-flood',
          label: '暴雨洪涝',
          type: 'subcategory',
          description: '台风螺旋雨带带来的极端降水',
          children: [
            { id: 'rainfall-intensity', label: '降水强度', type: 'detail', description: '台风本体及外围环流可带来24小时200-500mm甚至更多降水' },
            { id: 'urban-flooding', label: '城市内涝', type: 'detail', description: '短时强降雨导致城市道路地下空间严重积水' },
            { id: 'mountain-flash-flood', label: '山洪暴发', type: 'detail', description: '山区溪流暴涨形成山洪威胁下游村庄和公路' },
          ],
        },
        {
          id: 'geological-hazards',
          label: '地质灾害',
          type: 'subcategory',
          description: '强降雨触发的山体地质灾害',
          children: [
            { id: 'landslide', label: '滑坡崩塌', type: 'detail', description: '雨水浸泡软化土体导致山坡失稳发生滑塌' },
            { id: 'debris-flow', label: '泥石流', type: 'detail', description: '山区沟谷中饱水土体与泥沙石块混合快速流动' },
            { id: 'geo-monitoring', label: '监测预警', type: 'detail', description: '群测群防结合专业监测及时发现征兆组织撤离' },
          ],
        },
      ],
    },
    {
      id: 'rescue-recovery',
      label: '应急救援',
      type: 'category',
      description: '台风灾害的应急救援和恢复重建工作',
      children: [
        {
          id: 'personnel-transfer',
          label: '人员转移安置',
          type: 'subcategory',
          description: '危险区域人员的转移和安置保障',
          children: [
            { id: 'transfer-range', label: '转移范围确定', type: 'detail', description: '包括海边养殖人员危房住户低洼地区居民工地工人等' },
            { id: 'shelter-management', label: '避难场所管理', type: 'detail', description: '开放学校体育馆社区中心作为避难场所提供基本生活保障' },
            { id: 'return-guidance', label: '有序返回', type: 'detail', description: '确认安全后分批次组织群众返回家中防止一拥而上' },
          ],
        },
        {
          id: 'infrastructure-restoration',
          label: '基础设施抢修',
          type: 'subcategory',
          description: '生命线工程的紧急修复',
          children: [
            { id: 'power-grid-repair', label: '电力恢复', type: 'detail', description: '电力公司组织抢修队伍修复倒杆断线优先恢复医院等重要用户' },
            { id: 'communication-resume', label: '通信恢复', type: 'detail', description: '运营商出动应急通信车恢复基站供电和光缆连接' },
            { id: 'water-supply-fix', label: '供水恢复', type: 'detail', description: '修复破损管网清洗消毒水质检测合格后恢复供水' },
          ],
        },
        {
          id: 'post-disaster-assessment',
          label: '灾后评估重建',
          type: 'subcategory',
          description: '灾情统计评估和恢复重建规划',
          children: [
            { id: 'damage-statistics', label: '灾情统计', type: 'detail', description: '全面统计受灾人口房屋倒塌农作物受灾直接经济损失等数据' },
            { id: 'agricultural-relief', label: '农业救灾', type: 'detail', description: '组织排涝补种改种农业保险理赔减少农民损失' },
            { id: 'reconstruction-plan', label: '重建规划', type: 'detail', description: '制定灾后恢复重建方案提升防灾减灾能力避免重复受灾' },
          ],
        },
      ],
    },
  ],
};
