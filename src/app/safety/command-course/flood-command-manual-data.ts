import type { CommandManualData } from './types';

export type { SOPAction, DepartmentSOP, ResponseLevel, CommandManualData } from './types';

export const floodCommandManualData: CommandManualData = {
  disasterName: '内涝',
  disasterIcon: '内涝灾害',
  responseLevels: [
    {
      level: 'IV',
      color: 'blue',
      label: 'IV级响应',
      conditions: [
        '城区持续强降雨',
        '1小时降雨量 ≥30mm',
        '主干道积水深度 ≥30cm 且持续 ≥20分钟',
        '气象局发布蓝色预警',
      ],
      conditionLogic: '需同时满足全部4项条件',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（IV级）',
          sourceNote:
            '《北京市防汛应急预案》5.2.2防汛蓝色（四级）预警响应',
          sopTable: [
            {
              action: '指令水文监测',
              content: '监测河道水位、流量，预测洪水对城市排水系统影响',
              threshold: '即时',
            },
            {
              action: '指令城管监测',
              content: '利用地下管网监控平台，实时监测易涝点水位、排水设施运行状态',
              threshold: '即时',
            },
            {
              action: '指令交通巡查',
              content: '通过视频监控和巡查，识别低洼路段、隧道、涵洞等高风险区域',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（IV级）',
          sopTable: [
            {
              action: '值班值守',
              content: '安排专职值班人员，实时接收气象水文预报和积水点监测数据',
              threshold: '24小时在岗',
            },
            {
              action: '动态跟踪',
              content: '通过智慧应急平台跟踪高风险区域，每小时汇总各区县上报灾情及处置进展',
              threshold: '每小时1次',
            },
            {
              action: '物资调拨',
              content: '协调城管调拨移动泵车、排水管、沙袋至预设点位；督促街道清理雨水箅子',
              threshold: '即时',
            },
            {
              action: '协议储备',
              content: '启动企业代储协议，确保突发情况可快速调用',
              threshold: '即时',
            },
            {
              action: '队伍待命',
              content: '指令消防、市政抢险队伍待命，接到指令后30分钟内抵达现场',
              threshold: '30分钟响应',
            },
            {
              action: '技术支援',
              content: '组织专家团队指导管网疏通和设备操作',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（IV级）',
          sourceNote:
            '住建部《关于做好2024年城市排水防涝工作的通知》',
          sopTable: [
            {
              action: '拉网排查',
              content: '对历史易涝点排查，清理雨水箅子、排水口杂物；每处易涝点配1名技术负责人',
              threshold: '即时',
            },
            {
              action: '清淤作业',
              content: '每处易涝点配备3-5名清淤人员，使用铁钩、高压冲洗车等工具执行"即堵即清"',
              threshold: '即时',
            },
            {
              action: '智慧排水',
              content: '联动泵站根据水位监测自动开启强排；重大风险15分钟内电话直报分管副市长',
              threshold: '15分钟直报',
            },
            {
              action: '老旧泵站值守',
              content: '增派技术员驻点值守，每小时检查电机、配电柜运行状态',
              threshold: '每小时1次',
            },
            {
              action: '移动泵车',
              content: '调派移动泵车铺设排水管，定向导流优先处置主干道积水',
              threshold: '即时',
            },
            {
              action: '防倒灌',
              content: '预置沙袋；对井盖缺失或移位点位设置警示围栏',
              threshold: '即时',
            },
            {
              action: '物资检查',
              content: '检查防汛仓库储备，确保排水管、发电机、燃油满足48小时连续作业需求',
              threshold: '即时',
            },
            {
              action: '队伍待命',
              content: '组织市政抢险队伍待命，确保30分钟内可抵达现场',
              threshold: '30分钟响应',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（IV级）',
          sourceNote:
            '《北京市防汛应急预案》5.2.2第(6)条',
          sopTable: [
            {
              action: '交通管制',
              content: '积水深度≥30cm的低洼路段、下穿隧道实施交通管制：设警示牌、反光锥等物理隔离；导航平台实时推送绕行路线',
              threshold: '≥30cm即执行',
            },
            {
              action: '路况监控',
              content: '启动全市交通监控系统，重点监测易涝点周边交通流量',
              threshold: '每30分钟更新1次',
            },
            {
              action: '隐患巡查',
              content: '巡查桥梁、隧道、急弯陡坡等隐患点，发现问题即时上报',
              threshold: '即时',
            },
            {
              action: '公交调整',
              content: '动态调整公交线路；必要时调派应急接驳车转移受困群众',
              threshold: '即时',
            },
            {
              action: '设备待命',
              content: '调集清障车、装载机至易涝点附近待命，30分钟内响应塌方或车辆抛锚',
              threshold: '30分钟响应',
            },
            {
              action: '物资储备',
              content: '储备沙袋、钢板，用于临时修复塌陷路面或封堵倒灌区域',
              threshold: '即时',
            },
            {
              action: '队伍待命',
              content: '抢险队伍24小时待命，1小时内抵达现场',
              threshold: '1小时响应',
            },
            {
              action: '信息发布',
              content: '联合融媒体中心发布断交点位地图、绕行方案及恢复时间预测',
              threshold: '即时',
            },
            {
              action: '配合排水',
              content: '配合城管疏通排水管网，优先清理公交站台、地铁口周边积水',
              threshold: '即时',
            },
            {
              action: '数据接入',
              content: '接入气象局实时降雨数据，通过GIS叠加交通管制区域',
              threshold: '即时',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（IV级）',
          sourceNote:
            '《北京市防汛应急预案》第2.3条"基层防汛指挥机构"职责',
          sopTable: [
            {
              action: '及时直报',
              content: '主干道积水深度≥30cm、持续20分钟以上，15分钟内电话直报上级应急管理部门',
              threshold: '15分钟直报',
            },
            {
              action: '信息汇总',
              content: '通过应急通信系统收集汇总现场信息：积水点位、物资需求等',
              threshold: '即时',
            },
            {
              action: '重点巡查',
              content: '老旧小区、低洼路段实施"一点一策"治理，每小时巡查一次积水情况',
              threshold: '每小时1次',
            },
            {
              action: '设施检查',
              content: '检查路灯、广告牌等市政设施漏电隐患，设置警示标识',
              threshold: '即时',
            },
            {
              action: '居民提示',
              content: '通过社区公告栏、微信群、广播等渠道提示居民避开积水路段',
              threshold: '即时',
            },
            {
              action: '网格清理',
              content: '组织社区人员、网格员对雨水箅子、排水口拉网排查，清除堵塞物',
              threshold: '即时',
            },
            {
              action: '敲门行动',
              content: '对独居老人、残障人员等脆弱群体逐户告知风险并协助转移',
              threshold: '即时',
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
        '本市单小时降雨量≥50mm且持续',
        '气象局发布黄色预警',
        '交警监测：多个主干道积水深度超30cm且持续30分钟以上',
        '城市管理局上报超过5处内涝点',
        '排水系统超负荷运行',
      ],
      conditionLogic: '满足以下任意3项以上即可触发升级',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（III级）',
          sopTable: [
            {
              action: '到岗指挥',
              content: '立即到岗坐镇应急指挥中心，统筹应急、城管、交通、公安、卫健等部门成立联合指挥部，集中办公',
              threshold: '即时',
            },
            {
              action: '督导方案',
              content: '检查各成员单位预案执行情况，重点督导城管"一点一策"与交通公交绕行方案落地',
              threshold: '即时',
            },
            {
              action: '短临研判',
              content: '每30分钟听取气象、水文短临预报；GIS叠加积水点、救援队伍位置数据预判升级风险',
              threshold: '每30分钟1次',
            },
            {
              action: '升级建议',
              content: '若主干道积水深度≥50cm或新增3处以上断交点，向市长建议启动II级响应',
              threshold: '≥50cm或≥3处断交',
            },
            {
              action: '硬隔离',
              content: '指令公安交警在断交上游500米设硬隔离封闭积水路段；交通局铺设钢板临时恢复通行',
              threshold: '500米硬隔离',
            },
            {
              action: '保障供电医疗',
              content: '督导供电公司保障泵站、医院供电；卫健委设置临时医疗点并配备急救包',
              threshold: '即时',
            },
            {
              action: '平台监控',
              content: '指令城管部门利用地下管网监控平台实时监测易涝点水位、排水设施运行状态',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（III级）',
          sopTable: [
            {
              action: '局长带班',
              content: '局长到岗带班，组织成立应急、城管、交通、公安、卫健等部门24小时联合指挥部，集中办公',
              threshold: '即时',
            },
            {
              action: 'GIS监控',
              content: '启动应急指挥平台GIS实时叠加功能：动态监控内涝点、救援队伍分布与物资调度路径',
              threshold: '即时',
            },
            {
              action: '物资增配',
              content: '增配移动泵车、冲锋舟、沙袋；高风险区域物资预置量增加30%-50%；启动企业代储协议',
              threshold: '即时',
            },
            {
              action: '联合抢险',
              content: '协调消防、武警等组建联合抢险组，重点保障医院、学校、地下车库等关键区域',
              threshold: '即时',
            },
            {
              action: '应急保障',
              content: '预置应急发电车、卫星电话，保障泵站和通信基站运行',
              threshold: '即时',
            },
            {
              action: '动态简报',
              content: '每30分钟汇总气象、城管、交警数据，生成《内涝风险动态简报》上报市政府及省级应急管理部门',
              threshold: '每30分钟1次',
            },
            {
              action: '临时医疗协调',
              content: '卫健委在断交区域周边设临时医疗点不少于3个；协调交通局调派应急接驳车转移受困群众',
              threshold: '临时医疗点≥3个',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（III级）',
          description: 'III级较IV级新增岗位，负责治安管控与交通秩序维护',
          isNew: true,
          sourceNote:
            '《国家防汛抗旱应急预案》第5.2.6条"治安保障"',
          sopTable: [
            {
              action: '到岗带班',
              content: '分管副局长到岗带班；组建交警、特警、治安、网安等多警种24小时联合指挥部',
              threshold: '即时',
            },
            {
              action: '数据整合',
              content: '通过指挥平台实时整合气象、水文、城管数据，动态监控内涝点、断交点及救援进展',
              threshold: '即时',
            },
            {
              action: '全警上路',
              content: '调派50%以上警力驻守重点区域；协调周边县市警力待命，1小时内增援',
              threshold: '50%以上警力',
            },
            {
              action: '硬隔离',
              content: '积水深度≥50cm路段上游500米设置警示牌反光锥实施硬隔离；导航APP推送绕行方案',
              threshold: '≥50cm执行',
            },
            {
              action: '公交调整',
              content: '联合交通局暂停或绕行受影响公交线路，调集应急接驳车转移受困群众',
              threshold: '即时',
            },
            {
              action: '绿色通道',
              content: '在医院、学校周边开辟应急绿色通道，警车引导救护车、救援车辆优先通行',
              threshold: '即时',
            },
            {
              action: '物资调集',
              content: '调集冲锋舟、救生衣等应急物资，配合消防支队实施积水区人员转移',
              threshold: '即时',
            },
            {
              action: '联动抢险',
              content: '协同城管、应急局成立联合抢险组，负责现场秩序维护与车辆拖离',
              threshold: '即时',
            },
            {
              action: '临时医疗',
              content: '协同卫健委在断交区域周边设不少于3个临时医疗点，优先救治老弱病残',
              threshold: '临时医疗点≥3个',
            },
            {
              action: '协议储备',
              content: '启动协议储备机制，调用企业代储物资，2小时内抵达现场',
              threshold: '2小时',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（III级）',
          sourceNote:
            '《北京市防汛应急预案》5.2.3第(6)(7)条',
          sopTable: [
            {
              action: '局长进驻',
              content: '局长进驻应急指挥中心，组建公路、运管、公交、轨交等多部门24小时联合指挥部',
              threshold: '即时',
            },
            {
              action: '信息整合',
              content: '每30分钟整合气象、水文、城管数据，通过GIS监控内涝点、断交点及救援进展，生成《内涝风险动态简报》',
              threshold: '每30分钟1次',
            },
            {
              action: '方案检查',
              content: '检查下属单位应急预案执行情况，重点督导公交绕行、地铁防汛、公路抢通等责任到人',
              threshold: '即时',
            },
            {
              action: '硬隔离',
              content: '积水深度≥50cm路段上游500米设警示牌反光锥实施硬隔离封闭；导航APP推送绕行方案',
              threshold: '≥50cm执行',
            },
            {
              action: '公交调整',
              content: '暂停或绕行受影响公交线路，调集应急接驳车转移受困群众',
              threshold: '即时',
            },
            {
              action: '道路抢修',
              content: '增配挖掘机、装载机等大型设备清除塌方淤泥；塌陷区域铺设钢板+速凝材料，2小时内恢复单向通行',
              threshold: '2小时恢复',
            },
            {
              action: '优先排水',
              content: '联合城管调集移动泵车，优先抽排医院、交通枢纽周边积水',
              threshold: '即时',
            },
            {
              action: '地铁督导',
              content: '督导地铁运营单位加强地下站点防汛措施，必要时调整运营时间或停运',
              threshold: '即时',
            },
            {
              action: '协议储备',
              content: '启动企业协议储备机制，调用清障车、钢板、发电机等物资，2小时内抵达现场',
              threshold: '2小时',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（III级）',
          sopTable: [
            {
              action: '进驻指挥',
              content: '分管副局长进驻指挥中心，统筹24小时联合抢险指挥部，联动应急、交通、气象等集中办公',
              threshold: '即时',
            },
            {
              action: '专项工作组',
              content: '启动排水抢险组、设施保障组、次生灾害防控组',
              threshold: '即时',
            },
            {
              action: '实时更新',
              content: '每30分钟通过GIS内涝风险地图更新积水点水位、泵站运行状态并同步应急平台；重大风险15分钟内电话直报副市长',
              threshold: '每30分钟1次；15分钟直报',
            },
            {
              action: '人员增派',
              content: '各区城管局、养护单位按预案增派人员与设备',
              threshold: '即时',
            },
            {
              action: '大型抽排',
              content: '增配移动泵车，优先处置主干道、下穿隧道积水',
              threshold: '即时',
            },
            {
              action: '管网疏通',
              content: '堵塞点采用高压冲洗车和人工清淤，确保排水口开孔率≥95%',
              threshold: '开孔率≥95%',
            },
            {
              action: '防倒灌',
              content: '预置防水挡板；低洼小区、地下车库入口增配沙袋',
              threshold: '即时',
            },
            {
              action: '硬隔离',
              content: '对积水严重路段（医院、学校周边）实施上游500米硬隔离；联合交警推送绕行路线',
              threshold: '500米硬隔离',
            },
            {
              action: '高危巡查',
              content: '检查路灯杆、广告牌漏电风险；松动设施强制拆除',
              threshold: '即时',
            },
            {
              action: '敲门行动',
              content: '联合街道定向协助独居老人、残障群体转移至临时安置点',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（III级）',
          description: 'III级较IV级新增岗位，负责医疗救治与公共卫生保障',
          isNew: true,
          sourceNote:
            '《国家防汛抗旱应急预案》第4.10条"安全防护和医疗救护"',
          sopTable: [
            {
              action: '进驻指挥',
              content: '卫健委主要领导进驻指挥中心，组建医疗救治、疾控、监督等联合工作组',
              threshold: '即时',
            },
            {
              action: '风险研判',
              content: '每30分钟汇总气象、水文数据，结合内涝点分布预判次生公共卫生风险；风险升级立即向市政府建议启动II级响应',
              threshold: '每30分钟1次',
            },
            {
              action: '方案检查',
              content: '检查医疗资源调配、人员值守、物资储备等',
              threshold: '即时',
            },
            {
              action: '临时医疗点',
              content: '断交区域、安置点增设不少于3个临时医疗站，配急救药品与消杀物资，优先救治老弱病残',
              threshold: '临时医疗点≥3个',
            },
            {
              action: '巡回医疗队',
              content: '增派不少于5支巡回医疗队，覆盖断交区域及安置点',
              threshold: '巡回医疗队≥5支',
            },
            {
              action: '水源检测',
              content: '内涝区水源每6小时检测1次，监测大肠杆菌、重金属等；发现污染立即停用并通报城管',
              threshold: '每6小时1次',
            },
            {
              action: '消杀防疫',
              content: '疾控队伍对积水区域喷洒杀虫剂预防蚊媒传播；垃圾堆放点日产日清和消毒',
              threshold: '即时',
            },
            {
              action: '监测哨点',
              content: '安置点设发热/腹泻监测哨点：异常聚集病例2小时内启动流调；疑似霍乱、痢疾"即报即隔"',
              threshold: '2小时流调',
            },
            {
              action: '绿色通道',
              content: '协同交通、公安申请救护车与医疗物资运输"特别通行证"；协调公安维护医疗点秩序',
              threshold: '即时',
            },
            {
              action: '协议储备',
              content: '启动协议储备机制，2小时内抵达现场',
              threshold: '2小时',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（III级）',
          description: 'III级较IV级新增岗位，负责气象监测与短临预报',
          isNew: true,
          sourceNote:
            '《北京市防汛应急预案》第4.1.1条"气象监测预报"',
          sopTable: [
            {
              action: '进驻指挥',
              content: '分管副局长进驻应急指挥中心，组建24小时联合指挥部（气象台、减灾科、办公室等参与）',
              threshold: '即时',
            },
            {
              action: '预案检查',
              content: '检查应急预案落实：监测设备运行、预警发布流程、值班人员配置',
              threshold: '即时',
            },
            {
              action: '升级建议',
              content: '每30分钟综合气象、城管等部门数据预判内涝发展趋势：若监测到3小时降雨≥50mm或新增≥3处主干道积水≥50cm，立即向市政府建议启动II级响应',
              threshold: '每30分钟1次',
            },
            {
              action: '实况监测',
              content: '启动移动气象监测车、无人机对重灾区分分钟实况监测',
              threshold: '即时',
            },
            {
              action: '短临预报',
              content: '每1小时发布0-3小时强降水落区预报，GIS叠加地形与排水管网数据预测积水扩散路径',
              threshold: '每1小时1次',
            },
            {
              action: '动态简报',
              content: '每2小时向市长、防汛指挥部报送《内涝风险动态简报》',
              threshold: '每2小时1次',
            },
            {
              action: '全网预警',
              content: '通过预警平台/短信/APP弹窗对受威胁区域全网发布暴雨橙色预警，标注具体断交点位',
              threshold: '即时',
            },
            {
              action: '泵站联动',
              content: '联动应急与城管，指导泵站预排与移动泵车布点待命',
              threshold: '即时',
            },
            {
              action: '交通协同',
              content: '协同交通局向交警推送积水点实时地图，支持封闭深度≥50cm路段',
              threshold: '即时',
            },
            {
              action: '供电保障',
              content: '指令供电公司对低洼变电站预置防水挡板，保障气象监测站不间断供电',
              threshold: '即时',
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
        '12小时内持续降雨量≥100mm',
        '气象局发布橙色预警',
        '交警监测：主干道积水深度≥80cm持续2小时以上',
        '城管上报：超过5条主干道同时断交',
        '供电设施周边道路全面中断，影响抢险救援',
        'III级下投入全部移动泵车、冲锋舟，但积水消退速度＜30%',
      ],
      conditionLogic: '满足以下任意3项以上即可触发升级',
      departments: [
        {
          name: '市长',
          fullName: '市长（II级）',
          description: 'II级新增岗位，首次直接介入指挥，担任最高决策者',
          isNew: true,
          sourceNote:
            '《北京市防汛应急预案》5.2.4防汛橙色（二级）预警响应第(1)-(32)条',
          sopTable: [
            {
              action: '进驻指挥中心',
              content: '进驻市级应急指挥中心，签发《II级响应启动令》，明确部门分工与响应要求',
              threshold: '即时',
            },
            {
              action: '短临研判',
              content: '每30分钟听取气象、水文部门报告；灾情持续恶化，立即向省级防指申请启动I级响应或调用国家级救援力量',
              threshold: '每30分钟1次',
            },
            {
              action: '医疗保障',
              content: '卫健委保障医院供电供氧，ICU/手术室预置应急发电机',
              threshold: '即时',
            },
            {
              action: '教育保障',
              content: '教育局紧急停课，转移低洼校区师生',
              threshold: '即时',
            },
            {
              action: '工程抢修',
              content: '调集全市工程设备：塌陷路段2小时内恢复单向通行；地铁全网停运，公交绕行高风险区',
              threshold: '2小时恢复',
            },
            {
              action: '堤坝抢险',
              content: '管涌/裂缝堤坝：调用吨袋、速凝剂紧急加固；协调上游水库预泄洪',
              threshold: '即时',
            },
            {
              action: '地下车库',
              content: '强制关闭防水不达标地下车库：双泵并联排水防淹灌；增配"龙吸水"泵车',
              threshold: '即时',
            },
            {
              action: '省级支援',
              content: '调用省级救援队驻军支援人员转移、堤防抢险',
              threshold: '即时',
            },
            {
              action: '通信恢复',
              content: '启用卫星通信车和无人机基站，恢复断交区域信号',
              threshold: '即时',
            },
            {
              action: '舆情发布',
              content: '每小时通过融媒体发布《灾情通报》；网信办全网巡查，对谣言1小时内辟谣',
              threshold: '每小时1次；1小时辟谣',
            },
            {
              action: '强制转移',
              content: '街道对独居老人、残障群体实施"一对一转移"，确保不漏一人',
              threshold: '即时',
            },
          ],
        },
        {
          name: '副市长',
          fullName: '副市长（II级）',
          description: 'II级新增角色，进驻重灾区现场指挥部统筹抢险',
          isNew: true,
          sopTable: [
            {
              action: '现场指挥部',
              content: '进驻重灾区现场指挥部：统筹"抢险救援、医疗救助、交通管制"专项工作组，24小时联合值守',
              threshold: '即时',
            },
            {
              action: '执行指令',
              content: '签发《II级响应执行指令》，细化部门任务',
              threshold: '即时',
            },
            {
              action: '短临研判',
              content: '每30分钟听取气象、水文报告；灾情持续恶化立即向市长建议启动I级响应',
              threshold: '每30分钟1次',
            },
            {
              action: '医疗供电',
              content: '调发电车保障ICU/手术室等医疗双回路供电',
              threshold: '即时',
            },
            {
              action: '道路抢通',
              content: '封闭积水≥80cm路段，挖掘机清淤、钢板铺路',
              threshold: '≥80cm执行',
            },
            {
              action: '地铁停运',
              content: '轨道交通公司全线路停运，疏散滞留乘客',
              threshold: '即时',
            },
            {
              action: '邻市互助',
              content: '启动"邻市互助协议"：2小时内调入清障车、发电机等紧缺物资',
              threshold: '2小时',
            },
            {
              action: '升级预判',
              content: '每30分钟听取气象局短临预报，预判是否触发I级',
              threshold: '每30分钟1次',
            },
            {
              action: '舆情管控',
              content: '网信办全网巡查，1小时内封堵谣言',
              threshold: '1小时',
            },
            {
              action: '五包一转移',
              content: '组织"五包一"小组（1干部+1医生+1民警+1社工+1志愿者），对独居老人、残障群体强制转移',
              threshold: '即时',
            },
            {
              action: '申请支援',
              content: '若市级力量无法控灾（积水消退率＜30%），立即申请国家防总支援',
              threshold: '消退率＜30%',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（II级）',
          sopTable: [
            {
              action: '24小时驻守',
              content: '局长24小时驻守指挥中心，统筹应急、消防、武警、公安等20+部门作战组，实行"1小时会商、2小时调度"',
              threshold: '1小时会商',
            },
            {
              action: '实时叠加',
              content: '实时叠加气象卫星云图、积水点热力图、救援力量定位，自动生成《高风险区域预警指令》推送一线',
              threshold: '即时',
            },
            {
              action: '方案核查',
              content: '核查各部门"一点一策"方案落地情况，未达标单位通报问责',
              threshold: '即时',
            },
            {
              action: '动态简报',
              content: '每30分钟生成《内涝风险动态简报》；重大险情15分钟内电话直报国务院',
              threshold: '每30分钟1次；15分钟直报',
            },
            {
              action: '媒体发布',
              content: '融媒体中心每小时更新：积水禁区地图（水深≥80cm）、临时安置点物资发放渠道、谣言辟谣',
              threshold: '每小时1次',
            },
            {
              action: '省级排涝',
              content: '申请省级排涝基地支援：增调"龙吸水"3000型泵车',
              threshold: '即时',
            },
            {
              action: '社会力量',
              content: '启动协议企业工程队，调用挖掘机等设备抢修塌方路段',
              threshold: '即时',
            },
            {
              action: '强制转移',
              content: '联合街道执行"五包一"强制转移，确保独居老人、残障群体零遗漏',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（II级）',
          sopTable: [
            {
              action: '24小时驻守',
              content: '分管副局长24小时驻守指挥中心：统筹多警种跨部门作战组，实行"1小时会商、2小时调度"',
              threshold: '1小时会商',
            },
            {
              action: '数据整合',
              content: '每30分钟整合气象、水文、城管数据，GIS监控内涝点、断交点及救援进展，生成预警指令推送一线',
              threshold: '每30分钟1次',
            },
            {
              action: '全域发布',
              content: '通过融媒体中心每小时发布断交点位地图、绕行方案与安置点分布（短信/广播/政务新媒体）',
              threshold: '每小时1次',
            },
            {
              action: '全警上路',
              content: '调派70%以上警力驻守断交重灾区；协调周边县市警力待命，1小时内增援',
              threshold: '70%以上警力',
            },
            {
              action: '扩大封闭',
              content: '积水深度≥80cm主干道/下穿隧道上游500米硬隔离；导航APP实时推送绕行',
              threshold: '≥80cm执行',
            },
            {
              action: '绿色通道',
              content: '医院、学校周边开辟应急绿色通道，警车引导救护车/救援车优先通行',
              threshold: '即时',
            },
            {
              action: '治安巡逻',
              content: '安置点/物资发放点增派巡逻警力，严厉打击趁灾盗窃、哄抢物资',
              threshold: '即时',
            },
            {
              action: '联动医疗',
              content: '联合卫健护送急救药品；断交路段临时医疗点不少于5个并配ICU移动单元',
              threshold: '临时医疗点≥5个',
            },
            {
              action: '联动供电',
              content: '联合供电/通信尽快修复基站，保障泵站双回路供电',
              threshold: '即时',
            },
            {
              action: '协议储备',
              content: '调用企业协议储备：清障车、发电机等物资2小时内抵达',
              threshold: '2小时',
            },
            {
              action: '敲门行动',
              content: '对独居老人、残障群体"一对一强制转移"',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（II级）',
          sopTable: [
            {
              action: '局长驻守',
              content: '局长24小时驻守指挥中心：联动应急、城管、公安成立交通抢险专项组，实行"30分钟会商、1小时调度"',
              threshold: '30分钟会商',
            },
            {
              action: '风险预警',
              content: '实时叠加气象雷达、积水热力图、公交停运数据，自动生成《全网断交风险预警》',
              threshold: '即时',
            },
            {
              action: '方案检查',
              content: '核查公交、地铁、公路"一站一策"防汛方案，未达标立即整改',
              threshold: '即时',
            },
            {
              action: '路况发布',
              content: '每30分钟发布积水禁区地图（标注水深≥80cm红色区域）、公交地铁停运范围及接驳方案；开通24小时交通应急热线',
              threshold: '每30分钟1次',
            },
            {
              action: '硬隔离',
              content: '联合城管：主干道断交区域上游1公里硬隔离',
              threshold: '1公里硬隔离',
            },
            {
              action: '隧道排水',
              content: '隧道/下穿通道淹没区域：增调"龙吸水"3000型泵车，2小时内抽降50cm',
              threshold: '2小时抽降50cm',
            },
            {
              action: '道路抢修',
              content: '塌陷区域：临时铺装钢板+速凝材料，3小时内恢复单向通行',
              threshold: '3小时恢复',
            },
            {
              action: '应急接驳',
              content: '调集应急接驳车不少于50辆；GPS定向调度出租车优先保障医院/安置点',
              threshold: '接驳车≥50辆',
            },
            {
              action: '联动排水',
              content: '联合城管成立"泵车联动作业组"优先抽排医院、学校周边积水',
              threshold: '即时',
            },
            {
              action: '生命通道',
              content: '联合公安调用卫星通信车恢复断交区信号，开辟"生命通道"引导救援车辆',
              threshold: '即时',
            },
            {
              action: '清淤巡查',
              content: '断交区周边道路每小时巡查清淤，预置履带式应急接驳车转运危重患者',
              threshold: '每小时1次',
            },
            {
              action: '边坡监测',
              content: '边坡滑坡路段24小时监测；塌方后1小时内清理完毕；危桥强制封闭+北斗位移监测',
              threshold: '1小时清理',
            },
            {
              action: '协议储备',
              content: '调度企业协议储备，2小时内抵达现场',
              threshold: '2小时',
            },
            {
              action: '门到门转运',
              content: '联合街道：独居老人、残障群体"门到门转运"（1车1警1社工全程护送）',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（II级）',
          sopTable: [
            {
              action: '指挥进驻',
              content: '分管副局长进驻，统筹24小时联合抢险指挥部，联动应急、交通、气象等集中办公，扁平化指挥',
              threshold: '即时',
            },
            {
              action: '专项工作组',
              content: '排水抢险组、设施保障组、次生灾害防控组',
              threshold: '即时',
            },
            {
              action: '方案核查',
              content: '核查"一站一策"防汛方案，未达标单位立即整改',
              threshold: '即时',
            },
            {
              action: '实时更新',
              content: '每30分钟通过GIS更新积水点水位、泵站运行状态并同步应急平台；重大风险10分钟内电话直报副市长',
              threshold: '每30分钟1次；10分钟直报',
            },
            {
              action: '大型抽排',
              content: '增配"龙吸水"泵车不少于5台（单台抽排能力>3000m³/h），优先主干道/下穿隧道',
              threshold: '"龙吸水"≥5台',
            },
            {
              action: '管网疏通',
              content: '高压冲洗车+人工清淤，确保排水口开孔率>95%',
              threshold: '开孔率>95%',
            },
            {
              action: '防倒灌',
              content: '预置防水挡板；低洼小区/地下车库入口增配沙袋',
              threshold: '即时',
            },
            {
              action: '联合封控',
              content: '联合交通：主干道断交区域上游1公里硬隔离；塌陷路段钢板+速凝材料，3小时恢复单向通行',
              threshold: '3小时恢复',
            },
            {
              action: '高危巡查',
              content: '排查路灯杆、广告牌漏电风险；松动设施强制拆除',
              threshold: '即时',
            },
            {
              action: '清淤巡查',
              content: '断交区域周边道路每小时巡查清淤；预置履带式应急接驳车',
              threshold: '每小时1次',
            },
            {
              action: '塌方监测',
              content: '联合自然资源监测位移数据，预置挖掘机清理塌方',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市住建局',
          fullName: '市住建局（II级）',
          description: 'II级新增岗位，负责建筑工程安全与避难场所启用',
          isNew: true,
          sopTable: [
            {
              action: '入驻指挥',
              content: '成立战时指挥部，局长入驻市联合指挥部对接上级并落实直报机制',
              threshold: '即时',
            },
            {
              action: '工程停工',
              content: '督导在建工程停工及防汛措施落实；受威胁人员转移安置',
              threshold: '即时',
            },
            {
              action: '安全热力图',
              content: '每15分钟更新《建筑安全热力图》，标注受困点位、次生风险并上报市防指',
              threshold: '每15分钟1次',
            },
            {
              action: '危房巡检',
              content: '指导危旧房屋普查治理；加强低洼院落、危旧房屋巡检与险情处置准备',
              threshold: '即时',
            },
            {
              action: '避难场所',
              content: '启用体育馆、学校等场所作应急避难场所，搭军用帐篷并配套医疗点与防疫设施',
              threshold: '即时',
            },
            {
              action: '地下空间',
              content: '视情督导关闭普通地下空间，强化深基坑、在建轨道工程与普通地下空间防倒灌',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（II级）',
          sopTable: [
            {
              action: '战时指挥部',
              content: '成立战时指挥部，局长入驻市联合指挥部对接工作组/专家组；同步向上级与市长汇报',
              threshold: '即时',
            },
            {
              action: '省级医疗支援',
              content: '申请省级医疗队支援，重点保障ICU、手术室、急诊；调集创伤急救、感染控制、重症医学专家团队',
              threshold: '即时',
            },
            {
              action: '疫情报告',
              content: '每2小时向市防指报送《伤亡及疫情动态报告》；通过融媒体发布健康防护指南',
              threshold: '每2小时1次',
            },
            {
              action: '物资保障',
              content: '启用市应急物资储备库，增配呼吸机、透析机、急救药品，确保72小时不间断供应',
              threshold: '72小时保障',
            },
            {
              action: '床位腾空',
              content: '非急症患者分流至社区医疗机构；腾空三甲医院50%以上床位优先收治内涝伤病员',
              threshold: '50%床位腾空',
            },
            {
              action: '移动方舱',
              content: '安置区设临时医疗点，配移动方舱医院与快速检测设备',
              threshold: '即时',
            },
            {
              action: '食品抽检',
              content: '联合市场监管对临时供水点、集体供餐每日抽检，防食源性疾病',
              threshold: '每日1次',
            },
            {
              action: '心理援助',
              content: '派心理医生进驻安置点，开展PTSD筛查；提供24小时心理援助热线',
              threshold: '即时',
            },
            {
              action: '绿色通道',
              content: '联合应急管理局、武警建立伤员转运绿色通道：重伤员30分钟内抵达医院',
              threshold: '30分钟',
            },
            {
              action: '路线规划',
              content: '配合交通规划医疗救援优先路线，避免交通中断延误救治',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（II级）',
          sopTable: [
            {
              action: '局长驻守',
              content: '局长24小时驻守指挥中心，成立联合指挥部，实行"30分钟会商、1小时调度"',
              threshold: '30分钟会商',
            },
            {
              action: '升级建议',
              content: '监测到3小时降雨≥100mm或主干道积水深度≥80cm，立即向市长建议启动I级响应',
              threshold: '即时',
            },
            {
              action: '预案核查',
              content: '检查县区气象局应急预案落实：设备巡检、值班备勤、预警发布流程；漏洞单位通报问责',
              threshold: '即时',
            },
            {
              action: '短临预报',
              content: '每30分钟发布0-3小时短临预报，标注高风险区域；GIS叠加地形与排水管网数据预测积水路径',
              threshold: '每30分钟1次',
            },
            {
              action: '动态简报',
              content: '每1小时向副市长报送《内涝风险动态简报》',
              threshold: '每1小时1次',
            },
            {
              action: '泵站联动',
              content: '联合城管指导泵车布设点位；暴雨峰值前预降河道水位',
              threshold: '即时',
            },
            {
              action: '交通协同',
              content: '联合交通推送积水点实时地图，支持封闭深度≥80cm路段，导航推送绕行',
              threshold: '即时',
            },
            {
              action: '全网预警',
              content: '通过预警平台/短信/APP弹窗全网发布暴雨橙色预警，标注具体断交点位',
              threshold: '即时',
            },
            {
              action: '设备巡检',
              content: '自动气象站/雷达每日3次巡检；故障1小时内修复',
              threshold: '每日3次巡检',
            },
          ],
        },
        {
          name: '市自然资源局',
          fullName: '市自然资源局（II级）',
          description: 'II级新增岗位，负责地质灾害监测与风险预警',
          isNew: true,
          sopTable: [
            {
              action: '局长驻守',
              content: '局长24小时驻守指挥中心，成立联合指挥部，实行"30分钟会商、1小时调度"',
              threshold: '30分钟会商',
            },
            {
              action: '实时监测',
              content: '隐患点巡查从"每日1次"升级为高危区实时动态监测；无人机巡查+遥感监测，每2小时更新风险数据',
              threshold: '每2小时1次',
            },
            {
              action: '风险预警图',
              content: '应用地质安全风险平台，联合气象局每1小时发布短临风险预警图，标注溃坝、塌方高风险点',
              threshold: '每1小时1次',
            },
            {
              action: '全网发布',
              content: '通过应急广播/APP弹窗/短信全网发布地质灾害橙色预警，重点标注需紧急转移社区、学校',
              threshold: '即时',
            },
            {
              action: '谣言封禁',
              content: '联合网信办全网巡查谣言，1小时内封禁账号并公开辟谣',
              threshold: '1小时',
            },
            {
              action: '泵站联动',
              content: '联合城管指导泵车布设；暴雨峰值前预降河道水位',
              threshold: '即时',
            },
            {
              action: '清障协同',
              content: '联合交通调挖掘机清障，钢板临时铺路，3小时恢复通行',
              threshold: '3小时',
            },
            {
              action: '避难所',
              content: '协助街道/卫健委开辟应急避难所并预置医疗点',
              threshold: '即时',
            },
            {
              action: '技术下沉',
              content: '技术队伍驻点下沉到镇街，配备地质雷达/位移监测仪等设备',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（II级）',
          description: 'II级新增岗位，负责网络安全与舆情管控',
          isNew: true,
          sopTable: [
            {
              action: '驻守指挥',
              content: '分管副主任24小时驻守指挥中心，成立网络安全与舆情联合指挥部，联动应急、公安、交通、城管等集中办公',
              threshold: '即时',
            },
            {
              action: '专项工作组',
              content: '舆情监测组、网络安全组、信息发布组统一口径灾情权威信息',
              threshold: '即时',
            },
            {
              action: '预案核查',
              content: '核查网络应急预案落实：重点检查政务系统冗余备份、应急通信保障；未达标通报问责',
              threshold: '即时',
            },
            {
              action: '系统防护',
              content: '对应急指挥平台、市政管网监控系统实施"双链路监测+攻击溯源"；每15分钟扫描1次漏洞',
              threshold: '每15分钟1次',
            },
            {
              action: '舆情热力图',
              content: 'AI抓取"交通瘫痪"等敏感关键词，每30分钟生成《涉灾舆情热力图》',
              threshold: '每30分钟1次',
            },
            {
              action: '灾情通报',
              content: '联合融媒体中心每30分钟发布《灾情通报》：积水点实时地图（标水深≥80cm禁区）、救援进展、辟谣信息',
              threshold: '每30分钟1次',
            },
            {
              action: '谣言处置',
              content: '快速封禁谣言源头：1小时内完成禁言、关停、溯源查人',
              threshold: '1小时',
            },
            {
              action: '辟谣专区',
              content: '开通"内涝辟谣专区"，优先展示权威信息、限流可疑内容',
              threshold: '即时',
            },
            {
              action: '数据恢复',
              content: '断电断网导致数据丢失：协调省级云备份资源紧急恢复',
              threshold: '即时',
            },
            {
              action: '省级支援',
              content: '调用省级网络安全应急支援队：卫星通信车、便携式基站保障断交区域通信',
              threshold: '即时',
            },
            {
              action: '诈骗打击',
              content: '与公安联动：对冒充"救灾捐款"的诈骗网站快速关停，追踪IP定位团伙',
              threshold: '即时',
            },
            {
              action: '医疗协同',
              content: '协同卫健委保障医院挂号系统/电子病历库防攻击，确保诊疗数据不泄露',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（II级）',
          description: 'II级新增岗位，负责应急通信保障',
          isNew: true,
          sopTable: [
            {
              action: '驻守指挥',
              content: '驻守指挥中心，联动应急、交通、电力，实行"30分钟会商、1小时调度"',
              threshold: '30分钟会商',
            },
            {
              action: '资源调配',
              content: '卫星电话从III级20部增至≥50部；应急通信车从10辆增至≥30辆；启动邻市互助，2小时调入紧缺设备',
              threshold: '2小时',
            },
            {
              action: '通信优先',
              content: '联合交通为救护车/救援车辆配置"通信优先通道"',
              threshold: '即时',
            },
            {
              action: '供电保障',
              content: '联合供电对医院、泵站通信设备双回路供电，故障30分钟内修复',
              threshold: '30分钟修复',
            },
            {
              action: '谣言处置',
              content: '联合网信办1小时内封堵谣言；每30分钟推送断交点位地图/救援进展',
              threshold: '1小时；每30分钟推送',
            },
            {
              action: '无人机基站',
              content: '积水≥1米断交区域启用无人机基站覆盖信号',
              threshold: '即时',
            },
            {
              action: '应急通信包',
              content: '协助街道发放"简易应急通信包"，"一对一"指导使用',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（II级）',
          description: 'II级新增岗位，负责电力保障与抢修',
          isNew: true,
          sopTable: [
            {
              action: '驻守对接',
              content: '主要负责人24小时驻守，对接上级电网与政府，实行"30分钟直报"',
              threshold: '30分钟直报',
            },
            {
              action: '联合研判',
              content: '联合气象研判降雨对抢修影响；动态调整应急预案；每1小时报送《电力恢复进度热力图》',
              threshold: '每1小时1次',
            },
            {
              action: '战时调度',
              content: '启动"战时调度"模式：强制调用跨区域应急发电车、无人机巡检资源，优先保障医院/指挥中心',
              threshold: '即时',
            },
            {
              action: '省级资源',
              content: '申请省级应急资源：调配"龙吸水"5000泵车对淹没变电站强排，6小时内恢复运行',
              threshold: '6小时',
            },
            {
              action: '主干电网',
              content: '协调工兵部队架速凝钢桥、敷设临时电缆：12小时打通主干电网',
              threshold: '12小时',
            },
            {
              action: '物资调配',
              content: '协调调配应急物资库预制电缆接头、环网柜等修复设备',
              threshold: '即时',
            },
            {
              action: '断电隔离',
              content: '积水区域配电设施"断电+物理隔离"；联合公安设警戒线防触电',
              threshold: '即时',
            },
            {
              action: '热成像监测',
              content: '启用红外热成像无人机全天监测，2小时生成风险报告',
              threshold: '每2小时1次',
            },
            {
              action: '信息推送',
              content: '通过短信/社交媒体每3小时推送"停电-恢复"动态；对谣言1小时内辟谣；开通24小时双语服务热线',
              threshold: '每3小时1次；1小时辟谣',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（II级）',
          description: 'II级新增岗位，负责抢险救援与武装巡逻',
          isNew: true,
          sopTable: [
            {
              action: '进驻指挥',
              content: '支队主官进驻市联合指挥部，对接省防指，1小时直报，实行24小时联合值守',
              threshold: '1小时直报',
            },
            {
              action: '专业分队',
              content: '调集工兵、防化、舟桥等专业分队24小时内抵达重灾区',
              threshold: '24小时内',
            },
            {
              action: '全天候监测',
              content: '启用军用无人机/热成像对地下空间、地铁淹灌区全天候监测',
              threshold: '即时',
            },
            {
              action: '道路抢通',
              content: '工兵分队对塌方路段爆破清障与钢桥架设，12小时内恢复主干道通行',
              threshold: '12小时',
            },
            {
              action: '武装巡逻',
              content: '医院/安置点重点区域武装巡逻，打击哄抢物资',
              threshold: '即时',
            },
            {
              action: '救援通道',
              content: '协同应急管理局设立"五纵五横"救援通道，优先保障救护车/抢险车辆通行',
              threshold: '即时',
            },
            {
              action: '装甲车护送',
              content: '协同交通调用装甲车护送发电车/排水设备进入断交区',
              threshold: '即时',
            },
            {
              action: '跨省调度',
              content: '跨省调度国家排涝基地排水设备',
              threshold: '即时',
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
        '连续12小时降雨量≥300mm',
        '气象局发布红色预警',
        '交警监测：主干道积水深度≥100cm且持续扩大',
        '城市管理局上报：超过10条主干道同时断交超过12小时',
        '医院、应急指挥中心周边道路全部中断，救援车辆无法通行',
        'II级已投入全部省级救援力量仍持续恶化',
      ],
      conditionLogic: '满足以下任意3项以上即可触发升级',
      departments: [
        {
          name: '市长',
          fullName: '市长（I级）',
          description: '担任市级防指总指挥，接管全部指挥权',
          sopTable: [
            {
              action: '最高指挥权',
              content: '市级防指总指挥身份，接管副市长与各部门指挥权，实行"防指总指挥→防办→专业工作组"扁平化模式',
              threshold: '即时',
            },
            {
              action: '启动令',
              content: '签发《I级响应启动令》，宣布全市进入应急响应状态并授权采取非常措施（交通管制、物资征用、人员强制转移等）',
              threshold: '即时',
            },
            {
              action: '全员进驻',
              content: '市防汛抗旱总指挥部成员进驻指挥大厅联合值守',
              threshold: '即时',
            },
            {
              action: '短临研判',
              content: '每30分钟听取气象、水文报告；3小时雨量＞250mm立即申请省级I级响应或调用省级救援力量',
              threshold: '每30分钟1次',
            },
            {
              action: '国家级对接',
              content: '直接对接省防总申请调用国家级排涝设备，协调驻地部队参与高危区抢险',
              threshold: '即时',
            },
            {
              action: '跨市支援',
              content: '申请跨市救援力量，2小时内落实部署',
              threshold: '2小时',
            },
            {
              action: '全域管制',
              content: '全域禁止非救援车辆通行；由警备区协调驻地部队出动装甲车开道护送救护车',
              threshold: '即时',
            },
            {
              action: '通信恢复',
              content: '启用应急卫星通信系统，恢复90%断交区信号',
              threshold: '90%恢复',
            },
            {
              action: '人员清零',
              content: '协调武警支队、基层干部24小时转移高危区域人员，确保养老院、学校、医院受困人员清零',
              threshold: '即时',
            },
            {
              action: '指令发布',
              content: '每15分钟通过防空警报系统+卫星短信发布核心指令包（转移路线、物资点等）；授权公安依法处置造谣煽动性言论',
              threshold: '每15分钟1次',
            },
            {
              action: '物资征用',
              content: '紧急征用全市宾馆、商场作为临时安置点',
              threshold: '即时',
            },
          ],
        },
        {
          name: '副市长',
          fullName: '副市长（I级）',
          description: '担任抢险总执行人，进驻最重区域现场',
          sopTable: [
            {
              action: '抢险总执行人',
              content: '联合水利/应急/公安等成立联合指挥部，进驻最重区域，组建24小时现场指挥部，接入省级平台',
              threshold: '即时',
            },
            {
              action: '执行令',
              content: '签发《I级响应执行令》：授权采取交通管制、物资征用、人员强制转移等紧急措施',
              threshold: '即时',
            },
            {
              action: '国家级装备',
              content: '直调省级/国家级救援装备；同步市长并抄送省防总，2小时内完成部署',
              threshold: '2小时',
            },
            {
              action: '跨省联动',
              content: '启动跨省应急联动协议，协调邻省救援队接管非核心区抢险',
              threshold: '即时',
            },
            {
              action: '物资征用令',
              content: '签发《应急物资紧急调用令》，征用全市商超物资，优先危险区域老弱孕幼',
              threshold: '即时',
            },
            {
              action: '空投急救',
              content: '通过无人机对断交区空投急救包；外卖骑手和摩托艇向半断交区投送急救包',
              threshold: '即时',
            },
            {
              action: '治安巡逻',
              content: '市公安局配置巡逻组，安置点/物资发放区巡逻，打击哄抢',
              threshold: '即时',
            },
            {
              action: '谣言处置',
              content: '联合网信办全网封堵谣言：转发≥500次或引发群体性聚集账号15分钟内溯源依法处置',
              threshold: '15分钟',
            },
            {
              action: '五包一终极转移',
              content: '执行"五包一"终极转移（1干部+1医生+1民警+1社工+1志愿者），独居老人门到门转移',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（I级）',
          sopTable: [
            {
              action: '双线报告',
              content: '局长入驻市联合指挥部：每15分钟直报省防总/应急管理部；横向对接市长/副市长决策',
              threshold: '每15分钟1次',
            },
            {
              action: '危化品督导',
              content: '督导危险化学品生产经营单位、非煤矿山、尾矿库落实防汛措施并做好抢险救援',
              threshold: '即时',
            },
            {
              action: '前沿指挥所',
              content: '重灾区设前沿指挥所（副局长担任指挥长），统筹以消防救援为主的各类队伍抢险救援',
              threshold: '即时',
            },
            {
              action: '全域热力图',
              content: '每15分钟生成《全域灾情热力图》：受困人员分布、次生风险点位、物资缺口清单',
              threshold: '每15分钟1次',
            },
            {
              action: '军队申请',
              content: '按程序申请解放军、武警和空中救援力量参与抢险救援',
              threshold: '即时',
            },
            {
              action: '国家排涝基地',
              content: '调用国家排涝基地"龙吸水"5000型泵车',
              threshold: '即时',
            },
            {
              action: '区域协同',
              content: '启动京津冀协同抢险救援机制',
              threshold: '即时',
            },
            {
              action: '通信恢复',
              content: '启用天通卫星和翼龙无人机，恢复90%断交区通信',
              threshold: '90%恢复',
            },
            {
              action: '五包一执行',
              content: '执行"五包一"终极转移，独居老人门到门转移',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市水利局',
          fullName: '市水利局（I级）',
          description: 'I级响应中承担水利调度与排涝统筹关键职责',
          sourceNote:
            '《国家防汛抗旱应急预案》第4.6.2条"渍涝灾害应急处置"',
          sopTable: [
            {
              action: '水利调度',
              content: '按权限做好水库、水闸等重要水利工程防洪调度',
              threshold: '即时',
            },
            {
              action: '排涝统筹',
              content: '统筹协调各区、市排水集团加强城镇积水排除及险情处置',
              threshold: '即时',
            },
            {
              action: '重点排涝',
              content: '重点保障各级指挥中心、重点医院、变电站、通信枢纽、计算中心等重点目标及重点区域排涝安全',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（I级）',
          sopTable: [
            {
              action: '双线报告',
              content: '局长入驻市联合指挥部：治安与交通管控组组长，每30分钟向省防总/省公安厅同步汇报',
              threshold: '每30分钟1次',
            },
            {
              action: '战时勤务',
              content: '启动"战时勤务模式"：调集80%以上警力驻守重灾区，取消全员休假',
              threshold: '80%以上警力',
            },
            {
              action: '重要目标安保',
              content: '保障要害部门与金融单位、救灾物资集散点安全保卫；妥处因洪涝引发群体性事件',
              threshold: '即时',
            },
            {
              action: '打击犯罪',
              content: '依法打击破坏救灾工作的违法犯罪',
              threshold: '即时',
            },
            {
              action: '生命线打通',
              content: '交通枢纽瘫痪时协调装甲车开道护送救护车：封闭所有非救援通道，1小时打通生命线',
              threshold: '1小时',
            },
            {
              action: '24小时值守',
              content: '对安置点/物资发放点24小时值守，严厉打击造谣惑众与盗窃、哄抢及破坏防汛设施行为',
              threshold: '即时',
            },
            {
              action: '交通管控',
              content: '负责灾区及周边道路管控疏导、维护抗洪抢险秩序',
              threshold: '即时',
            },
            {
              action: '遇难身份认定',
              content: '负责遇难人员身份认定',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（I级）',
          sopTable: [
            {
              action: '战时调度',
              content: '局长入驻市联合指挥部，直接对接上级部门，实行"战时调度"，签发《交通管制终极指令》',
              threshold: '即时',
            },
            {
              action: '前沿指挥所',
              content: '建立现场攻坚指挥部：重灾区前沿指挥所（技术总负责）',
              threshold: '即时',
            },
            {
              action: '交通管制',
              content: '保障指挥、抢险、救灾车辆优先通行；必要时严格交通管制',
              threshold: '即时',
            },
            {
              action: '硬隔离升级',
              content: '主干道积水≥100cm：上游1公里硬隔离，启用装甲车引导救援车队',
              threshold: '1公里硬隔离',
            },
            {
              action: '绿色通道',
              content: '联合公安开辟"五纵五横"绿色通道；每5公里设交警岗哨；占用应急车道车辆直接拖离并顶格处罚',
              threshold: '即时',
            },
            {
              action: '道路修复',
              content: '修复受损公路/桥梁设施保障救灾交通干线安全畅通；通过警备区协调驻石武警/解放军协助',
              threshold: '即时',
            },
            {
              action: '运力保障',
              content: '协调保障防汛抗旱救灾、防疫人员与物资及转移灾民所需运输运力',
              threshold: '即时',
            },
            {
              action: '阻洪设施清除',
              content: '紧急情况下督促项目业主清除阻碍行洪设施',
              threshold: '即时',
            },
            {
              action: '无人机监测',
              content: '启用无人机三维建模实时监测道路塌陷扩展趋势',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（I级）',
          sopTable: [
            {
              action: '15分钟会商',
              content: '局长入驻市联合指挥部，实行"15分钟会商"，决策权上收至市级防指工作组',
              threshold: '15分钟会商',
            },
            {
              action: '受威胁区域统计',
              content: '负责受威胁区域确认与统计（受威胁区域清单、转移人员清单、老弱病残幼特殊人员专项清单等）',
              threshold: '即时',
            },
            {
              action: '基础设施保护',
              content: '协助市直相关部门：排涝设施与民心河维护管理；城区供气/供暖/供水设备保护抢修；督导成员单位防汛工作',
              threshold: '即时',
            },
            {
              action: '排水设施管护',
              content: '协调周边泄洪排涝河（渠）道的橡胶坝、雨水闸门、提升泵站、排水管道维修管护',
              threshold: '即时',
            },
            {
              action: '园林清理',
              content: '加大园林巡视：降雨前中后清理倒伏树木、残枝落叶，避免影响排水与交通',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市住建局',
          fullName: '市住建局（I级）',
          sopTable: [
            {
              action: '30分钟直报',
              content: '局长入驻市联合指挥部对接上级工作组，实行"30分钟直报住建部"机制',
              threshold: '30分钟直报',
            },
            {
              action: '工程停工',
              content: '督导在建工程停工与防汛措施；受威胁人员转移安置',
              threshold: '即时',
            },
            {
              action: '安全热力图',
              content: '每15分钟更新《建筑安全热力图》并上报市防指',
              threshold: '每15分钟1次',
            },
            {
              action: '危房巡查',
              content: '危陋房屋普查治理；加强危旧房屋与低洼院落巡检与险情处置准备',
              threshold: '即时',
            },
            {
              action: '避难场所',
              content: '启用避难场所并配套医疗点与防疫设施',
              threshold: '即时',
            },
            {
              action: '地下空间',
              content: '视情督导关闭普通地下空间，强化防倒灌',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（I级）',
          sopTable: [
            {
              action: '战时指挥部',
              content: '成立战时指挥部，局长入驻市联合指挥部对接工作组/专家组，同步向省防指和市长汇报',
              threshold: '即时',
            },
            {
              action: '省级医疗支援',
              content: '申请省级医疗队支援（重点ICU/手术室/急诊、感染控制、重症专家团队）',
              threshold: '即时',
            },
            {
              action: '疫情报告',
              content: '每2小时向市防指报送《伤亡及疫情动态报告》，并通过融媒体发布健康防护指南',
              threshold: '每2小时1次',
            },
            {
              action: '物资保障',
              content: '增配关键设备确保72小时不间断供应，必要时启用省级应急物资',
              threshold: '72小时保障',
            },
            {
              action: '床位腾空',
              content: '非急症分流；腾空床位优先救治内涝相关伤病员',
              threshold: '即时',
            },
            {
              action: '移动方舱',
              content: '安置区设临时医疗点（移动方舱医院、快速检测）',
              threshold: '即时',
            },
            {
              action: '食品抽检',
              content: '抽检临时供水与集体供餐防食源性疾病',
              threshold: '每日1次',
            },
            {
              action: '心理援助',
              content: '心理援助与转运绿色通道，重伤员30分钟内抵达医院',
              threshold: '30分钟',
            },
            {
              action: '路线规划',
              content: '与交通协同规划医疗优先路线',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（I级）',
          sopTable: [
            {
              action: '30分钟直报',
              content: '局长进驻国家级联合指挥部，对接国家防总与中国气象局，实行"30分钟直报"',
              threshold: '30分钟直报',
            },
            {
              action: '极端天气评估',
              content: '每30分钟向国家防总报送《极端天气影响评估》：累计降雨与突破极值情况、衍生灾害风险等级',
              threshold: '每30分钟1次',
            },
            {
              action: '首席会商',
              content: '组织国家级首席预报员团队每1小时会商，发布0-3小时短临预报（极端降雨落区/移动路径）',
              threshold: '每1小时1次',
            },
            {
              action: '联合研判',
              content: '联合水利/自然资源研判流域降水与溃坝/滑坡等衍生风险',
              threshold: '即时',
            },
            {
              action: '分钟级采集',
              content: '启用移动气象监测车与无人机对重灾区分钟级数据采集（雨量/风速/积水深度）',
              threshold: '即时',
            },
            {
              action: '知雨模型',
              content: '应用"知雨"短时强降水模型预测积水扩散与交通断交点位，生成《内涝风险热力图》',
              threshold: '即时',
            },
            {
              action: '红色预警',
              content: '通过卫星短信+防空警报全网发布暴雨红色预警；对独居老人启动"敲门行动/电话叫应"',
              threshold: '即时',
            },
            {
              action: '交通协同',
              content: '协同交通提供积水点实时地图，支持封闭深度≥100cm路段',
              threshold: '即时',
            },
            {
              action: '疫病预警',
              content: '协同卫健发布疫病传播风险预警，指导安置点消杀',
              threshold: '即时',
            },
            {
              action: '国家级资源',
              content: '申请国家级资源"龙吸水"泵车/排水车支援并配合军队工兵抢通生命线',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市自然资源局',
          fullName: '市自然资源局（I级）',
          sopTable: [
            {
              action: '30分钟直报',
              content: '局长进驻国家级联合指挥部对接国务院工作组、自然资源部，实行"30分钟直报"',
              threshold: '30分钟直报',
            },
            {
              action: '滚动会商',
              content: '滚动会商研判并做地质灾害气象风险预警调整发布',
              threshold: '即时',
            },
            {
              action: '专家支援',
              content: '申请技术指导中心专家"一对一"研判溃坝/滑坡等重大风险并提出处置方案',
              threshold: '即时',
            },
            {
              action: '灾情报告',
              content: '每15分钟向市防总报送《灾情动态报告》',
              threshold: '每15分钟1次',
            },
            {
              action: '涉山道路封闭',
              content: '指导属地应急响应：涉山道路封闭与群众避险转移；发布铁路地质灾害风险提示',
              threshold: '即时',
            },
            {
              action: '加密调查',
              content: '加密地质灾害风险调查并发布安全提示',
              threshold: '即时',
            },
            {
              action: '空天地监测',
              content: '启用"空天地"一体化监测：对断交区域厘米级形变监测、数据实时上传国家平台，发布《地质灾害热力图》标注次生灾害链风险',
              threshold: '即时',
            },
            {
              action: '谣言封禁',
              content: '联合网信办1小时内封堵"地质灾害"等谣言并通过应急广播发布权威信息',
              threshold: '1小时',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（I级）',
          sopTable: [
            {
              action: '30分钟直报',
              content: '主任进驻国家级联合指挥部，对接国家应急通信保障指挥机构，实行"30分钟直报"',
              threshold: '30分钟直报',
            },
            {
              action: '专家组支援',
              content: '申请国家级通信保障专家组支援，制定"一站一策"抢修方案',
              threshold: '即时',
            },
            {
              action: '灾情报告',
              content: '每15分钟向国家防总报送《灾情动态报告》',
              threshold: '每15分钟1次',
            },
            {
              action: '通信恢复推送',
              content: '每15分钟通过卫星短信+应急广播推送通信恢复进展；对"全城断网"谣言1小时内溯源封堵',
              threshold: '每15分钟1次；1小时',
            },
            {
              action: '国家级资源调度',
              content: '调度国家级资源：对接国家电网发应急供电设备；配合军队/国家级救援队天通卫星终端恢复通信',
              threshold: '即时',
            },
            {
              action: '6小时恢复90%',
              content: '骨干传输网与核心机房双路由+热备倒换：6小时内恢复90%区域通信',
              threshold: '6小时',
            },
            {
              action: '潜水抢修',
              content: '武警潜水抢修淹没区通信设施：优先保障医院与应急指挥中心通信',
              threshold: '即时',
            },
            {
              action: '绿色通道',
              content: '与交通开辟通信抢修"绿色通道"，保障应急车辆优先通行',
              threshold: '即时',
            },
            {
              action: '双回路供电',
              content: '与电力联动：双回路供电，故障30分钟内修复',
              threshold: '30分钟',
            },
            {
              action: '无人机基站',
              content: '协同军队调用无人机基站覆盖断交区信号',
              threshold: '即时',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（I级）',
          sopTable: [
            {
              action: '15分钟直报',
              content: '主要负责人进驻国家级联合指挥部，对接国家电网总部与国务院工作组，实行"15分钟直报"',
              threshold: '15分钟直报',
            },
            {
              action: '跨省供电保障',
              content: '协调跨省应急发电车、大型抢修设备，重点保障应急指挥中心、医院、泵站、通信枢纽供电及灾区群众用电',
              threshold: '即时',
            },
            {
              action: '战时调度',
              content: '启用"战时调度"模式：强制调用国家电网跨大区应急发电车、无人机巡检',
              threshold: '即时',
            },
            {
              action: '变电站强排水',
              content: '配合水利部门对淹没变电站强排水',
              threshold: '即时',
            },
            {
              action: '临时线路',
              content: '联合武警/工兵架设临时线路，优先恢复主干网架',
              threshold: '即时',
            },
            {
              action: '断电隔离',
              content: '对存在漏电风险的积水区域实施"断电+物理隔离"并设警戒线',
              threshold: '即时',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（I级）',
          sopTable: [
            {
              action: '15分钟直报',
              content: '支队主官进驻国家级联合指挥部，对接中央军委联指与国务院防总，实行"15分钟直报"',
              threshold: '15分钟直报',
            },
            {
              action: '专业分队',
              content: '调集工兵、防化、舟桥等专业分队抵达重灾区',
              threshold: '即时',
            },
            {
              action: '跨省增援',
              content: '跨省增援、无人机热成像监测地下空间/地铁淹灌区',
              threshold: '即时',
            },
            {
              action: '道路抢通',
              content: '工兵分队对塌方路段爆破清障与钢桥架设，12小时内恢复主干道通行',
              threshold: '12小时',
            },
            {
              action: '非救援通道封闭',
              content: '封闭非救援通道，装甲车开道护送救护车',
              threshold: '即时',
            },
            {
              action: '装甲车护送',
              content: '协同交通调用装甲车护送发电车/排水设备进入断交区',
              threshold: '即时',
            },
            {
              action: '跨省调度',
              content: '跨省调度国家排涝基地排水设备',
              threshold: '即时',
            },
          ],
        },
      ],
    },
  ],
  references: [
    { title: '《国家防汛抗旱应急预案》（国办函〔2022〕48号）', url: 'https://www.mee.gov.cn/zcwj/gwywj/202207/t20220707_987881.shtml' },
    { title: '《北京市防汛应急预案》（2022年修订）', url: 'https://www.beijing.gov.cn/zhengce/zhengcefagui/202308/t20230807_3216832.html' },
    { title: '中国气象局暴雨预警信号标准', url: 'https://news.cctv.com/2022/05/13/ARTIuC8AtNkhCiFMRi8FhYgJ220513.shtml' },
    { title: '住建部《关于做好2024年城市排水防涝工作的通知》', url: 'https://mhuanbao.bjx.com.cn/mnews/20240402/1369300.shtml' },
  ],
};
