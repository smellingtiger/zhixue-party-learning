export const coldWaveGraphData = {
  id: 'cold-wave',
  label: '寒潮',
  type: 'root',
  description: '寒潮灾害防灾减灾知识体系',
  children: [
    {
      id: 'cold-wave-grade',
      label: '寒潮分级',
      type: 'category',
      description: '按降温幅度和最低气温划分寒潮等级',
      children: [
        {
          id: 'general-cold-wave',
          label: '一般寒潮',
          type: 'subcategory',
          description: '48小时内降温≥8℃且最低温≤4℃',
          children: [
            { id: 'general-standard', label: '分级标准', type: 'detail', description: '48小时降温8-10℃且最低气温≤4℃或72小时降温10-12℃' },
            { id: 'general-influence', label: '影响范围', type: 'detail', description: '影响3个及以上省级行政区部分区域出现寒潮天气' },
          ],
        },
        {
          id: 'strong-cold-wave',
          label: '强寒潮',
          type: 'subcategory',
          description: '48小时内降温≥10℃且最低温≤0℃',
          children: [
            { id: 'strong-standard', label: '分级标准', type: 'detail', description: '48小时降温10-14℃且最低气温≤0℃或72小时降温12-16℃' },
            { id: 'strong-influence', label: '影响程度', type: 'detail', description: '大范围剧烈降温伴随大风和雨雪冰冻天气' },
            { id: 'strong-response', label: '应对级别', type: 'detail', description: '启动III级或II级应急响应加强重点行业防范' },
          ],
        },
        {
          id: 'super-strong-cold-wave',
          label: '特强寒潮',
          type: 'subcategory',
          description: '48小时内降温≥16℃或最低温≤-8℃',
          children: [
            { id: 'super-standard', label: '分级标准', type: 'detail', description: '48小时降温≥16℃或最低温度≤-8℃极端低温突破历史极值' },
            { id: 'super-catastrophic', label: '灾害性后果', type: 'detail', description: '可能造成大面积冻害交通瘫痪电力中断农业严重受损' },
            { id: 'super-emergency', label: '最高响应', type: 'detail', description: '启动I级应急响应全面部署防寒抗冻工作' },
          ],
        },
      ],
    },
    {
      id: 'cold-warning-signal',
      label: '预警信号',
      type: 'category',
      description: '气象部门发布的四级寒潮预警信号',
      children: [
        {
          id: 'blue-cold-signal',
          label: '蓝色预警信号',
          type: 'subcategory',
          description: '48小时内降温≥8℃最低温≤4℃',
          children: [
            { id: 'bcs-condition', label: '发布条件', type: 'detail', description: '48小时内最低气温将下降8℃以上最低气温≤4℃' },
            { id: 'bcs-defense', label: '防御指南', type: 'detail', description: '注意添衣保暖对水产养殖采取一定的防护措施' },
          ],
        },
        {
          id: 'yellow-cold-signal',
          label: '黄色预警信号',
          type: 'subcategory',
          description: '24小时内降温≥10℃最低温≤4℃',
          children: [
            { id: 'ycs-condition', label: '发布条件', type: 'detail', description: '24小时内最低气温将下降10℃以上最低气温≤4℃' },
            { id: 'ycs-defense', label: '防御指南', type: 'detail', description: '做好防寒保暖工作农业水产业畜牧业等要采取防霜冻冰冻措施' },
            { id: 'ycs-public-action', label: '公众行动', type: 'detail', description: '老人小孩尽量减少外出外出注意防风防滑防跌倒' },
          ],
        },
        {
          id: 'orange-cold-signal',
          label: '橙色预警信号',
          type: 'subcategory',
          description: '24小时内降温≥12℃最低温≤0℃',
          children: [
            { id: 'ocs-condition', label: '发布条件', type: 'detail', description: '24小时内最低气温将下降12℃以上最低气温≤0℃' },
            { id: 'ocs-defense', label: '防御指南', type: 'detail', description: '做好防寒防风准备农业养殖业等采取具体防冻害措施' },
            { id: 'ocs-special-group', label: '特殊群体保护', type: 'detail', description: '特别注意对老弱病幼人群的保暖照顾及时发放御寒物资' },
          ],
        },
        {
          id: 'red-cold-signal',
          label: '红色预警信号',
          type: 'subcategory',
          description: '24小时内降温≥16℃最低温≤0℃',
          children: [
            { id: 'rcs-condition', label: '发布条件', type: 'detail', description: '24小时内最低气温将下降16℃以上最低气温≤0℃' },
            { id: 'rcs-defense', label: '防御指南', type: 'detail', description: '人员应注意添衣保暖农业生产等做好防霜冻冰冻和大风准备' },
            { id: 'rcs-emergency-measures', label: '应急措施', type: 'detail', description: '做好防风防寒和防冻害措施相关应急处置部门和抢险单位随时准备启动抢险应急方案' },
          ],
        },
      ],
    },
    {
      id: 'personal-protection',
      label: '个人防护',
      type: 'category',
      description: '寒潮天气下的个人健康防护措施',
      children: [
        {
          id: 'clothing-warmth',
          label: '穿衣保暖',
          type: 'subcategory',
          description: '科学分层穿衣保持体温',
          children: [
            { id: 'three-layer-dressing', label: '三层穿衣法', type: 'detail', description: '内层排汗中层保暖外层防风三件套搭配最有效' },
            { id: 'key-parts-protection', label: '重点部位保护', type: 'detail', description: '头部手脚颈部腰部是散热大户务必重点保暖' },
            { id: 'avoid-tight-clothing', label: '避免过紧衣物', type: 'detail', description: '衣物过紧会影响血液循环反而不利于保暖适度宽松为宜' },
          ],
        },
        {
          id: 'health-precautions',
          label: '健康防护',
          type: 'subcategory',
          description: '预防寒潮引发的健康问题',
          children: [
            { id: 'prevent-cardiovascular', label: '心脑血管防护', type: 'detail', description: '寒冷刺激血管收缩高血压心脏病患者需格外注意监测指标' },
            { id: 'respiratory-care', label: '呼吸道防护', type: 'detail', description: '冷空气刺激易诱发哮喘支气管炎出门戴口罩减少冷空气直接吸入' },
            { id: 'frostbite-prevention', label: '预防冻伤', type: 'detail', description: '暴露部位涂抹防冻膏发现皮肤发白麻木立即进入温暖环境复温' },
          ],
        },
        {
          id: 'home-heating-safety',
          label: '居家取暖安全',
          type: 'subcategory',
          description: '安全使用各类取暖设备',
          children: [
            { id: 'electric-heater-safe', label: '电暖器安全使用', type: 'detail', description: '远离窗帘被褥等可燃物不要在电暖器上晾晒衣物' },
            { id: 'carbon-monoxide-alert', label: '一氧化碳中毒防范', type: 'detail', description: '煤炉炭火取暖必须保持通风定期检查烟道防止CO中毒' },
            { id: 'humidify-indoor-air', label: '室内加湿', type: 'detail', description: '取暖导致空气干燥使用加湿器或放置水盆保持湿度40%-60%' },
          ],
        },
      ],
    },
    {
      id: 'agricultural-protection',
      label: '农业防护',
      type: 'category',
      description: '农作物和畜禽的防寒抗冻措施',
      children: [
        {
          id: 'crop-protection',
          label: '作物防冻',
          type: 'subcategory',
          description: '不同类型农作物的防寒技术',
          children: [
            { id: 'greenhouse-insulation', label: '大棚保温', type: 'detail', description: '加盖保温被草帘多层覆盖必要时在大棚内增设小拱棚' },
            { id: 'field-frost-protection', label: '大田作物防冻', type: 'detail', description: '熏烟增温灌水防冻喷施防冻剂秸秆覆盖等多种方法组合使用' },
            { id: 'fruit-tree-protection', label: '果树防冻', type: 'detail', description: '树干涂白包扎树盘覆草培土根部灌水等措施综合应用' },
          ],
        },
        {
          id: 'livestock-poultry-protection',
          label: '畜禽防寒',
          type: 'subcategory',
          description: '养殖场牲畜家禽的保暖管理',
          children: [
            { id: 'barn-warming', label: '圈舍保暖加固', type: 'detail', description: '修补漏风处增加垫料密度适当提高饲养密度互相取暖' },
            { id: 'feed-adjustment', label: '饲料调整', type: 'detail', description: '增加能量饲料比例提供温水饮用补充维生素增强抗寒能力' },
            { id: 'disease-prevention', label: '疫病防控', type: 'detail', description: '低温高湿环境下疫病风险升高加强消毒和免疫接种' },
          ],
        },
        {
          id: 'aquaculture-protection',
          label: '水产养殖防寒',
          type: 'subcategory',
          description: '鱼虾蟹等水产品的越冬管理',
          children: [
            { id: 'deep-water-area', label: '加深水位', type: 'detail', description: '将养殖品种转移到深水区域利用水体深层相对稳定的温度' },
            { id: 'reduce-feeding', label: '减少投喂', type: 'detail', description: '水温降低后鱼类代谢减慢减少投喂量避免水质恶化' },
            { id: 'anti-freeze-equipment', label: '防冻设施', type: 'detail', description: '北方地区可使用塑料大棚覆盖或搭建温室进行温水养殖' },
          ],
        },
      ],
    },
    {
      id: 'secondary-disasters-cold',
      label: '次生灾害',
      type: 'category',
      description: '寒潮引发的各类次生灾害',
      children: [
        {
          id: 'ice-snow-disaster',
          label: '冰雪灾害',
          type: 'subcategory',
          description: '降雪和道路结冰造成的危害',
          children: [
            { id: 'road-icing', label: '道路结冰', type: 'detail', description: '路面结冰摩擦系数急剧下降交通事故率上升3-5倍' },
            { id: 'roof-snow-load', label: '积雪压塌', type: 'detail', description: '大棚厂房临时建筑因积雪超载发生坍塌事故' },
            { id: 'de-icing-methods', label: '除雪除冰', type: 'detail', description: '机械铲雪撒融雪剂热力除冰人工清扫等多方式配合' },
          ],
        },
        {
          id: 'freeze-damage',
          label: '冻害灾害',
          type: 'subcategory',
          description: '低温导致的各类冻伤损害',
          children: [
            { id: 'pipe-bursting', label: '水管冻裂', type: 'detail', description: '室外裸露水管冻结膨胀爆裂造成供水中断和财产损失' },
            { id: 'infrastructure-freeze', label: '设施冻损', type: 'detail', description: '电力通信设备交通信号灯等因低温故障停运' },
            { id: 'ecological-freeze', label: '生态冻害', type: 'detail', description: '南方亚热带植物热带作物遭受不可逆的冻害死亡' },
          ],
        },
        {
          id: 'fog-haze-cold',
          label: '雾霾天气',
          type: 'subcategory',
          description: '寒潮前后常伴随的大雾低能见度天气',
          children: [
            { id: 'radiation-fog', label: '辐射雾', type: 'detail', description: '寒潮过后晴朗夜晚地面辐射冷却形成浓雾能见度低于200米' },
            { id: 'traffic-impact-fog', label: '交通影响', type: 'detail', description: '高速公路封闭航班延误港口船舶滞留物流受阻' },
            { id: 'fog-health-effect', label: '健康影响', type: 'detail', description: '雾中污染物不易扩散呼吸系统疾病患者应减少户外活动' },
          ],
        },
      ],
    },
    {
      id: 'emergency-rescue-cold',
      label: '应急救援',
      type: 'category',
      description: '寒潮灾害的应急救援和保障工作',
      children: [
        {
          id: 'material-reserve',
          label: '物资储备与调拨',
          type: 'subcategory',
          description: '防寒救灾物资的准备和调配',
          children: [
            { id: 'warm-supplies-stockpile', label: '保暖物资储备', type: 'detail', description: '棉衣棉被毛毯电暖器等物资提前储备到各储备库点' },
            { id: 'food-energy-reserve', label: '生活物资保障', type: 'detail', description: '确保粮油肉蛋奶蔬菜等基本生活物资供应充足价格稳定' },
            { id: 'emergency-materials-deploy', label: '紧急调拨机制', type: 'detail', description: '建立快速调拨通道受灾地区提出需求后24小时内到位' },
          ],
        },
        {
          id: 'vulnerable-groups-care',
          label: '弱势群体关爱',
          type: 'subcategory',
          description: '特殊群体的防寒救助工作',
          children: [
            { id: 'elderly-care', label: '独居老人走访', type: 'detail', description: '社区网格员上门走访独居老人检查取暖安全和生活状况' },
            { id: 'homeless-assistance', label: '流浪人员救助', type: 'detail', description: '开放救助站提供临时避寒场所热食和御寒物品劝导进站' },
            { id: 'rural-poverty-support', label: '困难群众帮扶', type: 'detail', description: '向农村低保户特困户发放取暖补贴和御寒物资' },
          ],
        },
        {
          id: 'infrastructure-guarantee',
          label: '基础设施保供',
          type: 'subcategory',
          description: '保障生命线工程在寒潮中正常运行',
          children: [
            { id: 'power-grid-security', label: '电网安全保障', type: 'detail', description: '加强输电线路巡检除冰作业确保电力供应不中断' },
            { id: 'transportation-guarantee', label: '交通运输保障', type: 'detail', description: '公路铁路航空部门启动应急预案优先保障民生运输' },
            { id: 'water-gas-heating', label: '水气暖保供', type: 'detail', description: '供水供气供暖企业加强管网巡查抢修力量24小时待命' },
          ],
        },
      ],
    },
  ],
};
