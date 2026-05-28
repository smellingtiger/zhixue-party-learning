import type { CommandManualData } from './types';

export const coldWaveCommandManualData: CommandManualData = {
  disasterName: '寒潮',
  disasterIcon: '寒潮灾害',
  responseLevels: [
    {
      level: 'IV',
      color: 'blue',
      label: 'IV级响应',
      conditions: [
        '中国气象局发布寒潮蓝色预警（IV级），本市在预警覆盖范围内',
        '24小时降温≥8℃或48小时降温≥10℃',
        '最低气温≤4℃',
        '伴随5级以上大风',
        '辖区内出现道路结冰导致交通事故明显增加',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（IV级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条',
          sopTable: [
            {
              action: '预警接收',
              content: '接收市气象局寒潮蓝色预警报告，签署预警响应指令',
              threshold: '预警发布后30分钟内',
            },
            {
              action: '启动IV级响应',
              content: '签发IV级响应启动令，通知各成员单位进入应急状态',
              threshold: '预警发布后1小时内',
            },
            {
              action: '召集首次会商',
              content: '召集应急、气象、交通等部门进行首次会商，明确分工',
              threshold: '预警发布后2小时内',
            },
            {
              action: '研判走势',
              content: '根据气温变化趋势和影响范围判断是否升级响应',
              threshold: '持续研判',
            },
            {
              action: '向市长和省应急厅报告',
              content: '报告寒潮预警、影响预判和应对部署情况',
              threshold: '响应启动后2小时内首报',
            },
            {
              action: '指挥重点任务',
              content: '优先保障供暖、供水、供电、交通四类民生工程',
              threshold: '全程',
            },
            {
              action: '信息发布审批',
              content: '审核对外发布寒潮预警信息和防御提示',
              threshold: '每次发布前',
            },
            {
              action: '响应终止决策',
              content: '确认寒潮影响结束、气温回升至预警标准以下，终止响应',
              threshold: '寒潮结束后12小时内',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（IV级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条',
          sopTable: [
            {
              action: '预警接收与传达',
              content: '接收市气象局寒潮预警，向分管副市长报告并向成员单位传达',
              threshold: '预警发布后15分钟内',
            },
            {
              action: '启动应急值班',
              content: '加强值班力量，开通24小时应急热线，启用应急指挥系统',
              threshold: '预警发布后30分钟内',
            },
            {
              action: '物资盘点与预备',
              content: '盘点市级应急物资（棉被、棉衣、融雪剂、发电设备等），做好调拨准备',
              threshold: '预警发布后4小时内',
            },
            {
              action: '受影响区域排查',
              content: '汇总各区县、街道前期排查情况，建立重点风险台账',
              threshold: '预警发布后6小时内',
            },
            {
              action: '协调部门联动',
              content: '对接交通、住建、农业农村等部门，确认各自准备情况',
              threshold: '预警发布后4小时内',
            },
            {
              action: '发布防范通知',
              content: '通过短信、公众号、广播等渠道向社会发布寒潮防范通知',
              threshold: '预警发布后2小时内',
            },
            {
              action: '弱势群体摸排',
              content: '协调民政部门摸排流浪人员、独居老人等弱势群体信息',
              threshold: '预警发布后6小时内',
            },
            {
              action: '编写工作简报',
              content: '汇总各部门准备情况，编写工作简报供指挥部决策',
              threshold: '每日2次（9:00/17:00）',
            },
            {
              action: '信息直报',
              content: '向省应急厅直报本市应对部署情况',
              threshold: '每日1次',
            },
            {
              action: '响应终止建议',
              content: '寒潮影响结束后向分管副市长提出终止响应建议',
              threshold: '寒潮结束后12小时内',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（IV级）',
          sourceNote:
            '《气象灾害防御条例》第二十一条至第二十八条',
          sopTable: [
            {
              action: '发布寒潮蓝色预警',
              content: '按标准发布寒潮蓝色预警信号，明确降温幅度、最低气温、大风等级、影响时段',
              threshold: '达到蓝色预警标准后即时',
            },
            {
              action: '加密监测',
              content: '加密气象观测频次，跟踪冷空气强度和路径变化',
              threshold: '预警发布后即时',
            },
            {
              action: '预警区域精准化',
              content: '细化预警覆盖的区县和街道，提供乡镇级预报',
              threshold: '预警发布后2小时内',
            },
            {
              action: '趋势预报产品制作',
              content: '制作72小时逐3小时气温预报、大风预报和道路结冰风险预报',
              threshold: '预警发布后4小时内',
            },
            {
              action: '预警滚动更新',
              content: '根据最新观测数据滚动更新预警信息',
              threshold: '每6小时更新一次',
            },
            {
              action: '部门会商',
              content: '与交通、农业、电力等部门专题会商，提供专业气象服务',
              threshold: '预警发布后6小时内',
            },
            {
              action: '多渠道发布',
              content: '通过电视、广播、短信、新媒体等多渠道发布预警信息',
              threshold: '预警发布后即时',
            },
            {
              action: '预警解除研判',
              content: '研判气温回升趋势，提出预警解除建议',
              threshold: '持续研判',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（IV级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条',
          sopTable: [
            {
              action: '预警接收与传达',
              content: '接收寒潮预警，向公交公司、客运站、公路养护单位传达',
              threshold: '预警发布后30分钟内',
            },
            {
              action: '融雪除冰物资检查',
              content: '检查融雪剂、除雪车、防滑沙等物资和装备储备情况',
              threshold: '预警发布后4小时内',
            },
            {
              action: '重点路段巡查',
              content: '对桥梁、隧道、急弯、陡坡等易结冰路段进行专项巡查',
              threshold: '预警发布后6小时内',
            },
            {
              action: '防滑物资预置',
              content: '在重点桥梁和路段预置防滑沙、融雪剂',
              threshold: '预警发布后12小时内',
            },
            {
              action: '公共交通预案',
              content: '制定公交线路调整和应急运力调度预案',
              threshold: '预警发布后8小时内',
            },
            {
              action: '公路信息发布',
              content: '通过可变情报板、交通广播发布公路通行预警信息',
              threshold: '预警发布后4小时内',
            },
            {
              action: '应急运力储备',
              content: '储备应急客运和货运车辆，确保随时可调用',
              threshold: '预警发布后8小时内',
            },
            {
              action: '跨区域协调',
              content: '与相邻地市交通部门建立信息互通机制',
              threshold: '预警发布后8小时内',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（IV级）',
          sourceNote:
            '《突发事件应对法》第四十三条至第四十八条"基层应急职责"',
          sopTable: [
            {
              action: '预警接收与传达',
              content: '接收区应急局传达的寒潮预警，向社区、物业、辖区单位传达',
              threshold: '预警发布后1小时内',
            },
            {
              action: '隐患排查',
              content: '排查辖区内老旧房屋、临时建筑、广告牌、树木等受大风降温影响的安全隐患',
              threshold: '预警发布后8小时内',
            },
            {
              action: '弱势群体走访',
              content: '走访独居老人、低保户、残疾人员等弱势群体，了解取暖和防寒需求',
              threshold: '预警发布后12小时内',
            },
            {
              action: '流浪人员巡查',
              content: '对桥洞、地下通道、车站等流浪人员聚集区域进行巡查',
              threshold: '预警发布后即日开始，每日2次',
            },
            {
              action: '防寒物资准备',
              content: '检查社区避难场所、物资储备点，确保棉被、热水等基本物资可用',
              threshold: '预警发布后12小时内',
            },
            {
              action: '防寒宣传',
              content: '通过社区广播、宣传栏、微信群等宣传防寒保暖知识',
              threshold: '预警发布后6小时内',
            },
            {
              action: '管道防冻巡查',
              content: '排查老旧小区供水管道、消防栓防冻情况',
              threshold: '预警发布后12小时内',
            },
            {
              action: '信息上报',
              content: '每日向区应急局上报辖区排查情况和受影响情况',
              threshold: '每日16:00前',
            },
            {
              action: '应急队伍待命',
              content: '组织社区应急小分队和志愿者队伍随时待命',
              threshold: '预警发布后即时',
            },
            {
              action: '开门纳暖',
              content: '开放社区活动室、党群服务中心作为临时取暖点',
              threshold: '气温降至4℃以下时开放',
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
        '中国气象局寒潮预警升级为黄色（III级）',
        '实测24小时降温≥10℃或48小时降温≥12℃，最低气温降至0℃以下',
        '道路结冰导致高速公路和国省干线大面积封闭（≥3条干线）',
        '雨雪冰冻造成供电线路覆冰导致局部区域停电（影响≥5000户）',
        '供水管道冻裂导致区域性停水（影响≥1万户）',
        '低温造成人员冻伤住院≥10人',
        '寒潮伴随7级以上大风，造成广告牌、临时建筑倒塌',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（III级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.3条',
          sopTable: [
            {
              action: '升级响应决策',
              content: '签发III级响应升级令，通报全体指挥部成员单位',
              threshold: '达到升级条件后30分钟内',
            },
            {
              action: '扩大指挥部',
              content: '增补市公安局、城管局、卫健委为指挥部成员单位',
              threshold: '升级后1小时内',
            },
            {
              action: '召开升级后首次会商',
              content: '明确III级响应下各岗位任务和协同要求',
              threshold: '升级后2小时内',
            },
            {
              action: '请求省级支援',
              content: '向省应急厅报告寒潮影响，必要时请求省级物资支援',
              threshold: '升级后2小时内',
            },
            {
              action: '宣布重点管制措施',
              content: '宣布学校停课、工地停工、景区关闭等管制措施',
              threshold: '升级后2小时内决策',
            },
            {
              action: '设立现场督导组',
              content: '向重点受影响区县派出督导组，靠前督导',
              threshold: '升级后4小时内',
            },
            {
              action: '每日指挥部例会',
              content: '每日召开指挥部例会，听取各岗位汇报，研判形势',
              threshold: '每日9:00',
            },
            {
              action: '向省指挥部述职',
              content: '每日向省指挥部报告寒潮影响和处置进展',
              threshold: '每日17:00前',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（III级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.3条',
          sopTable: [
            {
              action: '升级通知',
              content: '向全体指挥部成员单位发送III级响应升级通知',
              threshold: '升级后30分钟内',
            },
            {
              action: '物资调拨启动',
              content: '向重点受影响区县调拨棉被、棉衣、融雪剂、应急照明等物资',
              threshold: '升级后4小时内首批出库',
            },
            {
              action: '灾情信息汇总升级',
              content: '建立统一的灾情信息登记表，包括道路封闭、停电、停水、人员伤亡等',
              threshold: '升级后2小时内建立',
            },
            {
              action: '协调城管投入',
              content: '协调市城管局组织专业除雪队伍投入重点区域',
              threshold: '升级后4小时内',
            },
            {
              action: '协调安置点准备',
              content: '协调各区县确认避难场所和临时安置点可用性',
              threshold: '升级后6小时内',
            },
            {
              action: '社会力量动员',
              content: '通知应急救援社会力量（蓝天救援队等）做好备勤',
              threshold: '升级后4小时内',
            },
            {
              action: '灾情简报升级',
              content: '灾情简报频率提升为每日3次',
              threshold: '9:00/15:00/21:00',
            },
            {
              action: '12345热线对接',
              content: '与12345市民热线建立寒潮相关诉求实时通报机制',
              threshold: '升级后2小时内',
            },
            {
              action: '伤亡统计',
              content: '建立冻伤、一氧化碳中毒、因灾死亡等统计台账',
              threshold: '每日更新',
            },
            {
              action: '保险理赔协调',
              content: '通知保险机构启动寒潮灾害快速理赔通道',
              threshold: '升级后24小时内',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（III级）',
          sourceNote:
            '《气象灾害防御条例》第二十五条至第二十八条',
          sopTable: [
            {
              action: '升级寒潮预警为黄色',
              content: '按标准升级发布寒潮黄色预警信号',
              threshold: '达到黄色预警标准后即时',
            },
            {
              action: '加密会商频次',
              content: '参加省-市气象部门加密会商，掌握最新预报结论',
              threshold: '每3小时参加一次会商',
            },
            {
              action: '精细化预报',
              content: '提供逐小时气温、风速、降水相态（雨/雪/冻雨）预报',
              threshold: '升级后即时',
            },
            {
              action: '道路结冰预警',
              content: '发布道路结冰黄色/橙色预警信号',
              threshold: '达到标准后即时',
            },
            {
              action: '暴雪预警（如叠加）',
              content: '如预计出现暴雪，同步发布暴雪预警信号',
              threshold: '达到标准后即时',
            },
            {
              action: '行业专项预报',
              content: '向交通、电力、农业等部门提供专项气象服务产品',
              threshold: '升级后4小时内首期',
            },
            {
              action: '预警信息全渠道覆盖',
              content: '协调通信运营商发送全网预警短信',
              threshold: '升级后2小时内',
            },
            {
              action: '寒潮过程评估',
              content: '对寒潮强度、持续时间、影响范围进行过程评估',
              threshold: '每日出具评估报告',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（III级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条',
          sopTable: [
            {
              action: '道路除雪融冰作业',
              content: '组织专业队伍对主要道路进行除雪融冰作业',
              threshold: '降雪开始后即时',
            },
            {
              action: '高速公路管控',
              content: '根据路况对高速公路实施限速、限行或关闭',
              threshold: '视路况即时决策',
            },
            {
              action: '国省干线保通',
              content: '优先保障国省干线道路畅通，确保应急运输通道',
              threshold: '全程',
            },
            {
              action: '桥梁防冻重点保障',
              content: '在重点桥梁铺设防滑材料，进行融雪剂撒布',
              threshold: '气温降至0℃以下时循环作业',
            },
            {
              action: '公共交通调整',
              content: '调整公交发车间隔和线路，保障市民基本出行',
              threshold: '升级后即时',
            },
            {
              action: '长途客运管理',
              content: '根据路况决定长途客运停班、减班或绕行',
              threshold: '升级后2小时内决策',
            },
            {
              action: '应急运力调度',
              content: '调度应急车辆保障医疗急救、物资运输等需求',
              threshold: '全程待命',
            },
            {
              action: '道路信息实时发布',
              content: '通过交通广播、导航App、可变情报板实时发布路况信息',
              threshold: '每2小时更新',
            },
            {
              action: '滞留旅客安置',
              content: '协调客运站做好因停班滞留旅客的安置',
              threshold: '停班后即时',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（III级）',
          sourceNote:
            '《突发事件应对法》第五章',
          sopTable: [
            {
              action: '全面隐患排查',
              content: '对辖区进行逐楼逐栋全面排查，重点关注老旧小区和棚户区',
              threshold: '升级后8小时内完成首轮',
            },
            {
              action: '弱势群体救助',
              content: '对孤寡老人、残疾人、低保户逐户上门，送去防寒物资',
              threshold: '升级后24小时内全覆盖',
            },
            {
              action: '流浪人员日巡夜查',
              content: '加大流浪人员巡查频次，发现一人救助一人',
              threshold: '每日至少3次巡查',
            },
            {
              action: '取暖安全排查',
              content: '排查煤炉取暖、电取暖设备安全隐患，预防火灾和一氧化碳中毒',
              threshold: '升级后24小时内完成首轮',
            },
            {
              action: '供水管道应急',
              content: '配合供水部门对冻裂管道进行临时处置，保障基本用水',
              threshold: '发现后即时处置',
            },
            {
              action: '临时取暖点运营',
              content: '延长社区取暖点开放时间，提供热水和食品',
              threshold: '升级后即时',
            },
            {
              action: '群众求助响应',
              content: '建立24小时社区求助热线，及时响应群众反映的供热、供水等问题',
              threshold: '升级后即时开通',
            },
            {
              action: '信息上报加强',
              content: '向区应急局每日上报受灾和处置情况',
              threshold: '每日2次（10:00/16:00）',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（III级）',
          description: 'III级较IV级新增岗位，负责交通管制、治安维护与流浪人员救助',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.3条',
          sopTable: [
            {
              action: '交通管制执行',
              content: '执行高速公路和主要道路交通管制，指挥疏导交通',
              threshold: '接到交通管制指令后即时',
            },
            {
              action: '交通事故快速处置',
              content: '增加路面警力，对因道路结冰引发的交通事故快速处置',
              threshold: '升级后即时增派50%警力',
            },
            {
              action: '流浪人员救助',
              content: '对街头流浪人员进行排查和救助，劝导至救助站',
              threshold: '升级后即日启动，每日巡查',
            },
            {
              action: '社会治安管控',
              content: '加强极端天气期间社会治安管控，防止哄抢等事件',
              threshold: '升级后即时',
            },
            {
              action: '110警情响应',
              content: '优先处置因寒潮引发的求助警情（车辆被困、人员冻伤等）',
              threshold: '升级后即时',
            },
            {
              action: '重点区域巡逻',
              content: '加强对车站、医院、商场等重点区域巡逻',
              threshold: '升级后即时',
            },
            {
              action: '一氧化碳中毒预防',
              content: '通过社区警务渠道宣传一氧化碳中毒防范知识',
              threshold: '升级后12小时内',
            },
            {
              action: '信息共享',
              content: '与应急、交通、城管部门建立实时信息共享机制',
              threshold: '升级后2小时内',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（III级）',
          description: 'III级较IV级新增岗位，负责道路除雪融冰、市政设施防冻保障',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.3条',
          sopTable: [
            {
              action: '道路除雪作业',
              content: '组织环卫力量对城市主次干道进行除雪融冰',
              threshold: '降雪开始后即时',
            },
            {
              action: '人行道防滑保障',
              content: '对人行道、天桥、地下通道进行铲雪和防滑处理',
              threshold: '降雪开始后即时',
            },
            {
              action: '市政设施防冻检查',
              content: '检查市政消火栓、供水阀门、排水设施防冻情况',
              threshold: '升级后4小时内完成首轮',
            },
            {
              action: '广告牌安全排查',
              content: '排查户外广告牌、店招因大风冰冻存在的安全隐患',
              threshold: '升级后8小时内完成首轮',
            },
            {
              action: '树木倒伏应急处置',
              content: '对因大风、冰冻导致倒伏的树木进行应急清理',
              threshold: '发现后1小时内处置',
            },
            {
              action: '垃圾清运保障',
              content: '确保极端天气下垃圾正常清运，防止因积压引发卫生问题',
              threshold: '持续保障',
            },
            {
              action: '除雪设备调度',
              content: '统一调度全市除雪车、铲车、撒布机等大型设备',
              threshold: '升级后2小时内完成调度',
            },
            {
              action: '融雪剂管理',
              content: '科学调配融雪剂使用，重点保障桥梁、坡道、交叉口',
              threshold: '全程',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（III级）',
          description: 'III级较IV级新增岗位，负责冻伤救治、一氧化碳中毒防范与极端天气医疗保障',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.3条',
          sopTable: [
            {
              action: '医疗救治启动',
              content: '启动极端天气医疗救治应急预案，开通冻伤绿色通道',
              threshold: '升级后即时',
            },
            {
              action: '急救力量加强',
              content: '增派急救车辆和人员，确保120急救电话畅通',
              threshold: '升级后1小时内增派50%',
            },
            {
              action: '一氧化碳中毒救治准备',
              content: '各医院急诊科做好一氧化碳中毒救治药品和设备准备',
              threshold: '升级后4小时内',
            },
            {
              action: '发热门诊保障',
              content: '确保发热门诊正常运转，做好呼吸道疾病增多的应对',
              threshold: '升级后即时',
            },
            {
              action: '血液保障',
              content: '协调血站保障急救用血',
              threshold: '升级后即时',
            },
            {
              action: '防寒健康宣传',
              content: '通过官方渠道发布防寒保暖、防一氧化碳中毒健康提示',
              threshold: '升级后2小时内发布',
            },
            {
              action: '基层卫生机构动员',
              content: '动员社区卫生服务中心参与防寒宣传和冻伤初诊',
              threshold: '升级后即时',
            },
            {
              action: '医疗信息统计',
              content: '统计冻伤、一氧化碳中毒、呼吸道疾病等因寒就诊数据',
              threshold: '每日上报指挥部',
            },
            {
              action: '特殊群体医疗',
              content: '对独居老人、残疾人等特殊群体提供上门医疗和送药服务',
              threshold: '升级后12小时内启动',
            },
            {
              action: '心理援助',
              content: '对因寒潮受灾群众提供心理援助热线服务',
              threshold: '升级后24小时内',
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
        '中国气象局寒潮预警升级为橙色（II级）',
        '实测24小时降温≥12℃或48小时降温≥14℃，最低气温降至-4℃以下',
        '暴雪（24小时降雪量≥10mm）导致城市主要道路交通瘫痪',
        '冻雨导致供电线路大面积覆冰断电（影响≥5万户）',
        '供水管道大面积冻裂，城区大面积停水（影响≥10万户）',
        '低温天气造成人员伤亡（冻死≥3人）',
        '高速公路、铁路大面积停运，大量旅客滞留（≥5000人）',
        '城市供暖系统大面积故障',
        '恶劣天气持续超过72小时无明显好转趋势',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '市长',
          fullName: '市长（II级）',
          description: 'II级新增岗位，首次直接介入指挥，担任全市寒潮应对最高决策者',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条、4.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '签发II级响应令',
              content: '确认灾情达到II级标准，签发响应升级令',
              threshold: '达到条件后1小时内',
            },
            {
              action: '全面接管指挥',
              content: '亲自坐镇市应急指挥中心，全面指挥寒潮应急处置',
              threshold: '升级后即时',
            },
            {
              action: '召开全市动员大会',
              content: '动员全市力量投入寒潮应对',
              threshold: '升级后4小时内',
            },
            {
              action: '向省政府述职',
              content: '每日向省政府报告寒潮影响和处置情况',
              threshold: '每日2次（9:00/17:00）',
            },
            {
              action: '请求军队支援',
              content: '向省军区请求武警部队支援',
              threshold: '升级后2小时内',
            },
            {
              action: '重大决策',
              content: '宣布停工停课停运、区域性交通管制等重大决策',
              threshold: '升级后2小时内',
            },
            {
              action: '市场秩序调控',
              content: '部署发改、商务部门保障市场供应、稳定物价',
              threshold: '升级后即时',
            },
            {
              action: '新闻发布会',
              content: '主持新闻发布会，向公众通报寒潮影响和应对措施',
              threshold: '升级后4小时内首次',
            },
            {
              action: '恢复生产部署',
              content: '研究部署寒潮过后的恢复生产工作',
              threshold: '寒潮影响减弱后即时',
            },
          ],
        },
        {
          name: '分管副市长',
          fullName: '分管副市长（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条、4.3条',
          sopTable: [
            {
              action: '协助市长指挥',
              content: '在市长领导下履行分管领域指挥职责',
              threshold: '全程',
            },
            {
              action: '现场督导',
              content: '带队赴重点受影响区县现场督导应急工作',
              threshold: '升级后4小时内出发',
            },
            {
              action: '跨部门协调',
              content: '协调应急与交通、电力、通信等核心部门联动',
              threshold: '全程',
            },
            {
              action: '物资调配审批',
              content: '审批市级储备物资大规模调拨方案',
              threshold: '随时',
            },
            {
              action: '每日向市长汇报',
              content: '每日向市长汇报分管领域处置进展',
              threshold: '每日2次',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条、4.3条',
          sopTable: [
            {
              action: '全面升级应急值守',
              content: '实行24小时双人值班，确保指挥系统不间断运行',
              threshold: '升级后即时',
            },
            {
              action: '大规模物资调拨',
              content: '启用全部市级储备库，大规模调拨救灾物资',
              threshold: '升级后4小时内首批到达',
            },
            {
              action: '省级对接',
              content: '向省应急厅正式请求省级应急物资和救援力量支援',
              threshold: '升级后2小时内',
            },
            {
              action: '联合指挥机制',
              content: '与供电公司、交通局、城管局建立联合指挥调度',
              threshold: '升级后4小时内',
            },
            {
              action: '灾情全面评估',
              content: '组织开展寒潮灾害全面影响评估',
              threshold: '升级后12小时内初评',
            },
            {
              action: '跨市协调',
              content: '协调周边城市应急资源支援',
              threshold: '升级后4小时内启动',
            },
            {
              action: '社会力量调度',
              content: '统一调度蓝天救援队等社会应急救援力量',
              threshold: '升级后6小时内',
            },
            {
              action: '灾情简报',
              content: '灾情简报频率提升为每日4次',
              threshold: '8:00/14:00/20:00/次日2:00',
            },
            {
              action: '恢复方案制定',
              content: '牵头制定寒潮过后恢复生产生活方案',
              threshold: '寒潮减弱后启动',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '升级寒潮预警为橙色',
              content: '按标准升级发布寒潮橙色预警信号',
              threshold: '达到橙色预警标准后即时',
            },
            {
              action: '高频加密会商',
              content: '参加中国气象局-省-市三级加密会商',
              threshold: '每2小时参加一次',
            },
            {
              action: '精准逐时预报',
              content: '提供逐小时气温、降雪量、风速、冻雨精细化预报',
              threshold: '升级后即时',
            },
            {
              action: '专项预警全覆盖',
              content: '同步发布暴雪、道路结冰、大风等各类专项预警信号',
              threshold: '达到标准后即时',
            },
            {
              action: '应急气象服务车出动',
              content: '派出应急气象服务车赴重点区域开展现场监测',
              threshold: '升级后4小时内到位',
            },
            {
              action: '预警短信全网覆盖',
              content: '协调通信运营商向全市手机用户发送预警短信',
              threshold: '升级后2小时内',
            },
            {
              action: '过程影响评估',
              content: '每日出具寒潮过程综合影响评估报告',
              threshold: '每日提交指挥部',
            },
            {
              action: '预警解除研判',
              content: '持续研判寒潮减弱趋势，提出预警降级或解除建议',
              threshold: '持续',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '全域交通管制',
              content: '实施全域交通管制，封控危险路段，仅允许应急车辆通行',
              threshold: '升级后即时',
            },
            {
              action: '大规模除雪保通',
              content: '组织全部除雪力量投入主干道路除雪保通',
              threshold: '升级后即时',
            },
            {
              action: '滞留旅客大规模安置',
              content: '调集大巴、开放安置点，安置因停运滞留的旅客',
              threshold: '升级后2小时内启动',
            },
            {
              action: '应急运输绿色通道',
              content: '开辟医疗急救、物资运输、民生保障车辆绿色通道',
              threshold: '升级后即时',
            },
            {
              action: '铁路航空协调',
              content: '协调铁路部门加开临时列车、协调航空部门保障',
              threshold: '升级后4小时内对接',
            },
            {
              action: '道路抢通攻坚',
              content: '集中力量抢通中断的主要交通干线',
              threshold: '升级后6小时内至少抢通1条干线',
            },
            {
              action: '交通恢复方案',
              content: '制定寒潮过后的分阶段交通恢复方案',
              threshold: '升级后12小时内',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '全域交通管控',
              content: '执行最严格交通管控，封堵危险路段入口',
              threshold: '升级后即时',
            },
            {
              action: '滞留人员救助',
              content: '对火车站、客运站、高速服务区滞留人员进行救助',
              threshold: '升级后即时',
            },
            {
              action: '全域治安管控',
              content: '加强社会面治安管控，重点区域武装巡逻',
              threshold: '升级后即时',
            },
            {
              action: '救援力量投入',
              content: '出动特警、巡警参与被困人员救援和物资运送',
              threshold: '升级后即时',
            },
            {
              action: '社会秩序维护',
              content: '维护商场、加油站、安置点的社会秩序',
              threshold: '全程',
            },
            {
              action: '舆情监控',
              content: '配合网信办监控网络舆情，及时发现和处置谣言',
              threshold: '24小时监控',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条、4.3条',
          sopTable: [
            {
              action: '全员除雪作业',
              content: '调动全部环卫力量进行城市大规模除雪',
              threshold: '升级后即时',
            },
            {
              action: '跨区设备调度',
              content: '统一调度全市除雪设备，优先保障主干道和桥梁',
              threshold: '升级后即时',
            },
            {
              action: '积雪清运',
              content: '组织积雪清运，防止占道和融化后二次结冰',
              threshold: '持续作业',
            },
            {
              action: '市政设施应急抢修',
              content: '组织抢修队伍对受损市政设施进行应急抢修',
              threshold: '升级后即时',
            },
            {
              action: '倒伏树木应急清理',
              content: '对因冰冻倒伏的树木进行全面清理',
              threshold: '升级后即时',
            },
            {
              action: '人行通道全面保障',
              content: '确保所有人行天桥、地下通道安全通行',
              threshold: '升级后持续作业',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（II级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '全市医疗动员',
              content: '动员全市医疗机构投入寒潮相关救治',
              threshold: '升级后即时',
            },
            {
              action: '急救力量全投入',
              content: '调动全部急救资源，确保120电话畅通',
              threshold: '升级后即时',
            },
            {
              action: '一氧化碳中毒专项救治',
              content: '建立一氧化碳中毒快速诊断和救治通道',
              threshold: '升级后即时',
            },
            {
              action: '医疗巡诊',
              content: '派出医疗巡诊队赴安置点和重点社区巡诊',
              threshold: '升级后8小时内启动',
            },
            {
              action: '防寒药品储备',
              content: '盘点各医院防寒防冻药品储备，及时补充',
              threshold: '升级后4小时内',
            },
            {
              action: '请求省级医疗支援',
              content: '向省卫健委请求省级医疗队支援',
              threshold: '升级后4小时内',
            },
            {
              action: '卫生防疫',
              content: '对安置点进行卫生防疫检查',
              threshold: '升级后12小时内启动',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（II级）',
          description: 'II级新增岗位，负责电力保障与电网抢修，冰冻灾害对电网影响极大',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '电力灾情评估',
              content: '评估冰冻对电网造成的损害范围和严重程度',
              threshold: '升级后1小时内',
            },
            {
              action: '应急供电保障',
              content: '调配发电车、发电机保障指挥部、医院、通信基站供电',
              threshold: '升级后2小时内到位',
            },
            {
              action: '线路除冰作业',
              content: '组织队伍对覆冰线路进行人工除冰或直流融冰',
              threshold: '升级后即时启动',
            },
            {
              action: '倒塔倒杆抢修',
              content: '对因覆冰倒塌的电塔、电杆进行应急抢修',
              threshold: '升级后即时启动',
            },
            {
              action: '优先保障清单',
              content: '制定优先恢复供电清单（医院、水厂、通信、供暖）',
              threshold: '升级后2小时内确定',
            },
            {
              action: '请求省级支援',
              content: '向省电力公司请求抢修力量和物资支援',
              threshold: '升级后2小时内',
            },
            {
              action: '分区域恢复方案',
              content: '制定分区域电力恢复方案并向社会公告',
              threshold: '升级后8小时内发布',
            },
            {
              action: '用电安全提示',
              content: '通过多渠道向社会发布极端天气用电安全提示',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（II级）',
          description: 'II级新增岗位，负责应急通信保障，极端天气下通信保障是应急指挥的生命线',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '通信灾情评估',
              content: '评估冰冻对通信基站、光缆造成的损害',
              threshold: '升级后1小时内',
            },
            {
              action: '应急通信保障',
              content: '调配应急通信车、卫星电话保障指挥部通信',
              threshold: '升级后2小时内到位',
            },
            {
              action: '基站抢修',
              content: '组织通信运营商抢修受损通信基站',
              threshold: '升级后即时',
            },
            {
              action: '发电机燃油保障',
              content: '协调保障基站备用发电机的燃油供应',
              threshold: '升级后全时保障',
            },
            {
              action: '优先恢复计划',
              content: '制定优先恢复通信区域清单（指挥中心、医院、安置点）',
              threshold: '升级后2小时内确定',
            },
            {
              action: '公众通信恢复',
              content: '向社会公告通信恢复进度',
              threshold: '每6小时更新',
            },
            {
              action: '通信信息报告',
              content: '向指挥部报告通信保障和恢复情况',
              threshold: '每2小时报告',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（II级）',
          description: 'II级新增岗位，负责网络舆情管控与权威信息发布',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '网络舆情监控',
              content: '24小时监控网络舆情，聚焦停电停水停暖等民生话题',
              threshold: '升级后即时',
            },
            {
              action: '权威信息发布',
              content: '通过官方新媒体矩阵发布寒潮应对权威信息',
              threshold: '每2小时更新',
            },
            {
              action: '谣言快速处置',
              content: '对停电停课停供等谣言及时辟除',
              threshold: '发现后1小时内',
            },
            {
              action: '负面情绪疏导',
              content: '引导网络舆论，疏导群众因停电停水等产生的不满情绪',
              threshold: '持续',
            },
            {
              action: '新闻发布会组织',
              content: '组织每日新闻发布会，向公众传递权威信息',
              threshold: '每日1次',
            },
            {
              action: '媒体协调',
              content: '协调主流媒体做好寒潮应对报道',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市教育局',
          fullName: '市教育局（II级）',
          description: 'II级新增岗位，负责全市中小学全面停课管理和师生安全保障',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全面停课令',
              content: '发布全市中小学、幼儿园全面停课令',
              threshold: '升级后即时',
            },
            {
              action: '学生安全保障',
              content: '通知各学校做好留校学生的安全保障和生活保障',
              threshold: '升级后即时',
            },
            {
              action: '校舍安全检查',
              content: '组织对全市校舍进行因寒潮冰冻导致的安全隐患检查',
              threshold: '升级后12小时内启动',
            },
            {
              action: '线上教学预案',
              content: '制定停课期间线上教学预案',
              threshold: '升级后24小时内发布方案',
            },
            {
              action: '复课研判',
              content: '根据寒潮减弱和气温回升情况研判复课时间',
              threshold: '寒潮减弱后即时研判',
            },
            {
              action: '校车安全管理',
              content: '全面暂停校车运行，防止因道路结冰引发事故',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市农业农村局',
          fullName: '市农业农村局（II级）',
          description: 'II级新增岗位，负责农业大棚加固、作物冻害评估与畜禽防寒',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '农业灾情排查',
              content: '组织力量排查全市农业大棚、养殖场受灾情况',
              threshold: '升级后4小时内启动',
            },
            {
              action: '大棚加固指导',
              content: '指导农户对蔬菜大棚进行加固和保温',
              threshold: '升级后即时通知',
            },
            {
              action: '畜禽防寒保暖',
              content: '指导养殖户做好畜禽圈舍防寒保暖，防止冻死冻伤',
              threshold: '升级后即时通知',
            },
            {
              action: '设施农业供电保障',
              content: '协调供电部门保障设施农业的供暖供电',
              threshold: '升级后4小时内对接',
            },
            {
              action: '作物冻害评估',
              content: '组织农技人员开展冬小麦、油菜等作物冻害评估',
              threshold: '升级后12小时内启动',
            },
            {
              action: '水产养殖防冻',
              content: '指导水产养殖户采取增氧、破冰等防冻措施',
              threshold: '升级后即时通知',
            },
            {
              action: '灾情统计上报',
              content: '统计农业受灾面积、经济损失，上报省农业农村厅',
              threshold: '每日更新',
            },
            {
              action: '保险理赔指导',
              content: '指导受灾农户对接农业保险理赔',
              threshold: '升级后即时通知',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（II级）',
          description: 'II级新增岗位，负责大规模除雪除冰、抢险救援与秩序维护',
          isNew: true,
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '接受任务',
              content: '接受市指挥部赋予的除雪除冰、抢险救援、警戒等任务',
              threshold: '按指令接收',
            },
            {
              action: '兵力部署',
              content: '根据任务需求迅速部署兵力',
              threshold: '接受任务后4小时内到位',
            },
            {
              action: '重点区域除雪除冰',
              content: '对机场、火车站、高速公路枢纽等重点区域进行除雪除冰作业',
              threshold: '到位后即时',
            },
            {
              action: '被困人员救援',
              content: '参与因冰雪困在高速公路、山区的被困人员救援',
              threshold: '按指令执行',
            },
            {
              action: '物资搬运分发',
              content: '参与救灾物资搬运和分发',
              threshold: '按指令执行',
            },
            {
              action: '关键设施警戒',
              content: '对变电站、通信枢纽、物资仓库等重要设施实施警戒',
              threshold: '到位后即时',
            },
            {
              action: '秩序维护',
              content: '协助公安维护安置点和重点区域的社会秩序',
              threshold: '按指令执行',
            },
            {
              action: '情况报告',
              content: '定期向市指挥部报告任务执行情况',
              threshold: '每4小时报告',
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
        '中国气象局寒潮预警升级为红色（I级）',
        '实测24小时降温≥16℃或48小时降温≥18℃，最低气温降至-8℃以下',
        '大暴雪（24小时降雪量≥20mm）导致城市交通全面瘫痪',
        '严重冻雨导致供电系统大面积瘫痪（影响≥50万户）',
        '城市供水系统全面冻裂停水（影响≥100万人）',
        '城市供暖系统全面瘫痪，大面积居民无法取暖',
        '低温造成大量人员伤亡（冻死≥10人或冻伤≥100人）',
        '国务院决定启动I级响应',
        '恶劣天气持续超过120小时且无缓解趋势',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '市长',
          fullName: '市长（I级）',
          description: '执行国务院指令，全市总动员，担任市级防指总指挥',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条、4.3条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '执行国务院指令',
              content: '坚决执行国务院的各项指令',
              threshold: '即时',
            },
            {
              action: '全市总动员',
              content: '实施全市总动员，一切力量投入寒潮应对',
              threshold: '升级后即时',
            },
            {
              action: '请求全国支援',
              content: '向国务院请求全国各省市支援',
              threshold: '升级后2小时内',
            },
            {
              action: '大规模转移安置',
              content: '组织因停暖停电无法生活的市民大规模转移',
              threshold: '升级后即时',
            },
            {
              action: '接受全国援助',
              content: '按国务院指令接受全国物资和救援力量',
              threshold: '按指令执行',
            },
            {
              action: '每日述职',
              content: '每日向国务院指挥部述职',
              threshold: '每日2次',
            },
            {
              action: '灾后恢复部署',
              content: '指挥灾后恢复生产和重建',
              threshold: '寒潮减弱后启动',
            },
          ],
        },
        {
          name: '分管副市长',
          fullName: '分管副市长（I级）',
          description: '担任现场指挥，执行国务院和市级指挥部指令',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条、4.3条',
          sopTable: [
            {
              action: '现场指挥',
              content: '驻守现场指挥部，执行国务院和市级指挥部指令',
              threshold: '全程',
            },
            {
              action: '全国资源对接',
              content: '对接来自全国各省的救援力量和物资',
              threshold: '升级后即时',
            },
            {
              action: '跨省协调',
              content: '协调跨省救援力量部署和物资调配',
              threshold: '全程',
            },
            {
              action: '专项任务督办',
              content: '督办指挥部确定的重点任务',
              threshold: '每日检查',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条、4.2条、4.3条；《自然灾害救助条例》第十一条至第二十二条',
          sopTable: [
            {
              action: '国家-省-市三级信息平台',
              content: '建立全市统一灾情信息平台，实现三级信息共享',
              threshold: '升级后即时',
            },
            {
              action: '全国资源对接',
              content: '对接全国应急资源，包括救援队、物资、装备',
              threshold: '升级后即时',
            },
            {
              action: '全域物资统一调配',
              content: '实现全域救灾物资统一调配',
              threshold: '升级后即时',
            },
            {
              action: '大规模安置点管理',
              content: '协调民政部门管理大规模临时安置点',
              threshold: '升级后即时',
            },
            {
              action: '全面灾情评估',
              content: '配合国家评估组开展寒潮灾害全面评估',
              threshold: '升级后48小时内',
            },
            {
              action: '恢复重建方案',
              content: '编制寒潮灾后恢复重建总体方案',
              threshold: '寒潮减弱后1周内',
            },
          ],
        },
        {
          name: '市气象局',
          fullName: '市气象局（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.1条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '升级寒潮预警为红色',
              content: '按标准升级发布寒潮红色预警信号',
              threshold: '达到红色预警标准后即时',
            },
            {
              action: '最高频会商',
              content: '参加中国气象局-大区-省-市四级加密会商',
              threshold: '每1小时参加一次',
            },
            {
              action: '精准短临预报',
              content: '提供逐半小时精细化天气预报，包括降温速率、降雪强度',
              threshold: '升级后即时',
            },
            {
              action: '全网红色预警短信',
              content: '协调通信运营商向全市手机用户强制发送红色预警',
              threshold: '升级后1小时内',
            },
            {
              action: '全国气象资源协调',
              content: '请求国家级气象卫星和雷达加密观测',
              threshold: '升级后2小时内',
            },
            {
              action: '寒潮全周期评估',
              content: '对寒潮全过程进行科学评估和灾后气候分析',
              threshold: '持续',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全域交通最严管控',
              content: '实施最严格交通管控，仅允许应急和民生车辆通行',
              threshold: '升级后即时',
            },
            {
              action: '大规模除雪攻坚',
              content: '组织全部力量进行大规模除雪攻坚',
              threshold: '升级后即时',
            },
            {
              action: '航空铁路全面协调',
              content: '协调全国铁路、航空资源保障救援运输',
              threshold: '升级后即时',
            },
            {
              action: '大规模人员转运',
              content: '组织大规模人员转运至安全区域',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全域戒严',
              content: '对核心受影响区域实施戒严',
              threshold: '升级后即时',
            },
            {
              action: '全部警力投入',
              content: '出动全部警力参与抢险救援和秩序维护',
              threshold: '升级后即时',
            },
            {
              action: '严厉打击犯罪',
              content: '从严从快打击趁灾盗窃、抢劫、哄抬物价等犯罪',
              threshold: '全程',
            },
            {
              action: '人员救助',
              content: '全力救助被困和需要帮助的群众',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市城管局',
          fullName: '市城管局（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条、4.3条',
          sopTable: [
            {
              action: '全城除雪大会战',
              content: '调动全部除雪力量，24小时不间断作业',
              threshold: '升级后即时',
            },
            {
              action: '积雪全面清运',
              content: '组织大规模积雪清运，防止二次冰冻',
              threshold: '持续作业',
            },
            {
              action: '市政设施全面抢修',
              content: '组织全面抢修受损市政设施',
              threshold: '升级后即时',
            },
            {
              action: '请求邻市支援',
              content: '请求相邻城市环卫力量支援',
              threshold: '升级后2小时内',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全国医疗动员',
              content: '请求全国医疗力量支援',
              threshold: '升级后即时',
            },
            {
              action: '大规模一氧化碳中毒救治',
              content: '启动大规模一氧化碳中毒专项救治方案',
              threshold: '升级后即时',
            },
            {
              action: '野战医院设置',
              content: '在重点安置点设置野战医院',
              threshold: '升级后12小时内',
            },
            {
              action: '全面防疫',
              content: '实施全面卫生防疫，确保大灾之后无大疫',
              threshold: '升级即时启动',
            },
            {
              action: '心理援助全覆盖',
              content: '实现受灾群众心理援助全覆盖',
              threshold: '升级后24小时内',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '请求跨省支援',
              content: '向国家电网请求跨省支援抢修力量和装备',
              threshold: '升级后1小时内',
            },
            {
              action: '应急供电全覆盖',
              content: '调配一切发电设备保障医院、安置点、指挥中心供电',
              threshold: '升级后即时',
            },
            {
              action: '电网全面抢修',
              content: '组织电网全面抢修大会战',
              threshold: '升级后即时',
            },
            {
              action: '分阶段恢复预案',
              content: '向社会发布分阶段电力恢复计划',
              threshold: '升级后12小时内',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全面通信保障',
              content: '调配一切通信资源保障指挥和民生通信',
              threshold: '升级后即时',
            },
            {
              action: '卫星通信全面保障',
              content: '申请卫星通信资源保障受灾区域通信',
              threshold: '升级后4小时内',
            },
            {
              action: '通信全面恢复方案',
              content: '制定通信全面恢复方案并向社会公告',
              threshold: '升级后即时',
            },
            {
              action: '通信运营跨省支援',
              content: '请求通信运营企业跨省支援',
              threshold: '升级后2小时内',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全面舆情管控',
              content: '实施最严格的网络舆情管控',
              threshold: '升级后即时',
            },
            {
              action: '国务院信息发布',
              content: '配合国务院新闻办做好信息统一发布',
              threshold: '按指令执行',
            },
            {
              action: '国际国内舆论引导',
              content: '做好国际国内舆论引导',
              threshold: '升级后即时',
            },
            {
              action: '谣言最快处置',
              content: '对谣言实施最快速度处置',
              threshold: '发现后30分钟内',
            },
          ],
        },
        {
          name: '市教育局',
          fullName: '市教育局（I级）',
          description: 'I级响应中承担全面停课管理、师生安全保障与校舍安全责任',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全面停课令',
              content: '发布全市中小学、幼儿园全面停课令',
              threshold: '升级后即时',
            },
            {
              action: '学生安全保障',
              content: '通知各学校做好留校学生的安全保障和生活保障',
              threshold: '升级后即时',
            },
            {
              action: '校舍安全检查',
              content: '组织对全市校舍进行因寒潮冰冻导致的安全隐患检查',
              threshold: '升级后12小时内启动',
            },
            {
              action: '线上教学预案',
              content: '制定停课期间线上教学预案',
              threshold: '升级后24小时内发布方案',
            },
            {
              action: '复课研判',
              content: '根据寒潮减弱和气温回升情况研判复课时间',
              threshold: '寒潮减弱后即时研判',
            },
            {
              action: '校车安全管理',
              content: '全面暂停校车运行，防止因道路结冰引发事故',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市农业农村局',
          fullName: '市农业农村局（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.2条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全面农业灾情评估',
              content: '对全市农作物、设施农业、畜禽养殖进行全面灾害评估',
              threshold: '升级后即时',
            },
            {
              action: '请求全国农业支援',
              content: '向农业农村部请求全国农业救灾支援',
              threshold: '升级后4小时内',
            },
            {
              action: '畜禽紧急转移',
              content: '组织危险区域畜禽紧急转移',
              threshold: '升级后即时',
            },
            {
              action: '灾后恢复方案',
              content: '制定农业灾后恢复生产方案',
              threshold: '寒潮减弱后即时启动',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（I级）',
          sourceNote:
            '《国家气象灾害应急预案》第4.3条；《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '大规模投入',
              content: '按国务院指令大规模投入兵力',
              threshold: '按指令执行',
            },
            {
              action: '核心区域除雪抢险',
              content: '在核心受灾区域开展大规模除雪除冰和抢险',
              threshold: '到位后即时',
            },
            {
              action: '大规模人员转移',
              content: '参与受灾群众大规模转移',
              threshold: '按指令执行',
            },
            {
              action: '配合解放军',
              content: '配合解放军执行各项任务',
              threshold: '按指令执行',
            },
          ],
        },
      ],
    },
  ],
  references: [
    { title: '《国家气象灾害应急预案》（2019年修订）', url: 'https://www.gov.cn/zhengce/content/2019-12/11/content_5460363.htm' },
    { title: '《气象灾害防御条例》（国务院令第570号，2017年修订）', url: 'https://www.gov.cn/gongbao/content/2017/content_5241923.htm' },
    { title: '《国家突发事件总体应急预案》（2025年）', url: 'https://www.gov.cn/zhengce/202502/content_7005635.htm' },
    { title: '《中华人民共和国突发事件应对法》（2024年修订）', url: 'http://www.npc.gov.cn/npc/c2/c30834/202406/t20240628_437888.html' },
    { title: '《寒潮等级》（GB/T 21987-2017）', url: 'https://openstd.samr.gov.cn/' },
    { title: '《气象灾害预警信号发布与传播办法》（中国气象局令第16号）', url: 'https://www.cma.gov.cn/zfxxgk/gknr/flfgbz/bz/202109/t20210916_4094094.html' },
  ],
};
