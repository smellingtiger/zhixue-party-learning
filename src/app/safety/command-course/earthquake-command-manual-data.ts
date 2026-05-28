import type { CommandManualData } from './types';

export const earthquakeCommandManualData: CommandManualData = {
  disasterName: '地震',
  disasterIcon: '地震灾害',
  responseLevels: [
    {
      level: 'IV',
      color: 'blue',
      label: 'IV级响应',
      conditions: [
        '人口较密集地区4.0≤震级＜5.0',
        '造成10人以下死亡',
        '烈度达到VII度',
        '地震造成房屋倒塌或严重损坏≥50间',
        '地震造成人员伤亡',
        '地震造成生命线工程（供水、供电、供气、通信、交通）中断',
        '地震引发次生灾害（火灾、爆炸、滑坡等）',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（IV级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条；《破坏性地震应急条例》第二十二条至第二十七条；《中华人民共和国防震减灾法》第四十六条至第五十条',
          sopTable: [
            {
              action: '震后到岗',
              content: '接到震情报告后立即赶赴市应急指挥中心',
              threshold: '震后30分钟内',
            },
            {
              action: '批准启动IV级响应',
              content: '听取市应急局震情速报，签发IV级响应启动令',
              threshold: '震后1小时内',
            },
            {
              action: '召集首次指挥部会议',
              content: '听取各岗位先期处置情况，明确分工和优先级',
              threshold: '震后2小时内',
            },
            {
              action: '研判灾情走势',
              content: '根据余震趋势、建筑损毁、人员被困情况判断是否升级',
              threshold: '持续研判',
            },
            {
              action: '向市长和省应急厅报告',
              content: '报告震情、灾情、响应措施和需求',
              threshold: '震后2小时内首报',
            },
            {
              action: '指挥重点任务',
              content: '优先保障人员搜救、伤员转运、生命线工程抢修',
              threshold: '全程',
            },
            {
              action: '信息发布审批',
              content: '审核对外发布信息，稳定社会情绪',
              threshold: '每次发布前',
            },
            {
              action: '响应终止决策',
              content: '确认灾情稳定、应急任务完成后终止IV级响应',
              threshold: '灾情稳定后48小时内',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（IV级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条；《破坏性地震应急条例》第二十二条至第二十七条',
          sopTable: [
            {
              action: '震情速报',
              content: '接收中国地震台网正式测定结果，向分管副市长报告震级、震中、震源深度',
              threshold: '震后15分钟内',
            },
            {
              action: '启动应急值班',
              content: '全员到岗，开通24小时值班电话和应急指挥系统',
              threshold: '震后20分钟内',
            },
            {
              action: '灾情信息汇总',
              content: '汇总各区县、街道上报的灾情信息，建立灾情台账',
              threshold: '震后1小时内首报',
            },
            {
              action: '派出先遣工作组',
              content: '派出地震现场工作队赴震中区域开展灾情调查和评估',
              threshold: '震后1小时内出发',
            },
            {
              action: '协调救援力量',
              content: '调动市级消防救援队伍、地震灾害紧急救援队',
              threshold: '震后30分钟内下达指令',
            },
            {
              action: '物资调拨',
              content: '启用市级应急物资储备，调拨帐篷、棉被、折叠床等',
              threshold: '震后2小时内首批出库',
            },
            {
              action: '伤亡统计',
              content: '持续统计和更新人员伤亡、失踪、被困数据',
              threshold: '每2小时更新一次',
            },
            {
              action: '余震监测',
              content: '对接地震监测部门，跟踪余震序列，研判趋势',
              threshold: '持续监测',
            },
            {
              action: '编写灾情简报',
              content: '汇总灾情和处置情况，编写灾情简报供指挥部决策',
              threshold: '每日2次（8:00/20:00）',
            },
            {
              action: '响应终止建议',
              content: '灾情稳定后向分管副市长提出终止响应建议',
              threshold: '灾情稳定后24小时内',
            },
          ],
        },
        {
          name: '市住建局',
          fullName: '市住建局（IV级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条；《城市抗震防灾规划标准》GB 50413',
          sopTable: [
            {
              action: '启动应急评估',
              content: '组织建筑安全专家对震区建筑进行应急安全评估',
              threshold: '震后2小时内启动',
            },
            {
              action: '重点建筑排查',
              content: '优先排查学校、医院、养老院、商场等人员密集场所',
              threshold: '震后4小时内完成首轮',
            },
            {
              action: '危房标识',
              content: '对评估为危险的建筑张贴红/黄/绿标识（红=禁用、黄=限制使用、绿=可使用）',
              threshold: '评估完成后即时',
            },
            {
              action: '居住建筑排查',
              content: '对居民住宅进行安全排查，组织危房居民撤离',
              threshold: '震后12小时内完成首轮',
            },
            {
              action: '生命线工程排查',
              content: '排查供水、供气、供热管线和设施安全状况',
              threshold: '震后6小时内完成首轮',
            },
            {
              action: '建筑损毁统计',
              content: '统计房屋倒塌、严重损坏、一般损坏数量和面积',
              threshold: '每4小时更新一次',
            },
            {
              action: '临时安置点选址',
              content: '评估公园、广场、学校操场等作为临时安置点的安全性',
              threshold: '震后4小时内提出方案',
            },
            {
              action: '抢修方案制定',
              content: '制定受损建筑抢修加固方案',
              threshold: '震后24小时内',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（IV级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条',
          sopTable: [
            {
              action: '道路灾情排查',
              content: '排查震区主要道路、桥梁、隧道损毁情况',
              threshold: '震后1小时内启动',
            },
            {
              action: '交通管制',
              content: '对受损路段实施交通管制，设置警示标志',
              threshold: '发现损毁后即时',
            },
            {
              action: '应急通道保障',
              content: '开辟救援车辆绿色通道，保障救援力量快速通行',
              threshold: '震后1小时内',
            },
            {
              action: '抢通保通',
              content: '组织力量抢通中断道路，优先保障通往医院、安置点道路',
              threshold: '震后4小时内首条抢通',
            },
            {
              action: '桥梁安全评估',
              content: '对震区桥梁进行紧急安全评估',
              threshold: '震后6小时内完成重点桥梁',
            },
            {
              action: '公共交通调整',
              content: '调整公交线路和班次，保障市民基本出行',
              threshold: '震后4小时内发布调整方案',
            },
            {
              action: '运力保障',
              content: '调集客运车辆保障人员疏散和转运',
              threshold: '震后2小时内到位',
            },
            {
              action: '道路损毁统计',
              content: '统计道路中断里程、桥梁损毁数量',
              threshold: '每4小时更新一次',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（IV级）',
          sourceNote:
            '《破坏性地震应急条例》第二十二条；《中华人民共和国防震减灾法》第四十六条',
          sopTable: [
            {
              action: '震后自查',
              content: '街道干部立即自查办公场所安全，确认通讯畅通',
              threshold: '震后10分钟内',
            },
            {
              action: '灾情速报',
              content: '向区应急局报告辖区震感、初步灾情、人员伤亡情况',
              threshold: '震后30分钟内首报',
            },
            {
              action: '人员疏散',
              content: '组织危房居民、老旧小区居民向安全区域疏散',
              threshold: '震后1小时内启动',
            },
            {
              action: '现场搜救',
              content: '组织社区工作者、志愿者对倒塌建筑进行初步搜救',
              threshold: '震后30分钟内启动',
            },
            {
              action: '伤员转运',
              content: '协助将受伤人员转运至医疗机构',
              threshold: '发现伤员后即时',
            },
            {
              action: '临时安置',
              content: '开放社区活动中心、学校等作为临时安置点',
              threshold: '震后2小时内开放',
            },
            {
              action: '灾情排查',
              content: '逐楼逐户排查人员伤亡、建筑损毁、燃气泄漏等情况',
              threshold: '震后4小时内完成首轮',
            },
            {
              action: '信息发布',
              content: '通过社区广播、微信群等向居民发布震情和避险信息',
              threshold: '震后1小时内首次发布',
            },
            {
              action: '秩序维护',
              content: '组织社区安保力量维护安置点、物资发放点秩序',
              threshold: '全程',
            },
            {
              action: '特殊群体关注',
              content: '重点关注独居老人、残疾人、儿童等特殊群体',
              threshold: '震后2小时内完成排查',
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
        '中国地震台网正式测定震级≥5.0级',
        '已确认死亡人数≥10人（含失踪）',
        '房屋倒塌≥500间或严重损坏≥2000间',
        '生命线工程大面积中断（供水/供电/供气/通信任一系统瘫痪超过2小时）',
        '地震引发重大次生灾害（火灾、爆炸、滑坡、泥石流等）',
        '震中烈度达到VII度及以上',
        '辖区内出现大规模人员疏散（≥1万人）',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '分管副市长',
          fullName: '分管副市长（III级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.3条；《中华人民共和国突发事件应对法》第五章',
          sopTable: [
            {
              action: '升级响应决策',
              content: '签发III级响应升级令，通报全体指挥部成员',
              threshold: '达到升级条件后30分钟内',
            },
            {
              action: '扩大指挥部',
              content: '增补市公安局、卫健委、地震局为指挥部成员单位',
              threshold: '升级后1小时内',
            },
            {
              action: '召开升级后首次会议',
              content: '明确III级响应下各岗位任务和协同要求',
              threshold: '升级后2小时内',
            },
            {
              action: '请求省级支援',
              content: '向省应急厅报告灾情，请求省级救援力量和物资支援',
              threshold: '升级后1小时内',
            },
            {
              action: '设立现场指挥部',
              content: '在震中区域设立现场指挥部，靠前指挥',
              threshold: '升级后3小时内',
            },
            {
              action: '每日指挥部例会',
              content: '每日固定时间召开指挥部例会，听取各岗位汇报',
              threshold: '每日8:00',
            },
            {
              action: '重大事项决策',
              content: '对人员搜救方案、大规模疏散、次生灾害处置等重大事项决策',
              threshold: '即时',
            },
            {
              action: '向省指挥部述职',
              content: '每日向省指挥部报告处置进展',
              threshold: '每日20:00前',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（III级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.3条',
          sopTable: [
            {
              action: '升级通知',
              content: '向全体指挥部成员单位发送III级响应升级通知',
              threshold: '升级后30分钟内',
            },
            {
              action: '增派救援力量',
              content: '调动全市消防救援力量、社会救援队伍投入搜救',
              threshold: '升级后1小时内',
            },
            {
              action: '建立灾情数据库',
              content: '建立统一的灾情信息数据库，实现多部门信息共享',
              threshold: '升级后2小时内',
            },
            {
              action: '物资大规模调拨',
              content: '启用多个市级储备库，大规模调拨救灾物资',
              threshold: '升级后2小时内出库',
            },
            {
              action: '志愿者管理',
              content: '建立志愿者登记和管理机制，有序引导社会力量参与',
              threshold: '升级后4小时内',
            },
            {
              action: '社会捐赠管理',
              content: '开通捐赠渠道，建立捐赠物资接收和分配台账',
              threshold: '升级后6小时内',
            },
            {
              action: '伤亡数据核实',
              content: '逐人核实伤亡数据，建立遇难者、伤员、失踪人员名册',
              threshold: '持续，每4小时更新',
            },
            {
              action: '次生灾害监测',
              content: '协调相关部门对次生灾害风险进行持续监测',
              threshold: '持续',
            },
            {
              action: '灾情简报升级',
              content: '灾情简报频率提升为每日3次',
              threshold: '8:00/14:00/20:00',
            },
            {
              action: '保险理赔协调',
              content: '通知保险机构启动快速理赔通道',
              threshold: '升级后24小时内',
            },
          ],
        },
        {
          name: '市住建局',
          fullName: '市住建局（III级）',
          sourceNote:
            '《国家地震应急预案》第4.3条；《城市抗震防灾规划标准》GB 50413',
          sopTable: [
            {
              action: '扩大排查范围',
              content: '将建筑安全排查范围扩大到全部震区',
              threshold: '升级后即时',
            },
            {
              action: '专家增援',
              content: '请求省级住建部门增派建筑安全评估专家',
              threshold: '升级后2小时内',
            },
            {
              action: '倒塌建筑搜救配合',
              content: '配合消防救援队伍提供建筑结构信息，辅助搜救方案制定',
              threshold: '即时响应',
            },
            {
              action: '供水供气抢修',
              content: '组织专业队伍抢修受损供水、供气设施',
              threshold: '震后8小时内恢复主要区域',
            },
            {
              action: '过渡安置房建设',
              content: '启动过渡安置房（活动板房）建设规划',
              threshold: '升级后12小时内出方案',
            },
            {
              action: '建筑垃圾清运方案',
              content: '制定倒塌建筑垃圾清运方案，为搜救和重建创造条件',
              threshold: '升级后24小时内',
            },
            {
              action: '地震灾害损失评估',
              content: '配合地震部门开展房屋建筑灾害损失评估',
              threshold: '升级后48小时内初评',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（III级）',
          sourceNote:
            '《国家地震应急预案》第4.3条',
          sopTable: [
            {
              action: '全域道路排查',
              content: '对全市道路、桥梁、隧道进行全面排查',
              threshold: '升级后4小时内启动',
            },
            {
              action: '大规模交通管制',
              content: '实施震区全域交通管制，仅允许救援车辆通行',
              threshold: '升级后即时',
            },
            {
              action: '应急运输保障',
              content: '调集大型客运车辆保障大规模人员疏散',
              threshold: '升级后2小时内到位',
            },
            {
              action: '道路抢通攻坚',
              content: '集中力量抢通通往震中的主干道路',
              threshold: '升级后6小时内抢通至少一条',
            },
            {
              action: '桥梁全面检测',
              content: '对震区所有桥梁进行安全检测',
              threshold: '升级后12小时内完成',
            },
            {
              action: '铁路/航空协调',
              content: '协调铁路、民航部门保障救援人员和物资运输',
              threshold: '升级后2小时内对接',
            },
            {
              action: '交通信息发布',
              content: '通过多种渠道发布交通管制和绕行信息',
              threshold: '每2小时更新',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（III级）',
          description: 'III级较IV级新增岗位，负责社会治安管控与人员搜救',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.3条；《中华人民共和国突发事件应对法》第五章',
          sopTable: [
            {
              action: '社会治安管控',
              content: '增派警力维护震区社会治安，防止趁灾盗窃、抢劫',
              threshold: '升级后1小时内到位',
            },
            {
              action: '交通管控',
              content: '配合交通局实施交通管制，指挥救援车辆通行',
              threshold: '升级后即时',
            },
            {
              action: '人员搜救',
              content: '出动特警、巡警参与倒塌建筑人员搜救',
              threshold: '升级后1小时内出动',
            },
            {
              action: '重点目标安保',
              content: '加强银行、商场、仓库等重点目标安全保卫',
              threshold: '升级后2小时内加强',
            },
            {
              action: '遇难者身份确认',
              content: '开展遇难者DNA比对和身份确认工作',
              threshold: '持续',
            },
            {
              action: '舆情监控',
              content: '监控网络舆情，及时处置谣言和虚假信息',
              threshold: '24小时监控',
            },
            {
              action: '安置点安保',
              content: '在各安置点部署警力维护秩序',
              threshold: '安置点开放后即时',
            },
            {
              action: '失踪人员查找',
              content: '接受失踪人员报告，建立失踪人员数据库',
              threshold: '升级后2小时内建立',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（III级）',
          description: 'III级较IV级新增岗位，负责医疗救治与卫生防疫',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.3条；《中华人民共和国突发事件应对法》第五章',
          sopTable: [
            {
              action: '医疗救治启动',
              content: '启动医疗救治应急预案，开通伤员绿色通道',
              threshold: '升级后即时',
            },
            {
              action: '伤员分类救治',
              content: '按照红（危重）、黄（重伤）、绿（轻伤）分类救治',
              threshold: '伤员到达后即时分类',
            },
            {
              action: '医疗资源调配',
              content: '调配全市医疗资源，必要时请求省级医疗队支援',
              threshold: '升级后1小时内',
            },
            {
              action: '现场医疗点设置',
              content: '在震中区域设置现场医疗救治点',
              threshold: '升级后2小时内',
            },
            {
              action: '血液保障',
              content: '协调血站保障急救用血供应',
              threshold: '升级后即时',
            },
            {
              action: '伤员转运',
              content: '组织危重伤员向省级医院转运',
              threshold: '需要时即时安排',
            },
            {
              action: '卫生防疫',
              content: '启动震后卫生防疫工作，防止传染病暴发',
              threshold: '升级后4小时内启动',
            },
            {
              action: '心理援助',
              content: '组织心理医生开展灾后心理援助',
              threshold: '升级后12小时内启动',
            },
            {
              action: '饮水卫生监测',
              content: '对安置点饮用水进行卫生监测',
              threshold: '升级后6小时内首次检测',
            },
            {
              action: '伤亡医疗信息统计',
              content: '统计伤员救治和遇难者信息，报指挥部',
              threshold: '每4小时更新',
            },
          ],
        },
        {
          name: '市地震局',
          fullName: '市地震局（III级）',
          description: 'III级较IV级新增岗位，负责专业震情研判与灾害评估',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.3条；《中华人民共和国防震减灾法》第四十六条',
          sopTable: [
            {
              action: '震情正式报告',
              content: '向指挥部提供正式震情报告（震级、震中、震源深度、烈度分布）',
              threshold: '震后30分钟内',
            },
            {
              action: '余震趋势研判',
              content: '分析余震序列，研判后续地震趋势',
              threshold: '震后2小时内首次研判',
            },
            {
              action: '烈度速报',
              content: '绘制地震烈度分布图，为灾情评估提供依据',
              threshold: '震后4小时内',
            },
            {
              action: '地震灾害损失初评',
              content: '开展地震灾害损失初步评估',
              threshold: '震后24小时内初评',
            },
            {
              action: '专业建议',
              content: '向指挥部提供避险、疏散、搜救等专业建议',
              threshold: '即时',
            },
            {
              action: '余震预警',
              content: '对可能发生的强余震发出预警',
              threshold: '持续监测',
            },
            {
              action: '地震现场科学考察',
              content: '组织专家赴震区开展地震科学考察',
              threshold: '震后12小时内出发',
            },
            {
              action: '震情信息发布',
              content: '通过官方渠道发布权威震情信息',
              threshold: '每4小时更新',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（III级）',
          sourceNote:
            '《破坏性地震应急条例》第二十二条至第二十九条',
          sopTable: [
            {
              action: '全面灾情排查',
              content: '逐楼逐户全面排查，确保不遗漏',
              threshold: '升级后4小时内完成',
            },
            {
              action: '大规模疏散',
              content: '组织危房居民大规模疏散至安全安置点',
              threshold: '升级后2小时内启动',
            },
            {
              action: '安置点管理',
              content: '加强安置点管理，做好登记、分配、服务',
              threshold: '全程',
            },
            {
              action: '物资发放',
              content: '组织救灾物资接收和发放，确保公平有序',
              threshold: '物资到达后即时',
            },
            {
              action: '伤员信息登记',
              content: '登记辖区伤员信息，配合医疗救治',
              threshold: '持续',
            },
            {
              action: '志愿者组织',
              content: '组织辖区志愿者参与救灾',
              threshold: '升级后2小时内',
            },
            {
              action: '逝者善后',
              content: '配合做好遇难者善后工作',
              threshold: '即时',
            },
            {
              action: '居民情绪安抚',
              content: '做好居民情绪安抚和心理疏导',
              threshold: '全程',
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
        '中国地震台网正式测定震级≥6.0级',
        '已确认死亡人数≥30人（含失踪）',
        '房屋倒塌≥5000间或严重损坏≥20000间',
        '城市生命线系统全面瘫痪（供水/供电/供气/通信多个系统同时中断）',
        '地震引发重大次生灾害链（滑坡+泥石流+堰塞湖等）',
        '震中烈度达到IX度及以上',
        '大规模人员疏散（≥10万人）',
        '核设施、大型化工企业等高危目标受到威胁',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '市长',
          fullName: '市长（II级）',
          description: 'II级新增岗位，由市长统一指挥，全面统筹全市应急工作',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条、4.3条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '签发II级响应令',
              content: '确认灾情达到II级标准，签发响应升级令',
              threshold: '达到条件后1小时内',
            },
            {
              action: '全面接管指挥',
              content: '亲自坐镇市应急指挥中心，全面指挥抗震救灾',
              threshold: '升级后即时',
            },
            {
              action: '召开全市动员大会',
              content: '动员全市力量投入抗震救灾',
              threshold: '升级后4小时内',
            },
            {
              action: '向省政府述职',
              content: '每日向省政府报告灾情和处置情况',
              threshold: '每日2次',
            },
            {
              action: '请求军队支援',
              content: '向省军区请求解放军和武警部队支援',
              threshold: '升级后2小时内',
            },
            {
              action: '请求国家救援队',
              content: '请求国家地震灾害紧急救援队支援',
              threshold: '升级后2小时内',
            },
            {
              action: '重大决策',
              content: '对大规模疏散、区域封锁、重点目标保护等重大事项决策',
              threshold: '即时',
            },
            {
              action: '对外通报',
              content: '举行新闻发布会，向公众通报灾情和救灾进展',
              threshold: '每日1次',
            },
            {
              action: '灾后重建部署',
              content: '研究部署灾后恢复重建工作',
              threshold: '灾情稳定后启动',
            },
          ],
        },
        {
          name: '分管副市长',
          fullName: '分管副市长（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条、4.3条',
          sopTable: [
            {
              action: '协助市长',
              content: '在市长领导下继续履行分管领域指挥职责',
              threshold: '全程',
            },
            {
              action: '现场指挥',
              content: '驻守现场指挥部，靠前指挥搜救和抢险',
              threshold: '全程',
            },
            {
              action: '跨区域协调',
              content: '协调周边城市救援力量和物资支援',
              threshold: '升级后2小时内',
            },
            {
              action: '专项任务督办',
              content: '督办指挥部确定的重点任务',
              threshold: '每日检查',
            },
            {
              action: '向市长汇报',
              content: '每日向市长汇报现场处置进展',
              threshold: '每日2次',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条、4.3条',
          sopTable: [
            {
              action: '全面升级应急值守',
              content: '实行24小时双人值班，确保指挥系统不间断运行',
              threshold: '升级后即时',
            },
            {
              action: '国家救援队对接',
              content: '对接国家地震灾害紧急救援队，提供灾情信息和引导',
              threshold: '国家队到达前准备',
            },
            {
              action: '大规模物资调拨',
              content: '启用全部市级储备库，同时请求省级物资支援',
              threshold: '升级后2小时内',
            },
            {
              action: '建立联合指挥机制',
              content: '与军队、武警建立联合指挥机制',
              threshold: '升级后4小时内',
            },
            {
              action: '灾情全面评估',
              content: '组织开展地震灾害全面评估',
              threshold: '升级后24小时内初评',
            },
            {
              action: '国际救援协调',
              content: '如需接受国际救援，做好对接和协调准备',
              threshold: '视情况启动',
            },
            {
              action: '灾情简报',
              content: '灾情简报频率提升为每日4次',
              threshold: '6:00/12:00/18:00/24:00',
            },
            {
              action: '恢复重建规划',
              content: '启动灾后恢复重建规划编制',
              threshold: '灾情稳定后48小时内',
            },
          ],
        },
        {
          name: '市住建局',
          fullName: '市住建局（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条；《建筑抗震设计标准》GB/T 50011-2010',
          sopTable: [
            {
              action: '全市建筑排查',
              content: '对全市建筑进行安全排查',
              threshold: '升级后12小时内启动',
            },
            {
              action: '搜救技术支持',
              content: '为国家救援队提供建筑结构技术支持',
              threshold: '即时',
            },
            {
              action: '大规模安置房建设',
              content: '启动大规模过渡安置房建设',
              threshold: '升级后24小时内开工',
            },
            {
              action: '供水供气全面抢修',
              content: '组织全市供水供气抢修大会战',
              threshold: '升级后即时',
            },
            {
              action: '建筑垃圾大规模清运',
              content: '组织大规模建筑垃圾清运',
              threshold: '升级后48小时内启动',
            },
            {
              action: '灾后重建规划',
              content: '参与灾后重建规划，制定建筑抗震标准提升方案',
              threshold: '灾情稳定后启动',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条',
          sopTable: [
            {
              action: '全域交通管制',
              content: '实施全域交通管制，保障救援通道畅通',
              threshold: '升级后即时',
            },
            {
              action: '大规模道路抢通',
              content: '组织大规模道路抢通攻坚',
              threshold: '升级后即时',
            },
            {
              action: '航空救援协调',
              content: '协调直升机参与搜救和物资投送',
              threshold: '升级后2小时内',
            },
            {
              action: '铁路运输保障',
              content: '协调铁路部门保障大批量救援人员和物资运输',
              threshold: '升级后2小时内',
            },
            {
              action: '交通恢复方案',
              content: '制定分阶段交通恢复方案',
              threshold: '升级后48小时内',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条',
          sopTable: [
            {
              action: '全域治安管控',
              content: '实施全域治安管控，防止大规模治安事件',
              threshold: '升级后即时',
            },
            {
              action: '大规模搜救',
              content: '出动全部可调动警力参与搜救',
              threshold: '升级后即时',
            },
            {
              action: '重点目标保卫',
              content: '对政府机关、金融机构、危险品仓库等重点目标加强保卫',
              threshold: '升级后2小时内',
            },
            {
              action: '临时交通管控',
              content: '实施严格的临时交通管控措施',
              threshold: '升级后即时',
            },
            {
              action: '打击违法犯罪',
              content: '严厉打击趁灾盗窃、抢劫、诈骗等违法犯罪',
              threshold: '全程',
            },
            {
              action: '大规模身份核查',
              content: '对遇难者和失踪人员进行大规模身份核查',
              threshold: '持续',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条',
          sopTable: [
            {
              action: '全市医疗动员',
              content: '动员全市医疗机构投入伤员救治',
              threshold: '升级后即时',
            },
            {
              action: '请求省级医疗队',
              content: '请求省级医疗队支援',
              threshold: '升级后1小时内',
            },
            {
              action: '野战医院设置',
              content: '在震区设置野战医院',
              threshold: '升级后6小时内',
            },
            {
              action: '大规模伤员转运',
              content: '组织大规模伤员向省内外医院转运',
              threshold: '升级后即时',
            },
            {
              action: '全面卫生防疫',
              content: '启动全面卫生防疫工作',
              threshold: '升级后即时',
            },
            {
              action: '心理援助扩大',
              content: '扩大心理援助覆盖面',
              threshold: '升级后6小时内',
            },
            {
              action: '遗体处理规范',
              content: '规范遇难者遗体处理，防止疫病传播',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市地震局',
          fullName: '市地震局（II级）',
          sourceNote:
            '《国家地震应急预案》第4.2条',
          sopTable: [
            {
              action: '加密监测',
              content: '加密地震监测，实时跟踪震情发展',
              threshold: '升级后即时',
            },
            {
              action: '强余震预警',
              content: '对可能发生的强余震及时发出预警',
              threshold: '持续',
            },
            {
              action: '灾害损失详评',
              content: '开展地震灾害损失详细评估',
              threshold: '升级后72小时内',
            },
            {
              action: '地震科学考察',
              content: '组织大规模地震科学考察',
              threshold: '升级后24小时内',
            },
            {
              action: '国际地震机构对接',
              content: '对接国际地震机构，获取全球地震监测数据',
              threshold: '视情况启动',
            },
          ],
        },
        {
          name: '市自然资源局',
          fullName: '市自然资源局（II级）',
          description: 'II级新增岗位，负责地质灾害排查与监测',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '地质灾害排查',
              content: '对震区山体、边坡进行地质灾害排查',
              threshold: '升级后2小时内启动',
            },
            {
              action: '滑坡/泥石流监测',
              content: '对已发现的滑坡、泥石流隐患点进行实时监测',
              threshold: '升级后4小时内',
            },
            {
              action: '堰塞湖评估',
              content: '评估地震引发的堰塞湖风险',
              threshold: '发现后即时评估',
            },
            {
              action: '地质灾害预警',
              content: '发布地质灾害气象预警',
              threshold: '持续',
            },
            {
              action: '疏散建议',
              content: '对受地质灾害威胁区域提出疏散建议',
              threshold: '即时',
            },
            {
              action: '地裂缝排查',
              content: '排查地震引起的地裂缝和地面沉降',
              threshold: '升级后12小时内',
            },
            {
              action: '矿山安全排查',
              content: '排查震区矿山安全状况',
              threshold: '升级后12小时内',
            },
            {
              action: '地质灾害损失评估',
              content: '评估地质灾害造成的损失',
              threshold: '升级后48小时内初评',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（II级）',
          description: 'II级新增岗位，负责网络舆情管控与信息发布',
          isNew: true,
          sourceNote:
            '《国家突发事件总体应急预案》第3.3条；《中华人民共和国突发事件应对法》第五十一条',
          sopTable: [
            {
              action: '网络舆情监控',
              content: '24小时监控网络舆情，及时发现和处置谣言',
              threshold: '升级后即时',
            },
            {
              action: '权威信息发布',
              content: '通过官方新媒体平台发布权威震情和救灾信息',
              threshold: '每2小时更新',
            },
            {
              action: '谣言辟除',
              content: '对网络谣言及时辟除，公布真相',
              threshold: '发现后1小时内',
            },
            {
              action: '媒体协调',
              content: '协调主流媒体做好抗震救灾报道',
              threshold: '升级后即时',
            },
            {
              action: '新闻发布会组织',
              content: '组织每日新闻发布会',
              threshold: '每日1次',
            },
            {
              action: '网络舆论引导',
              content: '引导网络舆论，传播正能量',
              threshold: '持续',
            },
            {
              action: '外媒管理',
              content: '做好境外媒体采访管理',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（II级）',
          description: 'II级新增岗位，负责应急通信保障',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '通信灾情评估',
              content: '评估地震对通信网络造成的损害',
              threshold: '升级后1小时内',
            },
            {
              action: '应急通信保障',
              content: '调配应急通信车、卫星电话等保障指挥通信',
              threshold: '升级后2小时内到位',
            },
            {
              action: '通信网络抢修',
              content: '组织通信运营商抢修受损通信设施',
              threshold: '升级后即时',
            },
            {
              action: '优先保障',
              content: '优先保障指挥部、救援队伍、医院的通信需求',
              threshold: '全程',
            },
            {
              action: '公众通信恢复',
              content: '分区域逐步恢复公众通信服务',
              threshold: '升级后12小时内部分恢复',
            },
            {
              action: '通信信息报告',
              content: '向指挥部报告通信保障和恢复情况',
              threshold: '每4小时更新',
            },
          ],
        },
        {
          name: '市供电公司',
          fullName: '市供电公司（II级）',
          description: 'II级新增岗位，负责电力保障与抢修',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.2条；《国家突发事件总体应急预案》第3.3条',
          sopTable: [
            {
              action: '电力灾情评估',
              content: '评估地震对电网造成的损害',
              threshold: '升级后1小时内',
            },
            {
              action: '应急供电保障',
              content: '调配发电车保障指挥部、医院、安置点供电',
              threshold: '升级后2小时内到位',
            },
            {
              action: '电网抢修',
              content: '组织抢修队伍抢修受损电网',
              threshold: '升级后即时',
            },
            {
              action: '优先恢复',
              content: '优先恢复医院、水厂、通信基站等关键设施供电',
              threshold: '升级后6小时内',
            },
            {
              action: '分区域恢复',
              content: '制定分区域电力恢复方案',
              threshold: '升级后12小时内部分恢复',
            },
            {
              action: '用电安全提示',
              content: '向公众发布震后用电安全提示',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（II级）',
          description: 'II级新增岗位，负责大规模搜救、抢险和秩序维护',
          isNew: true,
          sourceNote:
            '《国家地震应急预案》第4.2条；《中华人民共和国突发事件应对法》第五十一条至第五十六条',
          sopTable: [
            {
              action: '接受任务',
              content: '接受市指挥部赋予的搜救、抢险、警戒等任务',
              threshold: '升级后2小时内',
            },
            {
              action: '兵力部署',
              content: '根据任务需求部署兵力',
              threshold: '接受任务后4小时内到位',
            },
            {
              action: '大规模搜救',
              content: '在倒塌建筑区域开展大规模搜救',
              threshold: '到位后即时',
            },
            {
              action: '抢险救灾',
              content: '参与道路抢通、堤坝加固、堰塞湖排险等',
              threshold: '按指令执行',
            },
            {
              action: '重点目标警戒',
              content: '对重要桥梁、隧道、危险品仓库等实施警戒',
              threshold: '到位后即时',
            },
            {
              action: '秩序维护',
              content: '协助公安维护社会秩序',
              threshold: '按指令执行',
            },
            {
              action: '物资搬运',
              content: '参与救灾物资搬运和分发',
              threshold: '按指令执行',
            },
            {
              action: '情况报告',
              content: '定期向市指挥部报告任务执行情况',
              threshold: '每4小时报告',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（II级）',
          sourceNote:
            '《破坏性地震应急条例》第二十二条至第二十九条',
          sopTable: [
            {
              action: '全面灾情排查',
              content: '逐楼逐户全面排查，确保不遗漏',
              threshold: '升级后4小时内完成',
            },
            {
              action: '大规模疏散',
              content: '组织危房居民大规模疏散至安全安置点',
              threshold: '升级后2小时内启动',
            },
            {
              action: '安置点管理',
              content: '加强安置点管理，做好登记、分配、服务',
              threshold: '全程',
            },
            {
              action: '物资发放',
              content: '组织救灾物资接收和发放，确保公平有序',
              threshold: '物资到达后即时',
            },
            {
              action: '伤员信息登记',
              content: '登记辖区伤员信息，配合医疗救治',
              threshold: '持续',
            },
            {
              action: '志愿者组织',
              content: '组织辖区志愿者参与救灾',
              threshold: '升级后2小时内',
            },
            {
              action: '逝者善后',
              content: '配合做好遇难者善后工作',
              threshold: '即时',
            },
            {
              action: '居民情绪安抚',
              content: '做好居民情绪安抚和心理疏导',
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
        '中国地震台网正式测定震级≥7.0级',
        '已确认死亡人数≥200人（含失踪）',
        '房屋倒塌≥50000间',
        '城市功能基本瘫痪，无法自主运行',
        '地震引发特大次生灾害（大型堰塞湖溃坝、化工厂泄漏爆炸等）',
        '需要大规模跨省转移安置（≥50万人）',
        '核设施受到严重威胁',
        '国务院决定启动I级响应',
      ],
      conditionLogic: '满足以下任一条件即可触发',
      departments: [
        {
          name: '市长',
          fullName: '市长（I级）',
          description: 'I级响应下执行国务院指令，实施全市总动员',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条；《国家突发事件总体应急预案》第2.1条；《中华人民共和国防震减灾法》第五十二条',
          sopTable: [
            {
              action: '执行国务院指令',
              content: '坚决执行国务院抗震救灾指挥部的各项指令',
              threshold: '即时',
            },
            {
              action: '全市总动员',
              content: '实施全市总动员，一切力量投入抗震救灾',
              threshold: '升级后即时',
            },
            {
              action: '大规模疏散',
              content: '组织大规模跨区域疏散转移',
              threshold: '升级后即时',
            },
            {
              action: '请求全国支援',
              content: '请求全国各省市支援',
              threshold: '升级后2小时内',
            },
            {
              action: '接受国际援助',
              content: '按国务院指令接受国际救援队和物资援助',
              threshold: '按指令执行',
            },
            {
              action: '每日述职',
              content: '每日向国务院指挥部述职',
              threshold: '每日2次',
            },
            {
              action: '灾后重建指挥',
              content: '指挥灾后恢复重建',
              threshold: '灾情稳定后启动',
            },
          ],
        },
        {
          name: '分管副市长',
          fullName: '分管副市长（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条',
          sopTable: [
            {
              action: '现场指挥',
              content: '驻守现场指挥部，执行国务院和市级指挥部指令',
              threshold: '全程',
            },
            {
              action: '国家救援队对接',
              content: '对接国家地震灾害紧急救援队和国际救援队',
              threshold: '即时',
            },
            {
              action: '跨省协调',
              content: '协调跨省救援力量和物资调配',
              threshold: '即时',
            },
            {
              action: '专项任务执行',
              content: '执行指挥部确定的专项任务',
              threshold: '按指令执行',
            },
          ],
        },
        {
          name: '市应急局',
          fullName: '市应急局（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条、4.2条；《破坏性地震应急条例》第七条',
          sopTable: [
            {
              action: '全面信息汇总',
              content: '建立全市统一灾情信息平台，实现国家-省-市三级信息共享',
              threshold: '升级后即时',
            },
            {
              action: '国家级资源对接',
              content: '对接国家级应急资源，包括救援队、物资、装备',
              threshold: '升级后即时',
            },
            {
              action: '国际救援协调',
              content: '协调国际救援队入境、部署和保障',
              threshold: '按指令执行',
            },
            {
              action: '全域物资调配',
              content: '实现全域救灾物资统一调配',
              threshold: '升级后即时',
            },
            {
              action: '灾情全面评估',
              content: '配合国家评估组开展灾情全面评估',
              threshold: '升级后72小时内',
            },
            {
              action: '恢复重建方案',
              content: '编制灾后恢复重建总体方案',
              threshold: '灾情稳定后1周内',
            },
          ],
        },
        {
          name: '市住建局',
          fullName: '市住建局（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条；《建筑抗震设计标准》GB/T 50011-2010',
          sopTable: [
            {
              action: '全域建筑评估',
              content: '对全市建筑进行安全评估和分类',
              threshold: '升级后即时',
            },
            {
              action: '大规模安置',
              content: '规划和建设大规模过渡安置房（≥1万套）',
              threshold: '升级后48小时内开工',
            },
            {
              action: '供水供气全面恢复',
              content: '制定供水供气全面恢复方案',
              threshold: '升级后即时',
            },
            {
              action: '重建标准制定',
              content: '制定灾后重建建筑抗震标准',
              threshold: '灾情稳定后启动',
            },
          ],
        },
        {
          name: '市交通局',
          fullName: '市交通局（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '全域交通管制',
              content: '实施最严格的交通管制',
              threshold: '升级后即时',
            },
            {
              action: '大规模道路抢通',
              content: '组织大规模道路抢通，保障国家级救援力量通行',
              threshold: '升级后即时',
            },
            {
              action: '大规模人员转运',
              content: '组织大规模跨区域人员转运',
              threshold: '升级后即时',
            },
            {
              action: '航空救援保障',
              content: '保障直升机和运输机起降',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '市公安局',
          fullName: '市公安局（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '全域戒严',
              content: '对核心灾区实施戒严',
              threshold: '升级后即时',
            },
            {
              action: '全力搜救',
              content: '出动全部警力参与搜救',
              threshold: '升级后即时',
            },
            {
              action: '严厉打击犯罪',
              content: '对趁灾犯罪从重从快打击',
              threshold: '全程',
            },
            {
              action: '大规模身份核查',
              content: '对全部遇难者和失踪人员进行身份核查',
              threshold: '持续',
            },
          ],
        },
        {
          name: '市卫健委',
          fullName: '市卫健委（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '全国医疗动员',
              content: '请求全国医疗力量支援',
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
              content: '实现受灾群众心理援助全覆盖',
              threshold: '升级后24小时内',
            },
          ],
        },
        {
          name: '市地震局',
          fullName: '市地震局（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '加密监测',
              content: '实施最密集的地震监测',
              threshold: '升级后即时',
            },
            {
              action: '配合国家研判',
              content: '配合中国地震局开展震情研判',
              threshold: '升级后即时',
            },
            {
              action: '强余震预警',
              content: '对强余震及时发出预警',
              threshold: '持续',
            },
            {
              action: '灾害损失详评',
              content: '配合国家评估组开展灾害损失详细评估',
              threshold: '升级后72小时内',
            },
          ],
        },
        {
          name: '市自然资源局',
          fullName: '市自然资源局（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '全域地质灾害排查',
              content: '对全市进行地质灾害全面排查',
              threshold: '升级后即时',
            },
            {
              action: '堰塞湖应急处置',
              content: '对大型堰塞湖实施应急处置',
              threshold: '发现后即时',
            },
            {
              action: '大规模疏散建议',
              content: '对受地质灾害威胁区域提出大规模疏散建议',
              threshold: '即时',
            },
            {
              action: '灾后地质安全评估',
              content: '对灾后重建区域进行地质安全评估',
              threshold: '灾情稳定后启动',
            },
          ],
        },
        {
          name: '市委网信办',
          fullName: '市委网信办（I级）',
          sourceNote:
            '《国家突发事件总体应急预案》第2.1条',
          sopTable: [
            {
              action: '全面舆情管控',
              content: '实施最严格的网络舆情管控',
              threshold: '升级后即时',
            },
            {
              action: '国务院信息发布',
              content: '配合国务院新闻办做好信息发布',
              threshold: '按指令执行',
            },
            {
              action: '国际舆论引导',
              content: '做好国际舆论引导',
              threshold: '升级后即时',
            },
            {
              action: '谣言快速处置',
              content: '对谣言实施最快速处置',
              threshold: '发现后30分钟内',
            },
          ],
        },
        {
          name: '市通信办',
          fullName: '市通信办（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '全面通信保障',
              content: '调配一切通信资源保障指挥和救援通信',
              threshold: '升级后即时',
            },
            {
              action: '卫星通信保障',
              content: '调配卫星通信设备保障核心区域通信',
              threshold: '升级后4小时内',
            },
            {
              action: '通信全面恢复',
              content: '制定通信全面恢复方案',
              threshold: '升级后即时',
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
          sourceNote:
            '《国家地震应急预案》第4.1条',
          sopTable: [
            {
              action: '全面电力保障',
              content: '调配一切发电设备保障关键设施供电',
              threshold: '升级后即时',
            },
            {
              action: '电网全面抢修',
              content: '组织电网全面抢修',
              threshold: '升级后即时',
            },
            {
              action: '请求省级支援',
              content: '请求省级电力公司支援',
              threshold: '升级后2小时内',
            },
            {
              action: '分阶段恢复',
              content: '制定分阶段电力恢复方案',
              threshold: '升级后即时',
            },
          ],
        },
        {
          name: '武警部队',
          fullName: '武警部队（I级）',
          sourceNote:
            '《国家地震应急预案》第4.1条；《中华人民共和国突发事件应对法》第五十一条至第五十六条',
          sopTable: [
            {
              action: '大规模投入',
              content: '按国务院指令大规模投入兵力',
              threshold: '按指令执行',
            },
            {
              action: '核心区域搜救',
              content: '在核心灾区开展大规模搜救',
              threshold: '到位后即时',
            },
            {
              action: '重点目标保卫',
              content: '对所有重点目标实施军事保卫',
              threshold: '按指令执行',
            },
            {
              action: '配合解放军',
              content: '配合解放军执行各项任务',
              threshold: '按指令执行',
            },
          ],
        },
        {
          name: '属地街道',
          fullName: '属地街道（I级）',
          sourceNote:
            '《破坏性地震应急条例》第七条',
          sopTable: [
            {
              action: '全面灾情排查',
              content: '逐楼逐户全面排查，确保不遗漏',
              threshold: '升级后4小时内完成',
            },
            {
              action: '大规模疏散',
              content: '组织危房居民大规模疏散至安全安置点',
              threshold: '升级后2小时内启动',
            },
            {
              action: '安置点管理',
              content: '加强安置点管理，做好登记、分配、服务',
              threshold: '全程',
            },
            {
              action: '物资发放',
              content: '组织救灾物资接收和发放，确保公平有序',
              threshold: '物资到达后即时',
            },
            {
              action: '伤员信息登记',
              content: '登记辖区伤员信息，配合医疗救治',
              threshold: '持续',
            },
            {
              action: '志愿者组织',
              content: '组织辖区志愿者参与救灾',
              threshold: '升级后2小时内',
            },
            {
              action: '逝者善后',
              content: '配合做好遇难者善后工作',
              threshold: '即时',
            },
            {
              action: '居民情绪安抚',
              content: '做好居民情绪安抚和心理疏导',
              threshold: '全程',
            },
          ],
        },
      ],
    },
  ],
  references: [
    { title: '《国家地震应急预案》（2025年修订，国办函〔2025〕102号）', url: 'https://www.gov.cn/zhengce/zhengceku/202510/content_7044768.htm' },
    { title: '《中华人民共和国防震减灾法》（2009年施行）', url: 'http://www.npc.gov.cn/zgrdw/npc/zfjc/zfjcelys/2018-10/19/content_2062711.htm' },
    { title: '《破坏性地震应急条例》（国务院令第172号）', url: 'https://www.gov.cn/gongbao/content/2011/content_1860777.htm' },
    { title: '《国家突发事件总体应急预案》（2025年）', url: 'https://www.gov.cn/zhengce/202502/content_7005635.htm' },
    { title: '《中华人民共和国突发事件应对法》（2024年修订）', url: 'http://www.npc.gov.cn/npc/c2/c30834/202406/t20240628_437888.html' },
    { title: '《建筑抗震设计标准》GB/T 50011-2010（2024年局部修订）', url: 'https://www.mohurd.gov.cn/gongkai/zc/wjk/art/2024/art_17339_778179.html' },
  ],
};
