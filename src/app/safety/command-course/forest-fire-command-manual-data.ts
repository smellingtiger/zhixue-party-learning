import type { CommandManualData } from './types';

export const forestFireCommandManualData: CommandManualData = {
  disasterName: '森林火灾',
  disasterIcon: '森林火灾',
  responseLevels: [
    {
      level: 'IV',
      color: 'blue',
      label: 'IV级响应',
      conditions: [
        '卫星监测、视频监控或瞭望发现森林火情，经核实现有明火且可能持续蔓延',
        '受害森林面积预估≤1公顷（不含本数），或其他林地起火',
        '造成1人以上、3人以下死亡（不含本数），或1人以上、10人以下重伤',
        '火场周边有居民点、重要设施或危险源但在安全距离外，暂不构成直接威胁',
        '森林火险预警等级达到橙色（II级预警），且辖区内发生火情',
        '发生在国家法定节假日、重大活动等敏感时段，24小时内须控制火情',
        '发生在县级行政边界2公里范围内，可能跨区域蔓延',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（IV级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.1条、6.2条；《森林草原防灭火条例》第16条、第22条',
          sopTable: [
            {
              action: '火情接收与到岗',
              content: '接到市应急局火情速报，立即赶赴市应急指挥中心',
              threshold: '接到报告后30分钟内',
            },
            {
              action: '批准启动IV级响应',
              content: '听取火场初判情况，签发IV级响应启动令',
              threshold: '火情核实后1小时内',
            },
            {
              action: '召集首次指挥部会议',
              content: '召集应急、林草、消防等部门召开指挥部会议，明确分工',
              threshold: '启动响应后1小时内',
            },
            {
              action: '研判火情走势',
              content: '根据气象条件（风力/风向/湿度）、地形、植被类型研判火势发展趋势',
              threshold: '持续研判，每2小时复核',
            },
            {
              action: '向市长报备',
              content: '向市长报告火情基本情况、响应措施和预判走势',
              threshold: '启动响应后2小时内首报',
            },
            {
              action: '指挥重点任务',
              content: '优先保障扑火力量投送、受威胁群众疏散、重要目标保护',
              threshold: '全程',
            },
            {
              action: '信息发布审批',
              content: '审核对外发布火情信息，回应社会关切',
              threshold: '每次发布前',
            },
            {
              action: '响应终止决策',
              content: '确认明火扑灭、火场无复燃条件后终止IV级响应',
              threshold: '达到终止条件后48小时内',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（IV级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.1条、6.2条；《森林草原防灭火条例》第22条',
          sopTable: [
            {
              action: '火情速报',
              content: '接收火情报告（卫星热点/视频监控/瞭望/110联动），核实后向分管副市长报告',
              threshold: '接到火情后15分钟内',
            },
            {
              action: '启动应急值班',
              content: '森防指办公室全员到岗，开通24小时值班电话和指挥系统，启动视频调度',
              threshold: '接到火情后20分钟内',
            },
            {
              action: '火场信息汇总',
              content: '汇总火场面积、蔓延方向、气象条件、周边风险目标等，建立火情台账',
              threshold: '启动响应后1小时内首报',
            },
            {
              action: '协调扑火力量',
              content: '调动市级专业扑火队伍、消防救援力量向火场集结',
              threshold: '启动响应后30分钟内下达指令',
            },
            {
              action: '物资调拨',
              content: '启用市级森林防灭火物资储备库，调拨风力灭火机、灭火水枪、防护装备等',
              threshold: '启动响应后1小时内首批出库',
            },
            {
              action: '航空灭火协调',
              content: '如具备条件，协调航空护林直升机参与吊桶洒水灭火',
              threshold: '启动响应后1小时内申请',
            },
            {
              action: '伤亡统计',
              content: '持续统计和更新扑火人员和受威胁群众伤亡情况',
              threshold: '每2小时更新一次',
            },
            {
              action: '火场动态跟踪',
              content: '对接气象部门获取火场实时气象数据，跟踪火场蔓延态势',
              threshold: '持续监测',
            },
            {
              action: '编写火情简报',
              content: '汇总火情和处置情况，编写火情简报供指挥部决策',
              threshold: '每日2次（8:00/20:00）',
            },
            {
              action: '响应终止建议',
              content: '明火扑灭后向分管副市长提出终止响应建议',
              threshold: '确认火场安全后24小时内',
            },
          ],
        },
        {
          name: '市林草局',
          fullName: '市林草局（IV级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.2条；《森林防火条例》第31-35条',
          sopTable: [
            {
              action: '火情分析',
              content: '提供起火区域植被类型、林分结构、可燃物载量等专业数据',
              threshold: '接到火情后30分钟内',
            },
            {
              action: '火场态势研判',
              content: '结合地形、植被、气象研判火场蔓延速度、方向和强度',
              threshold: '启动响应后1小时内首次研判',
            },
            {
              action: '早期处置指导',
              content: '指导属地林业站和乡镇扑火队开展火情早期处理',
              threshold: '接到火情后即时',
            },
            {
              action: '防火隔离带规划',
              content: '如需开设隔离带，提供最优线路规划建议（依托河流/道路/山脊）',
              threshold: '启动响应后2小时内提出方案',
            },
            {
              action: '火场周边敏感目标排查',
              content: '排查火场周边自然保护区、珍稀树种、林区危化品仓库等敏感目标',
              threshold: '启动响应后2小时内完成',
            },
            {
              action: '森林资源损失初评',
              content: '初步评估受害森林面积和树种损失',
              threshold: '启动响应后4小时内初评',
            },
            {
              action: '火险因子监测',
              content: '提供火场区域近期火险等级、降雨量、可燃物含水率等火险因子数据',
              threshold: '持续监测',
            },
            {
              action: '航空护林协调',
              content: '协助协调航空护林飞行计划和航护路线',
              threshold: '按需协调',
            },
          ],
        },
        {
          name: '市消防救援支队',
          fullName: '市消防救援支队（IV级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.2条；《森林防火条例》第31-35条',
          sopTable: [
            {
              action: '力量集结',
              content: '接到调度指令后立即集结专业扑火力量，装备风力灭火机、灭火水枪、水泵等',
              threshold: '接到指令后15分钟内出发',
            },
            {
              action: '火场侦察',
              content: '到达火场后立即进行火场侦察，判断火头方向、火线长度、火势强度',
              threshold: '抵达火场后30分钟内',
            },
            {
              action: '制定扑火方案',
              content: '根据火场地形和火势，制定"两翼推进、分段合围"或"一点突破、两翼推进"等战术',
              threshold: '侦察完毕后30分钟内',
            },
            {
              action: '扑打明火',
              content: '按照"先控制、后消灭"原则，优先压制火头、控制火翼、清理火尾',
              threshold: '方案确定后即时展开',
            },
            {
              action: '开设隔离带',
              content: '在火势蔓延前方开设防火隔离带，阻隔火势蔓延',
              threshold: '火线推进速度超预期时即时开设',
            },
            {
              action: '通信保障',
              content: '确保火场通信畅通，各战斗小组保持联络',
              threshold: '全程',
            },
            {
              action: '扑火安全监督',
              content: '设立安全官，监控火场风向突变、飞火、爆燃等危险信号，预设紧急避险路线',
              threshold: '全程',
            },
            {
              action: '力量需求评估',
              content: '实时评估是否需要增援力量，向指挥部提交增援申请',
              threshold: '每2小时评估一次',
            },
          ],
        },
        {
          name: '属地乡镇',
          fullName: '属地乡镇（IV级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.2条；《森林防火条例》第31-35条',
          sopTable: [
            {
              action: '火情核实与上报',
              content: '接到火情报告后立即派人核实，确认火情后向县级森防指报告',
              threshold: '接到报告后15分钟内核实',
            },
            {
              action: '先期扑救',
              content: '组织乡镇半专业扑火队和村级扑火应急队进行先期扑救',
              threshold: '核实火情后即时出发',
            },
            {
              action: '群众疏散',
              content: '判明火势发展方向，组织受威胁村庄/居民点群众向安全区域疏散',
              threshold: '确认威胁后1小时内启动',
            },
            {
              action: '路口引导',
              content: '在通往火场的主要路口安排人员引导增援扑火队伍',
              threshold: '扑火力量到达前到位',
            },
            {
              action: '后勤保障',
              content: '为扑火队伍提供水源、食品、油料等基本后勤保障',
              threshold: '扑火队伍到达后即时',
            },
            {
              action: '火场周边管控',
              content: '设置警戒线，禁止无关人员进入火场区域',
              threshold: '启动响应后即时',
            },
            {
              action: '转移安置',
              content: '开放村委会、学校等作为临时安置点，安置疏散群众',
              threshold: '群众疏散后即时',
            },
            {
              action: '火场看守',
              content: '明火扑灭后组织群众看守火场，防止复燃',
              threshold: '明火扑灭后72小时内',
            },
            {
              action: '信息报送',
              content: '向乡镇（街道）防灭火指挥部定期报送本辖区灾情',
              threshold: '每2小时报告一次',
            },
            {
              action: '特殊群体排查',
              content: '排查独居老人、残疾人等特殊群体是否安全',
              threshold: '疏散完成后即时核查',
            },
          ],
        },
      ],
    },
    {
      level: 'III',
      color: 'yellow',
      label: 'III级响应',
      conditions: [
        '受害森林面积超过1公顷（含本数），或24小时内火场面积扩大超过3倍',
        '已确认死亡人数≥3人（含本数），或重伤≥10人（含本数）',
        '火场蔓延方向前方5公里内有居民点、学校、医院、重要设施或危险源',
        '火线长度超过2公里，且风力≥5级（风速≥8.0m/s），火势无法有效控制',
        '发生在敏感时段（国家法定节假日/重大活动期间/高火险期），12小时内未控制',
        '火场涉及2个以上县级行政区，跨区域协调需求增加',
        '同时发生2起以上森林火灾',
        '森林火险预警等级达到红色（I级预警），火势仍在蔓延',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（III级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.1条、6.3条；《森林草原防灭火条例》第5条',
          sopTable: [
            {
              action: '升级响应决策',
              content: '签发III级响应升级令，通报全体指挥部成员单位',
              threshold: '达到升级条件后30分钟内',
            },
            {
              action: '扩大指挥部',
              content: '增补市公安局、卫健委、气象局为指挥部成员单位',
              threshold: '升级后1小时内',
            },
            {
              action: '召开升级后首次会议',
              content: '明确III级响应下各岗位新增任务和协同要求',
              threshold: '升级后2小时内',
            },
            {
              action: '向省森防指报告',
              content: '向省森防指办公室报告火情升级情况和处置进展',
              threshold: '升级后1小时内',
            },
            {
              action: '设立前线指挥部',
              content: '在火场附近安全区域设立前线指挥部，委派前方指挥长',
              threshold: '升级后3小时内',
            },
            {
              action: '每日指挥部例会',
              content: '每日固定时间召开指挥部例会，听取各岗位汇报',
              threshold: '每日8:00和20:00',
            },
            {
              action: '重大事项决策',
              content: '对跨区域增援、大规模疏散、航空灭火力量申请等重大事项决策',
              threshold: '即时',
            },
            {
              action: '对外信息发布',
              content: '审核并发布权威火情信息，举行新闻发布会',
              threshold: '每日至少1次',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（III级）',
          sopTable: [
            {
              action: '升级通知',
              content: '向全体成员单位发送III级响应升级通知，要求全部到岗',
              threshold: '升级后30分钟内',
            },
            {
              action: '增调扑火力量',
              content: '调动全市可用的专业扑火队伍、半专业队伍向火场增援',
              threshold: '升级后1小时内下达指令',
            },
            {
              action: '火场信息平台',
              content: '建立统一的火场信息共享平台，实现多部门火场态势数据共享',
              threshold: '升级后2小时内',
            },
            {
              action: '大量物资调拨',
              content: '启用多个市级储备库，大规模调拨扑火装备和防护物资',
              threshold: '升级后1小时内出库',
            },
            {
              action: '国家队申请',
              content: '研判是否需要向国家森防指申请国家综合性消防救援队伍森林消防力量增援',
              threshold: '升级后2小时内研判',
            },
            {
              action: '跨区域协调',
              content: '协调周边未受灾县（市、区）扑火力量和物资支援',
              threshold: '升级后3小时内',
            },
            {
              action: '扑火安全督导',
              content: '督促前线做好扑火安全管理和紧急避险准备',
              threshold: '全程，每4小时检查',
            },
            {
              action: '灾情简报升级',
              content: '灾情简报频率提升为每日3次',
              threshold: '8:00/14:00/20:00',
            },
            {
              action: '航空灭火协调',
              content: '申请增加航空护林飞机架次，协调空域使用',
              threshold: '升级后2小时内',
            },
            {
              action: '响应评估',
              content: '持续评估是否需要进一步升级响应',
              threshold: '每4小时一次',
            },
          ],
        },
        {
          name: '市林草局',
          fullName: '市林草局（III级）',
          sopTable: [
            {
              action: '深度火场分析',
              content: '结合多光谱卫星影像和无人机航拍，分析火场燃烧强度和蔓延趋势',
              threshold: '升级后2小时内',
            },
            {
              action: '防火通道研判',
              content: '评估现有防火通道、防火林带的阻火效果，提出利用和加强方案',
              threshold: '升级后3小时内',
            },
            {
              action: '植被损失评估',
              content: '扩大评估范围，评估火场及周边可能受影响区域的森林资源情况',
              threshold: '升级后4小时内',
            },
            {
              action: '自然保护区排查',
              content: '重点排查火场周边自然保护区、国家森林公园等是否受威胁',
              threshold: '升级后即时',
            },
            {
              action: '林区危化品排查',
              content: '排查林区内加油站、炸药库、化工厂等危险源',
              threshold: '升级后2小时内完成',
            },
            {
              action: '火因初步研判',
              content: '协助公安部门对起火原因进行初步研判（人为/雷击/自燃等）',
              threshold: '升级后即时',
            },
            {
              action: '灭火水源调查',
              content: '调查火场周边可用水源（河流/湖泊/水库/蓄水池），为以水灭火提供数据',
              threshold: '升级后2小时内',
            },
          ],
        },
        {
          name: '市消防救援支队',
          fullName: '市消防救援支队（III级）',
          sopTable: [
            {
              action: '全面增援',
              content: '调集全市消防扑火力量增援火场，优先保障扑火骨干力量',
              threshold: '升级后1小时内到位',
            },
            {
              action: '多线作战指挥',
              content: '根据火场态势划分作战片区，设立片区指挥员',
              threshold: '升级后2小时内',
            },
            {
              action: '以水灭火展开',
              content: '部署森林消防水泵、水带系统，利用就近水源实施以水灭火',
              threshold: '水源确定后即时展开',
            },
            {
              action: '隔离带开设',
              content: '大规模开设防火隔离带，优先保护居民点和重要设施',
              threshold: '升级后即时',
            },
            {
              action: '危险源保护',
              content: '在危险源（加油站/化工厂/弹药库等）周边开设环形防火隔离带',
              threshold: '发现威胁后即时',
            },
            {
              action: '扑火人员轮换',
              content: '安排扑火人员轮换制度，防止疲劳作战',
              threshold: '单班连续作业≤4小时',
            },
            {
              action: '火场气象监测',
              content: '在火场设立便携气象站，实时监测风向风速突变',
              threshold: '升级后即时',
            },
            {
              action: '伤亡应急救援',
              content: '如发生扑火人员伤亡，立即组织救援和转运',
              threshold: '即时',
            },
          ],
        },
        {
          name: '属地乡镇',
          fullName: '属地乡镇（III级）',
          sopTable: [
            {
              action: '大规模群众疏散',
              content: '根据指挥部指令，组织火势蔓延方向上的村庄/居民点全面疏散',
              threshold: '升级后1小时内',
            },
            {
              action: '疏散人员统计',
              content: '逐户统计疏散人员名单，确保不漏一人',
              threshold: '疏散完成后即时',
            },
            {
              action: '安置点管理',
              content: '增设安置点，做好登记、分配、食品饮水保障、医疗服务',
              threshold: '全程',
            },
            {
              action: '后勤保障扩大',
              content: '为增援扑火队伍提供更大规模的后勤保障',
              threshold: '全时保障',
            },
            {
              action: '进山路口管控',
              content: '全部进山路口设卡，禁止一切无关人员和车辆进入',
              threshold: '升级后即时',
            },
            {
              action: '农事用火禁令',
              content: '发布本区域内禁止一切野外用火的紧急通知',
              threshold: '升级后即时',
            },
            {
              action: '伤亡信息登记',
              content: '登记本辖区因火灾伤亡人员信息，报县级森防指',
              threshold: '持续，发现即报',
            },
            {
              action: '群众情绪安抚',
              content: '做好疏散群众情绪安抚，防止恐慌',
              threshold: '全程',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（III级）',
          description: 'III级较IV级新增岗位，负责火场交通管制、群众疏散协助、治安维护与火案调查',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3条；《森林草原防灭火条例》第5条',
          sopTable: [
            {
              action: '火场交通管制',
              content: '对通往火场的道路实施交通管制，仅允许救援车辆和扑火车辆通行',
              threshold: '升级后1小时内到位',
            },
            {
              action: '群众疏散协助',
              content: '协助属地乡镇组织群众安全有序疏散',
              threshold: '升级后即时',
            },
            {
              action: '治安维护',
              content: '增派警力维护火场周边和安置点治安秩序，防止趁火盗窃',
              threshold: '升级后2小时内到位',
            },
            {
              action: '火案调查',
              content: '组织刑侦力量开展起火原因调查，固定证据，锁定嫌疑人',
              threshold: '升级后即时开展',
            },
            {
              action: '无人机管控',
              content: '禁止未经批准的社会无人机在火场区域飞行，保障航空灭火安全',
              threshold: '升级后即时',
            },
            {
              action: '网络舆情监控',
              content: '监控网络涉火舆情，及时发现和处置谣言',
              threshold: '升级后24小时不间断',
            },
            {
              action: '重点目标保卫',
              content: '加强银行、商场、加油站、政府机关等重点目标的巡逻保卫',
              threshold: '升级后2小时内加强',
            },
            {
              action: '扑火人员身份核查',
              content: '对因火灾伤亡的扑火人员进行身份核查',
              threshold: '持续',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（III级）',
          description: 'III级较IV级新增岗位，负责伤员救治、医疗队派驻与卫生防疫',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3条；《森林草原防灭火条例》第5条',
          sopTable: [
            {
              action: '医疗急救启动',
              content: '启动医疗救治应急预案，调派120救护车赴火场待命',
              threshold: '升级后即时',
            },
            {
              action: '现场医疗点设置',
              content: '在火场前线指挥部附近设置现场医疗点，配置急救药品和设备',
              threshold: '升级后2小时内',
            },
            {
              action: '伤员分类救治',
              content: '按照红（危重）、黄（重伤）、绿（轻伤）对伤员分类救治',
              threshold: '伤员到达后即时分类',
            },
            {
              action: '烧伤专项救治',
              content: '调配烧伤科专家，做好烧伤人员专门救治准备',
              threshold: '升级后即时',
            },
            {
              action: '吸入性损伤救治',
              content: '针对扑火人员吸入性损伤（烟雾吸入）做好救治准备',
              threshold: '升级后即时',
            },
            {
              action: '医疗资源调配',
              content: '调配全市医疗资源，必要时请求省级医疗支援',
              threshold: '升级后2小时内',
            },
            {
              action: '安置点医疗',
              content: '在各安置点设置医疗点，提供基本医疗服务',
              threshold: '安置点开设后即时',
            },
            {
              action: '卫生防疫',
              content: '对安置点饮用水和食品进行卫生监测，防止传染病发生',
              threshold: '升级后6小时内启动',
            },
            {
              action: '心理援助',
              content: '对受灾群众和扑火人员进行心理疏导',
              threshold: '升级后12小时内启动',
            },
            {
              action: '医疗信息统计',
              content: '统计伤员救治信息并报指挥部',
              threshold: '每4小时更新',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（III级）',
          description: 'III级较IV级新增岗位，负责火场气象专项服务、人工增雨作业与火险预警发布',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3条；《森林草原防灭火条例》第5条',
          sopTable: [
            {
              action: '火场专项预报',
              content: '制作火场区域逐小时精细化气象预报（风向/风速/温度/湿度/降水）',
              threshold: '升级后1小时内首次发布',
            },
            {
              action: '火险等级更新',
              content: '更新火场区域森林火险气象等级预报',
              threshold: '升级后即时',
            },
            {
              action: '风向突变预警',
              content: '重点监测可能导致火势突变的冷锋过境、风向切变、雷暴大风等',
              threshold: '持续监测，突变前30分钟预警',
            },
            {
              action: '人工增雨准备',
              content: '评估人工增雨作业条件，做好火箭弹和飞机增雨准备',
              threshold: '升级后即时研判',
            },
            {
              action: '气象数据推送',
              content: '向前线指挥部和扑火队伍实时推送气象数据',
              threshold: '每30分钟推送一次',
            },
            {
              action: '中长期预报',
              content: '制作未来3-7天火场区域天气趋势预报',
              threshold: '升级后6小时内',
            },
            {
              action: '雷电监测',
              content: '对火场区域的雷电活动进行实时监测，防范雷击引发新火点',
              threshold: '持续监测',
            },
            {
              action: '现场气象服务',
              content: '视情派出现场气象服务小组赴前线',
              threshold: '升级后4小时内',
            },
          ],
        },
      ],
    },
    {
      level: 'II',
      color: 'orange',
      label: 'II级响应',
      conditions: [
        '受害森林面积超过100公顷（含本数），且仍在快速蔓延',
        '已确认死亡人数≥10人（含本数），或重伤≥50人（含本数）',
        '火线长度超过10公里，或火场呈多点爆发态势（≥3个独立火场）',
        '火场蔓延方向直接威胁县级以上城镇、大型工业园区、重要军事设施',
        '超过48小时尚未有效控制火势，过火面积持续扩大',
        '森林火灾引发次生灾害（大面积山体滑坡、泥石流、堰塞湖）',
        '大规模群众疏散（≥5000人）',
        '发生在跨省界区域，影响波及周边省份',
        '境外火灾蔓延至我国境内',
        '省森防指要求升级或直接启动II级响应',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '市长',
          fullName: '市长（II级）',
          description: 'II级新增岗位，首次直接介入指挥，担任市森防指总指挥，全面统筹全市防灭火工作',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《森林草原防灭火条例》第6条（行政首长负责制）',
          sopTable: [
            {
              action: '签发II级响应令',
              content: '确认火情达到II级标准，签发响应升级令',
              threshold: '达到条件后1小时内',
            },
            {
              action: '全面接管指挥',
              content: '亲自坐镇市应急指挥中心，全面指挥森林火灾应急处置',
              threshold: '升级后即时',
            },
            {
              action: '召开全市动员大会',
              content: '通过视频会议系统动员全市力量投入防灭火作战',
              threshold: '升级后4小时内',
            },
            {
              action: '向省政府述职',
              content: '每日向省政府和省森防指报告火情和处置情况',
              threshold: '每日2次（8:00/18:00）',
            },
            {
              action: '请求军队和武警支援',
              content: '向省军区和武警总队请求兵力支援',
              threshold: '升级后2小时内',
            },
            {
              action: '请求跨省增援',
              content: '向省森防指请求协调邻省扑火力量跨区域增援',
              threshold: '升级后2小时内',
            },
            {
              action: '重大决策',
              content: '对城镇疏散、跨区域调兵、重要目标破坏性保护等重大事项决策',
              threshold: '即时',
            },
            {
              action: '举行新闻发布会',
              content: '亲自或委托常务副市长举行新闻发布会，向公众通报火情和救灾进展',
              threshold: '每日至少1次',
            },
            {
              action: '灾后重建部署',
              content: '火情稳定后部署火烧迹地恢复和灾后重建工作',
              threshold: '火情稳定后启动',
            },
          ],
        },
        {
          name: '副市长',
          fullName: '副市长（II级）',
          description: '在市长统一领导下协助指挥，担任前线指挥部指挥长靠前指挥',
          sopTable: [
            {
              action: '协助市长指挥',
              content: '在市长统一领导下继续履行分管领域指挥职责',
              threshold: '全程',
            },
            {
              action: '前线指挥',
              content: '担任或委派前线指挥部指挥长，靠前指挥扑火作战',
              threshold: '升级后即时赶赴前线',
            },
            {
              action: '跨区域协调',
              content: '对接跨省、跨市增援的扑火力量，纳入统一指挥体系',
              threshold: '增援力量到达前完成对接',
            },
            {
              action: '专项任务督办',
              content: '督办指挥部确定的重点任务（火头压制/隔离带开设/群众转移等）',
              threshold: '每4小时检查进度',
            },
            {
              action: '向市长汇报',
              content: '每日向市长汇报前线处置进展和需求',
              threshold: '每日2次（8:00/18:00）',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（II级）',
          sopTable: [
            {
              action: '全面升级应急值守',
              content: '实行24小时双人值班，确保指挥系统不间断运行',
              threshold: '升级后即时',
            },
            {
              action: '国家队对接',
              content: '对接国家森防指调派的森林消防力量，提供火场信息和后勤保障',
              threshold: '国家队到达前完成准备',
            },
            {
              action: '大规模物资调拨',
              content: '启用全市全部储备库，同时请求省级物资支援',
              threshold: '升级后2小时内',
            },
            {
              action: '军地联合指挥',
              content: '与军队、武警建立联合指挥机制，明确兵力使用方案',
              threshold: '升级后4小时内',
            },
            {
              action: '火情全面评估',
              content: '组织多部门开展火情全面评估（过火面积、损失、发展趋势）',
              threshold: '升级后24小时内初评',
            },
            {
              action: '应急资金拨付',
              content: '协调财政部门拨付应急救灾资金',
              threshold: '升级后6小时内到位',
            },
            {
              action: '灾情简报',
              content: '灾情简报频率提升为每日4次',
              threshold: '6:00/12:00/18:00/24:00',
            },
            {
              action: '恢复重建规划',
              content: '启动火烧迹地恢复和灾后重建规划编制',
              threshold: '火情稳定后48小时内',
            },
          ],
        },
        {
          name: '市林草局',
          fullName: '市林草局（II级）',
          sopTable: [
            {
              action: '森林资源全面评估',
              content: '利用卫星遥感（高分系列卫星）和无人机全面评估过火面积和森林损失',
              threshold: '升级后12小时内',
            },
            {
              action: '生态影响评估',
              content: '评估火灾对珍稀动植物、自然保护区、水源涵养地等生态系统的影响',
              threshold: '升级后24小时内',
            },
            {
              action: '火烧迹地管理',
              content: '制定火烧迹地管理方案，防止水土流失和次生灾害',
              threshold: '升级后48小时内',
            },
            {
              action: '重点林区保护',
              content: '对尚未波及的重点林区制定预防性保护方案',
              threshold: '升级后即时',
            },
            {
              action: '林区设施排查',
              content: '排查林区内林业管护站、检查站、瞭望塔等设施是否受损',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市消防救援支队',
          fullName: '市消防救援支队（II级）',
          sopTable: [
            {
              action: '全面投入作战',
              content: '调动全市全部可用的消防和扑火力量，按战区划分实施统一指挥',
              threshold: '升级后即时',
            },
            {
              action: '空地协同作战',
              content: '与航空灭火飞机建立空地协同机制，地面配合空中洒水',
              threshold: '升级后即时建立',
            },
            {
              action: '开辟大纵深隔离带',
              content: '在火场外围开辟50-100米宽的大纵深防火隔离带',
              threshold: '升级后4小时内启动',
            },
            {
              action: '重点保护圈层',
              content: '在城镇、重要设施周边开辟"三道防线"保护圈层',
              threshold: '升级后6小时内',
            },
            {
              action: '跨省扑火队对接',
              content: '对接跨省增援的扑火力量，安排作战区域和后勤保障',
              threshold: '增援到达前完成',
            },
            {
              action: '扑火安全强化',
              content: '增加安全官人数，每条火线设立专职安全观察员',
              threshold: '升级后即时',
            },
            {
              action: '夜间作战管理',
              content: '如需夜间扑火，严格实施夜间作战安全管理（照明/通信/紧急避险）',
              threshold: '夜间作战全程',
            },
          ],
        },
        {
          name: '属地乡镇',
          fullName: '属地乡镇（II级）',
          sopTable: [
            {
              action: '全面疏散',
              content: '根据指挥部指令全面疏散火势威胁区域的群众，不留死角',
              threshold: '升级后即时',
            },
            {
              action: '大型安置点管理',
              content: '配合民政部门做好大型安置点的管理和服务',
              threshold: '全程',
            },
            {
              action: '物资接收分发',
              content: '接收和分发上级调拨的大量物资，建立发放台账',
              threshold: '物资到达后即时',
            },
            {
              action: '民兵组织',
              content: '组织民兵参与物资搬运、火场看守、路口管控等辅助性工作',
              threshold: '升级后2小时内',
            },
            {
              action: '直升机取水点保障',
              content: '为航空灭火直升机保障取水点安全和地面引导',
              threshold: '按需',
            },
            {
              action: '灾后善后',
              content: '配合开展火灾善后和群众安抚工作',
              threshold: '火情稳定后启动',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（II级）',
          sopTable: [
            {
              action: '全域交通管制',
              content: '实施全域交通管制，保障救援通道畅通，社会车辆绕行',
              threshold: '升级后即时',
            },
            {
              action: '大面积治安管控',
              content: '对火场周边区域实施治安管控，严厉打击趁火犯罪',
              threshold: '升级后即时',
            },
            {
              action: '无人机全域禁飞',
              content: '发布火场周边50公里空域禁飞通告',
              threshold: '升级后即时',
            },
            {
              action: '火案深入调查',
              content: '深入调查起火原因，追究肇事者法律责任',
              threshold: '持续深入',
            },
            {
              action: '舆情管控',
              content: '依法处置网络谣言和恶意炒作',
              threshold: '全程',
            },
            {
              action: '大规模群众疏散协助',
              content: '出动警力协助大规模群众疏散',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（II级）',
          sopTable: [
            {
              action: '全市医疗动员',
              content: '动员全市医疗机构投入伤员救治，开设绿色通道',
              threshold: '升级后即时',
            },
            {
              action: '请求省级医疗队',
              content: '请求省级烧伤科、呼吸科专家组支援',
              threshold: '升级后2小时内',
            },
            {
              action: '野战医疗所设置',
              content: '在前线设置野战医疗所，可实施紧急手术',
              threshold: '升级后6小时内',
            },
            {
              action: '大规模伤员转运',
              content: '组织大规模伤员向市外医院转运',
              threshold: '升级后即时',
            },
            {
              action: '全面卫生防疫',
              content: '对安置点开展全面的卫生防疫工作',
              threshold: '升级后即时',
            },
            {
              action: '心理健康干预',
              content: '对受灾群众和扑火人员开展大规模心理健康干预',
              threshold: '升级后12小时内',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（II级）',
          sopTable: [
            {
              action: '加密预报频次',
              content: '火场专项预报加密为每30分钟一次',
              threshold: '升级后即时',
            },
            {
              action: '人工增雨作业',
              content: '如气象条件具备，立即实施人工增雨作业',
              threshold: '条件具备后即时',
            },
            {
              action: '卫星遥感火点监测',
              content: '利用风云系列气象卫星实时监测火点变化',
              threshold: '升级后即时',
            },
            {
              action: '中长期火险预报',
              content: '制作未来7-15天火险趋势预报',
              threshold: '升级后12小时内',
            },
          ],
        },
        {
          name: '市自然资源局',
          fullName: '市自然资源局（II级）',
          description: 'II级新增岗位，负责次生地质灾害监测与风险预警',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '次生地质灾害排查',
              content: '对火烧迹地和火场周边山体进行地质灾害隐患排查',
              threshold: '升级后4小时内启动',
            },
            {
              action: '滑坡/泥石流监测',
              content: '对已发现的滑坡、泥石流隐患点进行实时监测',
              threshold: '发现隐患后即时',
            },
            {
              action: '火烧迹地地质评估',
              content: '评估火烧迹地植被破坏后的山体稳定性',
              threshold: '升级后24小时内',
            },
            {
              action: '泥石流预警',
              content: '结合气象预报发布火烧迹地泥石流风险预警',
              threshold: '持续监测',
            },
            {
              action: '疏散建议',
              content: '对受地质灾害威胁区域提出疏散建议',
              threshold: '即时',
            },
            {
              action: '矿山企业排查',
              content: '排查火场周边矿山企业安全，临近火场矿区立即停产撤人',
              threshold: '升级后4小时内',
            },
            {
              action: '地形测绘支撑',
              content: '为扑火指挥提供火场区域1:10000或更高精度地形图',
              threshold: '升级后即时提供',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（II级）',
          description: 'II级新增岗位，负责救援通道保障、道路抢通与应急运输调度',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '救援通道保障',
              content: '配合公安实施全域交通管制，保障扑火救援车辆优先通行',
              threshold: '升级后即时',
            },
            {
              action: '道路抢通',
              content: '对火场周边因火灾损坏的道路组织抢修，确保救援通道畅通',
              threshold: '升级后2小时内启动',
            },
            {
              action: '应急运输调度',
              content: '调集客运车辆用于大规模群众疏散转移',
              threshold: '升级后即时',
            },
            {
              action: '林区公路巡查',
              content: '对通往火场的林区公路进行巡查，清理倒木、落石等障碍',
              threshold: '持续',
            },
            {
              action: '物资运输保障',
              content: '协调货运车辆保障扑火装备和救灾物资运输',
              threshold: '升级后即时',
            },
            {
              action: '公共交通调整',
              content: '动态调整火场周边区域的公交、客运线路，发布绕行信息',
              threshold: '升级后2小时内',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（II级）',
          description: 'II级新增岗位，负责网络舆情管控与权威信息发布',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '网络舆情24小时监控',
              content: '对微博、微信、抖音、快手等平台涉火舆情全面监控',
              threshold: '升级后即时',
            },
            {
              action: '权威信息发布',
              content: '通过"XX发布"等官方新媒体矩阵发布权威火情信息',
              threshold: '每2小时更新',
            },
            {
              action: '谣言快速辟除',
              content: '对网络谣言及时辟除，公布真相和法律后果',
              threshold: '发现后1小时内辟除',
            },
            {
              action: '媒体服务',
              content: '设立媒体服务中心，为记者采访提供便利和引导',
              threshold: '升级后即时',
            },
            {
              action: '新闻发布会组织',
              content: '组织每日新闻发布会',
              threshold: '每日1次',
            },
            {
              action: '网络舆论引导',
              content: '组织网络评论员引导舆论，传播正能量',
              threshold: '持续',
            },
            {
              action: '国际舆情应对',
              content: '如有国际关注，做好国际舆情应对准备',
              threshold: '视情启动',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（II级）',
          description: 'II级新增岗位，负责应急通信保障与通信设施抢修',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '通信灾情评估',
              content: '评估火灾对通信基站、光缆等通信设施的影响',
              threshold: '升级后1小时内',
            },
            {
              action: '应急通信车部署',
              content: '向前线指挥部和重点区域部署应急通信车、卫星电话',
              threshold: '升级后2小时内到位',
            },
            {
              action: '通信网络抢修',
              content: '组织电信、移动、联通、铁塔等运营商抢修受损通信设施',
              threshold: '升级后即时',
            },
            {
              action: '指挥部专线保障',
              content: '保障市指挥部至前线指挥部的通信专线（有线+无线双备份）',
              threshold: '升级后即时',
            },
            {
              action: '公众通信恢复',
              content: '分区域逐步恢复公众通信，优先恢复安置点通信',
              threshold: '升级后12小时内重点区域恢复',
            },
            {
              action: '通信保障报告',
              content: '向指挥部报告通信保障和恢复情况',
              threshold: '每4小时更新',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（II级）',
          description: 'II级新增岗位，负责电力设施保护与应急供电保障',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '电力灾情评估',
              content: '评估火灾对输电线路、变电站等电力设施的影响',
              threshold: '升级后1小时内',
            },
            {
              action: '火场紧急断电',
              content: '对火场临近区域的输配电线路实施紧急断电，防止断线引燃',
              threshold: '升级后即时',
            },
            {
              action: '应急供电保障',
              content: '调配应急发电车保障指挥部、医院、安置点基本供电',
              threshold: '升级后2小时内到位',
            },
            {
              action: '电网抢修',
              content: '组织抢修队伍，在火场安全后抢修受损电网',
              threshold: '火场安全后即时',
            },
            {
              action: '重点设施保护',
              content: '对临近火场的变电站、输电线路采取清理可燃物、设置隔离带等保护措施',
              threshold: '升级后即时',
            },
            {
              action: '用电安全提示',
              content: '向火灾区域用户发布用电安全提示和停电通知',
              threshold: '升级后即时',
            },
            {
              action: '电力恢复方案',
              content: '制定分区域电力恢复方案',
              threshold: '升级后6小时内',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（II级）',
          description: 'II级新增岗位，负责大规模扑火、群众疏散与秩序维护',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '接受任务',
              content: '按照市指挥部统一指令受领扑火、疏散、警戒等任务',
              threshold: '升级后1小时内',
            },
            {
              action: '兵力集结与投送',
              content: '根据任务需求集结兵力并向任务区域机动',
              threshold: '受领任务后3小时内到位',
            },
            {
              action: '大规模扑火',
              content: '在指定火场区域展开扑火作战',
              threshold: '到位后即时',
            },
            {
              action: '隔离带开设',
              content: '发挥兵力优势，大规模开设防火隔离带',
              threshold: '按指令执行',
            },
            {
              action: '群众疏散',
              content: '协助地方组织大规模群众疏散转移',
              threshold: '按指令执行',
            },
            {
              action: '重点目标警戒',
              content: '对重要桥梁、水库、危险品仓库等实施武装警戒',
              threshold: '到位后即时',
            },
            {
              action: '物资搬运',
              content: '参与救灾物资装卸和分发',
              threshold: '按指令执行',
            },
            {
              action: '情况报告',
              content: '定期向市指挥部报告任务执行和兵力部署情况',
              threshold: '每4小时报告',
            },
            {
              action: '后勤自给',
              content: '确保部队基本后勤自给，减轻地方保障压力',
              threshold: '全程',
            },
          ],
        },
      ],
    },
    {
      level: 'I',
      color: 'red',
      label: 'I级响应',
      conditions: [
        '受害森林面积≥1000公顷（含本数），火灾呈大面积失控态势',
        '已确认死亡人数≥30人（含本数），或重伤≥100人（含本数）',
        '火势严重威胁设区的市级以上城市建成区、国家级自然保护区和世界自然遗产地',
        '火场同时威胁多个县级以上城镇，大面积疏散≥5万人',
        '森林火灾蔓延进入国家级自然保护区核心区或世界遗产地核心区',
        '火灾引发特大次生灾害（大型堰塞湖溃坝、化工厂爆炸、危险化学品大规模泄漏等）',
        '森林火灾导致区域生态安全受到严重威胁，可能造成不可逆生态破坏',
        '国务院决定启动I级响应',
        '发生在跨省界区域且两个以上省份同时受灾',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '市长',
          fullName: '市长（I级）',
          description: '执行国务院指令，实施全市总动员',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条；《森林草原防灭火条例》第4条',
          sopTable: [
            {
              action: '执行国务院指令',
              content: '坚决执行国务院森防指及工作组的各项指令',
              threshold: '即时',
            },
            {
              action: '全市总动员',
              content: '实施全市总动员，一切力量投入灭火救灾',
              threshold: '升级后即时',
            },
            {
              action: '对接国家级力量',
              content: '对接应急管理部工作组、国家林草局工作组、解放军部队等',
              threshold: '升级后即时',
            },
            {
              action: '大规模疏散指挥',
              content: '指挥可能涉及数万人的大规模跨区域疏散转移',
              threshold: '升级后即时',
            },
            {
              action: '请求全国支援',
              content: '请求全国各省（区、市）扑火力量和物资支援',
              threshold: '升级后2小时内',
            },
            {
              action: '每日述职',
              content: '每日向国务院森防指和省森防指述职',
              threshold: '每日2次',
            },
            {
              action: '灾后重建部署',
              content: '火情稳定后部署灾后重建',
              threshold: '火情稳定后启动',
            },
          ],
        },
        {
          name: '副市长',
          fullName: '副市长（I级）',
          description: '前线全权指挥，统一指挥前线各力量',
          sopTable: [
            {
              action: '前线全权指挥',
              content: '全力执行国务院森防指和市级指挥部指令，统一指挥前线各力量',
              threshold: '全程',
            },
            {
              action: '国家级力量对接',
              content: '对接国家级扑火力量，合理安排作战任务区域',
              threshold: '即时',
            },
            {
              action: '跨省协调',
              content: '协调跨省增援的扑火力量、装备和物资',
              threshold: '即时',
            },
            {
              action: '专项任务执行',
              content: '执行指挥部确定的防火隔离带开设、重点目标保护等专项任务',
              threshold: '按指令执行',
            },
            {
              action: '情况速报',
              content: '向前线出现重大变化（爆燃/风向突变/人员伤亡等）即时上报',
              threshold: '5分钟内上报',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（I级）',
          sopTable: [
            {
              action: '全面信息汇总',
              content: '建立全市统一灾情信息平台，实现国家-省-市三级信息共享',
              threshold: '升级后即时',
            },
            {
              action: '国家级资源对接',
              content: '对接国家级应急资源，协助做好力量部署和后勤保障',
              threshold: '升级后即时',
            },
            {
              action: '全域物资调配',
              content: '实现全域救灾物资统一调配，确保物资到点到位',
              threshold: '升级后即时',
            },
            {
              action: '火情全面评估',
              content: '配合国家工作组开展火情全面评估',
              threshold: '持续',
            },
            {
              action: '恢复重建方案',
              content: '编制灾后恢复重建总体方案',
              threshold: '火情稳定后1周内',
            },
          ],
        },
        {
          name: '市林草局',
          fullName: '市林草局（I级）',
          sopTable: [
            {
              action: '配合国家林草局工作组',
              content: '为国家林草局工作组提供本地林情数据、图件和专业支持',
              threshold: '升级后即时',
            },
            {
              action: '森林资源损失详评',
              content: '配合国家工作组开展森林资源损失详细评估',
              threshold: '升级后72小时内',
            },
            {
              action: '火烧迹地管理方案',
              content: '制定大规模火烧迹地水土保持和生态修复方案',
              threshold: '火情稳定后启动',
            },
          ],
        },
        {
          name: '市消防救援支队',
          fullName: '市消防救援支队（I级）',
          sopTable: [
            {
              action: '服从国家统一指挥',
              content: '全市消防扑火力量纳入国家统一指挥体系',
              threshold: '升级后即时',
            },
            {
              action: '全力配合作战',
              content: '配合国家级森林消防力量、解放军部队协同作战',
              threshold: '全程',
            },
            {
              action: '城市消防保障',
              content: '确保市区消防安全，防止飞火引发城市火灾',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（I级）',
          sopTable: [
            {
              action: '全域戒严',
              content: '对核心火场区域实施戒严',
              threshold: '升级后即时',
            },
            {
              action: '全力保障救援通道',
              content: '实施最严格的交通管制，确保国家级救援力量畅通',
              threshold: '升级后即时',
            },
            {
              action: '严厉打击犯罪',
              content: '对趁火犯罪从重从快打击',
              threshold: '全程',
            },
            {
              action: '外媒管理',
              content: '做好境外媒体采访管理',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（I级）',
          sopTable: [
            {
              action: '请求国家医疗支援',
              content: '请求国家卫健委调派国家级烧伤科、呼吸科专家组',
              threshold: '升级后即时',
            },
            {
              action: '大规模伤员转运',
              content: '组织大规模跨省伤员转运',
              threshold: '升级后即时',
            },
            {
              action: '全面防疫',
              content: '实施全面卫生防疫，确保大灾之后无大疫',
              threshold: '升级后即时',
            },
            {
              action: '心理援助全覆盖',
              content: '实现受灾群众和扑火人员心理援助全覆盖',
              threshold: '升级后24小时内',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（I级）',
          sopTable: [
            {
              action: '联合国家气象中心',
              content: '对接国家气象中心，获取国家级气象卫星和数值预报产品支撑',
              threshold: '升级后即时',
            },
            {
              action: '大规模人工增雨',
              content: '协调周边省份气象部门联合实施大规模飞机和火箭增雨作业',
              threshold: '条件具备后即时',
            },
            {
              action: '火险预警全国发布',
              content: '配合国家气象中心向全国发布火险预警信息',
              threshold: '按指令执行',
            },
          ],
        },
        {
          name: '市自然资源局',
          fullName: '市自然资源局（I级）',
          sourceNote:
            '《国家森林草原灾害应急预案》第6.3.4条',
          sopTable: [
            {
              action: '加密地质灾害监测',
              content: '对火烧迹地和火场周边山体实施全天候地质灾害监测，每2小时更新风险数据',
              threshold: '每2小时更新',
            },
            {
              action: '配合国家级评估',
              content: '配合国家级地质灾害专家组开展火场区域地质安全全面评估',
              threshold: '升级后即时',
            },
            {
              action: '涉山道路封闭建议',
              content: '对存在滑坡/泥石流风险的山丘道路提出封闭建议',
              threshold: '即时',
            },
            {
              action: '矿区全面停产撤人',
              content: '对火场周边全部矿山企业实施停产撤人，确保零遗漏',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（I级）',
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条',
          sopTable: [
            {
              action: '全域交通管制配合',
              content: '配合公安实施最严格的交通管制，保障国家级救援车队畅通',
              threshold: '升级后即时',
            },
            {
              action: '道路抢通突击',
              content: '组织机械化队伍抢通因火灾受损的主干道路，12小时内恢复基本通行',
              threshold: '12小时恢复',
            },
            {
              action: '大规模转运保障',
              content: '调集全市客运运力，保障数万人规模疏散转运需求',
              threshold: '升级后即时',
            },
            {
              action: '救灾物资运输',
              content: '协调铁路、公路货运力量，保障全国支援物资快速转运至前线',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（I级）',
          sopTable: [
            {
              action: '最严格舆情管控',
              content: '实施最严格的网络舆情管控措施',
              threshold: '升级后即时',
            },
            {
              action: '配合国新办',
              content: '配合国务院新闻办做好信息发布',
              threshold: '按指令执行',
            },
            {
              action: '国际舆论引导',
              content: '做好国际舆论引导，传播中国防火救灾正面形象',
              threshold: '升级后即时',
            },
            {
              action: '谣言最快处置',
              content: '对谣言实施最快速处置机制',
              threshold: '发现后30分钟内',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（I级）',
          sopTable: [
            {
              action: '全面通信保障',
              content: '调配一切通信资源保障国家级指挥通信',
              threshold: '升级后即时',
            },
            {
              action: '卫星通信保障',
              content: '部署Ka/Ku频段卫星通信终端保障核心区域通信',
              threshold: '升级后4小时内',
            },
            {
              action: '公众通信恢复',
              content: '加快公众通信恢复进度',
              threshold: '升级后24小时内部分恢复',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（I级）',
          sopTable: [
            {
              action: '全面电力保障',
              content: '调配一切发电设备保障所有关键设施供电',
              threshold: '升级后即时',
            },
            {
              action: '请求国网省公司支援',
              content: '请求国家电网省电力公司调派全省抢修力量支援',
              threshold: '升级后2小时内',
            },
            {
              action: '电网全面抢修',
              content: '组织电网全面抢修，制定分阶段恢复方案',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（I级）',
          sopTable: [
            {
              action: '大规模投入',
              content: '按国务院指令大规模投入兵力',
              threshold: '按军令执行',
            },
            {
              action: '核心区域扑火',
              content: '在核心火场区域配合解放军实施大规模扑火',
              threshold: '到位后即时展开',
            },
            {
              action: '重点目标军事保卫',
              content: '对全部重点目标实施武装保卫',
              threshold: '按指令执行',
            },
            {
              action: '配合解放军',
              content: '在统一指挥下配合解放军执行各项任务',
              threshold: '按指令执行',
            },
          ],
        },
        {
          name: '应急管理部工作组',
          fullName: '应急管理部工作组（I级）',
          description: 'I级响应国家级支援，代表国务院森防指靠前协调，统筹全国资源支援',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条"I级响应"；《森林草原防灭火条例》第4条（国家指挥部职责）',
          sopTable: [
            {
              action: '工作组进驻',
              content: '应急管理部派出前方工作组进驻市指挥部，代表国务院森防指靠前协调',
              threshold: '国务院启动I级响应后12小时内到达',
            },
            {
              action: '全国资源统筹',
              content: '统筹全国森林消防队伍、航空消防飞机、应急物资等资源调拨',
              threshold: '到达后即时展开',
            },
            {
              action: '扑火方案审定',
              content: '审定总体扑火方案，确保科学安全有效',
              threshold: '到达后24小时内',
            },
            {
              action: '跨省跨区协调',
              content: '协调跨省（区、市）增援力量和航空力量',
              threshold: '即时',
            },
            {
              action: '信息专报',
              content: '每日向国务院森防指报送火情和处置专报',
              threshold: '每日2次',
            },
            {
              action: '新闻发布会',
              content: '协调召开国家级新闻发布会',
              threshold: '按需要',
            },
            {
              action: '伤亡抚恤协调',
              content: '协调扑火伤亡人员的国家层面抚恤和表彰',
              threshold: '持续',
            },
            {
              action: '国际援助协调',
              content: '如需国际援助（卫星数据/航空灭火/专业队伍），做好对接协调',
              threshold: '视情启动',
            },
          ],
        },
        {
          name: '国家林草局工作组',
          fullName: '国家林草局工作组（I级）',
          description: 'I级响应国家级支援，提供森林火灾专业支撑与全国林草系统力量协调',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条"I级响应"',
          sopTable: [
            {
              action: '工作组派遣',
              content: '国家林草局派出前方工作组，提供森林火灾专业支撑',
              threshold: 'I级响应启动后24小时内到达',
            },
            {
              action: '卫星遥感分析',
              content: '协调获取高分系列卫星和国外卫星影像，全面分析火场态势',
              threshold: '到达后即时',
            },
            {
              action: '全国林草专家调度',
              content: '调度全国林草系统森林防火专家参与研判',
              threshold: '到达后即时',
            },
            {
              action: '生态损失评估',
              content: '组织森林资源损失和生态影响全面评估',
              threshold: '到达后72小时内初评',
            },
            {
              action: '火烧迹地恢复规划',
              content: '制定火烧迹地生态恢复总体规划',
              threshold: '火情稳定后启动',
            },
            {
              action: '国际数据协调',
              content: '协调获取国际卫星林火监测数据（如NASA FIRMS等）',
              threshold: '视情启动',
            },
          ],
        },
        {
          name: '省应急厅前方工作组',
          fullName: '省应急厅前方工作组（I级）',
          description: 'I级响应省级支援，驻点协调省级资源全面统筹',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条"I级响应"',
          sopTable: [
            {
              action: '驻点协调',
              content: '省应急厅派出前方工作组，驻点市指挥部协调',
              threshold: '升级后12小时内到达',
            },
            {
              action: '省级资源全面统筹',
              content: '统筹全省扑火力量、应急物资、航空力量等',
              threshold: '到达后即时',
            },
            {
              action: '国家资源申请',
              content: '协助市指挥部向国家申请各项资源支援',
              threshold: '到达后即时',
            },
            {
              action: '省级医疗资源调度',
              content: '调度全省烧伤科、呼吸科等专家力量和医疗资源',
              threshold: '到达后即时',
            },
            {
              action: '省内跨市协调',
              content: '协调省内其他地市扑火力量和物资支援',
              threshold: '即时',
            },
            {
              action: '每日省级专报',
              content: '向省政府和省森防指报送每日专报',
              threshold: '每日1次',
            },
          ],
        },
        {
          name: '解放军部队',
          fullName: '解放军部队（I级）',
          description: 'I级响应国家级支援，成建制投入大规模扑火和抢险',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条"I级响应"',
          sopTable: [
            {
              action: '受领作战任务',
              content: '按照中央军委联合作战指挥中心指令和国务院森防指部署受领任务',
              threshold: '按军令执行',
            },
            {
              action: '成建制兵力投送',
              content: '以团/旅级建制投送兵力至任务区域',
              threshold: '受领任务后24小时内到位',
            },
            {
              action: '大规模扑火作战',
              content: '在划定的任务区域展开大规模扑火、隔离带开设等',
              threshold: '到位后即时展开',
            },
            {
              action: '大规模群众疏散',
              content: '出动机械化部队协助大规模群众疏散转移',
              threshold: '按指令执行',
            },
            {
              action: '重大目标军事防护',
              content: '对重要军事设施实施防护，对有爆炸危险的军事目标实施紧急处置',
              threshold: '按指令执行',
            },
            {
              action: '空中力量配合',
              content: '协调军用直升机参与航空灭火和物资投送',
              threshold: '按指令执行',
            },
            {
              action: '后勤保障',
              content: '部队后勤基地为地方提供必要的后勤支援',
              threshold: '按指令执行',
            },
            {
              action: '战况报告',
              content: '每日向联指和指挥部报告任务执行情况',
              threshold: '每日2次',
            },
          ],
        },
        {
          name: '国家消防救援局森林消防队伍',
          fullName: '国家消防救援局森林消防队伍（I级）',
          description: 'I级响应国家级支援，全国森林消防力量统一调度',
          isNew: true,
          sourceNote:
            '《国家森林草原火灾应急预案》第6.3.4条"I级响应"',
          sopTable: [
            {
              action: '全国力量调度',
              content: '国家消防救援局统一调度全国森林消防队伍，优先调派最近的专业扑火力量',
              threshold: 'I级响应启动后即时',
            },
            {
              action: '成建制增援',
              content: '以支队/大队建制向火场投送森林消防专业力量',
              threshold: '受领任务后24小时内到位',
            },
            {
              action: '航空消防力量投送',
              content: '调派大型灭火飞机（如AG600/M-26等）参与航空灭火',
              threshold: 'I级响应启动后12小时内到位',
            },
            {
              action: '扑火战术指导',
              content: '派出国家级扑火专家团队指导制定总体扑火战术方案',
              threshold: '到达后即时',
            },
            {
              action: '空地协同指挥',
              content: '建立空地一体化灭火指挥体系，协调地面与航空力量协同作战',
              threshold: '到达后即时',
            },
            {
              action: '情况报告',
              content: '每日向国务院森防指和应急管理部报告扑火进展',
              threshold: '每日2次',
            },
          ],
        },
      ],
    },
  ],
  references: [
    { title: '《国家森林草原火灾应急预案》（国办函〔2020〕99号）', url: 'https://www.gov.cn/zhengce/zhengceku/2020-11/23/content_5563570.htm' },
    { title: '《森林草原防灭火条例》（国务院令第822号，2026年施行）', url: 'https://www.gov.cn/zhengce/zhengceku/202511/content_7049205.htm' },
    { title: '《森林防火条例》（国务院令第541号）', url: 'https://www.gov.cn/zhengce/content/2008-12/05/content_2748.htm' },
    { title: '《中华人民共和国森林法》（2019年修订）', url: 'https://www.gov.cn/xinwen/2019-12/28/content_5464831.htm' },
    { title: '《国家突发事件总体应急预案》（2025年）', url: 'https://www.gov.cn/zhengce/202502/content_7005635.htm' },
    { title: '《关于全面加强新形势下森林草原防灭火工作的意见》（2023年）', url: 'https://www.gov.cn/zhengce/2023-04/20/content_5752254.htm' },
  ],
};
